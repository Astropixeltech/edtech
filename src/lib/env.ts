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

export const SUPABASE_URL = "http://localhost:5000";
export const SUPABASE_PUBLISHABLE_KEY = "local-anon-key";
export const SUPABASE_PROJECT_ID = "local-edtech";

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
