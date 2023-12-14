/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// module.exports = nextConfig;

module.exports = {
  images: {
    domains: ["public.linear.app", "localhost"],
  },
  nextConfig,
};
