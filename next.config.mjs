// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['www.flaticon.com'], // Correct the domains property to be an array
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          path: require.resolve('path-browserify'),
        };
      }
      return config;
    },
  };
  
  export default nextConfig;