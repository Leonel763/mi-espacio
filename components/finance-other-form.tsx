'use client';
import {useState,type FormEvent} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {FinanceRecord} from '@/lib/finance-types';
import {errorText} from '@/lib/finance-types';
type Props={sb:SupabaseClient;spaceId:string;record?:FinanceRecord|null;action?:'editar'|'eliminar';onClose:()=>void;onSaved:()=>void;userId:string};
export default function FinanceOtherForm({sb,spaceId,record,action='editar',onClose,onSaved,userId}:Props){
 const [dateFrom,setDateFrom]=useState(new Date().toISOString().slice(0,7)+'-01');
 const [dateTo,setDateTo]=useState(new Date().toISOString().slice(0,7)+'-15');
 const [reason,setReason]=useState(record?'':'Sin ingresos durante este periodo');
 const [amount,setAmount]=useState(String(record?.amount||'')),[occurredOn,setOccurredOn]=useState(record?.occurred_on||''),[note,setNote]=useState(record?.note||'');
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError('');
  try{
   if(record){
    if(reason.trim().length<3)throw new Error('Explica el motivo de la solicitud.');
    const proposal=action==='eliminar'?{}:{amount:Number(amount),occurred_on:occurredOn,note};
    const {error:failure}=await sb.rpc('finance_request_change',{p_record:record.id,p_action:action,p_proposed:proposal,p_reason:reason.trim()});
    if(failure)throw failure;
   }else{
    if(dateTo<dateFrom)throw new Error('La fecha final debe ser posterior a la inicial.');
    const {error:failure}=await sb.from('finance_skipped_periods').insert({space_id:spaceId,user_id:userId,period_start:dateFrom,period_end:dateTo,reason:reason.trim()});
    if(failure)throw failure;
   }
   onSaved();onClose();
  }catch(err){setError(errorText(err))}finally{setBusy(false)}
 }
 return <div className="finance-overlay"><section role="dialog" aria-modal="true" aria-label={record?'Solicitud de cambio':'Periodo sin aporte'} className="finance-dialog">
 <div className="finance-dialog-head"><h3>{record?(action==='editar'?'Solicitar modificación':'Solicitar eliminación'):'Registrar periodo sin aporte'}</h3><button type="button" onClick={onClose} aria-label="Cerrar">×</button></div>
 <form className="finance-form" onSubmit={submit}>
 {record?<><p className="finance-hint">La modificación o eliminación debe ser autorizada por los otros integrantes y quedará registrada en el historial.</p>
 {action==='editar'&&<div className="finance-form-grid"><label>Monto en soles<input type="number" min=".01" step=".01" required value={amount} onChange={e=>setAmount(e.target.value)}/></label><label>Fecha<input type="date" required value={occurredOn} onChange={e=>setOccurredOn(e.target.value)}/></label><label className="finance-full">Comentario<input maxLength={1200} value={note} onChange={e=>setNote(e.target.value)}/></label></div>}
 <label>Motivo del cambio<textarea required minLength={3} maxLength={500} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explica por qué necesitas este cambio."/></label>
 {action==='editar'&&record.allocations?.length>0&&<p className="finance-hint">Los importes distribuidos entre varias quincenas no pueden cambiarse hasta habilitar la redistribución de fechas.</p>}</>:
 <><p className="finance-hint">Si no hubo ingresos, registra las fechas sin inventar un aporte. Esto no modifica tus saldos.</p><div className="finance-form-grid"><label>Desde<input type="date" required value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/></label><label>Hasta<input type="date" required min={dateFrom} value={dateTo} onChange={e=>setDateTo(e.target.value)}/></label></div><label>Motivo<input maxLength={300} required value={reason} onChange={e=>setReason(e.target.value)}/></label></>}
 {error&&<p className="finance-error" role="alert">{error}</p>}
 <div className="finance-form-actions"><button type="button" className="outline" onClick={onClose}>Cancelar</button><button className="primary" disabled={busy}>{busy?'Guardando…':record?'Enviar solicitud':'Guardar periodo'}</button></div></form></section></div>
}
