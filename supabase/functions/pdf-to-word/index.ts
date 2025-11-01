/**
 * Supabase Edge Function: PDF to Word Converter
 * 
 * This file runs in Deno runtime (not Node.js), so TypeScript errors about
 * Deno imports are expected in VSCode. The function will work correctly when
 * deployed to Supabase.
 * 
 * To deploy: supabase functions deploy pdf-to-word
 */

/// <reference types="./types.d.ts" />

// @ts-ignore - Deno imports work in Supabase runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno imports work in Supabase runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // @ts-ignore - Deno global is available in Supabase Edge Functions
    const supabaseClient = createClient(
      // @ts-ignore - Deno global is available in Supabase Edge Functions
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore - Deno global is available in Supabase Edge Functions
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the PDF file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Import PDF parsing library
    // Note: For Deno, we'll use a different approach
    // We'll extract text using pdf-parse or similar Deno-compatible library
    
    // For now, we'll use a simple text extraction approach
    // In production, you'd want to use a more robust PDF parsing library
    
    // Convert the PDF to text (simplified version)
    // This is a placeholder - you'd need to implement actual PDF parsing
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    let extractedText = '';
    
    try {
      // Try to extract text from PDF
      // This is a very basic approach and won't work for all PDFs
      const pdfText = textDecoder.decode(uint8Array);
      
      // Extract text between stream and endstream markers (simplified)
      const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
      let match;
      
      while ((match = streamRegex.exec(pdfText)) !== null) {
        const streamContent = match[1];
        // Try to extract readable text
        const readableText = streamContent.replace(/[^\x20-\x7E\n]/g, '');
        if (readableText.trim().length > 0) {
          extractedText += readableText + '\n';
        }
      }
      
      if (!extractedText.trim()) {
        extractedText = 'PDF text extraction requires advanced parsing. Please use the client-side conversion.';
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      extractedText = 'Error extracting text from PDF.';
    }

    // Create a simple Word document structure (XML format)
    const wordXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:t>Converted from PDF: ${file.name}</w:t>
      </w:r>
    </w:p>
    ${extractedText.split('\n').map(line => `
    <w:p>
      <w:r>
        <w:t>${line.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] || c))}</w:t>
      </w:r>
    </w:p>`).join('')}
  </w:body>
</w:document>`;

    // Store the converted file in Supabase Storage
    const fileName = file.name.replace('.pdf', '.docx');
    const timestamp = Date.now();
    const storagePath = `converted/${timestamp}-${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('pdf-conversions')
      .upload(storagePath, new Blob([wordXml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload converted file', details: uploadError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseClient
      .storage
      .from('pdf-conversions')
      .getPublicUrl(storagePath);

    return new Response(
      JSON.stringify({
        success: true,
        fileName: fileName,
        downloadUrl: urlData.publicUrl,
        storagePath: storagePath,
        extractedText: extractedText.substring(0, 500) + '...' // Preview
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in pdf-to-word function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
