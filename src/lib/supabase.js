
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aparezodtgmmhflhkzpg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LrXYgALCh74mNJ2qlA3CxQ_QfSsCKM2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
