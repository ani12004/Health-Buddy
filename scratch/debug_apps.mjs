import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .limit(5)
  
  console.log('Appointments sample:', JSON.stringify(data, null, 2))
  if (error) console.error('Error:', error)
}

debugAppointments()
