import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileType === 'text/plain' || fileType === 'text/markdown') {
      return await file.text();
    }
    
    if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
      return await extractTextFromPDF(file);
    }
    
    if (fileName.endsWith('.docx') || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractTextFromWord(file);
    }
    
    if (fileName.endsWith('.doc') || fileType === 'application/msword') {
      throw new Error('ملفات .doc القديمة غير مدعومة. الرجاء تحويل الملف إلى .docx أو PDF.');
    }
    
    if (fileType.startsWith('image/')) {
      return await extractTextFromImage(file);
    }
    
    return await file.text();
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}

async function extractTextFromWord(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractTextFromImage(file: File): Promise<string> {
  const worker = await createWorker('ara+eng');
  const imageData = await file.arrayBuffer();
  const { data: { text } } = await worker.recognize(new Blob([imageData]));
  await worker.terminate();
  return text;
}
