import Anthropic from '@anthropic-ai/sdk';
// The SDK's zodOutputFormat() builds a JSON schema via the Zod v4 API
// internally (z.toJSONSchema), so the schema passed to it must also be
// built with the "zod/v4" entry point, not the default v3 API surface.
import { z } from 'zod/v4';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { json, readJsonBody, handleAnthropicError, requireApiKey } from './_util.js';

export const config = { path: '/api/analyze' };

const EvalSchema = z.object({
  score: z.number().min(0).max(100).describe('Overall fit score, 0-100'),
  pass: z.boolean().describe('Whether the candidate passes the bar for this role'),
  summary: z.string().describe('2-3 sentence overview in Thai'),
  strengths: z.array(z.string()).describe('Key strengths, in Thai'),
  weaknesses: z.array(z.string()).describe('Areas to improve, in Thai'),
  rubric: z
    .array(z.object({ criterion: z.string(), note: z.string() }))
    .describe('Per-criterion breakdown, in Thai'),
});

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const keyError = requireApiKey();
  if (keyError) return keyError;

  const body = await readJsonBody(req);
  const name = body && typeof body.name === 'string' ? body.name.trim() : '';
  const jd = body && typeof body.jd === 'string' ? body.jd : '';
  const evidence = body && typeof body.evidence === 'string' ? body.evidence : '';

  if (!name) return json({ error: 'กรุณาใส่ชื่อแคนดิเดท' }, 400);

  const client = new Anthropic();
  const prompt = `คุณเป็นผู้ช่วยฝ่ายบุคคลที่ช่วยประเมินแคนดิเดทสำหรับตำแหน่งงาน

ตำแหน่งงาน/เกณฑ์ที่ต้องการ: ${jd.trim() ? jd : '(ไม่ได้ระบุ ให้ประเมินตามเกณฑ์ทั่วไปที่เหมาะสมกับข้อมูลที่มี)'}

ข้อมูลของแคนดิเดท "${name}":
${evidence || '(ไม่มีข้อมูลคำตอบ/เรซูเม่ที่อ่านได้ กรุณาประเมินจากข้อมูลที่มีอย่างจำกัด)'}

โปรดประเมินแคนดิเดทคนนี้อย่างละเอียดและตรงไปตรงมา ให้คะแนนความเหมาะสม (0-100), สรุปภาพรวมสั้นๆ, จุดแข็ง, ข้อควรพัฒนา และรายละเอียดตามเกณฑ์แต่ละข้อ ทั้งหมดเป็นภาษาไทย`;

  try {
    const response = await client.messages.parse({
      model: 'claude-sonnet-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: zodOutputFormat(EvalSchema), effort: 'low' },
    });
    if (!response.parsed_output) {
      return json({ error: 'วิเคราะห์ไม่สำเร็จ: โมเดลไม่ส่งผลลัพธ์ในรูปแบบที่ถูกต้อง' }, 502);
    }
    return json(response.parsed_output, 200);
  } catch (e) {
    return handleAnthropicError(e);
  }
};
