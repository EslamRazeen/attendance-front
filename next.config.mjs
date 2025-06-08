/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'attendance-eslamrazeen-eslam-razeens-projects.vercel.app'],
  },
  async rewrites() {
    return [
      {
        source: '/api/attendance/:path*',
        destination: 'https://attendance-eslamrazeen-eslam-razeens-projects.vercel.app/api/attendanceQRCode/:path*',
      },
    ]
  },
};

export default nextConfig;
