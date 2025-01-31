/** @type {import('next').NextConfig} */
const nextConfig = {
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