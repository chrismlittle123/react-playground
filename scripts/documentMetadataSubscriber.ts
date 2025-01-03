import { TableSubscriber } from '../pages/api/subscriber';
import type { DocumentMetadata } from '../pages/types/documentMetadata';


// Usage example
async function main() {
  // Create a subscriber for any table with its corresponding interface type
  const subscriber = new TableSubscriber<DocumentMetadata>('document_metadata'); // Replace with your table name and interface

  try {
    // Set up error handling for uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught exception:', error);
      await subscriber.unsubscribe();
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Received SIGINT. Cleaning up...');
      await subscriber.unsubscribe();
      process.exit(0);
    });

    // Start the subscription
    await subscriber.subscribe();
    
    // Keep the script running
    await subscriber.keepAlive();
  } catch (error) {
    console.error('Fatal error:', error);
    await subscriber.unsubscribe();
    process.exit(1);
  }
}

// Run the subscriber
main().catch(console.error);