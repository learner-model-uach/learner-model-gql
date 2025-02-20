/**
 * @type {import('next').NextConfig}
 */
const config = {
  experimental: {
    externalDir: true,
  },
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;
