import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    // `unauthorized()` / `forbidden()` in the data-access layer depend on these.
    authInterrupts: true,
  },
};

export default withNextIntl(nextConfig);
