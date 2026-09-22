import * as pdfjsLib from 'pdfjs-dist';
// Vite `?url` import resolves to the built asset's URL so pdf.js can spin
// up its worker without a bundler-specific worker loader.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import { sizeLabel } from './format';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_CHARS = 20000;

const TEXT_EXT = /\.(txt|md|csv|json)$/i;
const PDF_EXT = /\.pdf$/i;
const DOCX_EXT = /\.docx$/i;
const DOC_EXT = /\.doc$/i;

async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
  }
  return pages.join('\n\n').trim();
}

async function extractDocxText(file) {
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return (result.value || '').trim();
}

/**
 * Reads a File's metadata and, where possible, its text content:
 * - .txt/.md/.csv/.json — read directly
 * - .pdf — extracted with pdf.js
 * - .docx — extracted with mammoth
 * - .doc (legacy binary Word) and everything else (images, etc.) — metadata
 *   only; `error` explains why so the UI can show it and the "paste text"
 *   fallback stays available.
 */
export async function readFileMeta(file) {
  const meta = {
    name: file.name,
    size: file.size,
    sizeLabel: sizeLabel(file.size),
    text: null,
    error: null,
  };
  try {
    if (TEXT_EXT.test(file.name) || file.type === 'text/plain') {
      meta.text = (await file.text()).slice(0, MAX_CHARS);
    } else if (PDF_EXT.test(file.name) || file.type === 'application/pdf') {
      const text = await extractPdfText(file);
      if (text) {
        meta.text = text.slice(0, MAX_CHARS);
      } else {
        meta.error = 'ไม่พบข้อความในไฟล์ PDF นี้ (อาจเป็นไฟล์ที่สแกนเป็นรูปภาพ) — ลองวางข้อความแทน';
      }
    } else if (
      DOCX_EXT.test(file.name) ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const text = await extractDocxText(file);
      if (text) {
        meta.text = text.slice(0, MAX_CHARS);
      } else {
        meta.error = 'ไม่พบข้อความในไฟล์ Word นี้ — ลองวางข้อความแทน';
      }
    } else if (DOC_EXT.test(file.name)) {
      meta.error = 'ไฟล์ .doc (Word รุ่นเก่า) อ่านเนื้อไฟล์โดยตรงไม่ได้ กรุณาแปลงเป็น .docx หรือวางข้อความแทน';
    }
    // Images and other formats: attached as metadata only, no error — this
    // mirrors the original design's "paste text" fallback for anything
    // that isn't plain text, PDF, or docx.
  } catch (e) {
    meta.error = 'อ่านไฟล์ไม่สำเร็จ: ' + (e && e.message ? e.message : String(e));
  }
  return meta;
}
