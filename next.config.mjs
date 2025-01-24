/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/tweets',
                destination: 'http://107.175.36.39:3000/tweets'
            }
        ]
    }
};

export default nextConfig;
