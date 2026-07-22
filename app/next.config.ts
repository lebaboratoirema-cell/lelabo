import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/:locale/glassware',
        destination: '/:locale/petit-outillage',
        permanent: true,
      },
      {
        source: '/:locale/glassware/:path*',
        destination: '/:locale/petit-outillage/:path*',
        permanent: true,
      },
      {
        source: '/:locale/chemicals',
        destination: '/:locale/produits-chimiques',
        permanent: true,
      },
      {
        source: '/:locale/chemicals/:path*',
        destination: '/:locale/produits-chimiques/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
