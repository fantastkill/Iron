-- Execute em um projeto Supabase NOVO. Não importa a demonstração local.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.plans (
  name text primary key check (name in ('Smart','Fit','Black')),
  price numeric(8,2) not null check (price >= 0 and price <= 99999)
);
insert into public.plans values ('Smart',79.90),('Fit',99.90),('Black',159.90);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  email text not null unique,
  role text not null default 'aluno' check (role in ('aluno','professor','admin')),
  plan text not null default 'Fit' references public.plans(name),
  teacher_id uuid references public.profiles(id) on delete set null,
  active boolean not null default true,
  password_ready boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.profiles(teacher_id);
create table public.invitations (
  email text primary key check (email = lower(trim(email))),
  name text not null check (length(trim(name)) between 1 and 80),
  role text not null check (role in ('professor','aluno')),
  plan text not null references public.plans(name),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.admin_student_access (
  admin_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  primary key(admin_id,student_id)
);

-- Helpers em schema não exposto evitam recursão das políticas de profiles.
create function private.current_role() returns text language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id=(select auth.uid()) and active and password_ready;
$$;
create function private.can_read_student(p_student uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles s where s.id=p_student and s.role='aluno' and (
    (s.id=(select auth.uid()) and s.active and s.password_ready) or
    (private.current_role()='professor' and s.teacher_id=(select auth.uid())) or
    (private.current_role()='admin' and exists(select 1 from public.admin_student_access a where a.student_id=s.id and a.admin_id=(select auth.uid())))
  ));
$$;
create function private.can_read_profile(p_id uuid,p_role text,p_teacher uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select p_id=(select auth.uid()) or (private.current_role() is not null and (
    private.current_role()='admin' or
    (private.current_role()='professor' and p_role='aluno' and p_teacher=(select auth.uid())) or
    (private.current_role()='aluno' and p_role='professor' and exists(select 1 from public.profiles s where s.id=(select auth.uid()) and s.teacher_id=p_id))
  ));
$$;
grant usage on schema private to authenticated;
grant execute on function private.current_role(),private.can_read_student(uuid),private.can_read_profile(uuid,text,uuid) to authenticated;
revoke execute on function private.current_role(),private.can_read_student(uuid),private.can_read_profile(uuid,text,uuid) from public,anon;

create function private.valid_exercises(items jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare item jsonb; ids text[] := '{}';
begin
  if jsonb_typeof(items)<>'array' or jsonb_array_length(items) not between 1 and 40 then return false; end if;
  for item in select * from jsonb_array_elements(items) loop
    if jsonb_typeof(item)<>'object' or not (item ?& array['id','name','sets','reps','rest']) then return false; end if;
    if jsonb_typeof(item->'id') is distinct from 'string' or jsonb_typeof(item->'name') is distinct from 'string' or jsonb_typeof(item->'sets') is distinct from 'number' or jsonb_typeof(item->'reps') is distinct from 'number' or jsonb_typeof(item->'rest') is distinct from 'number' then return false; end if;
    if (item->>'id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' or item->>'id'=any(ids) then return false; end if;
    if length(trim(item->>'name')) not between 1 and 100 then return false; end if;
    if (item->>'sets')::integer not between 1 and 20 or (item->>'reps')::integer not between 1 and 100 or (item->>'rest')::integer not between 0 and 600 then return false; end if;
    if (item->>'sets')::numeric <> (item->>'sets')::integer or (item->>'reps')::numeric <> (item->>'reps')::integer or (item->>'rest')::numeric <> (item->>'rest')::integer then return false; end if;
    ids:=array_append(ids,item->>'id');
  end loop;
  return true;
exception when others then return false;
end;
$$;
grant execute on function private.valid_exercises(jsonb) to authenticated;
revoke execute on function private.valid_exercises(jsonb) from public,anon;
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 100),
  days text[] not null check (cardinality(days) between 1 and 7 and days <@ array['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']::text[] and array_position(days,null) is null),
  exercises jsonb not null check (private.valid_exercises(exercises)),
  unique(id,student_id)
);
create index on public.workouts(student_id);
create table public.workout_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  workout_id uuid not null,
  date date not null,
  completed uuid[] not null default '{}',
  primary key(student_id,workout_id,date),
  foreign key(workout_id,student_id) references public.workouts(id,student_id) on delete cascade
);
create table public.workout_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  workout_id uuid not null,
  date date not null,
  title text not null,
  unique(student_id,workout_id,date),
  foreign key(workout_id,student_id) references public.workouts(id,student_id) on delete cascade
);
create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  date date not null check(date <= (now() at time zone 'America/Sao_Paulo')::date),
  weight numeric(5,1) not null check(weight between 20 and 350),
  waist numeric(5,1) not null check(waist between 30 and 250),
  chest numeric(5,1) not null check(chest between 30 and 250),
  unique(student_id,date)
);

