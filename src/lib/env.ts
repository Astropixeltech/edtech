const getEnvVar = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {}
  try {
    if (typeof process !== "undefined" && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {}
  return undefined;
};

export const SUPABASE_URL =
  getEnvVar("VITE_SUPABASE_URL") ||
  getEnvVar("NEXT_PUBLIC_SUPABASE_URL") ||
  "https://ayqbpqgahtycrncbknvj.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  getEnvVar("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  getEnvVar("VITE_SUPABASE_ANON_KEY") ||
  getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  getEnvVar("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWJwcWdhaHR5Y3JuY2JrbnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDU5OTgsImV4cCI6MjA4NDMyMTk5OH0.AQXrmhtMhjXrlb3spjKdD9dp0XQbiTzhexTpEKmdO0o";

export const SUPABASE_PROJECT_ID =
  getEnvVar("VITE_SUPABASE_PROJECT_ID") ||
  getEnvVar("NEXT_PUBLIC_SUPABASE_PROJECT_ID") ||
  "ayqbpqgahtycrncbknvj";

export const CLOUDINARY_CLOUD_NAME =
  getEnvVar("VITE_CLOUDINARY_CLOUD_NAME") ||
  getEnvVar("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME") ||
  getEnvVar("CLOUDINARY_CLOUD_NAME") ||
  "u1tmgtke";

export const CLOUDINARY_API_KEY =
  getEnvVar("VITE_CLOUDINARY_API_KEY") ||
  getEnvVar("NEXT_PUBLIC_CLOUDINARY_API_KEY") ||
  getEnvVar("CLOUDINARY_API_KEY") ||
  "794196418432486";

