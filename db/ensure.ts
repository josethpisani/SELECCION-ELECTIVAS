import { db } from './client';
import path from 'node:path';
import fs from 'node:fs';
import * as XLSX from 'xlsx';

let ready: Promise<void> | null = null;

export function ensureDatabase() {
  if (!ready) {
    ready = (async () => {
      const statements = [
        `CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, middle_name TEXT NOT NULL DEFAULT '', student_id TEXT NOT NULL UNIQUE, email TEXT NOT NULL, phone TEXT, grade TEXT NOT NULL, track TEXT NOT NULL, electives_json TEXT NOT NULL DEFAULT '[]', advanced_json TEXT NOT NULL DEFAULT '[]', observation TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Pendiente', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        `CREATE TABLE IF NOT EXISTS roster_students (student_id TEXT PRIMARY KEY, first_name TEXT NOT NULL, middle_name TEXT NOT NULL DEFAULT '', last_name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', grade TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        `CREATE TABLE IF NOT EXISTS subjects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, grade TEXT NOT NULL, track TEXT NOT NULL DEFAULT 'Ambos', type TEXT NOT NULL, capacity INTEGER NOT NULL DEFAULT 25, active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        `CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade)`,
        `CREATE INDEX IF NOT EXISTS idx_roster_grade ON roster_students(grade)`,
        `CREATE INDEX IF NOT EXISTS idx_subjects_grade ON subjects(grade)`,
      ];
      for (const sql of statements) await db.execute(sql);
      const count = await db.execute('SELECT COUNT(*) AS count FROM roster_students');
      if (Number(count.rows[0]?.count ?? 0) === 0) {
        const file = path.join(process.cwd(), 'public', 'data', 'Listas 11 y 12 2027.xlsx');
        const workbook = XLSX.read(fs.readFileSync(file));
        const configs = [{ source: '12º 2027', emails: '12 emails', grade: '12' }, { source: '11º 2027', emails: '11 emails', grade: '11' }];
        const normalize = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
        for (const config of configs) {
          const emailRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[config.emails] ?? { '!ref': 'A1' });
          const emails = new Map(emailRows.filter(r => r['Student Name'] && r['Student Name'] !== 'Select/Deselect All').map(r => [normalize(r['Student Name']), String(r['Student Contact Addresses'] ?? '').trim()]));
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[config.source] ?? { '!ref': 'A1' });
          for (const row of rows) {
            const studentId = String(row['Student Number'] ?? '').trim();
            const lastName = String(row['Last Name'] ?? '').trim();
            const firstName = String(row['First Name'] ?? '').trim();
            const middleName = String(row['Middle Name'] ?? '').trim();
            if (!studentId || !firstName) continue;
            const key = normalize(`${lastName}, ${firstName}${middleName ? ` ${middleName}` : ''}`);
            const now = new Date().toISOString();
            await db.execute({ sql: 'INSERT OR IGNORE INTO roster_students (student_id,first_name,middle_name,last_name,email,grade,active,created_at,updated_at) VALUES (?,?,?,?,?,?,1,?,?)', args: [studentId, firstName, middleName, lastName, emails.get(key) ?? '', config.grade, now, now] });
          }
        }
      }
    })();
  }
  return ready;
}
