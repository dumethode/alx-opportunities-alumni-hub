from sqlalchemy.orm import Session

from app.models.models import CommunityGroup, Event, HubLocation, Newsletter, Opportunity, Testimonial


def serialize_opportunity(item: Opportunity) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "slug": item.slug,
        "organization": item.organization,
        "category": item.category.name,
        "excerpt": item.excerpt,
        "description": item.description,
        "location": item.location,
        "department": item.department,
        "compensation": item.compensation,
        "opportunity_type": item.opportunity_type,
        "deadline": item.deadline,
        "deadline_label": item.deadline_label,
        "apply_url": item.apply_url,
        "image_url": item.image_url,
        "featured": item.featured,
        "views_count": len(item.views),
    }


def serialize_event(item: Event) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "slug": item.slug,
        "category": item.category.name,
        "summary": item.summary,
        "description": item.description,
        "venue_name": item.venue_name,
        "location_text": item.location_text,
        "start_at": item.start_at,
        "end_at": item.end_at,
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
        "published_at": item.published_at,
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
