
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ntachuvjrdmlouejtifh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YWNodXZqcmRtbG91ZWp0aWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNjU2ODAsImV4cCI6MjA1Njg0MTY4MH0.u2veoOUH-MftQ8FC0SoSo4DVnagcnxpvoHtpc-PI8_8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// For TypeScript type issues with tables not in the types.ts file,
// we need to use a custom type that extends the Database type
interface CustomMediaMetadata {
  Row: {
    id: string;
    filename: string;
    title: string;
    description: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    filename: string;
    title: string;
    description?: string | null;
    created_at?: string;
  };
  Update: {
    id?: string;
    filename?: string;
    title?: string;
    description?: string | null;
    created_at?: string;
  };
}

// Custom type extension to include the media_metadata table
export type CustomDatabase = Database & {
  public: {
    Tables: {
      media_metadata: CustomMediaMetadata;
    } & Database['public']['Tables'];
  };
};

export const supabase = createClient<CustomDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
