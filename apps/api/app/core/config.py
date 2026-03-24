from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 10080
    database_url: str = "sqlite:///./alx_hub.db"
    cors_origins: str = "http://localhost:3000,https://alxafrica.vercel.app"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    cookie_domain: str | None = None
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None
    supabase_avatars_bucket: str = "avatars"
    supabase_opportunities_bucket: str = "opportunity-images"
    seed_admin_email: str = "admin@alxafrica.com"
    seed_admin_password: str = "Admin123!"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
