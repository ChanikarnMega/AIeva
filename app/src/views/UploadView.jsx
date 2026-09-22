import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidates } from '../state/CandidatesContext.jsx';
import { buildEvidenceText, buildJdText } from '../lib/evidence';
import { analyzeCandidate } from '../lib/api';

function FileList({ files, onRemove }) {
  if (!files.length) return null;
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--space-3) 0 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {files.map((f, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
          }}
        >
          <span>
            {f.name} <span className="text-muted">({f.sizeLabel})</span>
            {f.error ? <span style={{ color: 'var(--color-accent-700)', display: 'block', fontSize: 12 }}>{f.error}</span> : null}
          </span>
          <button
            type="button"
            className="btn btn-icon"
            style={{ width: 24, height: 24, fontSize: 16, padding: 0 }}
            onClick={() => onRemove(i)}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}

const EMPTY_FORM = { name: '', jd: '', pastedText: '', files: [], jdFiles: [] };

export default function UploadView() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const { addCandidate } = useCandidates();
  const navigate = useNavigate();

  const onFilesSelected = async (e) => {
    const fileList = Array.from(e.target.files || []);
    e.target.value = '';
    // Lazy-loaded: pdf.js/mammoth are sizeable and only needed once a file
    // is actually picked, so keep them out of the initial page bundle.
    const { readFileMeta } = await import('../lib/fileParsing');
    const metas = await Promise.all(fileList.map(readFileMeta));
    setForm((s) => ({ ...s, files: [...s.files, ...metas] }));
  };

  const onJdFilesSelected = async (e) => {
    const fileList = Array.from(e.target.files || []);
    e.target.value = '';
    const { readFileMeta } = await import('../lib/fileParsing');
    const metas = await Promise.all(fileList.map(readFileMeta));
    setForm((s) => ({ ...s, jdFiles: [...s.jdFiles, ...metas] }));
  };

  const removeFile = (idx) => setForm((s) => ({ ...s, files: s.files.filter((_, i) => i !== idx) }));
  const removeJdFile = (idx) => setForm((s) => ({ ...s, jdFiles: s.jdFiles.filter((_, i) => i !== idx) }));

  const analyze = async () => {
    if (!form.name.trim()) {
      setError('กรุณาใส่ชื่อแคนดิเดท');
      return;
    }
    setAnalyzing(true);
    setError(null);
    const evidence = buildEvidenceText(form);
    const jdText = buildJdText(form);
    try {
      const evalResult = await analyzeCandidate({ name: form.name.trim(), jd: jdText, evidence });
      const candidate = {
        id: 'c' + Date.now(),
        name: form.name.trim(),
        jd: jdText,
        jdFiles: form.jdFiles.map((f) => ({ name: f.name, size: f.size, text: f.text })),
        files: form.files.map((f) => ({ name: f.name, size: f.size, text: f.text })),
        pastedText: form.pastedText.trim(),
        eval: evalResult,
        chat: [],
        createdAt: Date.now(),
      };
      addCandidate(candidate);
      setForm(EMPTY_FORM);
      setAnalyzing(false);
      navigate(`/candidates/${candidate.id}`);
    } catch (e) {
      setAnalyzing(false);
      setError('วิเคราะห์ไม่สำเร็จ ลองใหม่อีกครั้ง (' + e.message + ')');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-1)' }}>อัปโหลดข้อมูลแคนดิเดท</h2>
      <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
        ใส่ตำแหน่งงาน เกณฑ์ (ถ้ามี) แล้วอัปโหลดเรซูเม่/คำตอบของแคนดิเดท ระบบจะวิเคราะห์และให้คุณถามต่อได้
      </p>

      <div className="field" style={{ marginBottom: 'var(--space-4)' }}>
        <label>ชื่อแคนดิเดท</label>
        <input
          className="input"
          type="text"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="เช่น สมชาย ใจดี"
        />
      </div>

      <div className="field" style={{ marginBottom: 'var(--space-4)' }}>
        <label>ตำแหน่งงาน / Job Description</label>
        <textarea
          className="input"
          rows={3}
          value={form.jd}
          onChange={(e) => setForm((s) => ({ ...s, jd: e.target.value }))}
          placeholder="วางรายละเอียดตำแหน่งงานหรือเกณฑ์ที่ต้องการ (ไม่บังคับ — ถ้าไม่ใส่ AI จะประเมินตามเกณฑ์ทั่วไปของตำแหน่งที่เกี่ยวข้อง)"
          style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            หรืออัปโหลดไฟล์ JD
            <input type="file" multiple style={{ display: 'none' }} onChange={onJdFilesSelected} />
          </label>
          <span className="text-muted" style={{ fontSize: 13 }}>
            PDF / Word (.docx) / รูปภาพ / ข้อความ
          </span>
        </div>
        <FileList files={form.jdFiles} onRemove={removeJdFile} />
      </div>

      <div className="field" style={{ marginBottom: 'var(--space-4)' }}>
        <label>ไฟล์ (เรซูเม่ / คำตอบสัมภาษณ์ / คะแนน) — อัปโหลดได้หลายไฟล์</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            เลือกไฟล์
            <input type="file" multiple style={{ display: 'none' }} onChange={onFilesSelected} />
          </label>
          <span className="text-muted" style={{ fontSize: 13 }}>
            รองรับ PDF / Word (.docx) / รูปภาพ / ข้อความ
          </span>
        </div>
        <FileList files={form.files} onRemove={removeFile} />
      </div>

      <div className="field" style={{ marginBottom: 'var(--space-6)' }}>
        <label>หรือวางข้อความคำตอบ/เรซูเม่โดยตรง</label>
        <textarea
          className="input"
          rows={6}
          value={form.pastedText}
          onChange={(e) => setForm((s) => ({ ...s, pastedText: e.target.value }))}
          placeholder="วางเนื้อหาคำตอบ, transcript การสัมภาษณ์ หรือประวัติของแคนดิเดทที่นี่ (ใช้แทนไฟล์ที่อ่านเนื้อไม่ได้ เช่น รูปภาพ หรือ .doc รุ่นเก่า)"
          style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
        />
      </div>

      {error ? <p style={{ color: 'var(--color-accent-700)', fontSize: 13, marginBottom: 'var(--space-4)' }}>{error}</p> : null}

      <button className="btn btn-primary btn-block" onClick={analyze} disabled={analyzing}>
        {analyzing ? 'กำลังวิเคราะห์...' : 'วิเคราะห์แคนดิเดท'}
      </button>
    </div>
  );
}