-- Nunca confia em role ou teacher_id de raw_user_meta_data enviados pelo navegador.
create function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
declare invitation public.invitations; selected_plan text;
begin
  select * into invitation from public.invitations where email=lower(new.email);
  selected_plan:=coalesce(invitation.plan,new.raw_user_meta_data->>'plan','Fit');
  if not exists(select 1 from public.plans where name=selected_plan) then selected_plan:='Fit'; end if;
  insert into public.profiles(id,name,email,role,plan,password_ready) values (
    new.id,coalesce(invitation.name,nullif(left(trim(new.raw_user_meta_data->>'name'),80),''),'Novo aluno'),
    lower(new.email),coalesce(invitation.role,'aluno'),selected_plan,coalesce(new.encrypted_password,'')<>''
  );
  delete from public.invitations where email=lower(new.email);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();
-- Apenas o Auth pode confirmar que o convidado definiu a senha; recarregar a
-- página ou modificar metadata não desbloqueia as permissões de banco.
create function private.sync_password_ready() returns trigger language plpgsql security definer set search_path='' as $$
begin
  update public.profiles set password_ready=coalesce(new.encrypted_password,'')<>'' where id=new.id;
  return new;
end;
$$;
create trigger on_auth_password_set after update of encrypted_password on auth.users for each row execute function private.sync_password_ready();

-- Mutação administrativa restrita: não recebe role nem troca e-mail do Auth.
create function public.admin_update_profile(p_id uuid,p_name text,p_plan text,p_teacher uuid,p_active boolean) returns void language plpgsql security definer set search_path='' as $$
declare target_role text;
begin
  if private.current_role() is distinct from 'admin' then raise exception 'Acesso administrativo necessário' using errcode='42501'; end if;
  select role into target_role from public.profiles where id=p_id for update;
  if target_role is null or target_role='admin' then raise exception 'Perfil não gerenciável'; end if;
  if p_teacher is not null and not exists(select 1 from public.profiles where id=p_teacher and role='professor' and active) then raise exception 'Professor inválido'; end if;
  update public.profiles set name=p_name,active=p_active,
    plan=case when target_role='aluno' then p_plan else plan end,
    teacher_id=case when target_role='aluno' then p_teacher else null end where id=p_id;
end;
$$;
create function public.admin_update_plan(p_name text,p_price numeric) returns void language plpgsql security definer set search_path='' as $$
begin
  if private.current_role() is distinct from 'admin' then raise exception 'Acesso administrativo necessário' using errcode='42501'; end if;
  update public.plans set price=p_price where name=p_name;
  if not found then raise exception 'Plano inválido'; end if;
end;
$$;
-- O próprio aluno pode conceder/revogar consulta de treinos a um administrador.
create function public.set_admin_access(p_admin uuid,p_allowed boolean) returns void language plpgsql security definer set search_path='' as $$
begin
  if private.current_role() is distinct from 'aluno' then raise exception 'Somente o aluno pode autorizar' using errcode='42501'; end if;
  if not exists(select 1 from public.profiles where id=p_admin and role='admin' and active) then raise exception 'Administrador inválido'; end if;
  if p_allowed then insert into public.admin_student_access values(p_admin,auth.uid()) on conflict do nothing;
  else delete from public.admin_student_access where admin_id=p_admin and student_id=auth.uid(); end if;
end;
$$;
-- Diretório mínimo para consentimento: não divulga e-mail dos administradores.
create function public.admin_directory() returns table(id uuid,name text,allowed boolean) language sql stable security definer set search_path='' as $$
  select p.id,p.name,exists(select 1 from public.admin_student_access a where a.admin_id=p.id and a.student_id=(select auth.uid()))
  from public.profiles p where p.role='admin' and p.active and private.current_role()='aluno';
$$;
create function public.toggle_exercise(p_workout uuid,p_exercise uuid,p_date date) returns void language plpgsql security definer set search_path='' as $$
declare w public.workouts; done uuid[]; total integer;
begin
  if private.current_role() is distinct from 'aluno' or p_date is distinct from (now() at time zone 'America/Sao_Paulo')::date then raise exception 'Acesso ou data inválida' using errcode='42501'; end if;
  select * into w from public.workouts where id=p_workout and student_id=(select auth.uid()) for update;
  if not found or not exists(select 1 from jsonb_array_elements(w.exercises) e where (e->>'id')::uuid=p_exercise) then raise exception 'Exercício não autorizado' using errcode='42501'; end if;
  select completed into done from public.workout_progress where student_id=auth.uid() and workout_id=w.id and date=p_date;
  done:=coalesce(done,'{}');
  if p_exercise=any(done) then done:=array_remove(done,p_exercise); else done:=array_append(done,p_exercise); end if;
  insert into public.workout_progress values(auth.uid(),w.id,p_date,done) on conflict(student_id,workout_id,date) do update set completed=excluded.completed;
  select count(*) into total from jsonb_array_elements(w.exercises) e where (e->>'id')::uuid=any(done);
  if total=jsonb_array_length(w.exercises) then
    insert into public.workout_history(student_id,workout_id,date,title) values(auth.uid(),w.id,p_date,w.title) on conflict(student_id,workout_id,date) do update set title=excluded.title;
  else delete from public.workout_history where student_id=auth.uid() and workout_id=w.id and date=p_date; end if;
