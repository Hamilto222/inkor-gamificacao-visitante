
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create the mission-evidences bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets()

    if (bucketsError) {
      throw bucketsError
    }

    // Check and create mission-evidences bucket
    const missionBucketExists = buckets.some((bucket) => bucket.name === 'mission-evidences')

    if (!missionBucketExists) {
      const { error } = await supabaseAdmin
        .storage
        .createBucket('mission-evidences', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
        })

      if (error) {
        throw error
      }
    }

    // Check and create media-files bucket
    const mediaBucketExists = buckets.some((bucket) => bucket.name === 'media-files')

    if (!mediaBucketExists) {
      const { error } = await supabaseAdmin
        .storage
        .createBucket('media-files', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf']
        })

      if (error) {
        throw error
      }
    }

    return new Response(
      JSON.stringify({ message: 'Storage buckets setup complete' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
