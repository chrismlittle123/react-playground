import { describe, it, expect, vi } from 'vitest';
import { fetchDocuments } from '../pages/api/supabase';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [{ id: '1', name: 'Document 1' }], error: null }))
    }))
  }))
}));

describe('fetchDocuments', () => {
  it('should fetch documents from Supabase', async () => {
    const documents = await fetchDocuments();

    expect(documents).toEqual([{ id: '1', name: 'Document 1' }]);
  });
}); 