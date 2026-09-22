import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCandidates } from '../state/CandidatesContext.jsx';
import { buildEvidenceText } from '../lib/evidence';
import { sendChatMessage } from '../lib/api';

export default function ChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, updateCandidate } = useCandidates();
  const candidate = candidates.find((c) => c.id === id);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);

  if (!candidate) return <Navigate to="/" replace />;

  const chat = candidate.chat || [];

  const sendChat = async () => {
    const question = chatInput.trim();
    if (!question || chatSending) return;
    const evidence = buildEvidenceText({ pastedText: candidate.pastedText, files: candidate.files });
    const history = chat.map((m) => ({ role: m.role, text: m.text }));
    const withQuestion = [...chat, { role: 'user', text: question }];
    updateCandidate(candidate.id, (c) => ({ ...c, chat: withQuestion }));
    setChatInput('');
    setChatSending(true);
    try {
      const answer = await sendChatMessage({
        name: candidate.name,
        jd: candidate.jd,
        evidence,
        evalResult: candidate.eval,
        history,
        question,
      });
      updateCandidate(candidate.id, (c) => ({
        ...c,
        chat: [...withQuestion, { role: 'assistant', text: (answer || '').trim() }],
      }));
    } catch (e) {
      updateCandidate(candidate.id, (c) => ({
        ...c,
        chat: [...withQuestion, { role: 'assistant', text: 'ขออภัย เกิดข้อผิดพลาด: ' + e.message }],
      }));
    } finally {
      setChatSending(false);
    }
  };

  return (
    <div>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate(`/candidates/${candidate.id}`);
        }}
        style={{ fontSize: 13, display: 'inline-block', marginBottom: 'var(--space-4)' }}
      >
        &larr; กลับไปโปรไฟล์ {candidate.name}
      </a>
      <h2 style={{ marginBottom: 'var(--space-1)' }}>ถาม-ตอบเกี่ยวกับ {candidate.name}</h2>
      <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
        เช่น "ทำไมคนนี้ไม่ผ่าน" หรือ "คิดว่าทำไมเขาไม่ตอบแบบนี้"
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 'var(--space-6)' }}>
        {chat.map((m, i) => (
          <div key={i} style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-divider)' }}>
            <span
              className={'tag ' + (m.role === 'user' ? 'tag-neutral' : 'tag-accent')}
              style={{ marginBottom: 6, display: 'inline-block' }}
            >
              {m.role === 'user' ? 'คำถาม' : 'AI'}
            </span>
            <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{m.text}</p>
          </div>
        ))}
        {chat.length === 0 ? <p className="text-muted" style={{ padding: 'var(--space-4) 0' }}>ยังไม่มีคำถาม เริ่มพิมพ์ด้านล่างได้เลย</p> : null}
      </div>

      <div className="field">
        <textarea
          className="input"
          rows={3}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="พิมพ์คำถาม..."
          style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
        />
      </div>
      <button className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }} onClick={sendChat} disabled={chatSending}>
        {chatSending ? 'กำลังตอบ...' : 'ส่งคำถาม'}
      </button>
    </div>
  );
}
