'use client';
import {useMemo,useState,type FormEvent} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {allocationDates,allocations,errorText,money,dateLabel} from '@/lib/finance-types';
type Props={sb:SupabaseClient;spaceId:string;userId:string;onClose:()=>void;onSaved:()=>void};
export default function FinanceForm({sb,spaceId,userId,onClose,onSaved}:Props){
 const current=new Date().toISOString().slice(0,10);
 const [kind,setKind]=useState<'aporte'|'retiro'>('aporte'),[fund,setFund]=useState<'fijo'|'secundario'>('fijo'),[amount,setAmount]=useState(''),[date,setDate]=useState(current);
 const [from,setFrom]=useState(current.slice(0,7)+'-01'),[to,setTo]=useState(current.slice(0,7)+'-16'),[frequency,setFrequency]=useState<'quincena'|'mes'>('quincena');
 const [note,setNote]=useState(''),[file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const dates=useMemo(()=>allocationDates(from,to,frequency),[from,to,frequency]);
 const split=useMemo(()=>allocations(Number(amount),dates),[amount,dates]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');
  let evidence:string|null=null;
  try{
   const num=Number(amount);
   if(!Number.isFinite(num)||num<=0)throw new Error('El monto debe ser mayor que cero.');
   if(kind==='aporte'&&!dates.length)throw new Error('El rango debe incluir al menos un inicio de periodo (día 1 o 16).');
   if(file){
    if(file.size>5*1024*1024||!['image/png','image/jpeg','image/webp','application/pdf'].includes(file.type))throw new Error('Admite JPG, PNG, WEBP o PDF de hasta 5 MB.');
    const extension=file.type==='application/pdf'?'pdf':file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
    evidence=spaceId+'/'+userId+'/'+crypto.randomUUID()+'.'+extension;
    const result=await sb.storage.from('mi-espacio-evidencias').upload(evidence,file,{upsert:false,contentType:file.type});
    if(result.error)throw result.error;
   }
   const {error:failure}=await sb.rpc('finance_add_record',{p_space:spaceId,p_kind:kind,p_savings_type:fund,p_amount:num,p_date:date,p_start:kind==='aporte'?from:null,p_end:kind==='aporte'?to:null,p_allocations:kind==='aporte'?split:[],p_evidence:evidence,p_note:note});
   if(failure)throw failure;onSaved();onClose();
  }catch(err){setError(errorText(err));if(evidence)await sb.storage.from('mi-espacio-evidencias').remove([evidence])}
  finally{setBusy(false)}
 }
 return <div className="finance-overlay"><section role="dialog" aria-modal="true" aria-label="Registrar aporte o retiro" className="finance-dialog">
 <div className="finance-dialog-head"><h3>Registrar movimiento</h3><button type="button" onClick={onClose} aria-label="Cerrar">×</button></div>
 <form className="finance-form" onSubmit={submit}>
 <div className="finance-form-grid"><label>Movimiento<select value={kind} onChange={e=>setKind(e.target.value as 'aporte'|'retiro')}><option value="aporte">Aporte</option><option value="retiro">Retiro</option></select></label>
 <label>Fondo<select value={fund} onChange={e=>setFund(e.target.value as 'fijo'|'secundario')}><option value="fijo">Ahorro fijo</option><option value="secundario">Ahorro secundario</option></select></label>
 <label>Monto en soles<input type="number" required min=".01" step=".01" value={amount} onChange={e=>setAmount(e.target.value)}/></label><label>Fecha del depósito<input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label></div>
 {kind==='aporte'&&<><h4>Periodo que cubre el aporte</h4><div className="finance-form-grid">
 <label>Frecuencia<select value={frequency} onChange={e=>setFrequency(e.target.value as 'quincena'|'mes')}><option value="quincena">Quincenal</option><option value="mes">Mensual</option></select></label>
 <label>Desde<input required type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Hasta<input required type="date" value={to} onChange={e=>setTo(e.target.value)}/></label></div>
 <div className="finance-distribution"><strong>Distribución automática · {dates.length} periodo(s)</strong>{split.map(p=><div key={p.date}><span>{dateLabel(p.date)}</span><b>{money(p.amount)}</b></div>)}{!dates.length&&<small>Selecciona un rango que incluya el día 1 o 16.</small>}</div></>}
 <label>Comprobante privado (opcional)<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={e=>setFile(e.target.files?.[0]||null)}/><small>Una captura puede cubrir todas las quincenas seleccionadas. Máximo 5 MB.</small></label>
 <label>Nota<input maxLength={1200} value={note} onChange={e=>setNote(e.target.value)} placeholder="Referencia o comentario"/></label>
 {error&&<p className="finance-error" role="alert">{error}</p>}
 <div className="finance-form-actions"><button className="outline" type="button" onClick={onClose}>Cancelar</button><button className="primary" disabled={busy||kind==='aporte'&&!dates.length}>{busy?'Guardando…':'Guardar movimiento'}</button></div>
 </form></section></div>
}
