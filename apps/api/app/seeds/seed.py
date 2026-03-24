from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.models import (
    AlumniProfile,
    CommunityGroup,
    Event,
    EventCategory,
    HubLocation,
    MentorshipHost,
    Newsletter,
    Opportunity,
    OpportunityCategory,
    Profile,
    Testimonial,
    User,
    UserRole,
)


def ensure_user(
    db: Session,
    *,
    email: str,
    password: str,
    role: UserRole,
    full_name: str,
    headline: str,
    location: str,
    bio: str | None = None,
    sync_password: bool = False,
) -> User:
    normalized_email = email.lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user and role == UserRole.ADMIN:
        user = db.query(User).filter(User.role == UserRole.ADMIN).first()
    if not user:
        user = User(email=normalized_email, password_hash=hash_password(password), role=role)
        db.add(user)
        db.flush()
    else:
        user.email = normalized_email

    if user.role != role:
        user.role = role

    if sync_password:
        user.password_hash = hash_password(password)

    if not user.profile:
        db.add(
            Profile(
                user_id=user.id,
                full_name=full_name,
                headline=headline,
                location=location,
                bio=bio,
            )
        )

    return user


def seed_database(db: Session) -> None:
    admin = ensure_user(
        db,
        email=settings.seed_admin_email,
        password=settings.seed_admin_password,
        role=UserRole.ADMIN,
        full_name="ALX Hub Admin",
        headline="Platform administrator",
        location="Kigali, Rwanda",
        sync_password=True,
    )
    user = ensure_user(
        db,
        email="mduhujubumwe@alxafrica.com",
        password="Learner123!",
        role=UserRole.USER,
        full_name="Methode Duhujubumwe",
        headline="ALX learner building career momentum",
        location="Kigali, Rwanda",
        bio="Focused on opportunities, community, and strong professional presentation.",
    )

    if not db.query(AlumniProfile).filter(AlumniProfile.user_id == user.id).first():
        db.add(
            AlumniProfile(
                user_id=user.id,
                cohort="ALX ProDev 2025",
                graduation_year=2025,
                current_company="Kepler",
                current_role="Student Success Associate",
                career_field="Operations & Community",
                expertise="Career support, communication, coordination",
                interests="Mentorship, opportunity discovery, alumni engagement",
                city="Kigali",
                country="Rwanda",
                mentorship_available=True,
            )
        )

    if db.query(OpportunityCategory).count() == 0:
        db.add_all(
            [
                OpportunityCategory(name="Jobs", slug="jobs"),
                OpportunityCategory(name="Scholarships", slug="scholarships"),
                OpportunityCategory(name="Internships", slug="internships"),
                OpportunityCategory(name="Tenders", slug="tenders"),
                OpportunityCategory(name="Deals", slug="deals"),
                OpportunityCategory(name="Fellowships", slug="fellowships"),
                OpportunityCategory(name="Funding", slug="funding"),
            ]
        )
        db.flush()

    categories = {
        category.slug: category
        for category in db.query(OpportunityCategory).all()
    }

    now = datetime.utcnow()
    if db.query(Opportunity).count() == 0:
        db.add_all(
            [
                Opportunity(
                    title="Community Partnerships Lead",
                    slug="community-partnerships-lead",
                    organization="ALX Rwanda",
                    category_id=categories["jobs"].id,
                    excerpt="Lead community growth initiatives and build premium employer relationships.",
                    description="Drive the relationship between the ALX community, hiring partners, and alumni support initiatives.",
                    location="Kigali",
                    department="Community",
                    compensation="Competitive",
                    opportunity_type="Full-time",
                    deadline=now + timedelta(days=12),
                    apply_url="https://example.com/apply/community-partnerships",
                    featured=True,
                    created_by=admin.id,
                ),
                Opportunity(
                    title="Regional Product Design Internship",
                    slug="regional-product-design-internship",
                    organization="BlueWave Labs",
                    category_id=categories["internships"].id,
                    excerpt="Join a design team shipping high-impact education technology experiences.",
                    description="Support product design research, prototypes, and cross-functional delivery for education and growth products.",
                    location="Remote",
                    department="Design",
                    compensation="Monthly stipend",
                    opportunity_type="Internship",
                    deadline=now + timedelta(days=19),
                    apply_url="https://example.com/apply/design-internship",
                    created_by=admin.id,
                ),
                Opportunity(
                    title="Pan-African Fellowship for Community Builders",
                    slug="pan-african-fellowship-community-builders",
                    organization="NextLeap Africa",
                    category_id=categories["fellowships"].id,
                    excerpt="A funded leadership track for alumni building meaningful community programs.",
                    description="Receive mentorship, funding access, and exposure while scaling community projects across the region.",
                    location="Hybrid",
                    department="Programs",
                    compensation="Fully funded",
                    opportunity_type="Fellowship",
                    deadline=now + timedelta(days=30),
                    apply_url="https://example.com/apply/community-fellowship",
                    featured=True,
                    created_by=admin.id,
                ),
            ]
        )

    if db.query(EventCategory).count() == 0:
        db.add_all(
            [
                EventCategory(name="Networking", slug="networking"),
                EventCategory(name="Career", slug="career"),
                EventCategory(name="Community", slug="community"),
            ]
        )
        db.flush()

    event_categories = {
        category.slug: category
        for category in db.query(EventCategory).all()
    }

    if db.query(Event).count() == 0:
        db.add_all(
            [
                Event(
                    title="ALX Career Momentum Night",
                    slug="alx-career-momentum-night",
                    category_id=event_categories["career"].id,
                    summary="Opportunity reviews, recruiter insights, and alumni networking in one evening.",
                    description="An elegant evening session focused on career acceleration, mock introductions, and curated opportunity signals.",
                    venue_name="ALX Tech Hub at Deco Center",
                    location_text="Kigali",
                    start_at=now + timedelta(days=7),
                    end_at=now + timedelta(days=7, hours=3),
                    featured=True,
                ),
                Event(
                    title="Builders Breakfast at Zaria Court",
                    slug="builders-breakfast-zaria-court",
                    category_id=event_categories["networking"].id,
                    summary="A focused meetup for alumni, founders, and learners looking to collaborate.",
                    description="Meet peers, exchange practical support, and discover promising collaboration leads.",
                    venue_name="ALX Hub at Zaria Court",
                    location_text="Kigali",
                    start_at=now + timedelta(days=14),
                    end_at=now + timedelta(days=14, hours=2),
                    featured=True,
                ),
            ]
        )

    if db.query(Newsletter).count() == 0:
        db.add_all(
            [
                Newsletter(
                    title="ALX Opportunity Memo 001",
                    slug="alx-opportunity-memo-001",
                    summary="Featured roles, grants, and community dates for the next two weeks.",
                    content="This memo highlights premium opportunities, key deadlines, and the strongest relationship-building moments ahead.",
                    created_by=admin.id,
                ),
                Newsletter(
                    title="ALX Opportunity Memo 002",
                    slug="alx-opportunity-memo-002",
                    summary="A sharper focus on internships, fellowships, and alumni-led introductions.",
                    content="This edition focuses on students and recent graduates seeking stronger application momentum.",
                    created_by=admin.id,
                ),
            ]
        )

    if db.query(MentorshipHost).count() == 0:
        db.add_all(
            [
                MentorshipHost(name="Methode", role="Alumni Mentorship Lead", bio="Supports goal-setting, career clarity, and community navigation."),
                MentorshipHost(name="Rollande", role="Relationship Management Lead", bio="Supports mentorship, networking, and growth pathways."),
            ]
        )

    if db.query(CommunityGroup).count() == 0:
        db.add_all(
            [
                CommunityGroup(
                    name="ALX Community Group Kigali",
                    type="community",
                    description="General community support, meetups, and announcements for learners.",
                    region="Kigali",
                ),
                CommunityGroup(
                    name="ALX Alumni Circle Rwanda",
                    type="alumni",
                    description="Alumni-only peer support and introductions for opportunities and referrals.",
                    region="Rwanda",
                ),
                CommunityGroup(
                    name="East Africa Alumni Chapter",
                    type="chapter",
                    description="Regional chapter focused on events, partnerships, and career exchange.",
                    region="East Africa",
                ),
            ]
        )

    if db.query(Testimonial).count() == 0:
        db.add_all(
            [
                Testimonial(
                    name="Jeanne M.",
                    role="Product Analyst",
                    company="Airtel",
                    quote="The hub feels like a serious support system, not just a list of links.",
                    featured=True,
                ),
                Testimonial(
                    name="Eric N.",
                    role="Operations Associate",
                    company="Zipline",
                    quote="Opportunities, mentoring, and practical follow-up tools live in one place now.",
                    featured=True,
                ),
            ]
        )

    if db.query(HubLocation).count() == 0:
        db.add_all(
            [
                HubLocation(
                    name="ALX Tech Hub at Deco Center",
                    slug="deco-center",
                    address="Deco Center, Kigali",
                    city="Kigali",
                    country="Rwanda",
                    latitude="-1.9441",
                    longitude="30.0619",
                    phone="+250 700 000 001",
                    email="deco@alxafrica.com",
                    directions_url="https://maps.google.com",
                ),
                HubLocation(
                    name="ALX Hub at Zaria Court",
                    slug="zaria-court",
                    address="Zaria Court, Kigali",
                    city="Kigali",
                    country="Rwanda",
                    latitude="-1.9490",
                    longitude="30.0911",
                    phone="+250 700 000 002",
                    email="zaria@alxafrica.com",
                    directions_url="https://maps.google.com",
                ),
            ]
        )

    db.commit()
