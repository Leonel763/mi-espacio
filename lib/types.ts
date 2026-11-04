export type Space = { id:string; name:string; color:string; owner_id:string; created_at:string };
export type EntryKind = 'task'|'event'|'goal'|'transaction'|'note';
export type Entry = { id:string;space_id:string;user_id:string;kind:EntryKind;title:string;description:string|null;amount:number|null;due_at:string|null;completed:boolean;visibility:'shared'|'private';created_at:string };
export type Tab = 'dashboard'|'agenda'|'tasks'|'goals'|'finance'|'notes';
