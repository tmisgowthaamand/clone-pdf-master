# PowerPoint to PDF Converter - Automation & Integration Guide

This guide provides prompts, code examples, and workflows for automating PowerPoint to PDF conversion using our tool.

## Table of Contents
1. [Batch Upload and Conversion](#batch-upload-and-conversion)
2. [Python Script Integration](#python-script-integration)
3. [API Endpoints](#api-endpoints)
4. [Email Automation](#email-automation)
5. [Mobile App Integration](#mobile-app-integration)
6. [Quality Check Automation](#quality-check-automation)

---

## 1. Batch Upload and Conversion

### Zapier/Make.com Workflow

**Prompt for Automation:**
```
Create a Zapier workflow that triggers on new files added to Google Drive in a 'Presentations' folder. 
Filter for .pptx files, then send them to our PowerPoint to PDF converter endpoint. 
Convert up to 5 files at once with high-quality settings, merge into a single PDF named 
'[original_filename]_batch.pdf', and save the output back to Google Drive in a 'Converted PDFs' folder. 
Include error handling for files over 100 MB.
```

**Workflow Steps:**
1. **Trigger**: Google Drive - New File in Folder
   - Folder: `/Presentations`
   - File Type Filter: `.pptx, .ppt`

2. **Filter**: File Size Check
   - Condition: `File Size < 100 MB`

3. **Action**: HTTP Request to Converter
   - Method: `POST`
   - URL: `http://your-domain.com/api/convert/powerpoint-to-pdf`
   - Body:
     ```json
     {
       "file_url": "{{google_drive_file_url}}",
       "quality": "high",
       "output_name": "{{file_name}}_converted.pdf"
     }
     ```

4. **Action**: Upload to Google Drive
   - Folder: `/Converted PDFs`
   - File: `{{converted_pdf}}`

---

## 2. Python Script Integration

### Single File Conversion

```python
import requests
import os
from pathlib import Path

class PowerPointToPDFConverter:
    def __init__(self, api_url="http://localhost:8082/api/convert"):
        self.api_url = api_url
    
    def convert_file(self, file_path, output_path=None, quality="high"):
        """
        Convert a PowerPoint file to PDF
        
        Args:
            file_path (str): Path to the PowerPoint file
            output_path (str): Path where PDF should be saved
            quality (str): Conversion quality - 'high', 'medium', 'low'
        
        Returns:
            str: Path to the converted PDF file
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Prepare output path
        if output_path is None:
            output_path = str(Path(file_path).with_suffix('.pdf'))
        
        print(f"Converting {file_path}...")
        
        # Upload file
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')}
            data = {'quality': quality}
            
            response = requests.post(
                f"{self.api_url}/powerpoint-to-pdf",
                files=files,
                data=data,
                timeout=300  # 5 minutes timeout
            )
        
        if response.status_code == 200:
            # Save PDF
            with open(output_path, 'wb') as f:
                f.write(response.content)
            print(f"✅ Conversion successful! Saved to: {output_path}")
            return output_path
        else:
            raise Exception(f"Conversion failed: {response.status_code} - {response.text}")
    
    def batch_convert(self, file_paths, output_dir=None):
        """
        Convert multiple PowerPoint files to PDF
        
        Args:
            file_paths (list): List of file paths to convert
            output_dir (str): Directory where PDFs should be saved
        
        Returns:
            list: List of paths to converted PDF files
        """
        results = []
        
        for file_path in file_paths:
            try:
                if output_dir:
                    output_path = os.path.join(output_dir, Path(file_path).stem + '.pdf')
                else:
                    output_path = None
                
                converted = self.convert_file(file_path, output_path)
                results.append({'success': True, 'input': file_path, 'output': converted})
            except Exception as e:
                print(f"❌ Failed to convert {file_path}: {str(e)}")
                results.append({'success': False, 'input': file_path, 'error': str(e)})
        
        return results

# Usage Example
if __name__ == "__main__":
    converter = PowerPointToPDFConverter()
    
    # Single file conversion
    converter.convert_file(
        file_path="./presentations/quarterly_report.pptx",
        output_path="./output/quarterly_report.pdf",
        quality="high"
    )
    
    # Batch conversion
    files = [
        "./presentations/report1.pptx",
        "./presentations/report2.pptx",
        "./presentations/report3.pptx"
    ]
    results = converter.batch_convert(files, output_dir="./output")
    
    # Print summary
    successful = sum(1 for r in results if r['success'])
    print(f"\n📊 Conversion Summary: {successful}/{len(results)} successful")
```

### Advanced: Watch Folder and Auto-Convert

```python
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class PowerPointWatcher(FileSystemEventHandler):
    def __init__(self, converter, output_dir):
        self.converter = converter
        self.output_dir = output_dir
    
    def on_created(self, event):
        if event.is_directory:
            return
        
        file_path = event.src_path
        if file_path.endswith(('.pptx', '.ppt')):
            print(f"📁 New PowerPoint detected: {file_path}")
            time.sleep(1)  # Wait for file to be fully written
            
            try:
                self.converter.convert_file(
                    file_path=file_path,
                    output_path=os.path.join(self.output_dir, Path(file_path).stem + '.pdf')
                )
            except Exception as e:
                print(f"❌ Auto-conversion failed: {str(e)}")

# Usage
converter = PowerPointToPDFConverter()
event_handler = PowerPointWatcher(converter, output_dir="./converted")
observer = Observer()
observer.schedule(event_handler, path="./presentations", recursive=False)
observer.start()

print("👀 Watching for new PowerPoint files...")
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()
observer.join()
```

---

## 3. API Endpoints

### REST API Documentation

If you want to expose the converter as an API service, here's the endpoint specification:

#### POST `/api/convert/powerpoint-to-pdf`

**Request:**
```http
POST /api/convert/powerpoint-to-pdf HTTP/1.1
Content-Type: multipart/form-data

file: [binary PowerPoint file]
quality: "high" | "medium" | "low" (optional, default: "high")
merge: true | false (optional, for batch conversion)
```

**Response (Success):**
```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="converted.pdf"

[PDF binary data]
```

**Response (Error):**
```json
{
  "error": "Conversion failed",
  "message": "Unsupported file format",
  "code": 400
}
```

### cURL Examples

```bash
# Single file conversion
curl -X POST http://localhost:8082/api/convert/powerpoint-to-pdf \
  -F "file=@presentation.pptx" \
  -F "quality=high" \
  -o output.pdf

# Batch conversion with merge
curl -X POST http://localhost:8082/api/convert/powerpoint-to-pdf \
  -F "file=@file1.pptx" \
  -F "file=@file2.pptx" \
  -F "merge=true" \
  -o merged.pdf
```

---

## 4. Email Automation

### Microsoft Power Automate Flow

**Prompt:**
```
Build an automation in Microsoft Power Automate: When an email arrives in Outlook with 
subject containing 'Presentation Update' and .ppt/.pptx attachments, extract attachments, 
convert to PDF using our converter, then email the PDF back to the sender with subject 
'Converted PDF Attached'. Limit to files under 50 MB each.
```

**Flow Steps:**

1. **Trigger**: When a new email arrives (V3)
   - Subject Filter: `contains 'Presentation Update'`
   - Has Attachments: `Yes`

2. **Condition**: Check attachment size
   ```
   @less(attachments('Current_attachment')?['size'], 52428800)
   ```

3. **Apply to each**: Attachment
   - Filter: `endsWith(items('Apply_to_each')?['name'], '.pptx') or endsWith(items('Apply_to_each')?['name'], '.ppt')`

4. **HTTP Action**: Convert to PDF
   - Method: `POST`
   - URI: `http://your-domain.com/api/convert/powerpoint-to-pdf`
   - Headers:
     ```json
     {
       "Content-Type": "multipart/form-data"
     }
     ```
   - Body:
     ```
     {
       "file": @{base64(items('Apply_to_each')?['contentBytes'])},
       "filename": @{items('Apply_to_each')?['name']}
     }
     ```

5. **Send Email**: Reply with PDF
   - To: `@{triggerOutputs()?['body/from']}`
   - Subject: `Converted PDF Attached - @{items('Apply_to_each')?['name']}`
   - Attachments: `@{body('HTTP_Action')}`

### Node.js Email Automation

```javascript
const nodemailer = require('nodemailer');
const FormData = require('form-data');
const axios = require('axios');
const Imap = require('imap');

class EmailPowerPointConverter {
  constructor(config) {
    this.imap = new Imap(config.imap);
    this.smtp = nodemailer.createTransport(config.smtp);
    this.converterUrl = config.converterUrl;
  }

  async processEmails() {
    this.imap.once('ready', () => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) throw err;
        
        // Search for unread emails with subject containing "Presentation Update"
        this.imap.search(['UNSEEN', ['SUBJECT', 'Presentation Update']], (err, results) => {
          if (err) throw err;
          
          const fetch = this.imap.fetch(results, { bodies: '' });
          
          fetch.on('message', (msg) => {
            msg.on('body', async (stream) => {
              const parsed = await this.parseEmail(stream);
              await this.convertAndReply(parsed);
            });
          });
        });
      });
    });

    this.imap.connect();
  }

  async convertAndReply(email) {
    for (const attachment of email.attachments) {
      if (attachment.filename.match(/\.(pptx?|ppt)$/i)) {
        try {
          const pdf = await this.convertToPDF(attachment);
          await this.sendReply(email.from, attachment.filename, pdf);
        } catch (error) {
          console.error(`Failed to convert ${attachment.filename}:`, error);
        }
      }
    }
  }

  async convertToPDF(attachment) {
    const form = new FormData();
    form.append('file', attachment.content, attachment.filename);
    form.append('quality', 'high');

    const response = await axios.post(this.converterUrl, form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer'
    });

    return response.data;
  }

  async sendReply(to, originalFilename, pdfBuffer) {
    await this.smtp.sendMail({
      from: 'converter@yourdomain.com',
      to: to,
      subject: `Converted PDF Attached - ${originalFilename}`,
      text: `Your PowerPoint file "${originalFilename}" has been converted to PDF.`,
      attachments: [{
        filename: originalFilename.replace(/\.(pptx?|ppt)$/i, '.pdf'),
        content: pdfBuffer
      }]
    });
  }
}

// Usage
const converter = new EmailPowerPointConverter({
  imap: {
    user: 'your-email@gmail.com',
    password: 'your-password',
    host: 'imap.gmail.com',
    port: 993,
    tls: true
  },
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-password'
    }
  },
  converterUrl: 'http://localhost:8082/api/convert/powerpoint-to-pdf'
});

converter.processEmails();
```

---

## 5. Mobile App Integration

### iOS Shortcuts

**Prompt:**
```
Create an iOS Shortcut that accesses the Files app, selects PPTX files, sends them to our 
PowerPoint to PDF converter, waits for conversion completion, and downloads the PDF to the 
Files app. Add a notification for success/failure and option to share via AirDrop.
```

**Shortcut Actions:**

1. **Get File** from Files app
   - File Types: `.pptx, .ppt`

2. **Get Contents of URL**
   - URL: `http://your-domain.com/api/convert/powerpoint-to-pdf`
   - Method: `POST`
   - Request Body: `Form`
   - Add Field: `file` = `Shortcut Input`

3. **Save File**
   - Destination: `Files/Converted PDFs/`
   - Filename: `Converted Input.pdf`

4. **Show Notification**
   - Title: `✅ Conversion Complete`
   - Body: `PDF saved to Files app`

5. **Share** (Optional)
   - Share: `Saved File`
   - Via: `AirDrop`

### Android Tasker Integration

```xml
<TaskerTask>
  <Task name="Convert PowerPoint to PDF">
    <Action type="FilePicker">
      <FileType>application/vnd.openxmlformats-officedocument.presentationml.presentation</FileType>
      <Variable>%selected_file</Variable>
    </Action>
    
    <Action type="HTTPPost">
      <URL>http://your-domain.com/api/convert/powerpoint-to-pdf</URL>
      <File>%selected_file</File>
      <ResponseFile>/sdcard/Download/converted.pdf</ResponseFile>
    </Action>
    
    <Action type="Notify">
      <Title>Conversion Complete</Title>
      <Text>PDF saved to Downloads</Text>
    </Action>
  </Task>
</TaskerTask>
```

---

## 6. Quality Check Automation

### AI-Assisted Quality Check

**Prompt for ChatGPT/Claude:**
```
After converting a PowerPoint file named 'Quarterly_Report.pptx' to PDF using our converter, 
analyze the output PDF. Check for:
1. Layout fidelity (images not distorted, fonts intact)
2. File size optimization (target <5MB)
3. Text readability and formatting preservation
4. Image quality and positioning

Suggest improvements like re-converting with different quality settings if issues found, 
and generate a summary report.
```

### Python Quality Check Script

```python
import PyPDF2
from PIL import Image
import io

class PDFQualityChecker:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.report = {}
    
    def check_file_size(self, max_size_mb=5):
        """Check if PDF is within size limit"""
        size_mb = os.path.getsize(self.pdf_path) / (1024 * 1024)
        self.report['file_size'] = {
            'size_mb': round(size_mb, 2),
            'within_limit': size_mb <= max_size_mb,
            'status': '✅' if size_mb <= max_size_mb else '⚠️'
        }
        return size_mb <= max_size_mb
    
    def check_page_count(self, expected_pages=None):
        """Verify page count matches original"""
        with open(self.pdf_path, 'rb') as f:
            pdf = PyPDF2.PdfReader(f)
            page_count = len(pdf.pages)
        
        self.report['page_count'] = {
            'count': page_count,
            'expected': expected_pages,
            'match': page_count == expected_pages if expected_pages else None,
            'status': '✅' if not expected_pages or page_count == expected_pages else '⚠️'
        }
        return page_count
    
    def check_text_extraction(self):
        """Verify text is extractable (not image-only)"""
        with open(self.pdf_path, 'rb') as f:
            pdf = PyPDF2.PdfReader(f)
            text_length = sum(len(page.extract_text()) for page in pdf.pages)
        
        self.report['text_extraction'] = {
            'total_characters': text_length,
            'extractable': text_length > 0,
            'status': '✅' if text_length > 0 else '⚠️'
        }
        return text_length > 0
    
    def generate_report(self):
        """Generate quality check report"""
        print("\n" + "="*50)
        print("📊 PDF QUALITY CHECK REPORT")
        print("="*50)
        
        for check, data in self.report.items():
            print(f"\n{check.upper().replace('_', ' ')}:")
            for key, value in data.items():
                print(f"  {key}: {value}")
        
        # Overall status
        all_passed = all(data.get('status') == '✅' for data in self.report.values())
        print("\n" + "="*50)
        print(f"OVERALL: {'✅ PASSED' if all_passed else '⚠️ NEEDS REVIEW'}")
        print("="*50 + "\n")
        
        return self.report

# Usage
checker = PDFQualityChecker('converted.pdf')
checker.check_file_size(max_size_mb=5)
checker.check_page_count(expected_pages=10)
checker.check_text_extraction()
report = checker.generate_report()
```

---

## 7. Cloud Storage Integration

### Google Drive Auto-Conversion

```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
import io

class GoogleDriveConverter:
    def __init__(self, credentials_path):
        self.creds = Credentials.from_authorized_user_file(credentials_path)
        self.service = build('drive', 'v3', credentials=self.creds)
        self.converter = PowerPointToPDFConverter()
    
    def watch_folder(self, folder_id):
        """Watch a Google Drive folder for new PowerPoint files"""
        query = f"'{folder_id}' in parents and (mimeType='application/vnd.openxmlformats-officedocument.presentationml.presentation' or mimeType='application/vnd.ms-powerpoint')"
        
        results = self.service.files().list(
            q=query,
            fields="files(id, name, mimeType)"
        ).execute()
        
        files = results.get('files', [])
        
        for file in files:
            self.convert_and_upload(file['id'], file['name'], folder_id)
    
    def convert_and_upload(self, file_id, filename, output_folder_id):
        """Download, convert, and re-upload to Google Drive"""
        # Download
        request = self.service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        
        done = False
        while not done:
            status, done = downloader.next_chunk()
        
        # Save temporarily
        temp_path = f'/tmp/{filename}'
        with open(temp_path, 'wb') as f:
            f.write(fh.getvalue())
        
        # Convert
        pdf_path = self.converter.convert_file(temp_path)
        
        # Upload PDF
        file_metadata = {
            'name': filename.replace('.pptx', '.pdf').replace('.ppt', '.pdf'),
            'parents': [output_folder_id]
        }
        media = MediaFileUpload(pdf_path, mimetype='application/pdf')
        
        self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        
        print(f"✅ Converted and uploaded: {filename}")
```

---

## Support & Troubleshooting

### Common Issues

1. **File Size Limits**: Maximum file size is 100MB
2. **Timeout**: Large files may take 2-5 minutes to convert
3. **Format Support**: Only .pptx and .ppt files are supported
4. **Quality Settings**: 
   - `high`: 3x resolution (best quality, larger file)
   - `medium`: 2x resolution (balanced)
   - `low`: 1x resolution (smallest file)

### Error Codes

- `400`: Invalid file format or corrupted file
- `413`: File too large (>100MB)
- `500`: Conversion error (check server logs)
- `503`: Service temporarily unavailable

---

## License & Credits

This automation guide is provided as-is for the PowerPoint to PDF Converter tool.
For commercial use, please review the license terms.

**Last Updated**: October 31, 2025
