import { describe, it, expect, vi } from 'vitest';
import { insertRow } from '../src/pages/api/supabase';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ data: [{ id: '1', name: 'Test Row' }], error: null }))
    }))
  }))
}));

describe('insertRow', () => {
  it('should insert a row into Supabase', async () => {
    const tableName = 'test_table';
    const row = { id: '1', name: 'Test Row' };

    const { data, error } = await insertRow(tableName, row);

    expect(data).toEqual([{ id: '1', name: 'Test Row' }]);
    expect(error).toBeNull();
  });
}); 