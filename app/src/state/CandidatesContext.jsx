import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loadCandidates, saveCandidates } from '../lib/storage';

const CandidatesContext = createContext(null);

export function CandidatesProvider({ children }) {
  const [candidates, setCandidates] = useState(() => loadCandidates());

  const addCandidate = useCallback((candidate) => {
    setCandidates((prev) => {
      const next = [candidate, ...prev];
      saveCandidates(next);
      return next;
    });
  }, []);

  const updateCandidate = useCallback((id, updater) => {
    setCandidates((prev) => {
      const next = prev.map((c) => (c.id === id ? updater(c) : c));
      saveCandidates(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ candidates, addCandidate, updateCandidate }),
    [candidates, addCandidate, updateCandidate],
  );

  return <CandidatesContext.Provider value={value}>{children}</CandidatesContext.Provider>;
}

export function useCandidates() {
  const ctx = useContext(CandidatesContext);
  if (!ctx) throw new Error('useCandidates must be used within a CandidatesProvider');
  return ctx;
}
