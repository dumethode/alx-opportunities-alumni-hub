"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

import { DocumentBuilder } from "@/components/forms";
import { API_BASE_URL, clientApi, getStoredAccessToken, resolveAssetUrl } from "@/lib/client-api";

function RequireAuth({
  title,
  children,
}: {
  title: string;
  children: import("react").ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    clientApi("/auth/me")
      .then(() => setAuthorized(true))
      .catch(() => setAuthorized(false))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-300">Loading {title.toLowerCase()}...</div>;
  }

  if (!authorized) {
    return (
      <div className="rounded-[30px] border border-cyan-300/30 bg-[linear-gradient(135deg,rgba(30,227,255,0.22),rgba(28,126,255,0.16))] p-6 shadow-[0_24px_70px_rgba(8,145,255,0.18)]">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-100">Members only</div>
          <div className="mt-3 text-xl font-semibold text-white">This section is available to logged-in members.</div>
          <div className="mt-3 text-sm leading-7 text-cyan-50">
            Sign in to unlock the full ALX member experience, including private tools, saved progress, alumni access, and support services.
          </div>
          <div className="mt-5">
            <Link href="/auth/sign-in" className="inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
              Sign in to unlock it
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function DashboardSection() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    clientApi("/dashboard").then(setData).catch(() => setData({ error: true }));
  }, []);

  return (
    <RequireAuth title="Dashboard">
      {!data ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-300">Loading dashboard...</div>
      ) : data.error || !data.stats ? (
        <div className="rounded-[28px] border border-cyan-300/15 bg-cyan-400/8 p-6 text-sm leading-7 text-cyan-50">
          Sign in to view your dashboard stats and quick actions.
        </div>
      ) : (
        <div className="space-y-5">
          {data?.user?.role === "admin" ? (
            <div className="rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(30,227,255,0.16),rgba(28,126,255,0.12))] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xl font-semibold text-white">Admin control center</div>
                  <div className="mt-2 text-sm leading-7 text-cyan-50">
                    You are signed in as an admin. Open the admin panel to add, edit, and delete opportunities, events, newsletters, testimonials, groups, and hub locations.
                  </div>
                </div>
                <Link href="/admin" className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
                  Open Admin Panel
                </Link>
              </div>
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(data.stats).map(([key, value]) => (
              <div key={key} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-2xl font-semibold text-white">{String(value)}</div>
                <div className="mt-1 text-sm capitalize text-slate-300">{key.replaceAll("_", " ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </RequireAuth>
  );
}

export function ResourceSection() {
  return (
    <RequireAuth title="Resources">
      <div className="grid gap-8 xl:grid-cols-2">
        <div id="resume-builder" className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="mb-5 text-xl font-semibold text-white">Resume Template Builder</div>
          <DocumentBuilder type="resume" />
        </div>
        <div id="cover-letter-builder" className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="mb-5 text-xl font-semibold text-white">Cover Letter Builder</div>
          <DocumentBuilder type="cover-letter" />
        </div>
      </div>
    </RequireAuth>
  );
}

export function AlumniSection() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    clientApi("/alumni").then(setData).catch(() => setData({ items: [] }));
  }, []);

  return (
    <RequireAuth title="Find Alumni">
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
          Search-ready alumni discovery is live in the backend foundation. This member view focuses on meaningful previews and warm introduction pathways.
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {data?.items?.length ? data.items.map((item: any) => (
            <div key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="space-y-2">
                <div className="text-xl font-semibold text-white">{item.full_name}</div>
                <div className="text-cyan-100">{item.headline}</div>
                <div className="text-sm text-slate-300">{item.company}</div>
                <div className="text-sm text-slate-300">{item.location}</div>
                <div className="text-sm leading-7 text-slate-300">{item.expertise}</div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="mailto:community@alxafrica.com" className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                  Request introduction
                </a>
                <Link href="/services#mentorship" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
                  Explore mentorship
                </Link>
              </div>
            </div>
          )) : (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-300">
              No alumni profiles are visible yet.
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}

export function ServicesSection() {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    clientApi("/services").then(setData).catch(() => setData({ groups: [], hosts: [] }));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const endpoint = String(form.get("flow"));
    const body =
      endpoint === "mentorship-bookings"
        ? {
            host_id: Number(form.get("host_id")),
            topic: form.get("topic"),
            goals: form.get("goals"),
            preferred_date: form.get("preferred_date"),
          }
        : {
            target_person: form.get("target_person"),
            purpose: form.get("purpose"),
            recipient_name: form.get("recipient_name"),
            recipient_org: form.get("recipient_org"),
            details: form.get("details"),
            deadline: form.get("deadline") || null,
          };
    const route = endpoint === "mentorship-bookings" ? "/mentorship-bookings" : "/supporting-letter-requests";
    try {
      const response = await clientApi<{ message: string }>(route, { method: "POST", bodyJson: body });
      setMessage(response.message);
      formElement.reset();
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <RequireAuth title="Services">
      <div className="space-y-8">
        <div id="community-groups" className="grid gap-5 lg:grid-cols-3">
          {data?.groups?.map((group: any) => (
            <div key={group.id} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="text-lg font-semibold text-white">{group.name}</div>
              <div className="mt-2 text-sm text-cyan-100">{group.type}</div>
              <p className="mt-3 text-sm leading-7 text-slate-300">{group.description}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-8 xl:grid-cols-2">
          <form id="mentorship" onSubmit={submit} className="rounded-[28px] border border-white/10 bg-white/5 p-6 space-y-4">
            <input type="hidden" name="flow" value="mentorship-bookings" />
            <div className="text-xl font-semibold text-white">Book alumni mentorship</div>
            <select name="host_id" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white">
              {data?.hosts?.map((host: any) => (
                <option key={host.id} value={host.id}>
                  {host.name} · {host.role}
                </option>
              ))}
            </select>
            <input name="topic" placeholder="Topic" required className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <textarea name="goals" placeholder="What support do you need?" required rows={4} className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <input name="preferred_date" type="datetime-local" required className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">Submit booking</button>
          </form>
          <form id="supporting-letter" onSubmit={submit} className="rounded-[28px] border border-white/10 bg-white/5 p-6 space-y-4">
            <input type="hidden" name="flow" value="supporting-letter-requests" />
            <div className="text-xl font-semibold text-white">Supporting letter request</div>
            <input name="purpose" placeholder="Purpose" required className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <input name="target_person" placeholder="Requested recommender (optional)" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <div className="grid gap-4 md:grid-cols-2">
              <input name="recipient_name" placeholder="Recipient name" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
              <input name="recipient_org" placeholder="Recipient organization" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            </div>
            <textarea name="details" rows={4} placeholder="Share context and key details" required className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <input name="deadline" type="datetime-local" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <div className="text-sm text-slate-300">Expect feedback within 48 business hours.</div>
            <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">Submit request</button>
          </form>
        </div>
        {message ? <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/8 px-4 py-3 text-sm text-cyan-50">{message}</div> : null}
        <div id="newsletter-archive" className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xl font-semibold text-white">Newsletter memo archive</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">
                Members can revisit bi-weekly ALX memos, opportunity highlights, and relationship updates.
              </div>
            </div>
            <Link href="/newsletters" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">
              Open archive
            </Link>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

export function NotificationsSection() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    clientApi("/notifications").then(setData).catch(() => setData({ items: [] }));
  }, []);

  return (
    <RequireAuth title="Notifications">
      <div className="space-y-4">
        {data?.items?.map((item: any) => (
          <div key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="text-base font-semibold text-white">{item.title}</div>
            <div className="mt-2 text-sm leading-7 text-slate-300">{item.body}</div>
          </div>
        ))}
      </div>
    </RequireAuth>
  );
}

export function AdminSection() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"opportunities" | "events" | "newsletters" | "testimonials" | "groups" | "locations">("opportunities");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">("info");
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [editingOpportunityId, setEditingOpportunityId] = useState<number | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [descriptionSyncKey, setDescriptionSyncKey] = useState(0);
  const [editingNewsletterId, setEditingNewsletterId] = useState<number | null>(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);

  const blankOpportunity = {
    title: "",
    organization: "",
    category_slug: "jobs",
    featured: true,
    deadline_mode: "rolling",
    deadline: "",
    deadline_label: "",
    excerpt: "",
    description: "",
    location: "",
    department: "",
    compensation: "",
    opportunity_type: "",
    apply_url: "",
    image_url_text: "",
  };
  const blankEvent = {
    title: "",
    category_slug: "career",
    summary: "",
    description: "",
    venue_name: "",
    location_text: "",
    start_at: "",
    end_at: "",
    registration_url: "",
  };
  const blankNewsletter = { title: "", summary: "", content: "" };
  const blankTestimonial = { name: "", role: "", company: "", quote: "" };
  const blankGroup = { name: "", type: "community", description: "", region: "", contact_info: "", active: true };
  const blankLocation = { name: "", address: "", city: "Kigali", country: "Rwanda", latitude: "", longitude: "", phone: "", email: "", directions_url: "", active: true };

  const [opportunityDraft, setOpportunityDraft] = useState<any>(blankOpportunity);
  const [eventDraft, setEventDraft] = useState<any>(blankEvent);
  const [newsletterDraft, setNewsletterDraft] = useState<any>(blankNewsletter);
  const [testimonialDraft, setTestimonialDraft] = useState<any>(blankTestimonial);
  const [groupDraft, setGroupDraft] = useState<any>(blankGroup);
  const [locationDraft, setLocationDraft] = useState<any>(blankLocation);

  function formatCommand(command: string, value?: string) {
    if (typeof document === "undefined") return;
    document.execCommand(command, false, value);
  }

  async function loadAdminData() {
    const [
      overview,
      opportunityPayload,
      eventPayload,
      newsletterPayload,
      testimonialPayload,
      groupPayload,
      locationPayload,
    ] = await Promise.allSettled([
      clientApi("/admin/overview"),
      clientApi<{ items: any[] }>("/admin/opportunities"),
      clientApi<{ items: any[] }>("/admin/events"),
      clientApi<{ items: any[] }>("/admin/newsletters"),
      clientApi<{ items: any[] }>("/admin/testimonials"),
      clientApi<{ items: any[] }>("/admin/groups"),
      clientApi<{ items: any[] }>("/admin/locations"),
    ]);

    setData(overview.status === "fulfilled" ? overview.value : { error: true });
    setOpportunities(opportunityPayload.status === "fulfilled" ? opportunityPayload.value.items : []);
    setEvents(eventPayload.status === "fulfilled" ? eventPayload.value.items : []);
    setNewsletters(newsletterPayload.status === "fulfilled" ? newsletterPayload.value.items : []);
    setTestimonials(testimonialPayload.status === "fulfilled" ? testimonialPayload.value.items : []);
    setGroups(groupPayload.status === "fulfilled" ? groupPayload.value.items : []);
    setLocations(locationPayload.status === "fulfilled" ? locationPayload.value.items : []);
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.innerHTML = opportunityDraft.description || "";
    }
  }, [descriptionSyncKey, editingOpportunityId]);

  async function submitOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const endpoint = editingOpportunityId ? `${API_BASE_URL}/admin/opportunities/${editingOpportunityId}` : `${API_BASE_URL}/admin/opportunities`;
    const method = editingOpportunityId ? "PUT" : "POST";
    const deadlineMode = String(opportunityDraft.deadline_mode || "rolling");
    if (deadlineMode !== "date") {
      form.set("deadline", "");
      form.set(
        "deadline_label",
        deadlineMode === "asap" ? "ASAP" : deadlineMode === "not_specified" ? "Not specified" : "Rolling",
      );
    } else {
      form.set("deadline_label", "");
    }
    try {
      const token = getStoredAccessToken();
      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (!response.ok) {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const payload = await response.json();
          throw new Error(payload.detail ?? "Could not save opportunity.");
        }
        throw new Error(await response.text() || "Could not save opportunity.");
      }
      setMessageTone("success");
      setMessage(editingOpportunityId ? "Opportunity updated successfully." : "Opportunity created successfully.");
      setEditingOpportunityId(null);
      setOpportunityDraft(blankOpportunity);
      setDescriptionSyncKey((k) => k + 1);
      formElement.reset();
      await loadAdminData();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not save opportunity.");
    }
  }

  async function submitEventForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const endpoint = editingEventId ? `/admin/events/${editingEventId}` : "/admin/events";
    const method = editingEventId ? "PUT" : "POST";
    try {
      await clientApi(endpoint, { method, bodyJson: eventDraft });
      setMessageTone("success");
      setMessage(editingEventId ? "Event updated successfully." : "Event created successfully.");
      setEditingEventId(null);
      setEventDraft(blankEvent);
      await loadAdminData();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not save event.");
    }
  }

  async function submitNewsletterForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const endpoint = editingNewsletterId ? `/admin/newsletters/${editingNewsletterId}` : "/admin/newsletters";
    const method = editingNewsletterId ? "PUT" : "POST";
    try {
      await clientApi(endpoint, { method, bodyJson: newsletterDraft });
      setMessageTone("success");
      setMessage(editingNewsletterId ? "Newsletter updated successfully." : "Newsletter created successfully.");
      setEditingNewsletterId(null);
      setNewsletterDraft(blankNewsletter);
      await loadAdminData();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not save newsletter.");
    }
  }

  async function submitTestimonialForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const endpoint = editingTestimonialId ? `/admin/testimonials/${editingTestimonialId}` : "/admin/testimonials";
    const method = editingTestimonialId ? "PUT" : "POST";
    try {
      await clientApi(endpoint, { method, bodyJson: testimonialDraft });
      setMessageTone("success");
      setMessage(editingTestimonialId ? "Testimonial updated successfully." : "Testimonial created successfully.");
      setEditingTestimonialId(null);
      setTestimonialDraft(blankTestimonial);
      await loadAdminData();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not save testimonial.");
    }
  }

  async function submitGroupForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const endpoint = editingGroupId ? `/admin/groups/${editingGroupId}` : "/admin/groups";
    const method = editingGroupId ? "PUT" : "POST";
    try {
      await clientApi(endpoint, { method, bodyJson: groupDraft });
      setMessageTone("success");
      setMessage(editingGroupId ? "Group updated successfully." : "Group created successfully.");
      setEditingGroupId(null);
      setGroupDraft(blankGroup);
      await loadAdminData();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not save group.");
    }
  }

  async function submitLocationForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const endpoint = editingLocationId ? `/admin/locations/${editingLocationId}` : "/admin/locations";
    const method = editingLocationId ? "PUT" : "POST";
    try {
      await clientApi(endpoint, { method, bodyJson: locationDraft });
      setMessageTone("success");
      setMessage(editingLocationId ? "Location updated successfully." : "Location created successfully.");
      setEditingLocationId(null);
      setLocationDraft(blankLocation);
      await loadAdminData();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not save location.");
    }
  }

  async function destroy(endpoint: string, successMessage: string) {
    try {
      await clientApi(endpoint, { method: "DELETE" });
      setMessageTone("success");
      setMessage(successMessage);
      await loadAdminData();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Could not delete item.");
    }
  }

  const tabClass = (name: typeof activeTab) =>
    `rounded-full px-4 py-2 text-sm transition ${
      activeTab === name
        ? "bg-white text-slate-950 font-semibold shadow-[0_12px_30px_rgba(7,18,32,0.14)]"
        : "border border-white/10 bg-white/10 text-white hover:border-cyan-300/30 hover:bg-white/15"
    }`;

  return (
    <RequireAuth title="Admin">
      {data?.stats ? (
        <div className="space-y-8">
          <div className="rounded-[28px] border border-cyan-300/15 bg-cyan-400/8 p-6">
            <div className="text-xl font-semibold text-white">Admin content management</div>
            <div className="mt-2 text-sm leading-7 text-cyan-50">
              Admin users can manage opportunities, events, newsletters, and testimonials here. These actions are enforced by backend role checks.
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(data.stats).map(([key, value]) => (
              <div key={key} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="text-2xl font-semibold text-white">{String(value)}</div>
                <div className="mt-1 text-sm capitalize text-slate-300">{key}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setActiveTab("opportunities")} className={tabClass("opportunities")}>Opportunities</button>
            <button onClick={() => setActiveTab("events")} className={tabClass("events")}>Events</button>
            <button onClick={() => setActiveTab("newsletters")} className={tabClass("newsletters")}>Newsletters</button>
            <button onClick={() => setActiveTab("testimonials")} className={tabClass("testimonials")}>Testimonials</button>
            <button onClick={() => setActiveTab("groups")} className={tabClass("groups")}>Groups</button>
            <button onClick={() => setActiveTab("locations")} className={tabClass("locations")}>Hub locations</button>
          </div>

          {activeTab === "opportunities" ? (
            <div className="space-y-6">
              <form onSubmit={submitOpportunity} className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="text-xl font-semibold text-white">{editingOpportunityId ? "Edit opportunity" : "Add opportunity"}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="title" value={opportunityDraft.title} onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, title: event.target.value }))} placeholder="Title" required className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <input name="organization" value={opportunityDraft.organization} onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, organization: event.target.value }))} placeholder="Organization" required className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <select name="category_slug" value={opportunityDraft.category_slug} onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, category_slug: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white">
                    <option value="jobs">Jobs</option>
                    <option value="internships">Internships</option>
                    <option value="scholarships">Scholarships</option>
                    <option value="fellowships">Fellowships</option>
                    <option value="funding">Funding</option>
                    <option value="tenders">Tenders</option>
                    <option value="deals">Deals</option>
                  </select>
                  <select
                    name="deadline_mode"
                    value={opportunityDraft.deadline_mode}
                    onChange={(event) =>
                      setOpportunityDraft((current: any) => ({
                        ...current,
                        deadline_mode: event.target.value,
                        deadline_label:
                          event.target.value === "asap"
                            ? "ASAP"
                            : event.target.value === "not_specified"
                              ? "Not specified"
                              : event.target.value === "rolling"
                                ? "Rolling"
                                : "",
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white"
                  >
                    <option value="rolling">Rolling</option>
                    <option value="date">Specific date</option>
                    <option value="asap">ASAP</option>
                    <option value="not_specified">Not specified</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white">
                  <input
                    name="featured"
                    type="checkbox"
                    checked={Boolean(opportunityDraft.featured)}
                    onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, featured: event.target.checked }))}
                  />
                  Show this opportunity on the homepage
                </label>
                {opportunityDraft.deadline_mode === "date" ? (
                  <input
                    name="deadline"
                    value={opportunityDraft.deadline}
                    onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, deadline: event.target.value }))}
                    type="datetime-local"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white"
                  />
                ) : (
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
                    Deadline display will show as {opportunityDraft.deadline_mode === "asap" ? "ASAP" : opportunityDraft.deadline_mode === "not_specified" ? "Not specified" : "Rolling"}.
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Short summary
                    <span className="mt-1 block text-xs text-slate-400">This is the brief card text shown on the opportunities list before someone opens the full opportunity.</span>
                  </label>
                  <textarea name="excerpt" value={opportunityDraft.excerpt} onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, excerpt: event.target.value }))} placeholder="A short, clear preview of the opportunity" required rows={2} className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Full description
                    <span className="mt-1 block text-xs text-slate-400">Use the tools below for bold, italics, underline, bullets, and larger section headings inside the opportunity description.</span>
                  </label>
                  <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <button type="button" onClick={() => formatCommand("bold")} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white">B</button>
                    <button type="button" onClick={() => formatCommand("italic")} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm italic text-white">I</button>
                    <button type="button" onClick={() => formatCommand("underline")} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm underline text-white">U</button>
                    <button type="button" onClick={() => formatCommand("insertUnorderedList")} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white">Bullets</button>
                    <button type="button" onClick={() => formatCommand("formatBlock", "<h3>")} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white">Heading</button>
                    <button type="button" onClick={() => formatCommand("fontSize", "4")} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white">Larger text</button>
                    <button type="button" onClick={() => formatCommand("removeFormat")} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white">Clear</button>
                  </div>
                  <div
                    ref={descriptionRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(event) => {
                      const html = (event.currentTarget as HTMLDivElement).innerHTML;
                      setOpportunityDraft((current: any) => ({
                        ...current,
                        description: html,
                      }));
                    }}
                    className="min-h-[220px] rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white focus:outline-none"
                  />
                  <input type="hidden" name="description" value={opportunityDraft.description} required />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="location" value={opportunityDraft.location} onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, location: event.target.value }))} placeholder="Location" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <input name="department" value={opportunityDraft.department} onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, department: event.target.value }))} placeholder="Department" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="compensation" value={opportunityDraft.compensation} onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, compensation: event.target.value }))} placeholder="Compensation" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <input name="opportunity_type" value={opportunityDraft.opportunity_type} onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, opportunity_type: event.target.value }))} placeholder="Type" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <input name="apply_url" value={opportunityDraft.apply_url} onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, apply_url: event.target.value }))} placeholder="Apply URL" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <input name="image_url_text" value={opportunityDraft.image_url_text} onChange={(event) => setOpportunityDraft((current: any) => ({ ...current, image_url_text: event.target.value }))} placeholder="Image link, optional" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <label className="block text-sm text-slate-300">
                  Opportunity image upload
                  <span className="mt-1 block text-xs text-slate-400">Upload an image or paste a direct image link above for hosted images.</span>
                  <input name="image" type="file" accept="image/*" className="mt-2 block w-full text-sm text-slate-300" />
                </label>
                {message ? (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      messageTone === "error"
                        ? "border border-red-400/25 bg-red-500/12 text-red-100"
                        : messageTone === "success"
                          ? "border border-emerald-400/25 bg-emerald-500/12 text-emerald-50"
                          : "border border-cyan-300/25 bg-cyan-400/12 text-cyan-50"
                    }`}
                  >
                    {message}
                  </div>
                ) : null}
                <button className="rounded-2xl border border-cyan-300/30 bg-[linear-gradient(135deg,#1ee3ff,#1c7eff)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_34px_rgba(18,121,255,0.22)]">
                  {editingOpportunityId ? "Save changes" : "Publish opportunity"}
                </button>
              </form>
              <div className="space-y-4">
                {opportunities.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-white">{item.title}</div>
                      <div className="text-sm text-cyan-100">{item.organization}</div>
                      <div className="mt-1 text-sm text-slate-300">{item.category}</div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => {
                        setEditingOpportunityId(item.id);
                        setOpportunityDraft({
                          title: item.title ?? "",
                          organization: item.organization ?? "",
                          category_slug: String(item.category || "").toLowerCase(),
                          featured: item.featured ?? true,
                          deadline_mode: item.deadline ? "date" : item.deadline_label === "ASAP" ? "asap" : item.deadline_label === "Not specified" ? "not_specified" : "rolling",
                          deadline: item.deadline ? new Date(item.deadline).toISOString().slice(0, 16) : "",
                          deadline_label: item.deadline_label ?? "",
                          excerpt: item.excerpt ?? "",
                          description: item.description ?? "",
                          location: item.location ?? "",
                          department: item.department ?? "",
                          compensation: item.compensation ?? "",
                          opportunity_type: item.opportunity_type ?? "",
                          apply_url: item.apply_url ?? "",
                          image_url_text: item.image_url?.startsWith("http") ? item.image_url : "",
                        });
                        setMessage(`Editing ${item.title}. Update the fields and save changes.`);
                      }} className="rounded-2xl border border-cyan-300/25 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15">
                        Edit
                      </button>
                      <button onClick={() => destroy(`/admin/opportunities/${item.id}`, "Opportunity deleted successfully.")} className="rounded-2xl border border-red-400/30 bg-red-500/14 px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-500/20">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "events" ? (
            <div className="space-y-6">
              <form onSubmit={submitEventForm} className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="text-xl font-semibold text-white">{editingEventId ? "Edit event" : "Add event"}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={eventDraft.title} onChange={(event) => setEventDraft((current: any) => ({ ...current, title: event.target.value }))} placeholder="Title" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <select value={eventDraft.category_slug} onChange={(event) => setEventDraft((current: any) => ({ ...current, category_slug: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white">
                    <option value="career">Career</option>
                    <option value="networking">Networking</option>
                    <option value="community">Community</option>
                  </select>
                </div>
                <textarea value={eventDraft.summary} onChange={(event) => setEventDraft((current: any) => ({ ...current, summary: event.target.value }))} placeholder="Summary" rows={2} className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <textarea value={eventDraft.description} onChange={(event) => setEventDraft((current: any) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={5} className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={eventDraft.venue_name} onChange={(event) => setEventDraft((current: any) => ({ ...current, venue_name: event.target.value }))} placeholder="Venue" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <input value={eventDraft.location_text} onChange={(event) => setEventDraft((current: any) => ({ ...current, location_text: event.target.value }))} placeholder="Location text" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={eventDraft.start_at} onChange={(event) => setEventDraft((current: any) => ({ ...current, start_at: event.target.value }))} type="datetime-local" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <input value={eventDraft.end_at} onChange={(event) => setEventDraft((current: any) => ({ ...current, end_at: event.target.value }))} type="datetime-local" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <input value={eventDraft.registration_url} onChange={(event) => setEventDraft((current: any) => ({ ...current, registration_url: event.target.value }))} placeholder="Registration URL" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">{editingEventId ? "Save event" : "Publish event"}</button>
              </form>
              <div className="space-y-4">
                {events.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{item.title}</div>
                      <div className="text-sm text-cyan-100">{item.category}</div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => {
                        setEditingEventId(item.id);
                        setEventDraft({
                          title: item.title ?? "",
                          category_slug: String(item.category || "").toLowerCase(),
                          summary: item.summary ?? "",
                          description: item.description ?? "",
                          venue_name: item.venue_name ?? "",
                          location_text: item.location_text ?? "",
                          start_at: item.start_at ? new Date(item.start_at).toISOString().slice(0, 16) : "",
                          end_at: item.end_at ? new Date(item.end_at).toISOString().slice(0, 16) : "",
                          registration_url: item.registration_url ?? "",
                        });
                        setMessage(`Editing ${item.title}.`);
                      }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
                        Edit
                      </button>
                      <button onClick={() => destroy(`/admin/events/${item.id}`, "Event deleted successfully.")} className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "newsletters" ? (
            <div className="space-y-6">
              <form onSubmit={submitNewsletterForm} className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="text-xl font-semibold text-white">{editingNewsletterId ? "Edit newsletter" : "Add newsletter"}</div>
                <input value={newsletterDraft.title} onChange={(event) => setNewsletterDraft((current: any) => ({ ...current, title: event.target.value }))} placeholder="Title" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <textarea value={newsletterDraft.summary} onChange={(event) => setNewsletterDraft((current: any) => ({ ...current, summary: event.target.value }))} placeholder="Summary" rows={3} className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <textarea value={newsletterDraft.content} onChange={(event) => setNewsletterDraft((current: any) => ({ ...current, content: event.target.value }))} placeholder="Content" rows={7} className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">{editingNewsletterId ? "Save newsletter" : "Publish newsletter"}</button>
              </form>
              <div className="space-y-4">
                {newsletters.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{item.title}</div>
                      <div className="text-sm text-slate-300">{item.summary}</div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => {
                        setEditingNewsletterId(item.id);
                        setNewsletterDraft({ title: item.title ?? "", summary: item.summary ?? "", content: item.content ?? "" });
                        setMessage(`Editing ${item.title}.`);
                      }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
                        Edit
                      </button>
                      <button onClick={() => destroy(`/admin/newsletters/${item.id}`, "Newsletter deleted successfully.")} className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "testimonials" ? (
            <div className="space-y-6">
              <form onSubmit={submitTestimonialForm} className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="text-xl font-semibold text-white">{editingTestimonialId ? "Edit testimonial" : "Add testimonial"}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={testimonialDraft.name} onChange={(event) => setTestimonialDraft((current: any) => ({ ...current, name: event.target.value }))} placeholder="Name" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <input value={testimonialDraft.role} onChange={(event) => setTestimonialDraft((current: any) => ({ ...current, role: event.target.value }))} placeholder="Role" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <input value={testimonialDraft.company} onChange={(event) => setTestimonialDraft((current: any) => ({ ...current, company: event.target.value }))} placeholder="Company" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <textarea value={testimonialDraft.quote} onChange={(event) => setTestimonialDraft((current: any) => ({ ...current, quote: event.target.value }))} placeholder="Quote" rows={4} className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">{editingTestimonialId ? "Save testimonial" : "Publish testimonial"}</button>
              </form>
              <div className="space-y-4">
                {testimonials.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{item.name}</div>
                      <div className="text-sm text-cyan-100">{item.role}</div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => {
                        setEditingTestimonialId(item.id);
                        setTestimonialDraft({ name: item.name ?? "", role: item.role ?? "", company: item.company ?? "", quote: item.quote ?? "" });
                        setMessage(`Editing ${item.name}.`);
                      }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
                        Edit
                      </button>
                      <button onClick={() => destroy(`/admin/testimonials/${item.id}`, "Testimonial deleted successfully.")} className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "groups" ? (
            <div className="space-y-6">
              <form onSubmit={submitGroupForm} className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="text-xl font-semibold text-white">{editingGroupId ? "Edit group" : "Add group"}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={groupDraft.name} onChange={(event) => setGroupDraft((current: any) => ({ ...current, name: event.target.value }))} placeholder="Group name" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <select value={groupDraft.type} onChange={(event) => setGroupDraft((current: any) => ({ ...current, type: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white">
                    <option value="community">Community</option>
                    <option value="alumni">Alumni</option>
                    <option value="chapter">Chapter</option>
                  </select>
                </div>
                <textarea value={groupDraft.description} onChange={(event) => setGroupDraft((current: any) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={4} className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={groupDraft.region} onChange={(event) => setGroupDraft((current: any) => ({ ...current, region: event.target.value }))} placeholder="Region" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <input value={groupDraft.contact_info} onChange={(event) => setGroupDraft((current: any) => ({ ...current, contact_info: event.target.value }))} placeholder="Contact info" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">{editingGroupId ? "Save group" : "Publish group"}</button>
              </form>
              <div className="space-y-4">
                {groups.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{item.name}</div>
                      <div className="text-sm text-cyan-100 capitalize">{item.type}</div>
                      <div className="mt-1 text-sm text-slate-300">{item.region || item.contact_info || "No region yet"}</div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => {
                        setEditingGroupId(item.id);
                        setGroupDraft({ name: item.name ?? "", type: item.type ?? "community", description: item.description ?? "", region: item.region ?? "", contact_info: item.contact_info ?? "", active: item.active ?? true });
                        setMessage(`Editing ${item.name}.`);
                      }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
                        Edit
                      </button>
                      <button onClick={() => destroy(`/admin/groups/${item.id}`, "Group deleted successfully.")} className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "locations" ? (
            <div className="space-y-6">
              <form onSubmit={submitLocationForm} className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="text-xl font-semibold text-white">{editingLocationId ? "Edit hub location" : "Add hub location"}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={locationDraft.name} onChange={(event) => setLocationDraft((current: any) => ({ ...current, name: event.target.value }))} placeholder="Location name" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <input value={locationDraft.address} onChange={(event) => setLocationDraft((current: any) => ({ ...current, address: event.target.value }))} placeholder="Address" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={locationDraft.city} onChange={(event) => setLocationDraft((current: any) => ({ ...current, city: event.target.value }))} placeholder="City" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <input value={locationDraft.country} onChange={(event) => setLocationDraft((current: any) => ({ ...current, country: event.target.value }))} placeholder="Country" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={locationDraft.latitude} onChange={(event) => setLocationDraft((current: any) => ({ ...current, latitude: event.target.value }))} placeholder="Latitude" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <input value={locationDraft.longitude} onChange={(event) => setLocationDraft((current: any) => ({ ...current, longitude: event.target.value }))} placeholder="Longitude" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={locationDraft.phone} onChange={(event) => setLocationDraft((current: any) => ({ ...current, phone: event.target.value }))} placeholder="Phone" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                  <input value={locationDraft.email} onChange={(event) => setLocationDraft((current: any) => ({ ...current, email: event.target.value }))} placeholder="Email" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                </div>
                <input value={locationDraft.directions_url} onChange={(event) => setLocationDraft((current: any) => ({ ...current, directions_url: event.target.value }))} placeholder="Directions URL" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
                <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">{editingLocationId ? "Save location" : "Publish location"}</button>
              </form>
              <div className="space-y-4">
                {locations.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{item.name}</div>
                      <div className="text-sm text-cyan-100">{item.city}, {item.country}</div>
                      <div className="mt-1 text-sm text-slate-300">{item.email || item.phone || item.address}</div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => {
                        setEditingLocationId(item.id);
                        setLocationDraft({
                          name: item.name ?? "",
                          address: item.address ?? "",
                          city: item.city ?? "",
                          country: item.country ?? "",
                          latitude: item.latitude ?? "",
                          longitude: item.longitude ?? "",
                          phone: item.phone ?? "",
                          email: item.email ?? "",
                          directions_url: item.directions_url ?? "",
                          active: item.active ?? true,
                        });
                        setMessage(`Editing ${item.name}.`);
                      }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
                        Edit
                      </button>
                      <button onClick={() => destroy(`/admin/locations/${item.id}`, "Location deleted successfully.")} className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {message ? <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/8 px-4 py-3 text-sm text-cyan-50">{message}</div> : null}
        </div>
      ) : (
        <div className="rounded-[28px] border border-cyan-300/15 bg-cyan-400/8 p-6 text-sm text-cyan-50">
          Sign in as an admin to access content management.
        </div>
      )}
    </RequireAuth>
  );
}

export function TrackerSection() {
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    clientApi<{ items: any[] }>("/tracker").then((data) => setItems(data.items)).catch(() => setItems([]));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await clientApi<{ message: string }>("/tracker", {
        method: "POST",
        bodyJson: {
          title: form.get("title"),
          organization: form.get("organization"),
          category: form.get("category"),
          date_applied: form.get("date_applied") || null,
          deadline: form.get("deadline") || null,
          status: form.get("status"),
          notes: form.get("notes"),
          follow_up_date: form.get("follow_up_date") || null,
          interview_date: form.get("interview_date") || null,
          result: form.get("result"),
        },
      });
      setMessage(response.message);
      formElement.reset();
      const data = await clientApi<{ items: any[] }>("/tracker");
      setItems(data.items);
    } catch {
      setMessage("Unable to save tracker entry.");
    }
  }

  return (
    <RequireAuth title="Tracker">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="text-xl font-semibold text-white">Add tracker entry</div>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="title" placeholder="Opportunity title" required className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <input name="organization" placeholder="Organization" required className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="category" placeholder="Category" required className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <input name="status" placeholder="Status" required className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="date_applied" type="datetime-local" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <input name="deadline" type="datetime-local" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="follow_up_date" type="datetime-local" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <input name="interview_date" type="datetime-local" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
          </div>
          <input name="result" placeholder="Result" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
          <textarea name="notes" rows={4} placeholder="Notes" className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
          {message ? <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/8 px-4 py-3 text-sm text-cyan-50">{message}</div> : null}
          <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">Save tracker entry</button>
        </form>
        <div className="space-y-4">
          {items.length ? items.map((item) => (
            <div key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-white">{item.title}</div>
                  <div className="text-sm text-cyan-100">{item.organization}</div>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{item.status}</div>
              </div>
              <div className="mt-3 text-sm leading-7 text-slate-300">{item.notes || "No notes added yet."}</div>
            </div>
          )) : (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-300">
              No tracker entries yet. Add your first application to start following deadlines and progress.
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}

export function SavedSection() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    clientApi<{ items: any[] }>("/saved-opportunities").then((data) => setItems(data.items)).catch(() => setItems([]));
  }, []);

  return (
    <RequireAuth title="Saved opportunities">
      <div className="grid gap-4">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="text-lg font-semibold text-white">{item.title}</div>
            <div className="mt-1 text-sm text-cyan-100">{item.organization}</div>
            <div className="mt-3 text-sm text-slate-300">{item.excerpt}</div>
            <div className="mt-4">
              <Link href={`/opportunities/${item.slug}`} className="text-sm text-cyan-200 hover:text-white">
                Reopen opportunity
              </Link>
            </div>
          </div>
        )) : <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-300">No saved opportunities yet.</div>}
      </div>
    </RequireAuth>
  );
}

export function ProfileSection() {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    clientApi("/profile").then(setData).catch(() => setData({ error: true }));
    if (typeof window !== "undefined") {
      setEditMode(new URLSearchParams(window.location.search).get("edit") === "1");
    }
  }, []);

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await clientApi<{ message: string }>("/profile", {
        method: "PUT",
        bodyJson: {
          full_name: form.get("full_name"),
          email: form.get("email"),
          location: form.get("location"),
          bio: form.get("bio"),
          headline: form.get("headline"),
          linkedin_url: form.get("linkedin_url"),
          github_url: form.get("github_url"),
          portfolio_url: form.get("portfolio_url"),
          skills_text: form.get("skills_text"),
          interests_text: form.get("interests_text"),
        },
      });
      setMessage(response.message);
      const refreshed = await clientApi("/profile");
      setData(refreshed);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    }
  }

  async function handleAvatarUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("Uploading photo...");
    try {
      const token = getStoredAccessToken();
      const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (!response.ok) {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const payload = await response.json();
          throw new Error(payload.detail ?? "Upload failed. Please try again.");
        }
        throw new Error(`Upload failed (${response.status}). Please try again.`);
      }
      const refreshed = await clientApi("/profile");
      setData(refreshed);
      setMessage("Profile image uploaded successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not upload profile image.");
    }
  }

  return (
    <RequireAuth title="Profile">
      {data?.profile ? (
        <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
            {data.profile.avatar_url ? (
              <img src={resolveAssetUrl(data.profile.avatar_url) ?? ""} alt={data.profile.full_name} className="h-28 w-28 rounded-full object-cover" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl font-semibold text-white">
                {data.profile.full_name?.slice(0, 1)}
              </div>
            )}
            <div className="text-2xl font-semibold text-white">{data.profile.full_name}</div>
            <div className="text-cyan-100">{data.email}</div>
            <div className="text-sm text-slate-300">{data.profile.location || "Location not added yet."}</div>
            <div className="text-sm leading-7 text-slate-300">{data.profile.bio || "Add your story and career focus to strengthen your profile."}</div>
            <form onSubmit={handleAvatarUpload} className="space-y-3">
              <input name="avatar" type="file" accept="image/*" className="block w-full text-sm text-slate-300" />
              <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950">Upload photo</button>
            </form>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold text-white">{editMode ? "Edit profile" : "Profile details"}</div>
              <Link href={editMode ? "/profile" : "/profile?edit=1"} className="text-sm text-cyan-200 hover:text-white">
                {editMode ? "View mode" : "Edit mode"}
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input name="full_name" defaultValue={data.profile.full_name} placeholder="Full name" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
              <input name="email" defaultValue={data.email} placeholder="Email" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input name="headline" defaultValue={data.profile.headline ?? ""} placeholder="Headline" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
              <input name="location" defaultValue={data.profile.location ?? ""} placeholder="Location" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            </div>
            <textarea name="bio" defaultValue={data.profile.bio ?? ""} rows={4} placeholder="Bio" className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <div className="grid gap-4 md:grid-cols-2">
              <input name="linkedin_url" defaultValue={data.profile.linkedin_url ?? ""} placeholder="LinkedIn URL" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
              <input name="github_url" defaultValue={data.profile.github_url ?? ""} placeholder="GitHub URL" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            </div>
            <input name="portfolio_url" defaultValue={data.profile.portfolio_url ?? ""} placeholder="Portfolio URL" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <textarea name="skills_text" defaultValue={data.profile.skills_text ?? ""} rows={3} placeholder="Skills, comma separated" className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            <textarea name="interests_text" defaultValue={data.profile.interests_text ?? ""} rows={3} placeholder="Interests, comma separated" className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
            {message ? <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/8 px-4 py-3 text-sm text-cyan-50">{message}</div> : null}
            <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">Save profile</button>
          </form>
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-300">Loading profile...</div>
      )}
    </RequireAuth>
  );
}

export function NewsletterArchiveSection() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    clientApi<{ items: any[] }>("/newsletters").then((data) => setItems(data.items)).catch(() => setItems([]));
  }, []);

  return (
    <RequireAuth title="Newsletter archive">
      <div className="grid gap-4 md:grid-cols-2">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-semibold text-white">{item.title}</div>
            <div className="mt-2 text-sm text-slate-300">{item.summary}</div>
            <div className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-100">
              {new Date(item.published_at).toLocaleDateString()}
            </div>
          </div>
        )) : (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-300">
            No newsletters have been published yet.
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
