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

    // Extract text from PDF
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    const extractedData: string[][] = [['Page', 'Content']];
    
    try {
      const pdfText = textDecoder.decode(uint8Array);
      
      // Extract text from PDF streams
      const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
      let match;
      let pageNum = 1;
      
      while ((match = streamRegex.exec(pdfText)) !== null) {
        const streamContent = match[1];
        // Extract readable text
        const readableText = streamContent
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (readableText.length > 10) {
          extractedData.push([`Page ${pageNum}`, readableText]);
          pageNum++;
        }
      }
      
      // If no content extracted, try alternative method
      if (extractedData.length === 1) {
        const textObjects = pdfText.match(/\(([^)]+)\)/g);
        if (textObjects && textObjects.length > 0) {
          let combinedText = '';
          textObjects.forEach(obj => {
            const text = obj.slice(1, -1).replace(/\\[nrt]/g, ' ');
            combinedText += text + ' ';
          });
          if (combinedText.trim()) {
            extractedData.push(['Page 1', combinedText.trim()]);
          }
        }
      }
      
      // If still no content, add placeholder
      if (extractedData.length === 1) {
        extractedData.push(['Info', 'PDF text extraction requires advanced parsing. Use client-side conversion for better results.']);
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      extractedData.push(['Error', 'Failed to extract text from PDF']);
    }

    // Create Excel XML with extracted data
    let tableRows = '';
    extractedData.forEach(row => {
      tableRows += '<Row>';
      row.forEach(cell => {
        const escapedCell = cell
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        tableRows += `<Cell><Data ss:Type="String">${escapedCell}</Data></Cell>`;
      });
      tableRows += '</Row>';
    });

    const fileName = file.name.replace('.pdf', '.xlsx');
    const timestamp = Date.now();
    const storagePath = `converted/${timestamp}-${fileName}`;

    const excelXml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="PDF Content">
    <Table>
      ${tableRows}
    </Table>
  </Worksheet>
</Workbook>`;

    const { error: uploadError } = await supabaseClient.storage
      .from('pdf-conversions')
      .upload(storagePath, new Blob([excelXml], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      }), { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', upsert: false });

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
