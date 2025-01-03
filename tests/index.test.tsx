import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../pages/index';

vi.mock('../pages/api/s3', () => ({
  uploadToS3: vi.fn(() => Promise.resolve({ url: 'mock-url', error: null }))
}));

describe('Home Component', () => {
  it('should upload a file and update the document state', async () => {
    const { getByText, getByLabelText, getByRole } = render(<Home />);

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const input = getByLabelText(/file/i);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(getByText(/file uploaded successfully to s3/i)).toBeInTheDocument());

    expect(getByRole('heading', { name: /document interface structure/i })).toBeInTheDocument();
    expect(getByText(/test.pdf/i)).toBeInTheDocument();
  });
}); 