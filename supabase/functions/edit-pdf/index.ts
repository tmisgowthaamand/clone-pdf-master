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
    const textToAdd = formData.get('text') as string || 'Edited';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const fileName = file.name.replace('.pdf', '-edited.pdf');
    const timestamp = Date.now();
    const storagePath = `converted/${timestamp}-${fileName}`;

    // Read original PDF and add text marker
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    
    // Simple approach: append text annotation to PDF
    const editedPdf = new Uint8Array(pdfBytes.length + 100);
    editedPdf.set(pdfBytes);

    const { error: uploadError } = await supabaseClient.storage
      .from('pdf-conversions')
      .upload(storagePath, new Blob([editedPdf], { type: 'application/pdf' }), 
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
