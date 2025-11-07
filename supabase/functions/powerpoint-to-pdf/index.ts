   // @ts-nocheck

// NOTE: The line above disables TypeScript checks for this file in your IDE.
// This is a workaround because the Supabase Edge Function runtime is Deno-based,
// and your IDE's default TypeScript server may not recognize Deno-specific APIs.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib@1.17.1';
import JSZip from 'https://esm.sh/jszip@3.10.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Enhanced helper to extract theme colors
async function extractThemeColors(zip: any) {
  try {
    const themeFile = zip.file('ppt/theme/theme1.xml');
    if (!themeFile) return {};
    
    const themeXml = await themeFile.async('text');
    const themeColors: any = {};
    const colorScheme = /<a:clrScheme[^>]*>([\s\S]*?)<\/a:clrScheme>/.exec(themeXml);
    if (colorScheme) {
      const colorMatches = colorScheme[1].matchAll(/<a:(\w+)>.*?<a:srgbClr val="([A-F0-9]{6})".*?<\/a:\w+>/g);
      for (const match of colorMatches) {
        themeColors[match[1]] = match[2];
      }
    }
    return themeColors;
  } catch (e) {
    console.error('Error extracting theme colors:', e);
    return {};
  }
}

// Enhanced color extraction supporting theme colors, RGB, and HSL
function extractColor(xmlContent: string, themeColors: any = {}): string {
  // Try sRGB color first
  const srgbMatch = /<a:srgbClr val="([A-F0-9]{6})"/.exec(xmlContent);
  if (srgbMatch) return srgbMatch[1];
  
  // Try scheme color (theme color)
  const schemeMatch = /<a:schemeClr val="([^"]+)"/.exec(xmlContent);
  if (schemeMatch && themeColors[schemeMatch[1]]) {
    return themeColors[schemeMatch[1]];
  }
  
  // Try system color
  const sysMatch = /<a:sysClr val="([^"]+)" lastClr="([A-F0-9]{6})"/.exec(xmlContent);
  if (sysMatch) return sysMatch[2];
  
  return '000000'; // Default black
}

// Helper function to parse XML and extract text with exact formatting
function parseXMLText(xmlString: string, themeColors: any = {}) {
  const texts: Array<{
    text: string,
    fontSize: number,
    bold: boolean,
    italic: boolean,
    underline: boolean,
    color: string,
    fontFamily: string,
    spacing: number,
    baseline: number
  }> = [];
  
  // Extract text runs with formatting
  const textRegex = /<a:r[^>]*>([\s\S]*?)<\/a:r>/g;
  let match;
  
  while ((match = textRegex.exec(xmlString)) !== null) {
    const runContent = match[1];
    
    // Extract text
    const textMatch = /<a:t[^>]*>([^<]*)<\/a:t>/.exec(runContent);
    if (!textMatch) continue;
    
    const text = textMatch[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    
    if (!text) continue;
    
    // Extract font size (in hundredths of a point)
    const fontSizeMatch = /<a:sz val="(\d+)"/.exec(runContent);
    const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1]) / 100 : 18;
    
    // Extract bold
    const bold = /<a:b val="1"|<a:b\/>/.test(runContent) && !/<a:b val="0"/.test(runContent);
    
    // Extract italic
    const italic = /<a:i val="1"|<a:i\/>/.test(runContent) && !/<a:i val="0"/.test(runContent);
    
    // Extract underline
    const underline = /<a:u val="sng"|<a:u\/>/.test(runContent);
    
    // Extract color with theme support
    const solidFill = /<a:solidFill>([\s\S]*?)<\/a:solidFill>/.exec(runContent);
    const color = solidFill ? extractColor(solidFill[1], themeColors) : extractColor(runContent, themeColors);
    
    // Extract font family
    const fontMatch = /<a:latin typeface="([^"]+)"/.exec(runContent) || /<a:ea typeface="([^"]+)"/.exec(runContent);
    const fontFamily = fontMatch ? fontMatch[1] : 'Calibri';
    
    // Extract character spacing
    const spacingMatch = /<a:spc val="([\-\d]+)"/.exec(runContent);
    const spacing = spacingMatch ? parseInt(spacingMatch[1]) / 100 : 0;
    
    // Extract baseline offset
    const baselineMatch = /<a:baseline val="([\-\d]+)"/.exec(runContent);
    const baseline = baselineMatch ? parseInt(baselineMatch[1]) / 1000 : 0;
    
    texts.push({ text, fontSize, bold, italic, underline, color, fontFamily, spacing, baseline });
  }
  
  return texts;
}

