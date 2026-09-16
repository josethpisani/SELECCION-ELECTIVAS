'use client';
import { useState } from 'react';
import StudentForm from '../components/StudentForm';
import AdminPanel from '../components/AdminPanel';
export default function Home(){ const [mode,setMode]=useState<'student'|'admin'>('student'); return <main><header className="topbar"><div className="brand"><img className="logo" src="/AIP_LOGO-10.png" alt="Logo institucional"/><div><strong>Selección de electivas</strong><small>Portal Académico</small></div></div><button className="switch" onClick={()=>setMode(mode==='student'?'admin':'student')}>{mode==='student'?'Acceso administrativo':'Vista estudiante'} ↗</button></header>{mode==='student'?<StudentForm/>:<AdminPanel/>}<footer>© {new Date().getFullYear()} · Selección de electivas</footer></main> }
