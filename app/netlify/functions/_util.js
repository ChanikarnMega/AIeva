import Anthropic from '@anthropic-ai/sdk';

export function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function readJsonBody(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** Typed, most-specific-first error handling per the Anthropic SDK's error hierarchy. */
export function handleAnthropicError(e) {
  if (e instanceof Anthropic.AuthenticationError) {
    return json({ error: 'การตั้งค่า ANTHROPIC_API_KEY บนเซิร์ฟเวอร์ไม่ถูกต้อง' }, 500);
  }
  if (e instanceof Anthropic.RateLimitError) {
    return json({ error: 'เรียก AI บ่อยเกินไป กรุณาลองใหม่อีกสักครู่' }, 429);
  }
  if (e instanceof Anthropic.BadRequestError) {
    return json({ error: 'คำขอไม่ถูกต้อง: ' + e.message }, 400);
  }
  if (e instanceof Anthropic.APIError) {
    return json({ error: 'เรียก Claude ไม่สำเร็จ: ' + e.message }, e.status || 502);
  }
  return json({ error: 'เกิดข้อผิดพลาดที่ไม่คาดคิด: ' + (e && e.message ? e.message : String(e)) }, 500);
}

export function requireApiKey() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: 'ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY บนเซิร์ฟเวอร์ (ตั้งค่าใน Netlify environment variables)' }, 500);
  }
  return null;
}
