import { test, expect, Page } from '@playwright/test';

// Define the test

// Define the test

test('should upload a file via the UI and verify the upload', async ({ page }: { page: Page }) => {
  // Navigate to the home page
  await page.goto('http://localhost:3000');

  // Select the file input and upload a file
  const fileInput = await page.$('input[type="file"]');
  if (!fileInput) throw new Error('File input not found');
  await fileInput.setInputFiles({ name: 'test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('dummy content') });

  // Wait for the upload to complete and verify the success message
  await expect(page.locator('text=file uploaded successfully to s3')).toBeVisible();

  // Verify the document interface structure is displayed
  await expect(page.locator('role=heading[name="document interface structure"]')).toBeVisible();
  await expect(page.locator('text=test.pdf')).toBeVisible();
}); 