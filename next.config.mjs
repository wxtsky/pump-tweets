/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: 'https://x.com'
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, PUT, DELETE, OPTIONS'
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-Requested-With, Content-Type, Accept'
                    },
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true'
                    }
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
