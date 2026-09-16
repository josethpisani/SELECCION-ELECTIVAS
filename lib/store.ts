import {Student,RosterStudent} from './types';
const key='electivas_students';
const rosterKey='electivas_roster_overrides';
const rosterDeletedKey='electivas_roster_deleted';
export function readStudents():Student[]{if(typeof window==='undefined')return [];try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return []}}
export function saveStudent(s:Student){const all=readStudents();if(all.some(x=>x.studentId.toLowerCase()===s.studentId.toLowerCase()))throw new Error('Ya existe una selección registrada para este estudiante.');localStorage.setItem(key,JSON.stringify([s,...all]));}
export function updateStudent(id:string, changes:Partial<Student>){localStorage.setItem(key,JSON.stringify(readStudents().map(s=>s.id===id?{...s,...changes}:s)));}
export function deleteStudent(id:string){localStorage.setItem(key,JSON.stringify(readStudents().filter(s=>s.id!==id)));}
export function readRosterOverrides():RosterStudent[]{if(typeof window==='undefined')return [];try{return JSON.parse(localStorage.getItem(rosterKey)||'[]')}catch{return []}}
export function readDeletedRosterIds():string[]{if(typeof window==='undefined')return [];try{return JSON.parse(localStorage.getItem(rosterDeletedKey)||'[]')}catch{return []}}
export function saveRosterStudent(s:RosterStudent){const all=readRosterOverrides().filter(x=>x.studentId!==s.studentId);localStorage.setItem(rosterKey,JSON.stringify([s,...all]));localStorage.setItem(rosterDeletedKey,JSON.stringify(readDeletedRosterIds().filter(id=>id!==s.studentId)));}
export function deleteRosterStudent(id:string){localStorage.setItem(rosterKey,JSON.stringify(readRosterOverrides().filter(s=>s.studentId!==id)));const ids=readDeletedRosterIds();if(!ids.includes(id))ids.push(id);localStorage.setItem(rosterDeletedKey,JSON.stringify(ids));}
