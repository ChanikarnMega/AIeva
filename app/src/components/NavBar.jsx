import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  return (
    <div
      className="nav no-print"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '2px solid var(--color-divider)',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: '-0.01em',
          }}
        >
          Candidate Evaluation
        </span>
        <span style={{ fontSize: 12, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
          ประเมินแคนดิเดทด้วย AI
        </span>
      </div>
      <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => navigate('/upload')}>
        + วิเคราะห์แคนดิเดทใหม่
      </button>
    </div>
  );
}
