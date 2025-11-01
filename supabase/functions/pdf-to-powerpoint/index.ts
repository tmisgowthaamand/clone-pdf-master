 /**
 * Supabase Edge Function: PDF to PowerPoint Converter
 * 
 * This function provides a fallback for PDF to PowerPoint conversion.
 * For best results with image-rich PDFs (like presentations), use the 
 * client-side conversion which renders each page as a high-quality image.
 * 
 * This server-side version extracts text content and creates a basic PPTX.
 * 
 * To deploy: supabase functions deploy pdf-to-powerpoint
 */

/// <reference types="../pdf-to-word/types.d.ts" />

// @ts-ignore - Deno imports work in Supabase runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno imports work in Supabase runtime
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

    console.log('PDF to PowerPoint conversion started (server-side)');
    console.log('File:', file.name, 'Size:', file.size, 'bytes');
    console.log('Note: For best quality with image-rich PDFs, use client-side conversion');

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Extract text from PDF (simplified version)
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    let extractedText = '';
    let pageCount = 1;
    
    try {
      const pdfText = textDecoder.decode(uint8Array);
      
      // Try to detect page count
      const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g);
      if (pageMatches) {
        pageCount = pageMatches.length;
      }
      
      const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
      let match;
      
      while ((match = streamRegex.exec(pdfText)) !== null) {
        const streamContent = match[1];
        const readableText = streamContent.replace(/[^\x20-\x7E\n]/g, '');
        if (readableText.trim().length > 0) {
          extractedText += readableText + '\n';
        }
      }
      
      if (!extractedText.trim()) {
        extractedText = 'PDF contains primarily images or complex formatting.\n\nFor best results with presentation PDFs:\n1. Use the CLIENT-SIDE conversion option\n2. It will render each page as a high-quality image\n3. All visual content will be preserved perfectly';
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      extractedText = 'Error extracting text from PDF. Please use client-side conversion for image-rich PDFs.';
    }

    console.log(`Detected ${pageCount} pages, extracted ${extractedText.length} characters of text`);

    // Create a simple PowerPoint XML structure with info about client-side conversion
    const pptxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" 
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId2"/>
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:notes>
    <p:text>Converted from: ${file.name}
Pages detected: ${pageCount}
Text extracted: ${extractedText.length} characters

Note: This is a basic server-side conversion.
For best quality with image-rich PDFs (like presentations),
please use the CLIENT-SIDE conversion option which renders
each page as a high-quality image preserving all visual content.
    </p:text>
  </p:notes>
</p:presentation>`;

    // Store the converted file in Supabase Storage
    const fileName = file.name.replace('.pdf', '.pptx');
    const timestamp = Date.now();
    const storagePath = `converted/${timestamp}-${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('pdf-conversions')
      .upload(storagePath, new Blob([pptxXml], { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      }), {
        contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
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
        pageCount: pageCount,
        textLength: extractedText.length,
        message: 'Basic conversion complete. For image-rich PDFs, use client-side conversion for best quality.',
        extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '')
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in pdf-to-powerpoint function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        suggestion: 'Try using client-side conversion for better results with image-rich PDFs'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
