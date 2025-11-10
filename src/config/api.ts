// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // PDF Conversion
  PDF_TO_WORD: `${API_URL}/api/convert/pdf-to-docx`,
  PDF_TO_EXCEL: `${API_URL}/api/convert/pdf-to-excel`,
  PDF_TO_PPTX: `${API_URL}/api/convert/pdf-to-pptx`,
  PDF_TO_JPG: `${API_URL}/api/convert/pdf-to-jpg`,
  
  // To PDF Conversion
  WORD_TO_PDF: `${API_URL}/api/convert/docx-to-pdf`,
  EXCEL_TO_PDF: `${API_URL}/api/convert/excel-to-pdf`,
  EXCEL_TO_BANK_STATEMENT: `${API_URL}/api/convert/excel-to-bank-statement`,
  PPTX_TO_PDF: `${API_URL}/api/convert/pptx-to-pdf`,
  JPG_TO_PDF: `${API_URL}/api/convert/jpg-to-pdf`,
  HTML_TO_PDF: `${API_URL}/api/html-to-pdf`,
  
  // PDF Operations
  WATERMARK_ADD: `${API_URL}/api/watermark/add`,
  PDF_ROTATE: `${API_URL}/api/pdf/rotate`,
  PDF_PROTECT: `${API_URL}/api/pdf/protect`,
  PDF_UNLOCK: `${API_URL}/api/pdf/unlock`,
  
  // Sign PDF
  SIGN_CREATE_TEXT: `${API_URL}/api/sign/create-text-signature`,
  SIGN_APPLY: `${API_URL}/api/sign/apply-signatures`,
  
  // Health Check
  HEALTH: `${API_URL}/health`,
};

export { API_URL };
