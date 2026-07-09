import json
import urllib.error
import urllib.request
from typing import Any, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.core.config import settings
from app.models.models import User


router = APIRouter()


AssistMode = Literal["resume", "cover-letter", "tracker"]


class AssistPayload(BaseModel):
    mode: AssistMode
    prompt: str
    current_fields: dict[str, Any] = {}


class AssistResponse(BaseModel):
    reply: str
    fields: dict[str, Any]
    source: str = "built-in"


def _compact(value: Any) -> str:
    text = str(value or "").strip()
    return " ".join(text.split())


def _fallback_resume(prompt: str, current: dict[str, Any]) -> dict[str, Any]:
    name = _compact(current.get("full_name")) or "ALX learner"
    target = _compact(current.get("target_role")) or _compact(current.get("headline")) or "career opportunity"
    evidence = _compact(prompt)
    summary = (
        f"{name} is a results-oriented professional preparing for {target}. "
        f"They bring practical experience, strong learning agility, and clear communication. "
        f"Their strongest evidence includes {evidence[:220] or 'relevant projects, coursework, and community experience'}."
    )
    return {
        "headline": target.title() if target else "ALX Career Candidate",
        "summary": summary,
        "highlights": "\n".join(
            [
                "Converted learning and project experience into practical outcomes.",
                "Collaborated with peers, mentors, and stakeholders to complete high-quality work.",
                "Used clear communication, follow-through, and problem solving to move work forward.",
            ]
        ),
    }


def _fallback_cover_letter(prompt: str, current: dict[str, Any]) -> dict[str, Any]:
    role = _compact(current.get("role_title")) or "the role"
    company = _compact(current.get("company")) or "your team"
    evidence = _compact(prompt)
    return {
        "intro": (
            f"I am writing to apply for {role} at {company}. I am excited by the opportunity because it aligns with my skills, "
            f"career direction, and commitment to doing meaningful work with measurable impact."
        ),
        "body_1": (
            f"My background has prepared me to contribute quickly. {evidence[:260] or 'I have built relevant experience through ALX learning, projects, and practical collaboration.'}"
        ),
        "body_2": (
            "I work with care, structure, and ownership. I communicate clearly, learn quickly, and stay focused on outcomes that matter to the team and the people it serves."
        ),
        "body_3": (
            f"I would welcome the opportunity to bring this energy and discipline to {company} and contribute to the success of {role}."
        ),
        "closing": "Thank you for your time and consideration. I would be grateful for the opportunity to discuss how my background can support your team.",
    }


def _fallback_tracker(prompt: str, current: dict[str, Any]) -> dict[str, Any]:
    title = _compact(current.get("title")) or "Opportunity"
    organization = _compact(current.get("organization")) or "Organization"
    details = _compact(prompt)
    return {
        "title": title,
        "organization": organization,
        "category": _compact(current.get("category")) or "Application",
        "status": _compact(current.get("status")) or "Preparing",
        "notes": (
            f"Next steps for {title} at {organization}: review requirements, tailor resume and cover letter, confirm deadline, "
            f"submit application, then follow up. Context: {details[:260] or 'No additional context provided yet.'}"
        ),
        "result": _compact(current.get("result")) or "In progress",
    }


def _fallback(mode: AssistMode, prompt: str, current: dict[str, Any]) -> dict[str, Any]:
    if mode == "resume":
        return _fallback_resume(prompt, current)
    if mode == "cover-letter":
        return _fallback_cover_letter(prompt, current)
    return _fallback_tracker(prompt, current)


def _openai_assist(mode: AssistMode, prompt: str, current: dict[str, Any]) -> dict[str, Any] | None:
    if not settings.openai_api_key:
        return None

    system = (
        "You are an ALX career assistant. Return only compact JSON with a fields object and a reply string. "
        "Keep writing professional, specific, and ready to paste into form fields."
    )
    user = {
        "mode": mode,
        "prompt": prompt,
        "current_fields": current,
        "field_rules": {
            "resume": ["headline", "summary", "highlights"],
            "cover-letter": ["intro", "body_1", "body_2", "body_3", "closing"],
            "tracker": ["title", "organization", "category", "status", "notes", "result"],
        }[mode],
    }
    body = json.dumps(
        {
            "model": settings.openai_model,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(user)},
            ],
            "temperature": 0.35,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=18) as response:
            payload = json.loads(response.read().decode("utf-8"))
        content = payload["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        fields = parsed.get("fields") if isinstance(parsed, dict) else None
        if isinstance(fields, dict):
            return {"reply": str(parsed.get("reply") or "Draft prepared."), "fields": fields, "source": "openai"}
    except (urllib.error.URLError, TimeoutError, KeyError, ValueError, json.JSONDecodeError):
        return None
    return None


@router.post("/ai/assist", response_model=AssistResponse)
def assist(payload: AssistPayload, current_user: User = Depends(get_current_user)) -> AssistResponse:
    current = dict(payload.current_fields or {})
    current.setdefault("user_email", current_user.email)
    generated = _openai_assist(payload.mode, payload.prompt, current)
    if generated:
        return AssistResponse(**generated)

    fields = _fallback(payload.mode, payload.prompt, current)
    return AssistResponse(
        reply="I prepared a structured draft from your notes. Review it, adjust details, then apply it to the form.",
        fields=fields,
        source="built-in",
    )
