import { createClient } from "@supabase/supabase-js";
import * as config from "./config.js";

const supabase = createClient(config.cf.supabaseUrl, config.cf.supabaseAnonKey);

export { supabase };
