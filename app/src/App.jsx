import { Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import ListView from './views/ListView.jsx';
import UploadView from './views/UploadView.jsx';
import ProfileView from './views/ProfileView.jsx';
import ChatView from './views/ChatView.jsx';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      <NavBar />
      <div style={{ maxWidth: 920, margin: '0 auto', padding: 'var(--space-8) var(--space-6) 80px' }}>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/upload" element={<UploadView />} />
          <Route path="/candidates/:id" element={<ProfileView />} />
          <Route path="/candidates/:id/chat" element={<ChatView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
