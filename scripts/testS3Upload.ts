import * as fs from 'fs';
import * as path from 'path';
import { uploadToS3 } from '../pages/api/s3';


async function testS3Upload() {
  try {
    console.log('Starting S3 upload test...');
    // Specify the file to upload
    const fileName = '22d59376-9625-49c4-a286-10c183d38d04.pdf';
    const filePath = path.join(__dirname, '../../uploads', fileName);

    console.log('Reading file from path:', filePath);
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    const document_id = fileName.replace('.pdf', '');

    console.log('Uploading file to S3...');
    // Upload to S3
    const { url, error } = await uploadToS3(fileBuffer, document_id, 'application/pdf');

    if (error) {
      console.error('Error uploading to S3:', error);
    } else {
      console.log('File uploaded successfully to S3:', url);
    }
  } catch (error) {
    console.error('Error in testS3Upload:', error);
  }
}

testS3Upload(); 