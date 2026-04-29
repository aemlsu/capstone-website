/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "www.genyo.com.ph",
      },
      {
        protocol: "https",
        hostname: "**",   // temporary - allows all external images (safe for development)
      },
    ],
  },
};

module.exports = nextConfig;