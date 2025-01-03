import React, { useState } from 'react';
import type { Documents, DocumentType } from './types/documents';
import crypto from 'crypto';

export default function Home(): JSX.Element {
  const [filePath, setFilePath] = useState<string>('');
  const [documents, setDocuments] = useState<Documents[]>([]);
  const [dummyDoc, setDummyDoc] = useState<Documents | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setFilePath(data.filePath);

      const document_id = crypto.randomUUID();

      const newDoc: Documents = {
        id: document_id,
        client_id: '550e8400-e29b-41d4-a716-446655440060',
        file_name: 'original.pdf',
        file_path: `documents/pdf/${document_id}/original.pdf`,
        file_size: 2048,
        mime_type: 'application/pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        document_type: 'BANK_STATEMENT',
        document_status: 'PROCESSING',
        validation_errors: []
      };

      setDummyDoc(newDoc);
      setDocuments(prev => [...prev, newDoc]);
    }
  };

  return (
    <div>
      <h1>Hello world</h1>
      <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      {filePath && <p>File path: {filePath}</p>}
      {documents.map(doc => (
        <div key={doc.id}>
          <p>Document Type: {doc.document_type}</p>
          <p>File Name: {doc.file_name}</p>
        </div>
      ))}
      <div>
        <h2>Document Interface Structure:</h2>
        <pre>
          {dummyDoc ? JSON.stringify(dummyDoc, null, 2) : null}
        </pre>
      </div>
    </div>
  );
}