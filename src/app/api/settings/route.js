import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const settingsPath = join(process.cwd(), 'src/data/settings.json');

function readSettings() {
  return JSON.parse(readFileSync(settingsPath, 'utf8'));
}

export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings);
}

export async function POST(request) {
  const body = await request.json();
  const current = readSettings();
  const updated = { ...current, ...body };
  writeFileSync(settingsPath, JSON.stringify(updated, null, 2) + '\n');
  return NextResponse.json({ success: true, settings: updated });
}
