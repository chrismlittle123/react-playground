import React, { useState } from 'react';
import type { Documents } from './types/documents';

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

      // Add dummy document
      const newDoc: Documents = {
        id: Math.random().toString(),
        client_id: 'dummy-client-id',
        file_name: file.name,
        file_path: data.filePath,
        file_size: file.size,
        mime_type: 'application/pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        document_type: 'BANK_STATEMENT',
        document_status: 'PENDING',
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