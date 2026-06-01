"""
消息适配层：把前端跑团 JSON 转成 LangChain 的 Message 对象。

学习要点：
- LangChain 对话历史不是普通 dict，而是 `HumanMessage` / `AIMessage` / `SystemMessage`；
  模型据此区分「玩家说了什么」「助手（KP）回了什么」「系统指令」。
- 本项目的 `narrator`、`dice` 等前端角色在这里映射到 LangChain 能理解的类型。
"""

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage


def _map_role(role: str) -> str:
    """前端 role → LangChain 消息大类（human / ai / system）。"""
    mapping = {
        "player": "human",   # 玩家输入 → HumanMessage
        "dm": "ai",          # 守秘人回复 → AIMessage（模型上一轮输出）
        "narrator": "ai",    # 旁白也视作「助手侧」文本，便于模型延续语境
        "system": "system",
        "dice": "system",    # 检定结果作为系统侧补充信息
    }
    return mapping.get(role, "human")


def to_langchain_messages(messages: list[dict]) -> list[BaseMessage]:
    """
    将前端消息列表转为 `list[BaseMessage]`，供 ChatPromptTemplate 的
    `MessagesPlaceholder("history")` 填入。

    注意：战役级 system prompt（守秘人手册）在 `prompts/keeper.py` 里单独注入，
    不混在本函数返回的 history 中。
    """
    result: list[BaseMessage] = []
    for msg in messages:
        role = msg.get("role", "player")
        content = msg.get("content", "")
        if not content:
            continue

        kind = _map_role(role)
        if kind == "human":
            result.append(HumanMessage(content=content))
        elif kind == "ai":
            result.append(AIMessage(content=content))
        else:
            # 系统类消息加前缀，方便模型识别来源（检定 / 游戏系统）
            prefix = "【检定】" if role == "dice" else "【系统】"
            result.append(SystemMessage(content=f"{prefix}{content}"))
    return result
