CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  middle_name TEXT NOT NULL DEFAULT '', student_id TEXT NOT NULL UNIQUE, email TEXT NOT NULL, phone TEXT,
  grade TEXT NOT NULL CHECK (grade IN ('11','12')), track TEXT NOT NULL,
  electives_json TEXT NOT NULL DEFAULT '[]', advanced_json TEXT NOT NULL DEFAULT '[]',
  observation TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Pendiente',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT,
  grade TEXT NOT NULL, track TEXT NOT NULL DEFAULT 'Ambos', type TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 25, active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS selections (
  id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL REFERENCES students(id),
  subject_id INTEGER NOT NULL REFERENCES subjects(id), selection_type TEXT NOT NULL,
  created_at TEXT NOT NULL, UNIQUE(student_id, subject_id)
);
CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS roster_students (
  student_id TEXT PRIMARY KEY, first_name TEXT NOT NULL, middle_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', grade TEXT NOT NULL CHECK (grade IN ('11','12')),
  active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_selections_subject ON selections(subject_id);
CREATE INDEX IF NOT EXISTS idx_roster_grade ON roster_students(grade);
