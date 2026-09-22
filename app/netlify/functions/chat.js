import Anthropic from '@anthropic-ai/sdk';
import { json, readJsonBody, handleAnthropicError, requireApiKey } from './_util.js';

export const config = { path: '/api/chat' };

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const keyError = requireApiKey();
  if (keyError) return keyError;

  const body = await readJsonBody(req);
  const name = body && typeof body.name === 'string' ? body.name : '';
  const jd = body && typeof body.jd === 'string' ? body.jd : '';
  const evidence = body && typeof body.evidence === 'string' ? body.evidence : '';
  const evalResult = (body && body.evalResult) || {};
  const history = Array.isArray(body && body.history) ? body.history : [];
  const question = body && typeof body.question === 'string' ? body.question.trim() : '';

  if (!question) return json({ error: 'กรุณาระบุคำถาม' }, 400);

  const system = `คุณเป็นผู้ช่วยฝ่ายบุคคลที่ช่วยตอบคำถามเกี่ยวกับแคนดิเดทคนหนึ่ง โดยอ้างอิงจากข้อมูลและผลประเมินที่มีอยู่เท่านั้น ตอบเป็นภาษาไทย กระชับ ตรงประเด็น

ตำแหน่งงาน/เกณฑ์: ${jd && jd.trim() ? jd : '(ไม่ได้ระบุ)'}

ข้อมูลของแคนดิเดท "${name}":
${evidence || '(ไม่มีข้อมูล)'}

ผลประเมินที่คำนวณไว้แล้ว: ${JSON.stringify(evalResult)}`;

  const messages = [];
  for (const m of history) {
    if (!m || typeof m.text !== 'string' || !m.text) continue;
    messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text });
  }
  messages.push({ role: 'user', content: question });

  const client = new Anthropic();
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 4096,
      output_config: { effort: 'low' },
      system,
      messages,
    });
    const textBlock = response.content.find((b) => b.type === 'text');
    return json({ answer: textBlock ? textBlock.text : '' }, 200);
  } catch (e) {
    return handleAnthropicError(e);
  }
};
