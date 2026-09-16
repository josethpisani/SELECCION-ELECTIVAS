export type Grade='11'|'12'; export type Track='Ciencias'|'Humanidades';
export type RosterStudent={studentId:string;lastName:string;firstName:string;middleName:string;email?:string;grade:Grade};
export type Student={id:string;firstName:string;lastName:string;studentId:string;email:string;phone?:string;grade:Grade;track:Track;electives:string[];advanced:string[];observation:string;status:'Pendiente'|'Confirmado'|'Procesado';createdAt:string};
export type Subject={name:string;description?:string;grade:Grade;type:'Electiva'|'Curso avanzado'|'Materia regular';capacity:number;track:'Ambos'|'Ciencias'|'Humanidades';active:boolean};
export const electives:Subject[]=[
  ['Excel',25,'11'],['Arte I',20,'11'],['Business',25,'11'],
  ['Biology',25,'12'],['Estadística',25,'12'],['Excel',25,'12'],['Arte I',20,'12'],['Psicología',20,'12'],['Química III',15,'12'],['Relaciones Internacionales',20,'12']
].map(([name,capacity,grade])=>({name:name as string,capacity:capacity as number,grade:grade as Grade,type:'Electiva',track:'Ambos',active:true}));
export const advanced:Subject[]=['Cálculo Avanzado - Electiva','Comparative Literature II Honors','Español Avanzado - Electiva','Física Avanzada II','Química III Avanzado - Electiva','Cálculo Avanzado'].map(name=>({name,capacity:25,grade:'12',type:'Curso avanzado',track:'Ambos',active:true}));
