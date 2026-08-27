/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    '*.trycloudflare.com',
    'localhost:3001',
    '127.0.0.1:3001'
  ],
}

module.exports = nextConfig
