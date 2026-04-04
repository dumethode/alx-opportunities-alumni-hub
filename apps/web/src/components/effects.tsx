"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export function AnimatedCounter({ value, label }: { value: number; label: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    const interval = window.setInterval(() => {
      frame += 1;
      setDisplayValue(Math.round((value * frame) / totalFrames));
      if (frame >= totalFrames) window.clearInterval(interval);
    }, 25);
    return () => window.clearInterval(interval);
  }, [value]);

  return (
    <div className="counter-card rounded-2xl border border-[color:var(--alx-border)] bg-[var(--alx-panel-muted)] px-4 py-4">
      <div className="text-2xl font-semibold text-[var(--alx-text-strong)]">{displayValue}</div>
      <div className="mt-1 text-sm text-[var(--alx-text-muted)]">{label}</div>
    </div>
  );
}

export function HeroSlides({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [items.length]);

  return (
    <div className="space-y-3">
      <div className="relative h-8 overflow-hidden text-cyan-100">
        {items.map((item, itemIndex) => (
          <div
            key={item}
            className={`absolute left-0 top-0 transition duration-500 ${
              itemIndex === index ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {items.map((item, itemIndex) => (
          <div
            key={`${item}-dot`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              itemIndex === index ? "w-10 bg-cyan-200" : "w-4 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function CarouselStrip({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden pb-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-[linear-gradient(90deg,var(--alx-bg),transparent)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-[linear-gradient(270deg,var(--alx-bg),transparent)]" />
      <div className="overflow-x-auto">
        <div className="flex gap-6 snap-x snap-mandatory">{children}</div>
      </div>
    </div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Show content immediately to avoid large blank gaps during hydration.
  // For below-the-fold blocks, we opt back into reveal animation after mount.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let rect: DOMRect | null = null;
    try {
      rect = node.getBoundingClientRect();
    } catch {
      rect = null;
    }

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    // If the element is far below the viewport, re-enable the reveal animation
    // without causing visible flicker on the current screen.
    if (rect && rect.top > window.innerHeight * 1.15) {
      setVisible(false);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal-block ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function HeroAtmosphere() {
  return (
    <>
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />
      <div className="hero-orb hero-orb-three" />
    </>
  );
}

export function HeroBackdrop({
  images,
}: {
  images: Array<{ src: string; alt: string }>;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images.length) return;
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 5200);
    return () => window.clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0">
      {images.map((image, imageIndex) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={`absolute inset-0 h-full w-full object-cover transition duration-1000 ${
            imageIndex === index ? "opacity-100" : "opacity-0"
          } kenburns-slow`}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,27,110,0.72),rgba(4,10,20,0.25))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(18,91,255,0.28),transparent_45%)]" />
    </div>
  );
}

export function RoleMarquee({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  const track = [...items, ...items];
  return (
    <div className="rounded-[30px] border border-[color:var(--alx-border)] bg-[var(--alx-panel)] px-6 py-6 shadow-[0_18px_48px_rgba(9,49,90,0.08)]">
      <div className="text-sm font-semibold text-[var(--alx-text-strong)]">{title}</div>
      <div className="mt-4 alx-marquee">
        <div className="alx-marquee-track">
          {track.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full border border-[color:var(--alx-border)] bg-[var(--alx-pill)] px-4 py-2 text-sm font-medium text-[var(--alx-text-strong)] transition hover:bg-[var(--alx-pill-active)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 text-sm text-[var(--alx-text-muted)]">
        Tap a category on Opportunities to filter faster.
      </div>
    </div>
  );
}
