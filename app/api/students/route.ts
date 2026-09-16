import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
  const file = path.join(process.cwd(), 'public', 'data', 'Listas 11 y 12 2027.xlsx');
  const workbook = XLSX.read(fs.readFileSync(file));
  const configs = [
    { source: '12º 2027', emails: '12 emails', grade: '12' as const },
    { source: '11º 2027', emails: '11 emails', grade: '11' as const },
  ];
  const normalize = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  const students = configs.flatMap(({ source, emails, grade }) => {
    const emailRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[emails] ?? { '!ref': 'A1' });
    const emailMap = new Map(emailRows
      .filter((row) => row['Student Name'] && row['Student Name'] !== 'Select/Deselect All')
      .map((row) => [normalize(row['Student Name']), String(row['Student Contact Addresses'] ?? '').trim()]));
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[source] ?? { '!ref': 'A1' });
    return rows.map((row) => {
      const lastName = String(row['Last Name'] ?? '').trim();
      const firstName = String(row['First Name'] ?? '').trim();
      const middleName = String(row['Middle Name'] ?? '').trim();
      const fullKey = normalize(`${lastName}, ${firstName}${middleName ? ` ${middleName}` : ''}`);
      return { studentId: String(row['Student Number'] ?? '').trim(), lastName, firstName, middleName, email: emailMap.get(fullKey) ?? '', grade };
    });
  }).filter((s) => s.studentId && s.firstName);
  return NextResponse.json(students);
}
