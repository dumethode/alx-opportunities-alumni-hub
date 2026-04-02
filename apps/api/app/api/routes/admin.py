from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from slugify import slugify

from app.api.deps import DbDep, get_admin_user
from app.core.config import settings
from app.models.models import CommunityGroup, Event, EventCategory, GroupType, HubLocation, Newsletter, Opportunity, OpportunityCategory, OpportunityView, Testimonial, User
from app.schemas.common import MessageResponse
from app.services.serializers import serialize_event, serialize_group, serialize_location, serialize_newsletter, serialize_opportunity, serialize_testimonial
from app.services.storage import store_upload


router = APIRouter()

OPPORTUNITY_LIMITS = {
    "title": 180,
    "slug": 180,
    "organization": 180,
    "excerpt": 280,
    "location": 120,
    "department": 120,
    "compensation": 120,
    "opportunity_type": 120,
    "apply_url": 255,
    "deadline_label": 80,
    "image_url": 255,
}


def _clean_str(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = str(value).strip()
    return cleaned or None


def _ensure_max(field: str, value: str | None, max_len: int) -> str | None:
    if value is None:
        return None
    if len(value) <= max_len:
        return value
    raise HTTPException(status_code=400, detail=f"{field.replace('_', ' ').capitalize()} is too long (max {max_len} characters).")


def _build_unique_slug(db: DbDep, title: str, *, ignore_id: int | None = None) -> str:
    base = slugify(title) or "opportunity"
    base = base[: OPPORTUNITY_LIMITS["slug"]]
    slug = base
    counter = 1
    while True:
        query = db.query(Opportunity).filter(Opportunity.slug == slug)
        if ignore_id is not None:
            query = query.filter(Opportunity.id != ignore_id)
        if not query.first():
            return slug
        suffix = f"-{counter}"
        trimmed = base[: max(1, OPPORTUNITY_LIMITS["slug"] - len(suffix))]
        slug = f"{trimmed}{suffix}"
        counter += 1


def _views_count_map(db: DbDep, opportunity_ids: list[int]) -> dict[int, int]:
    if not opportunity_ids:
        return {}
    rows = (
        db.query(OpportunityView.opportunity_id, func.count(OpportunityView.id))
        .filter(OpportunityView.opportunity_id.in_(opportunity_ids))
        .group_by(OpportunityView.opportunity_id)
        .all()
    )
    return {int(opp_id): int(count) for opp_id, count in rows}


@router.get("/overview")
def overview(db: DbDep, admin_user: User = Depends(get_admin_user)) -> dict:
    return {
        "stats": {
            "opportunities": db.query(Opportunity).count(),
            "events": db.query(Event).count(),
            "newsletters": db.query(Newsletter).count(),
            "testimonials": db.query(Testimonial).count(),
            "groups": db.query(CommunityGroup).count(),
            "locations": db.query(HubLocation).count(),
        }
    }


@router.get("/opportunities")
def list_admin_opportunities(db: DbDep, admin_user: User = Depends(get_admin_user)) -> dict:
    try:
        items = db.query(Opportunity).order_by(Opportunity.published_at.desc()).all()
        view_counts = _views_count_map(db, [item.id for item in items])
        return {"items": [{**serialize_opportunity(item), "views_count": view_counts.get(item.id, 0)} for item in items]}
    except SQLAlchemyError as exc:
        # Hosted DBs can occasionally drift between deploys. Fallback to id ordering and
        # return a safe error message if that also fails.
        db.rollback()
        try:
            items = db.query(Opportunity).order_by(Opportunity.id.desc()).all()
            view_counts = _views_count_map(db, [item.id for item in items])
            return {"items": [{**serialize_opportunity(item), "views_count": view_counts.get(item.id, 0)} for item in items]}
        except SQLAlchemyError:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Could not load admin opportunities ({exc.__class__.__name__}). Please try again.",
            )


@router.get("/events")
def list_admin_events(db: DbDep, admin_user: User = Depends(get_admin_user)) -> dict:
    items = db.query(Event).order_by(Event.start_at.desc()).all()
    return {"items": [serialize_event(item) for item in items]}


@router.get("/newsletters")
def list_admin_newsletters(db: DbDep, admin_user: User = Depends(get_admin_user)) -> dict:
    items = db.query(Newsletter).order_by(Newsletter.published_at.desc()).all()
    return {"items": [serialize_newsletter(item) for item in items]}


