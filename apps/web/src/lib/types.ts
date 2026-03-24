export type Opportunity = {
  id: number;
  title: string;
  slug: string;
  organization: string;
  category: string;
  excerpt: string;
  description: string;
  location?: string | null;
  department?: string | null;
  compensation?: string | null;
  opportunity_type?: string | null;
  deadline?: string | null;
  apply_url?: string | null;
  image_url?: string | null;
  featured: boolean;
  views_count: number;
};

export type EventItem = {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  venue_name?: string | null;
  location_text?: string | null;
  start_at: string;
  end_at: string;
  status: string;
  featured: boolean;
};

export type Testimonial = {
  id: number;
  name: string;
  role: string;
  company?: string | null;
  quote: string;
};

export type Newsletter = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  published_at: string;
};

export type HubLocation = {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  phone?: string | null;
  email?: string | null;
  directions_url?: string | null;
};

export type MeResponse = {
  id: number;
  email: string;
  role: "user" | "admin";
  profile: {
    full_name: string;
    headline?: string | null;
    location?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    linkedin_url?: string | null;
    github_url?: string | null;
    portfolio_url?: string | null;
    skills_text?: string | null;
    interests_text?: string | null;
  };
};
