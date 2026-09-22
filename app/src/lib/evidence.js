/**
 * Builds the JD text sent to the AI: the typed JD text plus the extracted
 * (or "couldn't read") text of any uploaded JD files.
 */
export function buildJdText({ jd, jdFiles }) {
  const parts = [];
  if (jd && jd.trim()) parts.push(jd.trim());
  (jdFiles || []).forEach((f) => {
    if (f.text) parts.push(`เนื้อหาไฟล์ JD "${f.name}":\n` + f.text);
    else parts.push(`ไฟล์ JD แนบ (อ่านเนื้อไฟล์ไม่ได้): ${f.name}`);
  });
  return parts.join('\n\n');
}

/**
 * Builds the candidate-evidence text sent to the AI: pasted text plus the
 * extracted (or "couldn't read") text of every uploaded candidate file.
 */
export function buildEvidenceText({ pastedText, files }) {
  const parts = [];
  if (pastedText && pastedText.trim()) parts.push('ข้อความที่วางโดยตรง:\n' + pastedText.trim());
  (files || []).forEach((f) => {
    if (f.text) parts.push(`เนื้อหาไฟล์ "${f.name}":\n` + f.text);
    else parts.push(`ไฟล์แนบ (ไม่สามารถอ่านเนื้อไฟล์ได้): ${f.name}`);
  });
  return parts.join('\n\n---\n\n') || '(ไม่มีข้อมูลคำตอบ/เรซูเม่ที่อ่านได้ กรุณาประเมินจากข้อมูลที่มีอย่างจำกัด)';
}
