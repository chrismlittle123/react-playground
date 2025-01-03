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
    return { data: null, error };
  }

  console.log('Json schemas:', data);
  return { data, error: null };
}

async function main() {
  const { data: schemas, error } = await fetchJsonSchemas();

  if (error) {
    console.error('Error fetching json schemas:', error);
    return;
  }

  await generateTypes(schemas);
}

main();

import { compile } from 'json-schema-to-typescript';
import * as fs from 'fs';

async function generateTypes(schemas: any[]) {
  try {
    // Create pages/types directory if it doesn't exist
    if (!fs.existsSync('./pages/types')) {
      fs.mkdirSync('./pages/types', { recursive: true });
    }

    // Iterate over schemas
    for (const schema of schemas) {
      const schemaName = schema.name;
      const schemaData = schema.json_schema;

      // Compile schema to TypeScript
      const ts = await compile(schemaData, schemaName);

      // Write the generated TypeScript interface to a file
      const camelCaseName = schemaName.replace('_schema', '').replace(/_([a-z])/g, (g: string) => g[1].toUpperCase()).replace(/^jsons/, 'json').replace(/Schema/, 'Schemas');
      fs.writeFileSync(`./pages/types/${camelCaseName}.ts`, ts);
      console.log(`Successfully generated TypeScript interface for ${schemaName}!`);
    }
  } catch (error) {
    console.error('Error generating TypeScript interface:', error);
  }
}
