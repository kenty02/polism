import {createClient} from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
