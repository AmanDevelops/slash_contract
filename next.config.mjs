import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  disable: false,
});

// Your Next config is automatically typed!
export default withPWA({
  basePath: process.env.NEXT_PUBLIC_BASE_PATH, // Sets the base path to `/some-base-path`.
});
