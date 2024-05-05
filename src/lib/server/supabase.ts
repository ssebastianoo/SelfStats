import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { env as envServer } from '$env/dynamic/private';

export const supabase = createClient(env.PUBLIC_SUPABASE_URL!, envServer.PRIVATE_SERVICE_ROLE);
