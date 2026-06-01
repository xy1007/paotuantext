from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parents[1]
_ENV_FILE = _BACKEND_DIR / ".env"

# 优先从 backend/.env 加载；override=True 避免系统里空的环境变量盖掉文件里的 Key
if _ENV_FILE.exists():
    load_dotenv(_ENV_FILE, override=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
        env_ignore_empty=True,
    )

    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-v4-pro"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def api_key_configured(self) -> bool:
        return bool(self.deepseek_api_key.strip())


def _env_load_hint() -> str:
    if _ENV_FILE.exists() and settings.api_key_configured:
        return ""
    if _ENV_FILE.exists() and not settings.api_key_configured:
        return "backend/.env 存在但 DEEPSEEK_API_KEY 为空，请检查该行是否写对。"
    example = _BACKEND_DIR / ".env.example"
    if example.exists():
        return (
            "未找到有效的 backend/.env。请勿只改 .env.example，"
            "请执行：copy .env.example .env 并填入 DEEPSEEK_API_KEY。"
        )
    return "未找到 backend/.env，请复制 .env.example 为 .env 并填入密钥。"


settings = Settings()

ENV_FILE_PATH = _ENV_FILE
ENV_LOAD_HINT = _env_load_hint()
