import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchDocuments() {
  const { data, error } = await supabase
    .schema('dev')
    .from('documents')
    .select('*');

  if (error) {
    console.error('Error fetching documents:', error);
  } else {
    console.log('Documents:', data);
  }
}

fetchDocuments();