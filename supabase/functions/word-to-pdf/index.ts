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

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let extractedText = '';
    const textLines: string[] = [];
    
    // Try to extract text from DOCX
    try {
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const docContent = textDecoder.decode(uint8Array);
      
      // Extract text from w:t tags (Word text elements)
      const textMatches = docContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      if (textMatches && textMatches.length > 0) {
        textMatches.forEach(match => {
          const textContent = match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
          if (textContent.trim()) {
            textLines.push(textContent.trim());
          }
        });
        extractedText = textLines.join(' ');
      }
      
      // If no text extracted, try to find any readable text
      if (!extractedText || extractedText.length < 10) {
        const readableMatches = docContent.match(/[\x20-\x7E]{5,}/g);
        if (readableMatches && readableMatches.length > 0) {
          // Filter out XML tags and common Word metadata
          const filtered = readableMatches.filter(text => 
            !text.startsWith('<?xml') && 
            !text.includes('xmlns') &&
            !text.startsWith('w:') &&
            text.length > 3
          );
          extractedText = filtered.slice(0, 20).join(' ');
        }
      }
      
      // Final fallback
      if (!extractedText || extractedText.trim().length === 0) {
        extractedText = `Content from ${file.name} - Use client-side conversion for better results`;
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      extractedText = `Converted from ${file.name}`;
    }

    // Escape special characters for PDF
    const escapedText = extractedText
      .substring(0, 1000) // Limit to 1000 chars
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\r/g, '')
      .replace(/\n/g, ' ');

    const escapedFileName = file.name.replace(/[()\\]/g, '');
    const fileName = file.name.replace(/\.(doc|docx)$/i, '.pdf');
    const timestamp = Date.now();
    const storagePath = `converted/${timestamp}-${fileName}`;

    // Create a proper PDF with visible content
    const streamContent = `BT
/F1 14 Tf
50 750 Td
(Converted from: ${escapedFileName}) Tj
0 -25 Td
/F1 11 Tf
`;

    // Split text into lines (roughly 80 chars per line)
    const words = escapedText.split(' ');
    let currentLine = '';
    const pdfLines: string[] = [];
    
    words.forEach(word => {
      if ((currentLine + word).length > 80) {
        if (currentLine) pdfLines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    if (currentLine.trim()) pdfLines.push(currentLine.trim());

    // Add lines to PDF (limit to 30 lines for first page)
    let pdfTextCommands = streamContent;
    pdfLines.slice(0, 30).forEach(line => {
      pdfTextCommands += `(${line}) Tj\n0 -15 Td\n`;
    });
    pdfTextCommands += 'ET';

    const streamLength = pdfTextCommands.length;

    const pdfContent = `%PDF-1.4
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Count 1/Kids[3 0 R]>>
endobj
3 0 obj
<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>
endobj
4 0 obj
<</Length ${streamLength}>>
stream
${pdfTextCommands}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000270 00000 n 
trailer
<</Size 5/Root 1 0 R>>
startxref
${350 + streamLength}
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
