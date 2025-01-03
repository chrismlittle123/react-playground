import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchJsonSchemas() {
  const { data, error } = await supabase
    .schema('dev')
    .from('json_schemas')
    .select('*');

  if (error) {
    console.error('Error fetching json schemas:', error);
  } else {
    console.log('Json schemas:', data);
  }
}

fetchJsonSchemas();

import { compile } from 'json-schema-to-typescript';
import * as fs from 'fs';

const schemas = [
  "client_schema.json",
  "financial_analysis_schema.json",
  "assessment_schema.json",
  "document_schema.json",
  "document_metadata_schema.json",
  "subscription_schema.json",
  "user_schema.json",
];

async function generateTypes() {
  try {
    // Create types directory if it doesn't exist
    if (!fs.existsSync('./typescript')) {
      fs.mkdirSync('./typescript');
    }

    // Iterate over schemas
    for (const schemaFile of schemas) {
      // Read the schema
      const schema = JSON.parse(fs.readFileSync(`./json_schemas/${schemaFile}`, 'utf-8'));

      // Compile schema to TypeScript
      const ts = await compile(schema, schemaFile.replace('.json', '').replace('_', ' ').replace('schema', '')); // Generate name from file name

      // Write the generated TypeScript interface to a file
      fs.writeFileSync(`./typescript/${schemaFile.replace('.json', '.ts').replace('_', '-')}`, ts);
      console.log(`Successfully generated TypeScript interface for ${schemaFile}!`);
    }
  } catch (error) {
    console.error('Error generating TypeScript interface:', error);
  }
}

generateTypes();
