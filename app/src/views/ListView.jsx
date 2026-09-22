import { useNavigate } from 'react-router-dom';
import { useCandidates } from '../state/CandidatesContext.jsx';
import { dateLabel } from '../lib/format';

export default function ListView() {
  const { candidates } = useCandidates();
  const navigate = useNavigate();

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-1)' }}>ประวัติแคนดิเดทที่วิเคราะห์แล้ว</h2>
      <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
        คลิกที่แคนดิเดทเพื่อดูรายละเอียดหรือถามคำถามเพิ่ม
      </p>

      {candidates.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {candidates.map((c) => {
            const pass = !!(c.eval && c.eval.pass);
            const scoreLabel = c.eval && typeof c.eval.score === 'number' ? c.eval.score + '/100' : '—';
            return (
              <div
                key={c.id}
                className="card elev-sm"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-3)',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/candidates/${c.id}`)}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17 }}>{c.name}</div>
                  <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {dateLabel(c.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className={'tag ' + (pass ? 'tag-accent' : 'tag-neutral')}>{pass ? 'ผ่าน' : 'ไม่ผ่าน'}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      fontSize: 20,
                      minWidth: 56,
                      textAlign: 'right',
                      color: 'var(--color-accent-700)',
                    }}
                  >
                    {scoreLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: 'var(--space-8) 0', textAlign: 'left' }}>
          <p className="text-muted">
            ยังไม่มีแคนดิเดทที่วิเคราะห์ กดปุ่ม "วิเคราะห์แคนดิเดทใหม่" ด้านบนเพื่อเริ่ม
          </p>
        </div>
      )}
    </div>
  );
}
