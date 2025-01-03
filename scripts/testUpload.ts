import * as fs from 'fs';
import * as path from 'path';
import { uploadToS3 } from '../pages/api/s3';
import axios from 'axios';

async function downloadFile(url: string, fileName: string) {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const filePath = path.join(__dirname, '../../uploads', fileName);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

async function testS3Upload() {
  try {
    console.log('Starting S3 upload test...');
    // Specify the file to upload
    const fileName = 'ab2f7c57-0553-439f-861d-e6d37138bedc.pdf';
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

      // Download and verify the file
      const downloadFileName = `downloaded_${fileName}`;
      await downloadFile(url, downloadFileName);
      console.log('File downloaded and verified successfully');
    }
  } catch (error) {
    console.error('Error in testS3Upload:', error);
  }
}

testS3Upload(); 