const KEY = 'cand_eval_data_v1';

export function loadCandidates() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCandidates(candidates) {
  try {
    localStorage.setItem(KEY, JSON.stringify(candidates));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — data just
    // won't persist across reloads; the app still works for this session.
  }
}
