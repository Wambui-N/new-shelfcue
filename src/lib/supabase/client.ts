import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "./database.types";

export const createClient = () => createBrowserClient<Database>();