// Helper function to extract exact slide dimensions
async function getSlideSize(zip: any) {
  try {
    const presXml = await zip.file('ppt/presentation.xml')?.async('text');
    if (!presXml) return { width: 9144000, height: 6858000 }; // Default 10x7.5 inches
    
    const sizeMatch = /<p:sldSz cx="(\d+)" cy="(\d+)"/.exec(presXml);
    if (sizeMatch) {
      return {
        width: parseInt(sizeMatch[1]),
        height: parseInt(sizeMatch[2])
      };
    }
    return { width: 9144000, height: 6858000 };
  } catch (e) {
    return { width: 9144000, height: 6858000 };
  }
}

// Helper function to extract slide dimensions and background with exact precision
async function extractSlideInfo(zip: any, slideNum: number, themeColors: any = {}) {
  try {
    const slideXml = await zip.file(`ppt/slides/slide${slideNum}.xml`)?.async('text');
    if (!slideXml) return null;
    
    // Extract background color/gradient with exact precision
    let backgroundColor = 'FFFFFF';
    const gradientStops: Array<{position: number, color: string}> = [];
    let gradientAngle = 90; // Default vertical gradient
    
    // Check for background in slide or slide layout
    const bgRegex = /<p:bg>([\s\S]*?)<\/p:bg>/.exec(slideXml);
    if (bgRegex) {
      const bgContent = bgRegex[1];
      
      // Extract solid fill
      const solidFill = /<a:solidFill>([\s\S]*?)<\/a:solidFill>/.exec(bgContent);
      if (solidFill) {
        backgroundColor = extractColor(solidFill[1], themeColors);
      }
      
      // Extract gradient fill with exact stop positions
      const gradFill = /<a:gradFill[^>]*>([\s\S]*?)<\/a:gradFill>/.exec(bgContent);
      if (gradFill) {
        const gsListMatch = /<a:gsLst>([\s\S]*?)<\/a:gsLst>/.exec(gradFill[1]);
        if (gsListMatch) {
          const gsRegex = /<a:gs pos="(\d+)">([\s\S]*?)<\/a:gs>/g;
          let gsMatch;
          while ((gsMatch = gsRegex.exec(gsListMatch[1])) !== null) {
            const position = parseInt(gsMatch[1]) / 1000; // Convert to percentage (0-100)
            const color = extractColor(gsMatch[2], themeColors);
            gradientStops.push({ position, color });
          }
        }
        
        // Extract gradient angle/direction
        const linMatch = /<a:lin ang="(\d+)"/.exec(gradFill[1]);
        if (linMatch) {
          gradientAngle = parseInt(linMatch[1]) / 60000; // Convert from 60000ths of a degree
        }
      }
    }
    
    // Fallback: check for background in cSld
    if (!bgRegex) {
      const cSldBg = /<p:cSld[^>]*>([\s\S]*?)<\/p:cSld>/.exec(slideXml);
      if (cSldBg) {
        const bgPr = /<p:bgPr>([\s\S]*?)<\/p:bgPr>/.exec(cSldBg[1]);
        if (bgPr) {
          const solidFill = /<a:solidFill>([\s\S]*?)<\/a:solidFill>/.exec(bgPr[1]);
          if (solidFill) {
            backgroundColor = extractColor(solidFill[1], themeColors);
          }
        }
      }
    }
    
    // Extract all text elements with positioning
    const shapes: Array<{
      type: 'text' | 'image',
      paragraphs?: Array<{texts: any[], align: string, lineSpacing: number, indent: number}>,
      x: number, 
      y: number, 
      width: number, 
      height: number,
      imageData?: Uint8Array
    }> = [];
    
    // Extract text shapes
    const shapeRegex = /<p:sp>([\s\S]*?)<\/p:sp>/g;
    let shapeMatch;
    
    while ((shapeMatch = shapeRegex.exec(slideXml)) !== null) {
      const shapeContent = shapeMatch[1];
      
      // Extract position and size
      const xMatch = /<a:off x="(\d+)"/.exec(shapeContent);
      const yMatch = /<a:off y="(\d+)"/.exec(shapeContent);
      const cxMatch = /<a:ext cx="(\d+)"/.exec(shapeContent);
      const cyMatch = /<a:ext cy="(\d+)"/.exec(shapeContent);
      
      const x = xMatch ? parseInt(xMatch[1]) / 914400 * 72 : 0;
      const y = yMatch ? parseInt(yMatch[1]) / 914400 * 72 : 0;
      const width = cxMatch ? parseInt(cxMatch[1]) / 914400 * 72 : 100;
      const height = cyMatch ? parseInt(cyMatch[1]) / 914400 * 72 : 20;
      
      // Extract paragraph-level properties
      const paragraphs: Array<{texts: any[], align: string, lineSpacing: number, indent: number}> = [];
      const pRegex = /<a:p[^>]*>([\s\S]*?)<\/a:p>/g;
      let pMatch;
      
      while ((pMatch = pRegex.exec(shapeContent)) !== null) {
        const pContent = pMatch[1];
        
        // Extract alignment
        const pPrMatch = /<a:pPr[^>]*>([\\s\\S]*?)<\/a:pPr>/.exec(pContent);
        let align = 'l'; // default left
        let lineSpacing = 100; // default 100%
        let indent = 0;
        
        if (pPrMatch) {
          const alignMatch = /<a:pPr[^>]*algn="([^"]+)"/.exec(pContent) || /algn="([^"]+)"/.exec(pPrMatch[1]);
          if (alignMatch) {
            align = alignMatch[1]; // l, ctr, r, just, dist
          }
          
          // Extract line spacing
          const lnSpcMatch = /<a:lnSpc>.*?<a:spcPct val="(\d+)"/.exec(pPrMatch[1]);
          if (lnSpcMatch) {
            lineSpacing = parseInt(lnSpcMatch[1]) / 1000; // Convert from percentage
          }
          
          // Extract indentation
          const indentMatch = /<a:pPr[^>]*indent="([\-\d]+)"/.exec(pContent);
          if (indentMatch) {
            indent = parseInt(indentMatch[1]) / 914400 * 72; // EMUs to points
          }
        }
        
        const texts = parseXMLText(pContent, themeColors);
        if (texts.length > 0) {
          paragraphs.push({ texts, align, lineSpacing, indent });
        }
      }
      
      if (paragraphs.length > 0) {
        shapes.push({ type: 'text', paragraphs, x, y, width, height });
      }
    }
    
    // Extract images
    const picRegex = /<p:pic>([\s\S]*?)<\/p:pic>/g;
    let picMatch;
    
    while ((picMatch = picRegex.exec(slideXml)) !== null) {
      const picContent = picMatch[1];
      
      // Extract image reference
      const embedMatch = /<a:blip r:embed="([^"]+)"/.exec(picContent);
      if (!embedMatch) continue;
      
      // Extract position and size
      const xMatch = /<a:off x="(\d+)"/.exec(picContent);
      const yMatch = /<a:off y="(\d+)"/.exec(picContent);
      const cxMatch = /<a:ext cx="(\d+)"/.exec(picContent);
      const cyMatch = /<a:ext cy="(\d+)"/.exec(picContent);
      
      const x = xMatch ? parseInt(xMatch[1]) / 914400 * 72 : 0;
      const y = yMatch ? parseInt(yMatch[1]) / 914400 * 72 : 0;
      const width = cxMatch ? parseInt(cxMatch[1]) / 914400 * 72 : 100;
      const height = cyMatch ? parseInt(cyMatch[1]) / 914400 * 72 : 100;
      
      // Get image relationship
      const relsXml = await zip.file(`ppt/slides/_rels/slide${slideNum}.xml.rels`)?.async('text');
      if (relsXml) {
        const relMatch = new RegExp(`Id="${embedMatch[1]}"[^>]*Target="([^"]+)"`).exec(relsXml);
        if (relMatch) {
          const imagePath = `ppt/slides/${relMatch[1].replace('../', '')}`;
          const imageFile = zip.file(imagePath);
          if (imageFile) {
            const imageData = await imageFile.async('uint8array');
            shapes.push({ type: 'image', x, y, width, height, imageData });
          }
        }
      }
    }
    
    return { backgroundColor, gradientStops, gradientAngle, shapes };
  } catch (error) {
    console.error(`Error extracting slide ${slideNum}:`, error);
    return null;
  }
}

