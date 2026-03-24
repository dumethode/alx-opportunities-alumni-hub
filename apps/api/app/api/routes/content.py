from datetime import datetime

from fastapi import APIRouter, HTTPException, Query

from app.api.deps import DbDep
from app.models.models import ContactMessage, Event, HubLocation, Newsletter, Opportunity, OpportunityView, Testimonial
from app.schemas.common import MessageResponse
from app.schemas.domain import ContactPayload
from app.services.serializers import serialize_event, serialize_location, serialize_newsletter, serialize_opportunity, serialize_testimonial


router = APIRouter()


@router.get("/home")
def home(db: DbDep) -> dict:
    featured_opportunities = db.query(Opportunity).filter(Opportunity.featured.is_(True)).limit(3).all()
    latest_opportunities = db.query(Opportunity).order_by(Opportunity.published_at.desc()).limit(6).all()
    featured_events = db.query(Event).filter(Event.featured.is_(True)).limit(3).all()
    testimonials = db.query(Testimonial).filter(Testimonial.approved.is_(True)).limit(3).all()
    newsletters = db.query(Newsletter).order_by(Newsletter.published_at.desc()).limit(2).all()
    hubs = db.query(HubLocation).filter(HubLocation.active.is_(True)).all()
    return {
        "stats": {
            "opportunities": db.query(Opportunity).count(),
            "events": db.query(Event).count(),
            "alumni": db.query(Testimonial).count() + 42,
            "services": 6,
        },
        "featured_opportunities": [serialize_opportunity(item) for item in featured_opportunities],
        "latest_opportunities": [serialize_opportunity(item) for item in latest_opportunities],
        "featured_events": [serialize_event(item) for item in featured_events],
        "testimonials": [serialize_testimonial(item) for item in testimonials],
        "newsletters": [serialize_newsletter(item) for item in newsletters],
        "hub_locations": [serialize_location(item) for item in hubs],
    }


@router.get("/opportunities")
def list_opportunities(
    db: DbDep,
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
) -> dict:
    query = db.query(Opportunity)
    if search:
        term = f"%{search}%"
        query = query.filter(Opportunity.title.ilike(term) | Opportunity.organization.ilike(term))
    if category:
        query = query.join(Opportunity.category).filter_by(slug=category)
    items = query.order_by(Opportunity.published_at.desc()).all()
    return {"items": [serialize_opportunity(item) for item in items], "count": len(items)}


@router.get("/opportunities/{slug}")
def get_opportunity(slug: str, db: DbDep) -> dict:
    item = db.query(Opportunity).filter(Opportunity.slug == slug).first()
    if not item:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    db.add(OpportunityView(opportunity_id=item.id, session_key=f"public-{datetime.utcnow().timestamp()}"))
    db.commit()
    db.refresh(item)
    related = (
        db.query(Opportunity)
        .filter(Opportunity.category_id == item.category_id, Opportunity.id != item.id)
        .order_by(Opportunity.published_at.desc())
        .limit(3)
        .all()
    )
    return {"item": serialize_opportunity(item), "related": [serialize_opportunity(entry) for entry in related]}


@router.get("/events")
def list_events(db: DbDep, search: str | None = Query(default=None)) -> dict:
    query = db.query(Event)
    if search:
        term = f"%{search}%"
        query = query.filter(Event.title.ilike(term) | Event.summary.ilike(term))
    items = query.order_by(Event.start_at.desc()).all()
    now = datetime.utcnow()
    return {
        "items": [serialize_event(item) for item in items],
        "counts": {
            "all": len(items),
            "past": len([item for item in items if item.end_at < now]),
            "upcoming": len([item for item in items if item.start_at >= now]),
        },
    }


@router.get("/events/{slug}")
def get_event(slug: str, db: DbDep) -> dict:
    item = db.query(Event).filter(Event.slug == slug).first()
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"item": serialize_event(item)}


@router.get("/hub-locations")
def list_hub_locations(db: DbDep) -> dict:
    items = db.query(HubLocation).filter(HubLocation.active.is_(True)).all()
    return {"items": [serialize_location(item) for item in items]}


@router.get("/newsletters")
def list_newsletters(db: DbDep) -> dict:
    items = db.query(Newsletter).order_by(Newsletter.published_at.desc()).all()
    return {"items": [serialize_newsletter(item) for item in items]}


@router.post("/contact", response_model=MessageResponse)
def create_contact_message(payload: ContactPayload, db: DbDep) -> MessageResponse:
    db.add(ContactMessage(**payload.model_dump()))
    db.commit()
    return MessageResponse(message="Your message was sent successfully.")

