/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['pbs.twimg.com'],
    },
    async rewrites() {
        const isProd = process.env.NODE_ENV === 'production';
        const baseUrl = isProd
            ? 'http://107.175.36.39:3000'  // 请替换为您的生产环境 API 地址
            : 'http://127.0.0.1:8080';       // 开发环境 API 地址

        return [
            {
                source: '/api/tweets',
                destination: `${baseUrl}/tweets`
            },
            {
                source: '/api/token-analysis/:path*',
                destination: `${baseUrl}/token-analysis/:path*`
            },
            {
                source: '/api/user/:username',
                destination: `${baseUrl}/user/:username`
            }
        ]
    }
};

export default nextConfig;