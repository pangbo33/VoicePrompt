import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Sparkles, Copy, Check, Trash2 } from 'lucide-react'

// Qwen3-Max API 调用
const QWEN_API_KEY = 'sk-93ba43bc398b40408d6d67a10fb87e4c'
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

/**
 * 优化Prompt的异步函数
 * @param rawText - 原始文本内容
 * @returns 优化后的Prompt
 */
async function refinePromptWithQwen(rawText) {
  try {
    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-max',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的 AI 编程助手 Prompt 优化专家。你的任务是将用户口述的杂乱想法，重构为结构清晰、逻辑严密的 Prompt，用于指导 AI 编程工具（如 Claude、Cursor）编写代码。

优化后的 Prompt 应包含：
1. 需求概述：简明扼要地描述要实现的功能
2. 技术栈要求：React + TypeScript
3. 具体实现要点：分步骤列出需要实现的功能点
4. 代码规范要求：最佳实践、错误处理、注释要求

请直接输出优化后的 Prompt，不要有其他废话。`
          },
          {
            role: 'user',
            content: `请帮我优化以下想法，使其成为一个清晰的编程 Prompt：

${rawText}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'API 请求失败')
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Refine error:', error)
    throw new Error(error instanceof Error ? error.message : '优化失败，请重试')
  }
}

function App() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [refinedPrompt, setRefinedPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')
  const leftTextareaRef = useRef(null)
  const rightTextareaRef = useRef(null)

  // 初始化语音识别
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setErrorMsg('浏览器不支持语音识别，请使用 Chrome')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'zh-CN'

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += text
        } else {
          interimTranscript += text
        }
      }

      if (finalTranscript) {
        transcriptRef.current += finalTranscript
        setTranscript(transcriptRef.current)
      }

      setInterimText(interimTranscript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      let errorMessage = '识别错误'

      if (event.error === 'not-allowed') {
        errorMessage = '请允许麦克风权限'
      } else if (event.error === 'audio-capture') {
        errorMessage = '无法访问麦克风'
      } else {
        errorMessage = `识别错误: ${event.error}`
      }

      setErrorMsg(errorMessage)
      setIsListening(false)
      setStatus('idle')
    }

    recognition.onend = () => {
      if (isListening) {
        recognition.start()
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  // 开始录音
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      transcriptRef.current = transcript
      setTranscript(transcript)
      setInterimText('')
      setErrorMsg('')
      recognitionRef.current.start()
      setIsListening(true)
      setStatus('recording')
    }
  }, [transcript])

  // 停止录音
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      setStatus('idle')
      setInterimText('')
    }
  }, [])

  // 清空左侧文本
  const clearTranscript = () => {
    transcriptRef.current = ''
    setTranscript('')
    setInterimText('')
    setRefinedPrompt('')
    setErrorMsg('')
  }

  // 优化 Prompt
  const handleRefine = async () => {
    const finalText = leftTextareaRef.current?.value || transcript
    if (!finalText.trim()) return

    setIsProcessing(true)
    setStatus('processing')
    setErrorMsg('')

    try {
      const refined = await refinePromptWithQwen(finalText)
      setRefinedPrompt(refined)
      setTranscript(finalText)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : '优化失败，请重试')
    } finally {
      setIsProcessing(false)
      setStatus('idle')
    }
  }

  // 复制到剪贴板
  const handleCopy = () => {
    const textToCopy = rightTextareaRef.current?.value || refinedPrompt
    if (!textToCopy) return

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((error) => {
        console.error('Copy error:', error)
        setErrorMsg('复制失败，请重试')
      })
  }

  const getStatusText = () => {
    if (errorMsg) return errorMsg
    switch (status) {
      case 'recording': return '正在聆听...'
      case 'processing': return 'AI 处理中...'
      default: return '准备就绪'
    }
  }

  const getStatusColor = () => {
    if (errorMsg) return 'bg-red-500'
    switch (status) {
      case 'recording': return 'bg-red-500'
      case 'processing': return 'bg-blue-500'
      default: return 'bg-green-500'
    }
  }

  // 左侧显示的文本内容
  const leftDisplayValue = transcript || interimText || ''

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 顶部标题栏 */}
      <header className="h-14 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-800">VoicePrompt</h1>
          <span className="text-xs text-gray-500">语音转 Prompt 工具</span>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${(status === 'recording' || status === 'processing') ? 'animate-pulse' : ''}`} />
          <span className="text-sm text-gray-600">{getStatusText()}</span>
        </div>
      </header>

      {/* 主体区域 - 文本框居中显示，宽度80% */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-4/5 flex gap-6">
          {/* 左侧窗口 - 实时语音转录 */}
          <section className="flex-1 flex flex-col bg-white rounded-3xl shadow-lg border border-gray-200">
            {/* 标题栏 */}
            <div className="h-12 bg-gray-50 flex items-center justify-between px-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-gray-700">实时语音转录</span>
              </div>
            </div>

            {/* 文本编辑区域 - 增加高度 */}
            <div className="flex-1 p-4 overflow-hidden bg-white min-h-96">
              <textarea
                ref={leftTextareaRef}
                value={leftDisplayValue}
                onChange={(e) => {
                  setTranscript(e.target.value)
                  transcriptRef.current = e.target.value
                }}
                placeholder="点击下方麦克风按钮开始录音，或直接在此处输入文字..."
                className="w-full h-full bg-transparent text-sm text-gray-800 font-mono leading-relaxed resize-none focus:outline-none placeholder:text-gray-400"
                spellCheck={false}
              />
            </div>

            {/* 底部控制栏 - 录音按钮居中 */}
            <div className="h-20 bg-gray-50 border-t border-gray-200 flex items-center justify-center">
              {/* 录音按钮 */}
              <button
                onClick={isListening ? stopListening : startListening}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all shadow-lg
                  ${isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-purple-500/30'
                  }
                `}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    停止录音
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    开始录音
                  </>
                )}
              </button>
            </div>
          </section>

          {/* 右侧窗口 - AI Refined Prompt */}
          <section className="flex-1 flex flex-col bg-white rounded-3xl shadow-lg border border-gray-200">
            {/* 优化按钮放在右侧文本框正上方中间位置 */}
            <div className="h-12 bg-gray-50 flex items-center justify-center border-b border-gray-200">
              <button
                onClick={handleRefine}
                disabled={(!transcript && !interimText) || isProcessing}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all
                  ${(!transcript && !interimText) || isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md'
                  }
                `}
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? '处理中...' : '一键优化'}
              </button>
            </div>

            {/* 文本编辑区域 - 增加高度 */}
            <div className="flex-1 p-4 overflow-hidden bg-white min-h-96">
              <textarea
                ref={rightTextareaRef}
                value={refinedPrompt}
                onChange={(e) => setRefinedPrompt(e.target.value)}
                placeholder="在左侧录制语音后，点击「一键优化」生成 Prompt..."
                className="w-full h-full bg-transparent text-sm text-gray-800 font-mono leading-relaxed resize-none focus:outline-none placeholder:text-gray-400"
                spellCheck={false}
              />
            </div>

            {/* 底部状态栏 */}
            <div className="h-10 bg-gray-50 flex items-center px-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                {refinedPrompt ? `${refinedPrompt.length} 字符` : '等待优化...'}
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
