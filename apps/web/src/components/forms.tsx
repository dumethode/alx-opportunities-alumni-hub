"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { API_BASE_URL, clientApi } from "@/lib/client-api";

type ResumeEntry = { [key: string]: string };

function fieldClass() {
  return "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white";
}

function fileNameFromResponse(response: Response, fallback: string) {
  const disposition = response.headers.get("Content-Disposition") || response.headers.get("content-disposition");
  const match = disposition?.match(/filename="([^"]+)"/i);
  return match?.[1] || fallback;
}

function formatRange(from?: string, until?: string) {
  const parts = [String(from || "").trim(), String(until || "").trim()].filter(Boolean);
  return parts.join(" - ");
}

function GuidePanel({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-300">
      <div className="font-semibold text-white">{title}</div>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div>
    </div>
  );
}

function ResumeTemplatePreview() {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
      <div className="px-6 py-6">
        <div className="text-center text-2xl font-semibold">Full Name</div>
        <div className="mt-2 text-center text-sm text-slate-600">Kigali, Rwanda | +250 700 000 000</div>
        <div className="text-center text-sm text-slate-600">LinkedIn | GitHub | email@alxafrica.com</div>
        {["PROFESSIONAL PROFILE", "EDUCATIONAL BACKGROUND", "WORK EXPERIENCE", "SKILLS & ABILITIES"].map((heading) => (
          <div key={heading} className="mt-6">
            <div className="text-sm font-bold">{heading}</div>
            <div className="mt-1 h-px bg-slate-900" />
            <div className="mt-3 text-xs leading-6 text-slate-600">
              {heading === "SKILLS & ABILITIES" ? "Three aligned skill columns with group headings and bullet points." : "Your filled details appear here in the final resume."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoverLetterTemplatePreview() {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
      <div className="px-6 py-6 text-sm leading-7">
        <div>Full Name</div>
        <div>Gasabo, Kigali, Rwanda</div>
        <div>+250 700 000 000</div>
        <div>email@alxafrica.com</div>
        <div className="mt-6">February 03rd, 2026</div>
        <div className="mt-6">Hiring Team</div>
        <div>Recruitment Office</div>
        <div>Company Name</div>
        <div>Company Address</div>
        <div>Kigali, Rwanda</div>
        <div className="mt-6 text-base font-semibold">RE: APPLICATION FOR ROLE TITLE</div>
        <div className="mt-6">Dear Hiring Team,</div>
        <div className="mt-4 text-slate-600">Your opening, body paragraphs, and closing appear here in the same structure as the final cover letter.</div>
        <div className="mt-6">Sincerely,</div>
        <div className="mt-4 font-semibold">Full Name</div>
      </div>
    </div>
  );
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      if (mode === "sign-up") {
        await clientApi("/auth/register", {
          method: "POST",
          bodyJson: {
            full_name: form.get("full_name"),
            email: form.get("email"),
            password: form.get("password"),
          },
        });
      } else {
        await clientApi("/auth/login", {
          method: "POST",
          bodyJson: {
            email: form.get("email"),
            password: form.get("password"),
          },
        });
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "sign-up" ? (
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Full name</span>
          <input name="full_name" required className={fieldClass()} />
        </label>
      ) : null}
      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Email</span>
        <input name="email" type="email" required placeholder="name@alxafrica.com" className={fieldClass()} />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Password</span>
        <input name="password" type="password" required className={fieldClass()} />
      </label>
      {error ? <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
      <button disabled={loading} className="w-full rounded-2xl bg-[linear-gradient(135deg,#1ee3ff,#1c7eff)] px-4 py-3 font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70">
        {loading ? "Please wait..." : mode === "sign-up" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}

export function ContactForm() {
  const [state, setState] = useState<"idle" | "success" | "error" | "loading">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const form = new FormData(event.currentTarget);

    try {
      await clientApi("/contact", {
        method: "POST",
        bodyJson: {
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          category: form.get("category"),
          subject: form.get("subject"),
          message: form.get("message"),
        },
      });
      setState("success");
      event.currentTarget.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input name="name" placeholder="Your name" required className={fieldClass()} />
        <input name="email" placeholder="Your email" type="email" required className={fieldClass()} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="phone" placeholder="Phone, optional" className={fieldClass()} />
        <select name="category" required className={fieldClass()}>
          <option value="General">General</option>
          <option value="Opportunities">Opportunities</option>
          <option value="Mentorship">Mentorship</option>
          <option value="Support">Support</option>
        </select>
      </div>
      <input name="subject" placeholder="Subject" required className={fieldClass()} />
      <textarea name="message" placeholder="How can we help?" required rows={5} className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
      {state === "success" ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Message sent successfully. Expect a response within 48 business hours.</div> : null}
      {state === "error" ? <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">We could not send your message. Please try again.</div> : null}
      <button disabled={state === "loading"} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
        {state === "loading" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}

export function NewsletterSignupForm() {
  const [state, setState] = useState<"idle" | "success" | "error" | "loading">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const form = new FormData(event.currentTarget);

    try {
      await clientApi("/contact", {
        method: "POST",
        bodyJson: {
          name: "Newsletter subscriber",
          email: form.get("email"),
          phone: null,
          category: "Newsletter",
          subject: "Newsletter signup request",
          message: "Please add me to the ALX opportunity and community memo updates.",
        },
      });
      setState("success");
      event.currentTarget.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="email" type="email" required placeholder="name@alxafrica.com" className={fieldClass()} />
      <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">
        {state === "loading" ? "Subscribing..." : "Join the newsletter"}
      </button>
      {state === "success" ? <div className="text-sm text-emerald-200">Subscription request sent. The team will include you in the next memo cycle.</div> : null}
      {state === "error" ? <div className="text-sm text-red-200">We could not submit your newsletter request.</div> : null}
    </form>
  );
}

function DynamicList({
  title,
  items,
  setItems,
  fields,
}: {
  title: string;
  items: ResumeEntry[];
  setItems: (items: ResumeEntry[]) => void;
  fields: Array<{ key: string; label: string; multiline?: boolean }>;
}) {
  function update(index: number, key: string, value: string) {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    setItems(next);
  }

  function add() {
    setItems([...items, Object.fromEntries(fields.map((field) => [field.key, ""]))]);
  }

  function remove(index: number) {
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-white">{title}</div>
        <button type="button" onClick={add} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
          Add More
        </button>
      </div>
      {items.map((item, index) => (
        <div key={`${title}-${index}`} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-cyan-100">{title} {index + 1}</div>
            {items.length > 1 ? (
              <button type="button" onClick={() => remove(index)} className="text-sm text-red-200">
                Remove
              </button>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {fields.map((field) =>
              field.multiline ? (
                <textarea
                  key={field.key}
                  value={item[field.key] ?? ""}
                  onChange={(event) => update(index, field.key, event.target.value)}
                  placeholder={field.label}
                  rows={4}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white md:col-span-2"
                />
              ) : (
                <input
                  key={field.key}
                  value={item[field.key] ?? ""}
                  onChange={(event) => update(index, field.key, event.target.value)}
                  placeholder={field.label}
                  className={fieldClass()}
                />
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ResumeBuilderForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [experience, setExperience] = useState<ResumeEntry[]>([{ role: "", company: "", from: "", until: "", location: "", highlights: "" }]);
  const [education, setEducation] = useState<ResumeEntry[]>([{ school: "", award: "", from: "", until: "", location: "" }]);
  const [certifications, setCertifications] = useState<ResumeEntry[]>([{ name: "", issuer: "", year: "" }]);
  const [awards, setAwards] = useState<ResumeEntry[]>([{ name: "", issuer: "", year: "" }]);
  const [projects, setProjects] = useState<ResumeEntry[]>([{ name: "", description: "", impact: "" }]);
  const [skillGroups, setSkillGroups] = useState<ResumeEntry[]>([{ name: "", skills: "" }]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);

    const payload = {
      full_name: form.get("full_name"),
      headline: form.get("headline"),
      email: form.get("email"),
      phone: form.get("phone"),
      location: form.get("location"),
      linkedin_url: form.get("linkedin_url"),
      github_url: form.get("github_url"),
      summary: form.get("summary"),
      experience: experience.map((item) => ({ ...item, period: formatRange(item.from, item.until) })),
      education: education.map((item) => ({ ...item, period: formatRange(item.from, item.until) })),
      certifications,
      awards,
      projects,
      skill_groups: skillGroups,
      skills: skillGroups.flatMap((group) => String(group.skills || "").split(",").map((skill) => skill.trim()).filter(Boolean)),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/documents/resume`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileNameFromResponse(response, "alx-resume.docx");
      anchor.click();
      window.URL.revokeObjectURL(url);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <GuidePanel
          title="How to fill the resume template"
          items={[
            "Use Full name, email, phone, and location exactly as you want them to appear at the top.",
            "For Work Experience and Education, fill From and Until, for example Aug 2024 and Oct 2025.",
            "Write one highlight per line, not separated by commas.",
            "Leave Projects, Awards, or Certifications blank if you do not have them, they will not appear in the final resume.",
            "Use Skill Groups to create aligned columns like Student & Office Support, Technical Tools, or Project and Operations Support.",
          ]}
        />
        <ResumeTemplatePreview />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="full_name" placeholder="Full name" required className={fieldClass()} />
        <input name="email" placeholder="Email" type="email" required className={fieldClass()} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="phone" placeholder="Phone" required className={fieldClass()} />
        <input name="location" placeholder="Location" required className={fieldClass()} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="linkedin_url" placeholder="LinkedIn URL" className={fieldClass()} />
        <input name="github_url" placeholder="GitHub URL" className={fieldClass()} />
      </div>
      <input name="headline" placeholder="Professional headline" required className={fieldClass()} />
      <textarea name="summary" rows={4} placeholder="Professional summary" required className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
      <DynamicList title="Work Experience" items={experience} setItems={setExperience} fields={[
        { key: "role", label: "Role" },
        { key: "company", label: "Company" },
        { key: "from", label: "From, for example Aug 2024" },
        { key: "until", label: "Until, for example Oct 2025 or Present" },
        { key: "location", label: "Location" },
        { key: "highlights", label: "Highlights, write one bullet per line", multiline: true },
      ]} />
      <DynamicList title="Education" items={education} setItems={setEducation} fields={[
        { key: "school", label: "School" },
        { key: "award", label: "Degree or certificate" },
        { key: "from", label: "From, for example Sep 2022" },
        { key: "until", label: "Until, for example Nov 2025" },
        { key: "location", label: "Location" },
        { key: "honors", label: "Honors or classification" },
        { key: "gpa", label: "GPA or final score" },
      ]} />
      <DynamicList title="Certifications" items={certifications} setItems={setCertifications} fields={[
        { key: "name", label: "Certification" },
        { key: "issuer", label: "Issuer" },
        { key: "year", label: "Year" },
      ]} />
      <DynamicList title="Awards" items={awards} setItems={setAwards} fields={[
        { key: "name", label: "Award" },
        { key: "issuer", label: "Issuer" },
        { key: "year", label: "Year" },
      ]} />
      <DynamicList title="Projects" items={projects} setItems={setProjects} fields={[
        { key: "name", label: "Project" },
        { key: "impact", label: "Impact" },
        { key: "link", label: "Project link, optional" },
        { key: "description", label: "Description", multiline: true },
      ]} />
      <DynamicList title="Skill Groups" items={skillGroups} setItems={setSkillGroups} fields={[
        { key: "name", label: "Group name, for example Product or Technical" },
        { key: "skills", label: "Skills, comma separated" },
      ]} />
      {status === "success" ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Your resume has been generated and downloaded.</div> : null}
      {status === "error" ? <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">Resume generation failed. Please try again.</div> : null}
      <button disabled={status === "loading"} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
        {status === "loading" ? "Generating..." : "Generate resume"}
      </button>
    </form>
  );
}

function CoverLetterBuilderForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const payload = {
      full_name: form.get("full_name"),
      email: form.get("email"),
      phone: form.get("phone"),
      location: form.get("location"),
      linkedin_url: form.get("linkedin_url"),
      date: form.get("date"),
      hiring_manager: form.get("hiring_manager"),
      recipient_title: form.get("recipient_title"),
      company: form.get("company"),
      recipient_address: form.get("recipient_address"),
      recipient_location: form.get("recipient_location"),
      role_title: form.get("role_title"),
      intro: form.get("intro"),
      body: [form.get("body_1"), form.get("body_2"), form.get("body_3")].filter(Boolean),
      closing: form.get("closing"),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/documents/cover-letter`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileNameFromResponse(response, "alx-cover-letter.docx");
      anchor.click();
      window.URL.revokeObjectURL(url);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <GuidePanel
          title="How to fill the cover letter template"
          items={[
            "Use the same name and contact details you want at the top of the final letter.",
            "Fill the company block carefully: recipient name, title, company, address, and location.",
            "Write a strong opening that names the role directly.",
            "Use body paragraphs for role fit, key evidence, and why you are a strong match.",
            "Keep the closing short, confident, and ready for signature.",
          ]}
        />
        <CoverLetterTemplatePreview />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="full_name" placeholder="Full name" required className={fieldClass()} />
        <input name="email" placeholder="Email" type="email" required className={fieldClass()} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="phone" placeholder="Phone" required className={fieldClass()} />
        <input name="location" placeholder="Location" required className={fieldClass()} />
      </div>
      <input name="linkedin_url" placeholder="LinkedIn URL, optional" className={fieldClass()} />
      <div className="grid gap-4 md:grid-cols-2">
        <input name="date" placeholder="Date" required className={fieldClass()} />
        <input name="hiring_manager" placeholder="Recipient name or hiring manager" required className={fieldClass()} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="recipient_title" placeholder="Recipient title, optional" className={fieldClass()} />
        <input name="company" placeholder="Company" required className={fieldClass()} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="recipient_address" placeholder="Company address" className={fieldClass()} />
        <input name="recipient_location" placeholder="Company location" className={fieldClass()} />
      </div>
      <input name="role_title" placeholder="Role title or subject" required className={fieldClass()} />
      <textarea name="intro" rows={3} placeholder="Opening paragraph" required className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
      <textarea name="body_1" rows={3} placeholder="Body paragraph one" required className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
      <textarea name="body_2" rows={3} placeholder="Body paragraph two" required className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
      <textarea name="body_3" rows={3} placeholder="Optional body paragraph three" className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
      <textarea name="closing" rows={2} placeholder="Closing paragraph and signature" required className="w-full rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" />
      {status === "success" ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Your cover letter has been generated and downloaded.</div> : null}
      {status === "error" ? <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">Cover letter generation failed. Please try again.</div> : null}
      <button disabled={status === "loading"} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
        {status === "loading" ? "Generating..." : "Generate cover letter"}
      </button>
    </form>
  );
}

export function DocumentBuilder({ type }: { type: "resume" | "cover-letter" }) {
  return type === "resume" ? <ResumeBuilderForm /> : <CoverLetterBuilderForm />;
}
