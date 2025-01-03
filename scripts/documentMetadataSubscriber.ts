import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the type for document_metadata
interface DocumentMetadata {
  id: string;
  created_at: string;
  updated_at: string;
  document_id: string;
  metadata: {
    [key: string]: any;
  };
  // Add other fields that exist in your table
}

class DocumentMetadataSubscriber {
  private supabase: SupabaseClient;
  private subscription: RealtimeChannel | null = null;
  private isConnected: boolean = false;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async subscribe(): Promise<void> {
    try {
      console.log('Starting subscription to document_metadata table...');

      // Initialize the subscription
      this.subscription = this.supabase
        .channel('document_metadata_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'dev', // Your schema name
            table: 'document_metadata'
          },
          async (payload) => {
            await this.handleChange(payload);
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          this.isConnected = status === 'SUBSCRIBED';
        });

    } catch (error) {
      console.error('Error setting up subscription:', error);
      throw error;
    }
  }

  private async handleChange(payload: any): Promise<void> {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case 'INSERT':
          console.log('New record inserted:', newRecord);
          await this.handleNewRecord(newRecord as DocumentMetadata);
          break;

        case 'UPDATE':
          console.log('Record updated:', {
            old: oldRecord,
            new: newRecord
          });
          await this.handleUpdatedRecord(oldRecord, newRecord);
          break;

        case 'DELETE':
          console.log('Record deleted:', oldRecord);
          await this.handleDeletedRecord(oldRecord as DocumentMetadata);
          break;

        default:
          console.log('Unknown event type:', eventType);
      }
    } catch (error) {
      console.error('Error handling change:', error);
    }
  }

  private async handleNewRecord(record: DocumentMetadata): Promise<void> {
    // Implement your logic for new records here
    console.log(`Processing new document metadata with ID: ${record.id}`);
    // Example: Trigger additional processing, notifications, etc.
  }

  private async handleUpdatedRecord(oldRecord: DocumentMetadata, newRecord: DocumentMetadata): Promise<void> {
    // Implement your logic for updated records here
    console.log(`Document metadata updated: ${oldRecord.id}`);
    // Example: Compare changes, trigger workflows based on changes, etc.
  }

  private async handleDeletedRecord(record: DocumentMetadata): Promise<void> {
    // Implement your logic for deleted records here
    console.log(`Document metadata deleted: ${record.id}`);
    // Example: Cleanup related resources, trigger notifications, etc.
  }

  async unsubscribe(): Promise<void> {
    if (this.subscription) {
      await this.subscription.unsubscribe();
      this.isConnected = false;
      console.log('Unsubscribed from document_metadata table');
    }
  }

  isSubscribed(): boolean {
    return this.isConnected;
  }

  // Method to keep the script running
  async keepAlive(): Promise<never> {
    return new Promise((resolve) => {
      // Keep the process alive
      setInterval(() => {
        if (this.isConnected) {
          console.log('Subscription active, waiting for changes...');
        } else {
          console.log('Subscription not active, attempting to reconnect...');
          this.subscribe().catch(console.error);
        }
      }, 30000); // Check every 30 seconds
    });
  }
}

// Usage example
async function main() {
  const subscriber = new DocumentMetadataSubscriber();

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