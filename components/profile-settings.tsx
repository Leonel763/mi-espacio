'use client';
import {useEffect,useState,type FormEvent} from 'react';
import type {SupabaseClient,User} from '@supabase/supabase-js';
import {Camera,CheckCircle2,Mail,ShieldCheck,UserRound,X} from 'lucide-react';
import {errorText} from '@/lib/finance-types';
export type Profile={user_id:string;display_name:string;avatar_path:string|null;bio:string};
export async function loadProfile(sb:SupabaseClient,id:string){
 const {data,error}=await sb.from('user_profiles').select('user_id,display_name,avatar_path,bio').eq('user_id',id).maybeSingle();
 if(error)throw error;
 return data as Profile|null;
}
export async function profilePhoto(sb:SupabaseClient,path:string|null){
 if(!path)return null;
 const {data,error}=await sb.storage.from('mi-espacio-avatars').createSignedUrl(path,1800);
 return error?null:(data?.signedUrl||null);
}
export function ProfileAvatar({name,url,size='md'}:{name:string;url?:string|null;size?:'md'|'lg'}){
 return <span className={'profile-photo '+(size==='lg'?'profile-photo-large':'')}>{url?<img src={url} alt={'Foto de '+name}/>:<span>{(name.trim().charAt(0)||'U').toUpperCase()}</span>}</span>;
}
export default function ProfileSettings({sb,user,current,onClose,onSaved}:{sb:SupabaseClient;user:User;current:Profile|null;onClose:()=>void;onSaved:(p:Profile)=>void}){
 const [name,setName]=useState(current?.display_name||''),[bio,setBio]=useState(current?.bio||''),[avatar,setAvatar]=useState<string|null>(null),[upload,setUpload]=useState<File|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 useEffect(()=>{let active=true;void profilePhoto(sb,current?.avatar_path||null).then(u=>{if(active)setAvatar(u)});return()=>{active=false}},[sb,current?.avatar_path]);
 const preview=upload?URL.createObjectURL(upload):avatar;
 async function save(e:FormEvent){
  e.preventDefault();setError('');setSuccess('');setBusy(true);
  try{
   const clean=name.trim();if(clean.length<2||clean.length>60)throw new Error('El nombre debe tener entre 2 y 60 caracteres.');
   let path=current?.avatar_path||null;
   if(upload){
    if(upload.size>2*1024*1024||!['image/png','image/jpeg','image/webp'].includes(upload.type))throw new Error('La imagen debe ser JPG, PNG o WEBP, de máximo 2 MB.');
    const ext=upload.type==='image/png'?'png':upload.type==='image/webp'?'webp':'jpg';
    path=user.id+'/'+crypto.randomUUID()+'.'+ext;
    const {error:upError}=await sb.storage.from('mi-espacio-avatars').upload(path,upload,{upsert:false,contentType:upload.type});
    if(upError)throw upError;
   }
   const record:Profile={user_id:user.id,display_name:clean,bio:bio.trim(),avatar_path:path};
   const {error:dbError}=await sb.from('user_profiles').upsert(record,{onConflict:'user_id'});
   if(dbError)throw dbError;
   onSaved(record);setSuccess('Tu perfil fue actualizado correctamente.');setUpload(null);
  }catch(err){setError(errorText(err))}finally{setBusy(false)}
 }
 return <div className="profile-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)onClose()}}>
  <section className="profile-dialog" role="dialog" aria-modal="true" aria-label="Editar perfil">
   <div className="profile-head"><div><span>CONFIGURACIÓN PERSONAL</span><h2>Mi perfil</h2><p>Personaliza cómo te ven quienes comparten un espacio contigo.</p></div><button className="profile-close" aria-label="Cerrar" onClick={onClose}><X size={19}/></button></div>
   <form onSubmit={save} className="profile-form">
    <div className="profile-banner"><label className="profile-picture-edit"><ProfileAvatar name={name||user.email||'Usuario'} url={preview} size="lg"/><span><Camera size={15}/> Cambiar foto</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0]||null;setUpload(f)}}/></label><div><strong>{name||'Tu nombre visible'}</strong><small>Tu identidad en Mi Espacio</small></div></div>
    <label><span><UserRound size={16}/> Nombre para mostrar</span><input value={name} required minLength={2} maxLength={60} placeholder="Ej. Diego" onChange={e=>setName(e.target.value)}/><small>Se mostrará en tus aportes, aprobaciones e historial.</small></label>
    <label><span><Mail size={16}/> Correo electrónico</span><input value={user.email||''} disabled/><small>Tu correo no se comparte en las tarjetas financieras.</small></label>
    <label><span>Sobre mí <em>(opcional)</em></span><textarea rows={3} maxLength={240} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Algo breve sobre ti..."/></label>
    <div className="profile-privacy"><ShieldCheck size={18}/><span>Tu foto se almacena en un contenedor privado y solo los integrantes de tus espacios pueden visualizarla.</span></div>
    {error&&<p className="profile-error" role="alert">{error}</p>}{success&&<p className="profile-success"><CheckCircle2 size={16}/>{success}</p>}
    <div className="profile-actions"><button type="button" className="outline" onClick={onClose}>Cerrar</button><button type="submit" className="primary" disabled={busy}>{busy?'Guardando…':'Guardar cambios'}</button></div>
   </form>
  </section>
 </div>;
}
