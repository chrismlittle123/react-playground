import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class TableSubscriber<T> {
  private supabase: SupabaseClient;
  private subscription: RealtimeChannel | null = null;
  private isConnected: boolean = false;
  private tableName: string;

  constructor(tableName: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    this.tableName = tableName;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async subscribe(): Promise<void> {
    try {
      console.log(`Starting subscription to ${this.tableName} table...`);

      // Initialize the subscription
      this.subscription = this.supabase
        .channel(`${this.tableName}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'dev',
            table: this.tableName
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
          await this.handleNewRecord(newRecord as T);
          break;

        case 'UPDATE':
          console.log('Record updated:', {
            old: oldRecord,
            new: newRecord
          });
          await this.handleUpdatedRecord(oldRecord as T, newRecord as T);
          break;

        case 'DELETE':
          console.log('Record deleted:', oldRecord);
          await this.handleDeletedRecord(oldRecord as T);
          break;

        default:
          console.log('Unknown event type:', eventType);
      }
    } catch (error) {
      console.error('Error handling change:', error);
    }
  }

  private async handleNewRecord(record: T): Promise<void> {
    // Implement your logic for new records here
    console.log(`Processing new ${this.tableName} with ID: ${(record as any).id}`);
    // Example: Trigger additional processing, notifications, etc.
  }

  private async handleUpdatedRecord(oldRecord: T, newRecord: T): Promise<void> {
    // Implement your logic for updated records here
    console.log(`${this.tableName} updated: ${(oldRecord as any).id}`);
    // Example: Compare changes, trigger workflows based on changes, etc.
  }

  private async handleDeletedRecord(record: T): Promise<void> {
    // Implement your logic for deleted records here
    console.log(`${this.tableName} deleted: ${(record as any).id}`);
    // Example: Cleanup related resources, trigger notifications, etc.
  }

  async unsubscribe(): Promise<void> {
    if (this.subscription) {
      await this.subscription.unsubscribe();
      this.isConnected = false;
      console.log(`Unsubscribed from ${this.tableName} table`);
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

  public setNewRecordCallback(callback: (record: T) => Promise<void>): void {
    this.handleNewRecord = callback;
  }
}
