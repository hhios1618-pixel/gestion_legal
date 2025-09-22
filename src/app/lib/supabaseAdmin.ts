// src/app/lib/supabaseAdmin.ts
import 'server-only'; // evita que se empaquete al browser
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;     // <- NO CAMBIO NOMBRE
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // <- NO CAMBIO NOMBRE

if (!supabaseUrl || !supabaseServiceKey) {
  // Importante: este archivo NO debe cargarse en el cliente.
  // Si ves este error en el browser, algún componente client está importando supabaseAdmin.ts.
  throw new Error('Supabase URL o Service Role Key no están definidos en las variables de entorno.');
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});