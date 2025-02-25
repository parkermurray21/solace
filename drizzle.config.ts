const config = {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migration",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
};

export default config;
