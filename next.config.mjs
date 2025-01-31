/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // 匹配所有 API 路由
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // 在生产环境中建议设置具体的域名
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    },
    async rewrites() {
        return [
            {
                source: '/api/tweets',
                destination: 'http://107.175.36.39:3000/tweets'
            },
            {
                source: '/api/token-analysis/:path*',
                destination: 'http://107.175.36.39:3000/token-analysis/:path*'
            },
            {
                source: '/api/user/:username',
                destination: 'http://107.175.36.39:3000/user/:username'
            }
        ]
    }
};

export default nextConfig;