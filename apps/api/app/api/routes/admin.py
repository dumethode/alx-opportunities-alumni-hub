from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from slugify import slugify

from app.api.deps import DbDep, get_admin_user
from app.core.config import settings
from app.models.models import CommunityGroup, Event, EventCategory, GroupType, HubLocation, Newsletter, Opportunity, OpportunityCategory, Testimonial, User
from app.schemas.common import MessageResponse
from app.services.serializers import serialize_event, serialize_group, serialize_location, serialize_newsletter, serialize_opportunity, serialize_testimonial
from app.services.storage import store_upload


router = APIRouter()


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
    items = db.query(Opportunity).order_by(Opportunity.published_at.desc()).all()
    return {"items": [serialize_opportunity(item) for item in items]}


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
    category = db.query(OpportunityCategory).filter(OpportunityCategory.slug == category_slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    item = Opportunity(
        title=title,
        slug=slugify(title),
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
        image_url=store_opportunity_image(image),
        created_by=admin_user.id,
    )
    db.add(item)
    db.commit()
    return MessageResponse(message="Opportunity created.")


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
    item = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    category = db.query(OpportunityCategory).filter(OpportunityCategory.slug == category_slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    item.title = title
    item.slug = slugify(title)
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
        item.image_url = new_image_url
    db.commit()
    return MessageResponse(message="Opportunity updated.")


@router.delete("/opportunities/{opportunity_id}", response_model=MessageResponse)
def delete_opportunity(opportunity_id: int, db: DbDep, admin_user: User = Depends(get_admin_user)) -> MessageResponse:
    item = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    db.delete(item)
    db.commit()
    return MessageResponse(message="Opportunity deleted.")


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
