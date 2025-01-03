import { describe, it, expect, vi } from 'vitest';
import { generateTypes } from '../src/scripts/buildTypes';

vi.mock('fs', () => ({
  writeFileSync: vi.fn()
}));

vi.mock('json-schema-to-typescript', () => ({
  compile: vi.fn(() => Promise.resolve('export interface TestType {}'))
}));

describe('generateTypes', () => {
  it('should generate TypeScript types from JSON schemas', async () => {
    const schemas = [{ id: '1', schema: {} }];

    await generateTypes(schemas);

    expect(fs.writeFileSync).toHaveBeenCalled();
  });
}); 