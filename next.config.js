/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/nextjs');

// const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const isProduction = false;

const ContentSecurityPolicy = `
  frame-ancestors 'self';
  img-src 'self';
  data https;
`

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    dirs: ['pages', 'src'], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
  },
  extends: [
    'plugin:@next/next/recommended',
  ],
  images: {
    domains: ['images.ctfassets.net', 'picsum.photos','placeholder', 'via.placeholder.com', 'data.commercelayer.app','tienda.grupovanti.com'],
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true
      },
      {
        source: '/home/:slug*',
        destination: '/:slug*',
        permanent: true
      }
    ];
  },
  publicRuntimeConfig: {
    NEXT_PUBLIC_COMMERCELAYER_ENDPOINT: process.env.NEXT_PUBLIC_COMMERCELAYER_ENDPOINT,
    NEXT_PUBLIC_COMMERCELAYER_CLIENT_ID: process.env.NEXT_PUBLIC_COMMERCELAYER_CLIENT_ID,
    NEXT_PUBLIC_COMMERCELAYER_MARKET_SCOPE: process.env.NEXT_PUBLIC_COMMERCELAYER_MARKET_SCOPE,
  },
  staticPageGenerationTimeout: 300,
  experimental: {
    largePageDataBytes: 512 * 1024
  },
  i18n: {
    locales: ['es'],
    defaultLocale: 'es',
  },
  async headers () {
    return [
      {
        source: '/',
        headers: [
            {
              key: 'strict-transport-security',
              value: 'max-age=31557600; includeSubDomains; preload',
            },
            {
              key: 'x-xss-protection',
              value: '1; mode=block',
            },
            {
              key: 'x-frame-options',
              value: 'SAMEORIGIN',
            },
            {
              key: 'content-security-policy',
              value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
            },
        ],
      }
    ];
  },
};

if (isProduction) {
  nextConfig['sentry'] = {
    // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
    // for client-side builds. (This will be the default starting in
    // `@sentry/nextjs` version 8.0.0.) See
    // https://webpack.js.org/configuration/devtool/ and
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
    // for more information.
    hideSourceMaps: true,
  };
}

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = isProduction ? withSentryConfig(nextConfig, sentryWebpackPluginOptions) : nextConfig;
