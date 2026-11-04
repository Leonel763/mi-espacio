export type FinanceRecord={id:string;space_id:string;created_by:string;kind:'aporte'|'retiro';savings_type:'fijo'|'secundario';amount:number;occurred_on:string;period_start:string|null;period_end:string|null;allocations:{date:string;amount:number}[];evidence_path:string|null;note:string;archived_at:string|null;created_at:string};
export type FinanceSkip={id:string;user_id:string;period_start:string;period_end:string;reason:string};
export type FinanceRequest={id:string;record_id:string;requested_by:string;action:'editar'|'eliminar';proposed:Record<string,unknown>;reason:string;state:'pendiente'|'aprobada'|'rechazada';created_at:string};
export type FinanceVote={request_id:string;voter_id:string;approved:boolean};
export type FinanceAudit={id:number;actor_id:string;event:string;details:Record<string,unknown>;created_at:string};
export type FinanceMember={user_id:string;role:string};
export const money=(n:number)=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n);
export const dateLabel=(s:string)=>s?new Date(s+'T12:00:00').toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric'}):'—';
export const errorText=(e:unknown)=>e&&typeof e==='object'&&'message' in e?String((e as {message:unknown}).message):String(e);
export function allocationDates(start:string,end:string,kind:'quincena'|'mes'){
 if(!start||!end||start>end)return [];
 let [year,month]=start.split('-').map(Number);
 const stop=Number(end.slice(0,4))*12+Number(end.slice(5,7));
 const result:string[]=[];
 while(year*12+month<=stop&&result.length<74){
  const base=year+'-'+String(month).padStart(2,'0')+'-';
  for(const d of kind==='mes'?[1]:[1,16]){const date=base+String(d).padStart(2,'0');if(date>=start&&date<=end)result.push(date)}
  month++;if(month===13){year++;month=1}
 }
 return result;
}
export function allocations(amount:number,dates:string[]){
 const cents=Math.round(amount*100),base=Math.floor(cents/dates.length);
 return dates.map((date,i)=>({date,amount:(base+(i===dates.length-1?cents-base*dates.length:0))/100}));
}
