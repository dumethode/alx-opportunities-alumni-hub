"use client";

import { ImgHTMLAttributes, useEffect, useMemo, useState } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackSrc: string;
};

export function SafeImage({ src, fallbackSrc, alt = "", ...props }: Props) {
  const desiredSrc = useMemo(() => src || fallbackSrc, [src, fallbackSrc]);
  const [currentSrc, setCurrentSrc] = useState(desiredSrc);

  useEffect(() => {
    setCurrentSrc(desiredSrc);
  }, [desiredSrc]);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      loading={props.loading ?? "lazy"}
      decoding={props.decoding ?? "async"}
      onError={(event) => {
        props.onError?.(event);
        // If the primary URL 404s in production (common with ephemeral uploads),
        // fall back to a stable public placeholder so the UI never looks empty.
        setCurrentSrc((existing) => (existing === fallbackSrc ? existing : fallbackSrc));
      }}
    />
  );
}

