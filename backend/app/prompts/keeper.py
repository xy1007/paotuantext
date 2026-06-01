"""
Prompt 模板：把「守秘人手册 + 对话历史」组装成发给模型的消息结构。

学习要点：
- `ChatPromptTemplate` 是 LangChain 的聊天模板，占位符会在 invoke/astream 时被替换。
- `MessagesPlaceholder("history")` 表示「这里插入一整段对话历史」，
  类型必须是 `list[BaseMessage]`（由 adapters/messages.py 提供）。
- 模板只描述「消息长什么样」，真正调用模型在 chains/keeper_chain.py 里完成。
"""

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.services.campaign import DEFAULT_CAMPAIGN_ID, load_campaign_prompt

FALLBACK_PROMPT = """你是一位跑团主持人(KP)。用第二人称叙述场景，语言沉浸、节奏适中。
不要替玩家做决定；适时提示可进行的行动。"""

# 两条消息槽位：
# 1. system：战役 prompt.md 全文（规则、世界观、输出格式）
# 2. history：玩家与 KP 的多轮对话（MessagesPlaceholder 动态插入）
keeper_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "{system_prompt}"),
        MessagesPlaceholder("history"),
    ]
)


def get_system_prompt(campaign_id: str | None) -> str:
    """按剧本 id 读取 backend/campaigns/<id>/prompt.md，作为 system 消息内容。"""
    cid = campaign_id or DEFAULT_CAMPAIGN_ID
    try:
        return load_campaign_prompt(cid)
    except FileNotFoundError:
        return FALLBACK_PROMPT
