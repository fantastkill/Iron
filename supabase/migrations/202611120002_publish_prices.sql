-- Preços iniciais são referências de desenvolvimento. Exibir uma oferta exige
-- confirmação explícita da administração; nenhum pagamento é implementado.
begin;
alter table public.plans add column price_published boolean not null default false;
drop function public.admin_update_plan(text,numeric);
create function public.admin_update_plan(p_name text,p_price numeric,p_published boolean default false) returns void
language plpgsql security definer set search_path='' as $$
begin
  if private.current_role() is distinct from 'admin' then raise exception 'Acesso administrativo necessário' using errcode='42501'; end if;
  update public.plans set price=p_price,price_published=p_published where name=p_name;
  if not found then raise exception 'Plano inválido'; end if;
end;
$$;
revoke all on function public.admin_update_plan(text,numeric,boolean) from public,anon;
grant execute on function public.admin_update_plan(text,numeric,boolean) to authenticated;
commit;