@router.get("/testimonials")
def list_admin_testimonials(db: DbDep, admin_user: User = Depends(get_admin_user)) -> dict:
    items = db.query(Testimonial).order_by(Testimonial.id.desc()).all()
    return {"items": [serialize_testimonial(item) for item in items]}


@router.get("/groups")
def list_admin_groups(db: DbDep, admin_user: User = Depends(get_admin_user)) -> dict:
    items = db.query(CommunityGroup).order_by(CommunityGroup.id.desc()).all()
    return {"items": [serialize_group(item) for item in items]}


@router.get("/locations")
def list_admin_locations(db: DbDep, admin_user: User = Depends(get_admin_user)) -> dict:
    items = db.query(HubLocation).order_by(HubLocation.id.desc()).all()
    return {"items": [serialize_location(item) for item in items]}


def store_opportunity_image(image: UploadFile | None) -> str | None:
    if not image or not image.filename:
        return None
    extension = f".{image.filename.split('.')[-1]}" if "." in image.filename else ".png"
    filename = f"{uuid4().hex}{extension}"
    return store_upload(
        image,
        folder="opportunities",
        filename=filename,
        bucket=settings.supabase_opportunities_bucket,
    )


@router.post("/opportunities", response_model=MessageResponse)
def create_opportunity(
    db: DbDep,
    admin_user: User = Depends(get_admin_user),
    title: str = Form(...),
    organization: str = Form(...),
    category_slug: str = Form(...),
    excerpt: str = Form(...),
    description: str = Form(...),
    location: str | None = Form(default=None),
    department: str | None = Form(default=None),
    compensation: str | None = Form(default=None),
    opportunity_type: str | None = Form(default=None),
    apply_url: str | None = Form(default=None),
    featured: bool = Form(default=False),
    deadline: str | None = Form(default=None),
    deadline_label: str | None = Form(default=None),
    image: UploadFile | None = File(default=None),
) -> MessageResponse:
    title = _ensure_max("title", _clean_str(title), OPPORTUNITY_LIMITS["title"]) or ""
    organization = _ensure_max("organization", _clean_str(organization), OPPORTUNITY_LIMITS["organization"]) or ""
    excerpt = _ensure_max("excerpt", _clean_str(excerpt), OPPORTUNITY_LIMITS["excerpt"]) or ""
    description = str(description or "")
    location = _ensure_max("location", _clean_str(location), OPPORTUNITY_LIMITS["location"])
    department = _ensure_max("department", _clean_str(department), OPPORTUNITY_LIMITS["department"])
    compensation = _ensure_max("compensation", _clean_str(compensation), OPPORTUNITY_LIMITS["compensation"])
    opportunity_type = _ensure_max("type", _clean_str(opportunity_type), OPPORTUNITY_LIMITS["opportunity_type"])
    apply_url = _ensure_max("apply url", _clean_str(apply_url), OPPORTUNITY_LIMITS["apply_url"])
    deadline_label = _ensure_max("deadline label", _clean_str(deadline_label), OPPORTUNITY_LIMITS["deadline_label"])

    category = db.query(OpportunityCategory).filter(OpportunityCategory.slug == category_slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    slug = _build_unique_slug(db, title)

    item = Opportunity(
        title=title,
        slug=slug,
        organization=organization,
        category_id=category.id,
        excerpt=excerpt,
        description=description,
        location=location,
        department=department,
        compensation=compensation,
        opportunity_type=opportunity_type,
        apply_url=apply_url,
        featured=featured,
        deadline=datetime.fromisoformat(deadline) if deadline else None,
        deadline_label=deadline_label or None,
        image_url=_ensure_max("image", store_opportunity_image(image), OPPORTUNITY_LIMITS["image_url"]),
        created_by=admin_user.id,
    )
    try:
        db.add(item)
        db.commit()
        return MessageResponse(message="Opportunity created.")
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Could not create opportunity ({exc.__class__.__name__}).")


@router.put("/opportunities/{opportunity_id}", response_model=MessageResponse)
def update_opportunity(
    opportunity_id: int,
    db: DbDep,
    admin_user: User = Depends(get_admin_user),
    title: str = Form(...),
    organization: str = Form(...),
    category_slug: str = Form(...),
    excerpt: str = Form(...),
    description: str = Form(...),
    location: str | None = Form(default=None),
    department: str | None = Form(default=None),
    compensation: str | None = Form(default=None),
    opportunity_type: str | None = Form(default=None),
    apply_url: str | None = Form(default=None),
    featured: bool = Form(default=False),
    deadline: str | None = Form(default=None),
    deadline_label: str | None = Form(default=None),
    image: UploadFile | None = File(default=None),
) -> MessageResponse:
    title = _ensure_max("title", _clean_str(title), OPPORTUNITY_LIMITS["title"]) or ""
    organization = _ensure_max("organization", _clean_str(organization), OPPORTUNITY_LIMITS["organization"]) or ""
    excerpt = _ensure_max("excerpt", _clean_str(excerpt), OPPORTUNITY_LIMITS["excerpt"]) or ""
    description = str(description or "")
    location = _ensure_max("location", _clean_str(location), OPPORTUNITY_LIMITS["location"])
    department = _ensure_max("department", _clean_str(department), OPPORTUNITY_LIMITS["department"])
    compensation = _ensure_max("compensation", _clean_str(compensation), OPPORTUNITY_LIMITS["compensation"])
    opportunity_type = _ensure_max("type", _clean_str(opportunity_type), OPPORTUNITY_LIMITS["opportunity_type"])
    apply_url = _ensure_max("apply url", _clean_str(apply_url), OPPORTUNITY_LIMITS["apply_url"])
    deadline_label = _ensure_max("deadline label", _clean_str(deadline_label), OPPORTUNITY_LIMITS["deadline_label"])

    item = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    category = db.query(OpportunityCategory).filter(OpportunityCategory.slug == category_slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    item.title = title
    item.slug = _build_unique_slug(db, title, ignore_id=opportunity_id)
    item.organization = organization
    item.category_id = category.id
    item.excerpt = excerpt
    item.description = description
    item.location = location
    item.department = department
    item.compensation = compensation
    item.opportunity_type = opportunity_type
    item.apply_url = apply_url
    item.featured = featured
    item.deadline = datetime.fromisoformat(deadline) if deadline else None
    item.deadline_label = deadline_label or None
    new_image_url = store_opportunity_image(image)
    if new_image_url:
        item.image_url = _ensure_max("image", new_image_url, OPPORTUNITY_LIMITS["image_url"])
    try:
        db.commit()
        return MessageResponse(message="Opportunity updated.")
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Could not update opportunity ({exc.__class__.__name__}).")


@router.delete("/opportunities/{opportunity_id}", response_model=MessageResponse)
def delete_opportunity(opportunity_id: int, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    try:
        db.delete(item)
        db.commit()
        return MessageResponse(message="Opportunity deleted.")
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Could not delete opportunity ({exc.__class__.__name__}).")


@router.post("/events", response_model=MessageResponse)
def create_event(payload: dict, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    category = db.query(EventCategory).filter(EventCategory.slug == payload["category_slug"]).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    item = Event(
        title=payload["title"],
        slug=slugify(payload["title"]),
        category_id=category.id,
        summary=payload["summary"],
        description=payload["description"],
        venue_name=payload.get("venue_name"),
        location_text=payload.get("location_text"),
        start_at=datetime.fromisoformat(payload["start_at"]),
        end_at=datetime.fromisoformat(payload["end_at"]),
        registration_url=payload.get("registration_url"),
        featured=payload.get("featured", False),
    )
    db.add(item)
    db.commit()
    return MessageResponse(message="Event created.")


@router.put("/events/{event_id}", response_model=MessageResponse)
def update_event(event_id: int, payload: dict, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(Event).filter(Event.id == event_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    category = db.query(EventCategory).filter(EventCategory.slug == payload["category_slug"]).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    item.title = payload["title"]
    item.slug = slugify(payload["title"])
    item.category_id = category.id
    item.summary = payload["summary"]
    item.description = payload["description"]
    item.venue_name = payload.get("venue_name")
    item.location_text = payload.get("location_text")
    item.start_at = datetime.fromisoformat(payload["start_at"])
    item.end_at = datetime.fromisoformat(payload["end_at"])
    item.registration_url = payload.get("registration_url")
    item.featured = payload.get("featured", False)
    db.commit()
    return MessageResponse(message="Event updated.")


@router.delete("/events/{event_id}", response_model=MessageResponse)
def delete_event(event_id: int, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(Event).filter(Event.id == event_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(item)
    db.commit()
    return MessageResponse(message="Event deleted.")


@router.post("/newsletters", response_model=MessageResponse)
def create_newsletter(payload: dict, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    db.add(
        Newsletter(
            title=payload["title"],
            slug=slugify(payload["title"]),
            summary=payload["summary"],
            content=payload["content"],
            created_by=admin_user.id,
        )
    )
    db.commit()
    return MessageResponse(message="Newsletter created.")


@router.put("/newsletters/{newsletter_id}", response_model=MessageResponse)
def update_newsletter(newsletter_id: int, payload: dict, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    item.title = payload["title"]
    item.slug = slugify(payload["title"])
    item.summary = payload["summary"]
    item.content = payload["content"]
    db.commit()
    return MessageResponse(message="Newsletter updated.")


@router.delete("/newsletters/{newsletter_id}", response_model=MessageResponse)
def delete_newsletter(newsletter_id: int, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    db.delete(item)
    db.commit()
    return MessageResponse(message="Newsletter deleted.")


@router.post("/testimonials", response_model=MessageResponse)
def create_testimonial(payload: dict, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    db.add(
        Testimonial(
            name=payload["name"],
            role=payload["role"],
            company=payload.get("company"),
            quote=payload["quote"],
            featured=payload.get("featured", False),
        )
    )
    db.commit()
    return MessageResponse(message="Testimonial created.")


@router.put("/testimonials/{testimonial_id}", response_model=MessageResponse)
def update_testimonial(testimonial_id: int, payload: dict, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    item.name = payload["name"]
    item.role = payload["role"]
    item.company = payload.get("company")
    item.quote = payload["quote"]
    item.featured = payload.get("featured", False)
    db.commit()
    return MessageResponse(message="Testimonial updated.")


@router.delete("/testimonials/{testimonial_id}", response_model=MessageResponse)
def delete_testimonial(testimonial_id: int, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(item)
    db.commit()
    return MessageResponse(message="Testimonial deleted.")


@router.post("/groups", response_model=MessageResponse)
def create_group(payload: dict, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = CommunityGroup(
        name=payload["name"],
        type=GroupType(payload["type"]),
        description=payload["description"],
        region=payload.get("region"),
        contact_info=payload.get("contact_info"),
        active=payload.get("active", True),
    )
    db.add(item)
    db.commit()
    return MessageResponse(message="Group created.")


@router.put("/groups/{group_id}", response_model=MessageResponse)
def update_group(group_id: int, payload: dict, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Group not found")
    item.name = payload["name"]
    item.type = GroupType(payload["type"])
    item.description = payload["description"]
    item.region = payload.get("region")
    item.contact_info = payload.get("contact_info")
    item.active = payload.get("active", True)
    db.commit()
    return MessageResponse(message="Group updated.")


@router.delete("/groups/{group_id}", response_model=MessageResponse)
def delete_group(group_id: int, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Group not found")
    db.delete(item)
    db.commit()
    return MessageResponse(message="Group deleted.")


@router.post("/locations", response_model=MessageResponse)
def create_location(payload: dict, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = HubLocation(
        name=payload["name"],
        slug=slugify(payload["name"]),
        address=payload["address"],
        city=payload["city"],
        country=payload["country"],
        latitude=payload["latitude"],
        longitude=payload["longitude"],
        phone=payload.get("phone"),
        email=payload.get("email"),
        directions_url=payload.get("directions_url"),
        active=payload.get("active", True),
    )
    db.add(item)
    db.commit()
    return MessageResponse(message="Location created.")


@router.put("/locations/{location_id}", response_model=MessageResponse)
def update_location(location_id: int, payload: dict, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(HubLocation).filter(HubLocation.id == location_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Location not found")
    item.name = payload["name"]
    item.slug = slugify(payload["name"])
    item.address = payload["address"]
    item.city = payload["city"]
    item.country = payload["country"]
    item.latitude = payload["latitude"]
    item.longitude = payload["longitude"]
    item.phone = payload.get("phone")
    item.email = payload.get("email")
    item.directions_url = payload.get("directions_url")
    item.active = payload.get("active", True)
    db.commit()
    return MessageResponse(message="Location updated.")


@router.delete("/locations/{location_id}", response_model=MessageResponse)
def delete_location(location_id: int, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(HubLocation).filter(HubLocation.id == location_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(item)
    db.commit()
    return MessageResponse(message="Location deleted.")