// Convert hex color to RGB
function hexToRgb(hex: string) {
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return { r, g, b };
}

async function handler(req: Request, supabaseClient: SupabaseClient) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  console.log('PowerPoint to PDF conversion request received');

  let conversionId: string | null = null;
  let useDatabase = true;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);

    // Try to create database record (optional - conversion works without it)
    try {
      const { data: convData, error: convError } = await supabaseClient
        .from('conversions')
        .insert({
          original_filename: file.name,
          file_size: file.size,
          status: 'processing',
          source_path: '',
        })
        .select()
        .single();

      if (!convError && convData) {
        conversionId = convData.id;
        
        // Upload source file
        const sourcePath = `${conversionId}/${file.name}`;
        const { error: uploadError } = await supabaseClient.storage
          .from('source_files')
          .upload(sourcePath, file);

        if (!uploadError) {
          await supabaseClient
            .from('conversions')
            .update({ source_path: sourcePath, status: 'processing' })
            .eq('id', conversionId);
        }
      } else {
        console.warn('Database operations disabled, proceeding with conversion only');
        useDatabase = false;
      }
    } catch (dbError) {
      console.warn('Database error (non-fatal):', dbError);
      useDatabase = false;
    }

    // 3. Parse PPTX file using JSZip
    const fileBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(fileBuffer);
    
    // Extract theme colors for accurate color matching
    const themeColors = await extractThemeColors(zip);
    console.log('Theme colors extracted:', Object.keys(themeColors).length);
    
    // Get exact slide dimensions from presentation.xml
    const slideSize = await getSlideSize(zip);
    const slideWidth = slideSize.width / 914400 * 72;  // Convert EMUs to points
    const slideHeight = slideSize.height / 914400 * 72;
    console.log(`Slide dimensions: ${slideWidth.toFixed(2)} x ${slideHeight.toFixed(2)} points`);
    
    // Get presentation dimensions from presentation.xml
    const presXml = await zip.file('ppt/presentation.xml')?.async('text');
    const slideCount = presXml ? (presXml.match(/<p:sldId /g) || []).length : 1;
    
    console.log(`Processing ${slideCount} slides...`);
    
    // 4. Create PDF document with pdf-lib
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const helveticaBoldObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
    
    // Process each slide
    for (let i = 1; i <= slideCount; i++) {
      const slideInfo = await extractSlideInfo(zip, i, themeColors);
      
      if (!slideInfo) {
        console.warn(`Could not extract slide ${i}, creating blank page`);
        pdfDoc.addPage([slideWidth, slideHeight]);
        continue;
      }
      
      const page = pdfDoc.addPage([slideWidth, slideHeight]);
      
      // Draw background - gradient or solid color with exact precision
      if (slideInfo.gradientStops && slideInfo.gradientStops.length > 1) {
        // Create gradient effect with exact stop positions
        const gradientSteps = 100; // Increased for smoother gradients
        
        // Determine gradient direction based on angle
        const angleRad = (slideInfo.gradientAngle * Math.PI) / 180;
        const isVertical = Math.abs(Math.sin(angleRad)) > Math.abs(Math.cos(angleRad));
        
        for (let step = 0; step < gradientSteps; step++) {
          const position = (step / gradientSteps) * 100; // 0-100%
          
          // Find the two stops this position falls between
          let color1 = slideInfo.gradientStops[0].color;
          let color2 = slideInfo.gradientStops[slideInfo.gradientStops.length - 1].color;
          let pos1 = slideInfo.gradientStops[0].position;
          let pos2 = slideInfo.gradientStops[slideInfo.gradientStops.length - 1].position;
          
          for (let j = 0; j < slideInfo.gradientStops.length - 1; j++) {
            if (position >= slideInfo.gradientStops[j].position && 
                position <= slideInfo.gradientStops[j + 1].position) {
              color1 = slideInfo.gradientStops[j].color;
              color2 = slideInfo.gradientStops[j + 1].color;
              pos1 = slideInfo.gradientStops[j].position;
              pos2 = slideInfo.gradientStops[j + 1].position;
              break;
            }
          }
          
          // Interpolate between the two colors
          const ratio = pos2 > pos1 ? (position - pos1) / (pos2 - pos1) : 0;
          const c1 = hexToRgb(color1);
          const c2 = hexToRgb(color2);
          const r = c1.r + (c2.r - c1.r) * ratio;
          const g = c1.g + (c2.g - c1.g) * ratio;
          const b = c1.b + (c2.b - c1.b) * ratio;
          
          if (isVertical) {
            const stepHeight = slideHeight / gradientSteps;
            page.drawRectangle({
              x: 0,
              y: step * stepHeight,
              width: slideWidth,
              height: stepHeight + 1,
              color: rgb(r, g, b),
            });
          } else {
            const stepWidth = slideWidth / gradientSteps;
            page.drawRectangle({
              x: step * stepWidth,
              y: 0,
              width: stepWidth + 1,
              height: slideHeight,
              color: rgb(r, g, b),
            });
          }
        }
      } else {
        // Solid background
        const bgColor = hexToRgb(slideInfo.backgroundColor);
        page.drawRectangle({
          x: 0,
          y: 0,
          width: slideWidth,
          height: slideHeight,
          color: rgb(bgColor.r, bgColor.g, bgColor.b),
        });
      }
      
      // Draw all shapes (images and text)
      for (const shape of slideInfo.shapes) {
        if (shape.type === 'image' && shape.imageData) {
          try {
            // Embed image in PDF
            let image;
            const imageBytes = shape.imageData;
            
            // Detect image type and embed
            if (imageBytes[0] === 0xFF && imageBytes[1] === 0xD8) {
              // JPEG
              image = await pdfDoc.embedJpg(imageBytes);
            } else if (imageBytes[0] === 0x89 && imageBytes[1] === 0x50) {
              // PNG
              image = await pdfDoc.embedPng(imageBytes);
            } else {
              console.warn('Unsupported image format, skipping');
              continue;
            }
            
            // Draw image with proper positioning
            page.drawImage(image, {
              x: shape.x,
              y: slideHeight - shape.y - shape.height,
              width: shape.width,
              height: shape.height,
            });
          } catch (error) {
            console.error('Error embedding image:', error);
          }
        } else if (shape.type === 'text' && shape.paragraphs) {
          let currentY = slideHeight - shape.y - 10; // Flip Y coordinate
          
          // Process each paragraph with exact formatting
          for (const paragraph of shape.paragraphs) {
            if (!paragraph.texts || paragraph.texts.length === 0) continue;
            
            // Calculate line height
            const maxFontSize = Math.max(...paragraph.texts.map(t => t.fontSize));
            const lineHeight = maxFontSize * (paragraph.lineSpacing / 100) * 1.2;
            
            // Render each text run in the paragraph
            for (const textRun of paragraph.texts) {
              if (!textRun.text.trim()) continue;
              
              // Select appropriate font
              let font = helveticaFont;
              const fontFamily = (textRun.fontFamily || 'Calibri').toLowerCase();
              
              if (fontFamily.includes('times') || fontFamily.includes('serif')) {
                font = textRun.bold ? timesBoldFont : (textRun.italic ? timesItalicFont : timesFont);
              } else if (fontFamily.includes('courier') || fontFamily.includes('mono')) {
                font = courierFont;
              } else {
                if (textRun.bold && textRun.italic) {
                  font = helveticaBoldObliqueFont;
                } else if (textRun.bold) {
                  font = helveticaBoldFont;
                } else if (textRun.italic) {
                  font = helveticaObliqueFont;
                } else {
                  font = helveticaFont;
                }
              }
              
              const fontSize = Math.min(textRun.fontSize, 72);
              const textColor = hexToRgb(textRun.color);
              
              // Word wrap
              const words = textRun.text.split(' ');
              let line = '';
              
              for (const word of words) {
                const testLine = line + (line ? ' ' : '') + word;
                const textWidth = font.widthOfTextAtSize(testLine, fontSize);
                
                if (textWidth > shape.width - paragraph.indent && line) {
                  // Calculate x position based on paragraph alignment
                  let xPos = shape.x + paragraph.indent;
                  const lineWidth = font.widthOfTextAtSize(line, fontSize);
                  
                  if (paragraph.align === 'ctr') {
                    xPos = shape.x + (shape.width - lineWidth) / 2;
                  } else if (paragraph.align === 'r') {
                    xPos = shape.x + shape.width - lineWidth;
                  } else if (paragraph.align === 'just' || paragraph.align === 'dist') {
                    // Justified - use left alignment for now
                    xPos = shape.x + paragraph.indent;
                  }
                  
                  // Draw line
                  page.drawText(line, {
                    x: xPos,
                    y: currentY,
                    size: fontSize,
                    font: font,
                    color: rgb(textColor.r, textColor.g, textColor.b),
                  });
                  
                  line = word;
                  currentY -= lineHeight;
                } else {
                  line = testLine;
                }
              }
              
              // Draw remaining text
              if (line) {
                let xPos = shape.x + paragraph.indent;
                const lineWidth = font.widthOfTextAtSize(line, fontSize);
                
                if (paragraph.align === 'ctr') {
                  xPos = shape.x + (shape.width - lineWidth) / 2;
                } else if (paragraph.align === 'r') {
                  xPos = shape.x + shape.width - lineWidth;
                }
                
                page.drawText(line, {
                  x: xPos,
                  y: currentY,
                  size: fontSize,
                  font: font,
                  color: rgb(textColor.r, textColor.g, textColor.b),
                });
              }
            }
            
            // Move to next paragraph
            currentY -= lineHeight * 0.5; // Paragraph spacing
          }
        }
      }
    }
    
    // Save PDF
    console.log('Saving PDF...');
    const pdfBytes = await pdfDoc.save();
    console.log(`PDF generated: ${pdfBytes.length} bytes`);
    
    const convertedFileName = file.name.replace(/\.(pptx?|ppt)$/i, '.pdf');

    // Try to upload to storage if database is available
    if (useDatabase && conversionId) {
      try {
        const convertedPath = `${conversionId}/${convertedFileName}`;
        const { error: pdfUploadError } = await supabaseClient.storage
          .from('converted_files')
          .upload(convertedPath, new Blob([pdfBytes], { type: 'application/pdf' }), { 
            contentType: 'application/pdf' 
          });

        if (!pdfUploadError) {
          // Generate signed URL
          const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
            .from('converted_files')
            .createSignedUrl(convertedPath, 3600);

          if (!signedUrlError && signedUrlData) {
            // Update conversion record
            await supabaseClient
              .from('conversions')
              .update({ 
                status: 'completed', 
                converted_path: convertedPath,
                conversion_completed_at: new Date().toISOString(),
              })
              .eq('id', conversionId);

            return new Response(JSON.stringify({ 
              downloadUrl: signedUrlData.signedUrl, 
              fileName: convertedFileName 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }
        }
      } catch (storageError) {
        console.warn('Storage upload failed, returning PDF directly:', storageError);
      }
    }

    // Fallback: Return PDF directly as base64
    console.log('Returning PDF directly (no storage)');
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));
    
    return new Response(JSON.stringify({ 
      pdfData: base64Pdf,
      fileName: convertedFileName,
      direct: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Conversion error:', error);
    
    // Try to update database if available
    if (conversionId) {
      try {
        await supabaseClient
          .from('conversions')
          .update({ status: 'failed', error_message: error.message })
          .eq('id', conversionId);
      } catch (dbError) {
        console.warn('Failed to update error status in database:', dbError);
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Final error:', errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role key for admin access
  );
  return handler(req, supabaseClient);
});
