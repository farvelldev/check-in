import { createClient } from '@supabase/supabase-js';

// Este cliente usa claves públicas; nunca lo inicialices con credenciales privadas.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);