import dotenv from "dotenv";
import assert from "assert";

dotenv.config();

const { PORT, HOST, HOST_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE } =
  process.env;

assert(PORT, "Port is required");
assert(HOST, "Host is required");

const cf = {
  port: PORT,
  host: HOST,
  hostUrl: HOST_URL,
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
  supabaseServiceRole: SUPABASE_SERVICE_ROLE,
};

export { cf };
