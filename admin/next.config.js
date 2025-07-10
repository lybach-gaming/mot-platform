// @ts-check

const { withNx } = require('@nx/next');

/**
* @type {import('@nx/next/plugins/with-nx').WithNxOptions}
**/
const nextConfig = {
 nx: {},
 async rewrites() {
   return {
     fallback: [
       {
         source: '/:path*',
         destination: `${process.env.PHP_ADMIN}/:path*`,
       },
     ],
   };
 },
};

module.exports = withNx(nextConfig);