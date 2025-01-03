import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { DocumentMetadata } from '../pages/types/documentMetadata';

// Load environment variables
dotenv.config();

async function testDocumentMetadataSubscriber() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'dev' } });

  try {
    // Construct a valid item using the DocumentMetadata interface
    const newItem: DocumentMetadata = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_id: '64aef4d7-9edf-4f4e-a692-ab0f85e25faf',
      document_type: 'BANK_STATEMENT',
      document_metadata: {
        iban: 'GB29NWBK60161331926819',
        type: 'BANK_STATEMENT',
        currency: 'GBP',
        end_balance: { amount: 1000, currency: 'GBP' },
        account_type: 'CURRENT',
        start_balance: { amount: 500, currency: 'GBP' },
        account_holder: 'John Doe',
        account_number: '12345678',
        total_money_in: { amount: 1500, currency: 'GBP' },
        bank_identifier: {
          swift_bic: 'NWBKGB2L',
          local_bank_code: '123456',
          local_bank_code_type: 'SORT_CODE',
        },
        overdraft_limit: { amount: 200, currency: 'GBP' },
        total_money_out: { amount: 500, currency: 'GBP' },
        analysis_results: {
          summary: {
            total_income: { amount: 1500, currency: 'GBP' },
            total_savings: { amount: 200, currency: 'GBP' },
            total_expenses: { amount: 500, currency: 'GBP' },
            monthly_averages: {
              income: { amount: 1500, currency: 'GBP' },
              savings: { amount: 200, currency: 'GBP' },
              expenses: { amount: 500, currency: 'GBP' },
            },
          },
          categorised_transactions: {
            income: [],
            savings: [],
            expenses: [],
          },
        },
        statement_period_end: null,
        statement_period_start: null,
      },
    };

    console.log('Attempting to insert item:', newItem);
    await supabase
      .from('document_metadata')
      .upsert([newItem]);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function runTest() {
  await testDocumentMetadataSubscriber();
}

runTest().catch(console.error);