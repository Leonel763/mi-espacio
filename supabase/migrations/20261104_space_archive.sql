-- Migration already applied to EspacioDev2 (2026-11-04).
-- Archive rather than hard-delete to preserve historical financial records.
alter table public.spaces add column if not exists archived_at timestamptz;

create or replace function public.archive_my_space(p_space uuid)
returns void language plpgsql security invoker set search_path=''
as $body$
declare v_owner uuid; v_members integer;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión';
  end if;
  select owner_id into v_owner from public.spaces
  where id=p_space and archived_at is null;
  if v_owner is distinct from auth.uid() then
    raise exception 'Solo el propietario puede eliminar este espacio';
  end if;
  select count(*) into v_members from public.space_members where space_id=p_space;
  if v_members > 1 then
    raise exception 'No puedes eliminar un espacio compartido sin autorización de sus integrantes';
  end if;
  update public.spaces set archived_at=now()
  where id=p_space and owner_id=auth.uid() and archived_at is null;
  if not found then
    raise exception 'No se pudo eliminar el espacio';
  end if;
end
$body$;

revoke all on function public.archive_my_space(uuid) from public;
revoke all on function public.archive_my_space(uuid) from anon;
grant execute on function public.archive_my_space(uuid) to authenticated;
-- This owner-scoped policy permits the archival UPDATE.
create policy spaces_archive_by_owner on public.spaces for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));
