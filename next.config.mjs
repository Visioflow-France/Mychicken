import { resolve } from 'path';

/** @type {import('next').NextConfig} */

/* Sur le serveur (SSR des composants clients + bundle Cloudflare Workers),
   le point d'entrée « node » de @firebase/firestore embarque grpc/protobufjs,
   qui utilise `new Function` — interdit sur Cloudflare Workers. On force
   le build navigateur (fetch/WebChannel), identique et compatible partout. */
const nextConfig = {
  webpack(config, { isServer }) {
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        '@firebase/firestore': resolve('node_modules/@firebase/firestore/dist/index.esm.js'),
        '@firebase/firestore/lite': resolve('node_modules/@firebase/firestore/dist/lite/index.browser.esm.js'),
      };
    }
    return config;
  },
};

export default nextConfig;
