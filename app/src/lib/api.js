async function parseJsonResponse(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function analyzeCandidate({ name, jd, evidence }) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, jd, evidence }),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error((data && data.error) || `วิเคราะห์ไม่สำเร็จ (HTTP ${res.status})`);
  }
  return data;
}

export async function sendChatMessage({ name, jd, evidence, evalResult, history, question }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, jd, evidence, evalResult, history, question }),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error((data && data.error) || `ส่งคำถามไม่สำเร็จ (HTTP ${res.status})`);
  }
  return data.answer;
}
