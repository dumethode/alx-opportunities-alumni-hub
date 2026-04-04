from datetime import datetime

from sqlalchemy import inspect as sa_inspect
from sqlalchemy.orm.attributes import NO_VALUE

from app.models.models import CommunityGroup, Event, HubLocation, Newsletter, Opportunity, Testimonial


def _iso(value) -> str | None:
    if not value:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    # Defensive: tolerate legacy string values in hosted DBs.
    if isinstance(value, str):
        return value
    isoformat = getattr(value, "isoformat", None)
    return isoformat() if callable(isoformat) else str(value)


def serialize_opportunity(item: Opportunity) -> dict:
    views_count = 0
    try:
        state = sa_inspect(item)
        attr = state.attrs.views
        loaded = attr.loaded_value
        if loaded is not NO_VALUE and loaded is not None:
            views_count = len(loaded)
    except Exception:
        # Never fail serialization for admin/public lists.
        views_count = 0

    now = datetime.utcnow()
    is_expired = bool(item.deadline and isinstance(item.deadline, datetime) and item.deadline < now)

    return {
        "id": item.id,
        "title": item.title,
        "slug": item.slug,
        "organization": item.organization,
        "category": item.category.name if item.category else None,
        "excerpt": item.excerpt,
        "description": item.description,
        "location": item.location,
        "department": item.department,
        "compensation": item.compensation,
        "opportunity_type": item.opportunity_type,
        "deadline": _iso(item.deadline),
        "deadline_label": item.deadline_label,
        "is_expired": is_expired,
        "apply_url": item.apply_url,
        "image_url": item.image_url,
        "featured": item.featured,
        "views_count": views_count,
    }


def serialize_event(item: Event) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "slug": item.slug,
        "category": item.category.name if item.category else None,
        "summary": item.summary,
        "description": item.description,
        "venue_name": item.venue_name,
        "location_text": item.location_text,
        "start_at": _iso(item.start_at),
        "end_at": _iso(item.end_at),
        "status": item.status,
        "featured": item.featured,
    }


def serialize_newsletter(item: Newsletter) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "slug": item.slug,
        "summary": item.summary,
        "content": item.content,
        "published_at": _iso(item.published_at),
    }


def serialize_testimonial(item: Testimonial) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "role": item.role,
        "company": item.company,
        "quote": item.quote,
    }


def serialize_location(item: HubLocation) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "slug": item.slug,
        "address": item.address,
        "city": item.city,
        "country": item.country,
        "latitude": item.latitude,
        "longitude": item.longitude,
        "phone": item.phone,
        "email": item.email,
        "directions_url": item.directions_url,
        "active": item.active,
    }


def serialize_group(item: CommunityGroup) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "type": item.type.value if hasattr(item.type, "value") else str(item.type),
        "description": item.description,
        "region": item.region,
        "contact_info": item.contact_info,
        "active": item.active,
    }
