/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        // Enable Next.js image optimization (WebP, responsive sizes, lazy loading)
        formats: ["image/webp", "image/avif"],
    },
};

export default nextConfig;
