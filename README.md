<!--
╔══════════════════════════════════════════════════════════════════════╗
║  DreamSeed 种梦计划 — AI创造者大赛  官方 README 模板                ║
║                                                                      ║
║  使用说明：                                                          ║
║  1. 将本模板放在参赛仓库根目录 README.md 的顶部                       ║
║  2. 头图使用 DreamField 官方公开活动图片地址                         ║
║  3. 请保留 DREAMFIELD_README_HEADER_START / END 标识                 ║
║  4. 分割线以下供创作者自由编写项目内容                               ║
╚══════════════════════════════════════════════════════════════════════╝
-->

<!-- DREAMFIELD_README_HEADER_START -->

<p align="center">
  <a href="https://www.dreamfield.top">
    <img src="https://www.dreamfield.top/dream-field/contest-readme/assets/dreamseed-readme-banner.png" alt="DreamSeed 种梦计划参赛作品" width="100%" />
  </a>
</p>

<!-- DREAMFIELD_README_HEADER_END -->


# AI 跑团
对话式 AI 跑团游戏，移动端优先 Web 界面 + Python 后端代理 DeepSeek。

## 技术栈

- 前端：Vite + Vue 3 + TypeScript
- 后端：FastAPI + **LangChain**（`langchain-core` / `langchain-openai` / LCEL）
- 模型：`deepseek-v4-pro`（经 OpenAI 兼容接口调用 DeepSeek）

## LangChain 后端结构（学习路径）

```
backend/app/
├── llm/factory.py           # ChatOpenAI 单例，读取 .env 配置
├── adapters/messages.py     # 跑团 role -> HumanMessage / AIMessage / SystemMessage
├── prompts/keeper.py        # ChatPromptTemplate + 战役 prompt.md
├── chains/keeper_chain.py   # LCEL: prompt | llm，astream 流式输出
├── services/chat_service.py # 对外 stream_chat（供 FastAPI 调用）
├── routers/chat.py          # SSE 接口，前端无感
└── routers/saves.py         # 三槽位存档 REST API