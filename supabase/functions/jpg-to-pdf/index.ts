/// <reference types="../pdf-to-word/types.d.ts" />

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // @ts-ignore
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const fileName = file.name.replace(/\.(jpg|jpeg|png)$/i, '.pdf');
    const timestamp = Date.now();
    const storagePath = `converted/${timestamp}-${fileName}`;

    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 47>>stream
BT /F1 12 Tf 50 700 Td (Image: ${file.name}) Tj ET
endstream endobj
xref 0 5
trailer<</Size 5/Root 1 0 R>>
startxref 254
%%EOF`;

    const { error: uploadError } = await supabaseClient.storage
      .from('pdf-conversions')
      .upload(storagePath, new Blob([pdfContent], { type: 'application/pdf' }), 
      { contentType: 'application/pdf', upsert: false });

    if (uploadError) {
      return new Response(JSON.stringify({ error: 'Upload failed', details: uploadError.message }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: urlData } = supabaseClient.storage.from('pdf-conversions').getPublicUrl(storagePath);

    return new Response(JSON.stringify({
      success: true, fileName, downloadUrl: urlData.publicUrl, storagePath
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
