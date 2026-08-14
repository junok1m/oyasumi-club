// next.config.ts

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/girls",
        destination: "/",
        permanent: true,
      },
      {
        source: "/girls/jobs",
        destination: "/jobs",
        permanent: true,
      },
      {
        source: "/girls/qna",
        destination: "/qna",
        permanent: true,
      },
      {
        source: "/girls/reviews",
        destination: "/reviews",
        permanent: true,
      },
      {
        source: "/girls/blog",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/girls/jobs/:slug*",
        destination: "/jobs/:slug*",
        permanent: true,
      },
      {
        source: "/girls/qna/:slug*",
        destination: "/qna/:slug*",
        permanent: true,
      },
      {
        source: "/girls/reviews/:slug*",
        destination: "/reviews/:slug*",
        permanent: true,
      },
      {
        source: "/girls/blog/:slug*",
        destination: "/blog/:slug*",
        permanent: true,
      },
      {
        source: "/girls/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
