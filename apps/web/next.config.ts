import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextConfigForPhase(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    typedRoutes: false,
    distDir: isDev ? ".next-dev" : ".next",
    experimental: {
      devtoolSegmentExplorer: false,
    },
    webpack: (config, { dev }) => {
      if (dev) {
        config.cache = false;
      }
      return config;
    },
  };
}
