from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import DbDep, get_current_user
from app.core.config import settings
from app.models.models import (
    AlumniProfile,
    ApplicationTrackerEntry,
    CommunityGroup,
    MentorshipBooking,
    MentorshipHost,
    Newsletter,
    Notification,
    Opportunity,
    Profile,
    SavedOpportunity,
    SupportingLetterRequest,
    Testimonial,
    User,
)
from app.schemas.common import MessageResponse
from app.schemas.domain import MentorshipPayload, ProfilePayload, SupportingLetterPayload, TrackerPayload
from app.services.serializers import serialize_newsletter, serialize_opportunity, serialize_testimonial
from app.services.storage import store_upload


router = APIRouter()


def serialize_profile(current_user: User) -> dict:
    profile = current_user.profile
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
        "profile": {
            "full_name": profile.full_name if profile else "",
            "headline": profile.headline if profile else None,
            "location": profile.location if profile else None,
            "bio": profile.bio if profile else None,
            "avatar_url": profile.avatar_url if profile else None,
            "linkedin_url": profile.linkedin_url if profile else None,
            "github_url": profile.github_url if profile else None,
            "portfolio_url": profile.portfolio_url if profile else None,
            "skills_text": profile.skills_text if profile else None,
            "interests_text": profile.interests_text if profile else None,
        },
    }


@router.get("/dashboard")
def dashboard(db: DbDep, current_user: User = Depends(get_current_user)) -> dict:
    saved_count = db.query(SavedOpportunity).filter(SavedOpportunity.user_id == current_user.id).count()
    tracker_count = db.query(ApplicationTrackerEntry).filter(ApplicationTrackerEntry.user_id == current_user.id).count()
    notification_count = db.query(Notification).filter(Notification.user_id == current_user.id, Notification.read_at.is_(None)).count()
    return {
        "user": {
            "full_name": current_user.profile.full_name if current_user.profile else current_user.email,
            "role": current_user.role.value,
            "avatar_url": current_user.profile.avatar_url if current_user.profile else None,
        },
        "stats": {
            "saved_opportunities": saved_count,
            "tracker_entries": tracker_count,
            "unread_notifications": notification_count,
        },
        "quick_actions": [
            "Build a new resume",
            "Track a fresh application",
            "Book mentorship support",
            "Request a supporting letter",
        ],
    }


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)) -> dict:
    return serialize_profile(current_user)


@router.put("/profile", response_model=MessageResponse)
def update_profile(payload: ProfilePayload, db: DbDep, current_user: User = Depends(get_current_user)) -> MessageResponse:
    if not str(payload.email).endswith("@alxafrica.com"):
        raise HTTPException(status_code=400, detail="Email must use the alxafrica.com domain")

    current_user.email = str(payload.email).lower()
    if not current_user.profile:
        current_user.profile = Profile(user_id=current_user.id, full_name=payload.full_name)

    current_user.profile.full_name = payload.full_name
    current_user.profile.location = payload.location
    current_user.profile.bio = payload.bio
    current_user.profile.headline = payload.headline
    current_user.profile.linkedin_url = payload.linkedin_url
    current_user.profile.github_url = payload.github_url
    current_user.profile.portfolio_url = payload.portfolio_url
    current_user.profile.skills_text = payload.skills_text
    current_user.profile.interests_text = payload.interests_text
    db.commit()
    return MessageResponse(message="Profile updated successfully.")


@router.post("/profile/avatar", response_model=MessageResponse)
def upload_avatar(
    db: DbDep,
    current_user: User = Depends(get_current_user),
    avatar: UploadFile = File(...),
) -> MessageResponse:
    extension = (avatar.filename and f".{avatar.filename.split('.')[-1]}") if avatar.filename and "." in avatar.filename else ".png"
    filename = f"{current_user.id}-{uuid4().hex}{extension}"
    avatar_url = store_upload(
        avatar,
        folder="avatars",
        filename=filename,
        bucket=settings.supabase_avatars_bucket,
    )

    if not current_user.profile:
        current_user.profile = Profile(user_id=current_user.id, full_name=current_user.email)
    current_user.profile.avatar_url = avatar_url
    db.commit()
    return MessageResponse(message="Profile image uploaded.")


@router.get("/alumni")
def alumni_directory(db: DbDep, current_user: User = Depends(get_current_user)) -> dict:
    items = db.query(AlumniProfile).join(User).join(Profile).all()
    return {
        "items": [
            {
                "id": item.id,
                "full_name": item.user.profile.full_name,
                "headline": item.user.profile.headline,
                "career_field": item.career_field,
                "company": item.current_company,
                "location": ", ".join(filter(None, [item.city, item.country])),
                "cohort": item.cohort,
                "mentorship_available": item.mentorship_available,
                "expertise": item.expertise,
                "avatar_url": item.user.profile.avatar_url,
            }
            for item in items
        ]
    }


