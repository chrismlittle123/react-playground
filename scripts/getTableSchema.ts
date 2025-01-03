import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'dev' } });

async function getTableSchema() {
  try {
    // Query the schema for the document_metadata table
    const { data, error } = await supabase
      .from('document_metadata')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching schema:', error);
    } else {
      console.log('Table schema:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getTableSchema();
