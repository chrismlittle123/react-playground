import React, { useState } from 'react';

export default function Home(): JSX.Element {
  const [filePath, setFilePath] = useState<string>('');

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
    }
  };

  return (
    <div>
      <h1>Hello world</h1>
      <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      {filePath && <p>File path: {filePath}</p>}
    </div>
  );
} 