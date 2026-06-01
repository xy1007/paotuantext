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

## LangChain 后端结构

```
backend/app/
├── llm/factory.py           # ChatOpenAI 单例，读取 .env 配置
├── adapters/messages.py     # 跑团 role -> HumanMessage / AIMessage / SystemMessage
├── prompts/keeper.py        # ChatPromptTemplate + 战役 prompt.md
├── chains/keeper_chain.py   # LCEL: prompt | llm，astream 流式输出
├── services/chat_service.py # 对外 stream_chat（供 FastAPI 调用）
├── routers/chat.py          # SSE 接口，前端无感
└── routers/saves.py         # 三槽位存档 REST API

## 环境变量

| 变量 | 说明 |
|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |
| `DEEPSEEK_BASE_URL` | 默认 `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 默认 `deepseek-v4-pro` |
| `CORS_ORIGINS` | 默认 `http://localhost:5173` |

未配置 API Key 时，前端会使用本地 mock 回复演示界面。

## 目录说明

- `backend/campaigns/<剧本id>/prompt.md` — 各剧本守秘人手册（LangChain 注入）
- `frontend/src/campaigns/` — 前端主题、角色、快捷动作配置
- `backend/app/chains/keeper_chain.py` — LangChain LCEL 链
- `frontend/src/campaigns/darkwater-lake/config.ts` — 调查员身份、场景、快捷动作
- `frontend/src/styles/themes/darkwater-lake.ts` — 暗绿色调主题
- `frontend/src/composables/useChat.ts` — 身份选择 → 开场 → 对话流程

## 存档（服务器端）

- 存档目录：`backend/saves/{player_id}/{1|2|3}.json`（已加入 `.gitignore`，部署时需保证该目录可写）
- 玩家标识：浏览器 `localStorage` 中的 `paotuan-player-id`（UUID），请求头 `X-Player-Id`；**非强安全**（知晓 UUID 即可读写档）
- API：`GET/PUT/DELETE /api/saves`，`GET /api/saves/{slot}`（槽位 1–3）
- 游戏中点击顶栏存档图标可存/读/删；首页若有存档会显示「继续游戏」
- 手机通过局域网 IP 访问时，请走 Vite 开发代理（`/api` → 后端），存档 API 与聊天 API 同源

## 游玩说明

1. 打开页面后选择剧本；若有存档可「继续游戏」，否则选剧本后选择调查员身份
2. 声明行动，AI 守秘人描述结果；需要检定时 AI 会提示 d100 掷骰
3. 侧栏查看角色卡（HP / 理智 / 技能）；顶栏可打开存档面板