import * as fs from 'fs';
import * as path from 'path';
import { uploadToS3 } from '../pages/api/s3';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

async function downloadFile(url: string, fileName: string) {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const filePath = path.join(__dirname, '../downloads', fileName);
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
    // Generate a unique document_id
    const document_id = uuidv4();
    const sourceFileName = 'monzo_november.pdf';
    const sourcePath = path.join(__dirname, 'raw_pdfs', sourceFileName);

    console.log('Reading file from path:', sourcePath);
    // Read the file
    const fileBuffer = fs.readFileSync(sourcePath);

    console.log('Uploading file to S3...');
    // Upload to S3
    const { url, error } = await uploadToS3(fileBuffer, document_id, 'application/pdf');

    if (error) {
      console.error('Error uploading to S3:', error);
    } else {
      console.log('File uploaded successfully to S3:', url);

      // Construct the download URL
      const downloadUrl = `https://simply-comply-bucket-654654324108.s3.eu-west-2.amazonaws.com/documents/pdf/${document_id}/original.pdf`;

      // Download and verify the file
      const downloadFileName = `downloaded_${sourceFileName}`;
      await downloadFile(downloadUrl, downloadFileName);
      console.log('File downloaded and verified successfully');

      // Verify the file exists in the downloads folder
      const downloadedFilePath = path.join(__dirname, '../downloads', downloadFileName);
      if (fs.existsSync(downloadedFilePath)) {
        console.log('File exists in downloads folder:', downloadedFilePath);
      } else {
        console.error('File does not exist in downloads folder:', downloadedFilePath);
      }
    }
  } catch (error) {
    console.error('Error in testS3Upload:', error);
  }
}

testS3Upload();