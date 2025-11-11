/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    experimental: {
      allowedDevOrigins: [
      'http://127.0.0.1:3000',
      
    ], // replace with your actual dev IP/port
    },
  };
  
  export default nextConfig;
  