end;
$$;
-- Alterar os exercícios invalida apenas a conclusão do dia corrente dessa ficha.
create function private.reset_changed_workout() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.student_id is distinct from old.student_id then raise exception 'Crie outra ficha para atribuir a um aluno diferente'; end if;
  if new.exercises is distinct from old.exercises or new.student_id is distinct from old.student_id then
    delete from public.workout_progress where workout_id=old.id and date=(now() at time zone 'America/Sao_Paulo')::date;
    delete from public.workout_history where workout_id=old.id and date=(now() at time zone 'America/Sao_Paulo')::date;
  end if;
  return new;
end;
$$;
create trigger reset_changed_workout before update on public.workouts for each row execute function private.reset_changed_workout();

alter table public.plans enable row level security;
alter table public.profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.admin_student_access enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_progress enable row level security;
alter table public.workout_history enable row level security;
alter table public.measurements enable row level security;

-- Nega escrita direta em perfis/papéis/convites/progresso/histórico.
revoke all on public.plans,public.profiles,public.invitations,public.admin_student_access,public.workouts,public.workout_progress,public.workout_history,public.measurements from anon,authenticated;
grant select on public.plans to anon,authenticated;
grant select on public.profiles,public.invitations,public.admin_student_access,public.workout_progress,public.workout_history to authenticated;
grant select,insert,update,delete on public.workouts to authenticated;
grant select,insert,update on public.measurements to authenticated;
grant all on public.plans,public.profiles,public.invitations,public.admin_student_access,public.workouts,public.workout_progress,public.workout_history,public.measurements to service_role;

create policy plans_public on public.plans for select to anon,authenticated using(true);
create policy profiles_scoped on public.profiles for select to authenticated using(private.can_read_profile(id,role,teacher_id));
create policy invitations_admin on public.invitations for select to authenticated using(private.current_role()='admin');
create policy admin_grants_self on public.admin_student_access for select to authenticated using(student_id=auth.uid() or admin_id=auth.uid());
create policy workouts_scoped on public.workouts for select to authenticated using(private.can_read_student(student_id));
create policy workouts_insert_teacher on public.workouts for insert to authenticated with check(private.current_role()='professor' and exists(select 1 from public.profiles s where s.id=student_id and s.role='aluno' and s.teacher_id=auth.uid() and s.active));
create policy workouts_update_teacher on public.workouts for update to authenticated using(private.current_role()='professor' and exists(select 1 from public.profiles s where s.id=student_id and s.teacher_id=auth.uid())) with check(private.current_role()='professor' and exists(select 1 from public.profiles s where s.id=student_id and s.role='aluno' and s.teacher_id=auth.uid() and s.active));
create policy workouts_delete_teacher on public.workouts for delete to authenticated using(private.current_role()='professor' and exists(select 1 from public.profiles s where s.id=student_id and s.teacher_id=auth.uid()));
create policy progress_scoped on public.workout_progress for select to authenticated using(private.can_read_student(student_id));
create policy history_scoped on public.workout_history for select to authenticated using(private.can_read_student(student_id));
-- Medidas corporais são privadas do aluno, inclusive perante professor/admin.
create policy measurements_self_read on public.measurements for select to authenticated using(student_id=auth.uid() and private.current_role()='aluno');
create policy measurements_self_insert on public.measurements for insert to authenticated with check(student_id=auth.uid() and private.current_role()='aluno');
create policy measurements_self_update on public.measurements for update to authenticated using(student_id=auth.uid() and private.current_role()='aluno') with check(student_id=auth.uid() and private.current_role()='aluno');

revoke all on function public.admin_update_profile(uuid,text,text,uuid,boolean),public.admin_update_plan(text,numeric),public.set_admin_access(uuid,boolean),public.admin_directory(),public.toggle_exercise(uuid,uuid,date) from public,anon;
grant execute on function public.admin_update_profile(uuid,text,text,uuid,boolean),public.admin_update_plan(text,numeric),public.set_admin_access(uuid,boolean),public.admin_directory(),public.toggle_exercise(uuid,uuid,date) to authenticated;
revoke all on function private.handle_new_user(),private.reset_changed_workout(),private.sync_password_ready() from public,anon,authenticated;
commit;
