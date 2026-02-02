/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // frontend calls /api/tasks
        destination: 'https://anooshaqasim-full-stack-todo-backend.hf.space/api/:path*', 
      },
    ];
  },
};

module.exports = nextConfig;
