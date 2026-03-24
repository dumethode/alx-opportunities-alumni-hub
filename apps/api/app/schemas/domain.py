from datetime import datetime

from pydantic import BaseModel, EmailStr


class OpportunityOut(BaseModel):
    id: int
    title: str
    slug: str
    organization: str
    category: str
    excerpt: str
    description: str
    location: str | None
    department: str | None
    compensation: str | None
    opportunity_type: str | None
    deadline: datetime | None
    apply_url: str | None
    featured: bool
    views_count: int


class EventOut(BaseModel):
    id: int
    title: str
    slug: str
    category: str
    summary: str
    description: str
    venue_name: str | None
    location_text: str | None
    start_at: datetime
    end_at: datetime
    status: str
    featured: bool


class NewsletterOut(BaseModel):
    id: int
    title: str
    slug: str
    summary: str
    content: str
    published_at: datetime


class TestimonialOut(BaseModel):
    id: int
    name: str
    role: str
    company: str | None
    quote: str


class HubLocationOut(BaseModel):
    id: int
    name: str
    slug: str
    address: str
    city: str
    country: str
    latitude: str
    longitude: str
    phone: str | None
    email: str | None
    directions_url: str | None


class ContactPayload(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    category: str
    subject: str
    message: str


class TrackerPayload(BaseModel):
    title: str
    organization: str
    category: str
    date_applied: datetime | None = None
    deadline: datetime | None = None
    status: str
    notes: str | None = None
    follow_up_date: datetime | None = None
    interview_date: datetime | None = None
    result: str | None = None
    opportunity_id: int | None = None


class MentorshipPayload(BaseModel):
    host_id: int
    topic: str
    goals: str
    preferred_date: datetime


class SupportingLetterPayload(BaseModel):
    target_person: str | None = None
    purpose: str
    recipient_name: str | None = None
    recipient_org: str | None = None
    details: str
    deadline: datetime | None = None


class ResumePayload(BaseModel):
    full_name: str
    headline: str
    email: EmailStr
    phone: str
    location: str
    linkedin_url: str | None = None
    github_url: str | None = None
    summary: str
    experience: list[dict]
    education: list[dict]
    skills: list[str]
    certifications: list[dict] = []
    awards: list[dict] = []
    skill_groups: list[dict] = []
    projects: list[dict] = []


class ProfilePayload(BaseModel):
    full_name: str
    email: EmailStr
    location: str | None = None
    bio: str | None = None
    headline: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    skills_text: str | None = None
    interests_text: str | None = None


class CoverLetterPayload(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    location: str
    linkedin_url: str | None = None
    date: str
    hiring_manager: str
    recipient_title: str | None = None
    company: str
    recipient_address: str | None = None
    recipient_location: str | None = None
    role_title: str
    intro: str
    body: list[str]
    closing: str
