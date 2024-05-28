/** @type {import('next').NextConfig} */
const nextConfig =  {
    experimental: {
        serverActions: {
            bodySizeLimit: '20gb',
        },
    }, 
};

export default nextConfig;
