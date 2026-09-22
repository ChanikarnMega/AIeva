import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCandidates } from '../state/CandidatesContext.jsx';
import { dateLabel } from '../lib/format';

export default function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates } = useCandidates();
  const candidate = candidates.find((c) => c.id === id);

  if (!candidate) return <Navigate to="/" replace />;

  const ev = candidate.eval || {};
  const pass = !!ev.pass;
  const scoreLabel = typeof ev.score === 'number' ? ev.score + '/100' : '—';
  const files = candidate.files || [];

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
          &larr; กลับหน้ารายการ
        </a>
        <button className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }} onClick={() => window.print()}>
          พิมพ์ / บันทึกเป็น PDF
        </button>
      </div>

      <div id="printArea">
        <div className="card elev-sm" style={{ marginBottom: 'var(--space-6)', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
            <div>
              <span className="card-kicker">ผลการประเมิน</span>
              <h2 style={{ marginTop: 2, marginBottom: 4 }}>{candidate.name}</h2>
              <span className="text-muted" style={{ fontSize: 12 }}>
                {dateLabel(candidate.createdAt)}
              </span>
            </div>
            <div style={{ textAlign: 'right', flex: 'none' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 40, lineHeight: 1, color: 'var(--color-accent-700)' }}>
                {scoreLabel}
              </div>
              <span
                className={'tag ' + (pass ? 'tag-accent' : 'tag-neutral')}
                style={{ marginTop: 'var(--space-1)', display: 'inline-block' }}
              >
                {pass ? 'ผ่าน' : 'ไม่ผ่าน'}
              </span>
            </div>
          </div>
          {candidate.jd ? (
            <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <span className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ตำแหน่งงาน / เกณฑ์
              </span>
              <p style={{ fontSize: 13, margin: '2px 0 0', whiteSpace: 'pre-wrap' }}>{candidate.jd}</p>
            </div>
          ) : null}
        </div>

        <div className="card elev-sm" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="card-kicker">สรุปภาพรวม</span>
          <p style={{ fontSize: 15, margin: 0 }}>{ev.summary || ''}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div className="card elev-sm">
            <span className="card-kicker">จุดแข็ง</span>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
              {(ev.strengths || []).map((it, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  {it}
                </li>
              ))}
            </ul>
          </div>
          <div className="card elev-sm">
            <span className="card-kicker" style={{ color: 'var(--color-text)', opacity: 0.55 }}>
              ข้อควรพัฒนา
            </span>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
              {(ev.weaknesses || []).map((it, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card elev-sm" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="card-kicker">รายละเอียดตามเกณฑ์</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {(ev.rubric || []).map((r, i) => (
              <div key={i} style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-divider)' }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{r.criterion}</div>
                <div className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>
                  {r.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        {files.length > 0 ? (
          <div className="card elev-sm no-print" style={{ marginBottom: 'var(--space-6)' }}>
            <span className="card-kicker">ไฟล์ที่แนบ</span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {files.map((f, i) => (
                <li key={i} style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', fontSize: 13 }}>
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <button className="btn btn-primary no-print" onClick={() => navigate(`/candidates/${candidate.id}/chat`)}>
        ถามคำถามเพิ่มเติมกับ AI &rarr;
      </button>
    </div>
  );
}
