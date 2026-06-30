/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: '.',
  },
  devIndicators: false,
  env: {
    NEXT_PUBLIC_API_URL: 'https://trustly-hub-escrow-system-production.up.railway.app/api',
  },
};

export default nextConfig;
