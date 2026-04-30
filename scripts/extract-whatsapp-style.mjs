import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rawDir = path.join(root, 'private-research', 'raw');
const outDir = path.join(root, 'private-research', 'sanitized');
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  { key: 'anshuman', names: ['Anshuman', 'Anshuman Singh', 'Anshuman sir'] },
  { key: 'abhimanyu', names: ['Abhimanyu', 'Abhimanyu Saxena', 'Abhimanyu sir'] },
  { key: 'kshitij', names: ['Kshitij', 'Kshitij Mishra', 'Kshitij sir'] },
];

const piiPatterns = [
  /\+?\d[\d\s().-]{7,}\d/g,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  /https?:\/\/\S+/g,
];

function sanitize(text) {
  let out = text;
  for (const pattern of piiPatterns) out = out.replace(pattern, '[redacted]');
  return out.replace(/\s+/g, ' ').trim();
}

function likelyMessageLine(line) {
  // Common WhatsApp exports:
  // 30/04/26, 7:12 pm - Name: message
  // [30/04/26, 7:12:00 PM] Name: message
  return /(?:^\[?\d{1,2}[/-]\d{1,2}[/-]\d{2,4}.*?\]?\s*-\s*|^\[\d{1,2}[/-]\d{1,2}[/-]\d{2,4}.*?\]\s*)([^:]{1,80}):\s*(.+)$/.exec(line);
}

function parseFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const rows = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const match = likelyMessageLine(line);
    if (match) {
      if (current) rows.push(current);
      current = { sender: match[1].trim(), text: match[2].trim(), file: path.basename(file) };
    } else if (current && line.trim()) {
      current.text += '\n' + line.trim();
    }
  }
  if (current) rows.push(current);
  return rows;
}

const files = fs.existsSync(rawDir)
  ? fs.readdirSync(rawDir).filter((f) => f.toLowerCase().endsWith('.txt')).map((f) => path.join(rawDir, f))
  : [];

if (files.length === 0) {
  console.error(`No .txt WhatsApp exports found in ${rawDir}`);
  process.exit(1);
}

const allRows = files.flatMap(parseFile);
const report = [];

for (const target of targets) {
  const rows = allRows.filter((row) => target.names.some((name) => row.sender.toLowerCase().includes(name.toLowerCase())));
  const safeRows = rows
    .map((row) => ({ ...row, text: sanitize(row.text) }))
    .filter((row) => row.text && !/^<media omitted>$/i.test(row.text))
    .slice(0, 80);

  const sample = safeRows.slice(0, 30).map((row, i) => `${i + 1}. (${row.file}) ${row.text}`).join('\n');
  const content = `# ${target.key} private-chat style extraction\n\nSource: local WhatsApp exports in private-research/raw. This file is gitignored and should be used only for high-level style signals, not public quotes.\n\nMatched messages: ${rows.length}\nSanitized sample kept: ${safeRows.length}\n\n## Sanitized message sample\n\n${sample || '_No matching messages found._'}\n\n## Manual style notes to fill after review\n\n- Tone:\n- Recurring themes:\n- Response structure:\n- Safe prompt implications:\n`;
  fs.writeFileSync(path.join(outDir, `${target.key}-whatsapp-style.md`), content);
  report.push(`${target.key}: matched ${rows.length}, wrote ${target.key}-whatsapp-style.md`);
}

console.log(report.join('\n'));
