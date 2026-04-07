const config = {
  host:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:5000",
};

export default config;
