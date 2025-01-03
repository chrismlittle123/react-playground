import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

async function getItems() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'dev' } });

  try {
    // Get document metadata
    const { data: documentMetadata, error: docError } = await supabase
      .from('document_metadata')
      .select('*')
      .eq('id', '29f1b604-3697-4116-b811-4bf9c1ef75a9')
      .single();

    if (docError) {
      console.error('Error fetching document metadata:', docError);
    } else {
      console.log('Document metadata:', documentMetadata);
    }

    // Get financial analysis
    const { data: financialAnalysis, error: finError } = await supabase
      .from('financial_analysis')
      .select('*')
      .eq('id', '01676b20-47d9-4290-b749-7f61df3d80ce')
      .single();

    if (finError) {
      console.error('Error fetching financial analysis:', finError);
    } else {
      console.log('Financial analysis:', financialAnalysis);
    }

    // Get assessments
    const { data: assessments, error: assessError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', '01676b20-47d9-4290-b749-7f61df3d80ce')
      .single();

    if (assessError) {
      console.error('Error fetching assessments:', assessError);
    } else {
      console.log('Assessments:', assessments);
    }

    return {
      documentMetadata,
      financialAnalysis,
      assessments
    };

  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
}

// Execute the function
getItems();
