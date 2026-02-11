/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  experimental: {
    externalDir: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/organizations',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
