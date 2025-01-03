import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'dev' } });

export async function insertRow(tableName: string, row: any) {
  const { data, error } = await supabase
    .from(tableName)
    .insert(row);

  if (error) {
    console.error(`Error inserting into ${tableName}:`, error);
    return { data: null, error };
  }

  console.log(`Successfully inserted into ${tableName}:`, data);
  return { data, error: null };
}