@router.get("/saved-opportunities")
def saved_opportunities(db: DbDep, current_user: User = Depends(get_current_user)) -> dict:
    rows = (
        db.query(SavedOpportunity, Opportunity)
        .join(Opportunity, Opportunity.id == SavedOpportunity.opportunity_id)
        .filter(SavedOpportunity.user_id == current_user.id)
        .all()
    )
    return {"items": [serialize_opportunity(opportunity) for _, opportunity in rows]}


@router.post("/saved-opportunities/{opportunity_id}", response_model=MessageResponse)
def save_opportunity(opportunity_id: int, db: DbDep, current_user: User = Depends(get_current_user)) -> MessageResponse:
    exists = (
        db.query(SavedOpportunity)
        .filter(SavedOpportunity.user_id == current_user.id, SavedOpportunity.opportunity_id == opportunity_id)
        .first()
    )
    if exists:
        return MessageResponse(message="Opportunity already saved.")
    db.add(SavedOpportunity(user_id=current_user.id, opportunity_id=opportunity_id))
    db.add(
        Notification(
            user_id=current_user.id,
            type="saved_opportunity",
            title="Opportunity saved",
            body="You saved an opportunity to review later.",
            link="/saved",
        )
    )
    db.commit()
    return MessageResponse(message="Opportunity saved.")


@router.get("/tracker")
def list_tracker(db: DbDep, current_user: User = Depends(get_current_user)) -> dict:
    items = (
        db.query(ApplicationTrackerEntry)
        .filter(ApplicationTrackerEntry.user_id == current_user.id)
        .order_by(ApplicationTrackerEntry.deadline.asc())
        .all()
    )
    return {
        "items": [
            {
                "id": item.id,
                "title": item.title,
                "organization": item.organization,
                "category": item.category,
                "date_applied": item.date_applied,
                "deadline": item.deadline,
                "status": item.status,
                "notes": item.notes,
                "follow_up_date": item.follow_up_date,
                "interview_date": item.interview_date,
                "result": item.result,
            }
            for item in items
        ]
    }


@router.post("/tracker", response_model=MessageResponse)
def create_tracker_entry(payload: TrackerPayload, db: DbDep, current_user: User = Depends(get_current_user)) -> MessageResponse:
    db.add(ApplicationTrackerEntry(user_id=current_user.id, **payload.model_dump()))
    db.commit()
    return MessageResponse(message="Tracker entry added.")


@router.get("/services")
def services(db: DbDep, current_user: User = Depends(get_current_user)) -> dict:
    groups = db.query(CommunityGroup).filter(CommunityGroup.active.is_(True)).all()
    hosts = db.query(MentorshipHost).filter(MentorshipHost.active.is_(True)).all()
    newsletters = db.query(Newsletter).order_by(Newsletter.published_at.desc()).limit(4).all()
    testimonials = db.query(Testimonial).filter(Testimonial.approved.is_(True)).limit(4).all()
    return {
        "groups": [
            {"id": group.id, "name": group.name, "type": group.type.value, "description": group.description, "region": group.region}
            for group in groups
        ],
        "hosts": [{"id": host.id, "name": host.name, "role": host.role, "bio": host.bio} for host in hosts],
        "newsletters": [serialize_newsletter(item) for item in newsletters],
        "testimonials": [serialize_testimonial(item) for item in testimonials],
    }


@router.post("/mentorship-bookings", response_model=MessageResponse)
def create_booking(payload: MentorshipPayload, db: DbDep, current_user: User = Depends(get_current_user)) -> MessageResponse:
    host = db.query(MentorshipHost).filter(MentorshipHost.id == payload.host_id).first()
    if not host:
        raise HTTPException(status_code=404, detail="Mentor not found")
    db.add(MentorshipBooking(user_id=current_user.id, **payload.model_dump()))
    db.add(
        Notification(
            user_id=current_user.id,
            type="mentorship_booking",
            title="Mentorship request submitted",
            body=f"Your request with {host.name} is pending review.",
            link="/services",
        )
    )
    db.commit()
    return MessageResponse(message="Mentorship booking submitted.")


@router.post("/supporting-letter-requests", response_model=MessageResponse)
def create_supporting_letter_request(
    payload: SupportingLetterPayload,
    db: DbDep,
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    db.add(SupportingLetterRequest(user_id=current_user.id, **payload.model_dump()))
    db.add(
        Notification(
            user_id=current_user.id,
            type="supporting_letter",
            title="Supporting letter request received",
            body="Expect feedback within 48 business hours.",
            link="/services",
        )
    )
    db.commit()
    return MessageResponse(message="Supporting letter request submitted.")


@router.get("/notifications")
def notifications(db: DbDep, current_user: User = Depends(get_current_user)) -> dict:
    items = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return {
        "items": [
            {
                "id": item.id,
                "title": item.title,
                "body": item.body,
                "link": item.link,
                "read_at": item.read_at,
                "created_at": item.created_at,
            }
            for item in items
        ]
    }
