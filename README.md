# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation)


## Communication 
.
# VoicePrompt 项目协作开发对话记录

## 项目规划与需求分析

**Q: 我们需要开发一个语音转Prompt的工具，你有什么初步的想法？**

A: 我认为可以基于React + Vite构建前端，使用Web Speech API实现语音识别，并集成AI大模型进行Prompt优化。这样能够实现从语音输入到结构化Prompt的完整流程。

**Q: 技术选型方面，你建议选择哪些具体的技术栈？**

A: 我建议使用React 19 + Vite 8作为前端基础，Tailwind CSS进行样式设计，Lucide React提供图标，Web Speech API实现语音识别，阿里云Qwen3-Max作为AI模型，React Hooks进行状态管理。

**Q: 如何确保语音识别的准确性和用户体验？**

A: 可以采用连续语音识别模式，支持中间结果展示，并添加错误处理机制。同时设计直观的界面，包括录音状态指示和实时反馈。

## 技术架构设计

**Q: 你能详细说明一下系统的架构设计吗？**

A: 系统分为三个主要模块：语音识别模块负责实时转录，AI优化模块处理Prompt生成，UI模块展示结果。使用React Hooks管理状态，确保各模块间的数据流清晰。

**Q: 如何实现语音识别和AI优化的无缝集成？**

A: 通过WebSocket或fetch API将转录文本发送到AI服务，采用异步处理确保界面响应性。使用状态管理跟踪录音、处理和完成状态。

## 核心功能实现

**Q: 实时语音转录功能如何实现？**

A: 利用Web Speech API的continuous和interimResults属性，实现连续语音识别和中间结果展示。通过onresult事件处理识别结果，更新转录文本。

**Q: AI优化部分的具体实现方案是什么？**

A: 构建一个专门的优化函数，将转录文本发送到Qwen3-Max API，使用系统提示词指导模型生成结构化Prompt。处理API响应并提取优化后的内容。

**Q: 用户界面设计有什么考虑？**

A: 采用双面板布局，左侧显示实时转录，右侧显示优化结果。添加录音按钮、优化按钮和复制功能，确保操作直观。使用状态指示器显示当前工作状态。

## 代码实现与优化

**Q: 如何处理错误和异常情况？**

A: 实现全面的错误处理机制，包括语音识别错误、API调用失败等。提供友好的错误提示，确保用户体验流畅。

**Q: 性能优化方面有什么建议？**

A: 使用React.memo优化组件渲染，合理管理状态更新，避免不必要的重渲染。实现懒加载和代码分割，提升应用性能。

## 项目测试与部署

**Q: 如何确保项目的稳定性和可靠性？**

A: 进行全面的单元测试和集成测试，包括语音识别准确性测试、AI响应质量测试和UI交互测试。建立错误监控机制。

**Q: 部署方案如何考虑？**

A: 使用Vite的构建功能生成优化后的静态文件，可以部署到各种静态网站托管服务。考虑添加PWA功能提升移动端体验。

## 项目总结与价值

**Q: 这个项目的核心价值是什么？**

A: 解决了从口述想法到结构化Prompt的转换痛点，提升了AI编程助手的使用效率。通过技术整合，为开发者提供了更自然的交互方式。

**Q: 你认为项目的哪些方面体现了专业性？**

A: 系统化的需求分析、合理的技术选型、完善的错误处理、优化的用户体验设计，以及端到端的解决方案整合，都体现了项目开发的专业性。
