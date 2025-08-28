import { createClient } from "@supabase/supabase-js";
import * as config from "./config.js";

const supabase = createClient(config.default.supabase.supabaseUrl, config.default.supabase.supabaseAnonKey);

export { supabase };
