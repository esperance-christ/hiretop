import { createClient } from '@supabase/supabase-js'
import env from '#start/env'

const supabaseUrl = env.get('SUPABASE_URL')
const supabaseKey = env.get('SUPABASE_KEY')

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Veuillez definir les cles SUPABASE doivent être définis')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
