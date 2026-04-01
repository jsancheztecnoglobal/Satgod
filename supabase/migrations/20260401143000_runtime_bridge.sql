create type app.report_status as enum ('draft', 'ready_for_review', 'closed');

alter table public.user_profiles
  add column if not exists technician_code text unique;

alter table public.assets
  add column if not exists name text not null default '',
  add column if not exists location text;

alter table public.material_usage
  add column if not exists work_report_id uuid,
  add column if not exists name_snapshot text,
  add column if not exists sku_snapshot text,
  add column if not exists unit_snapshot text;

alter table public.attachments
  add column if not exists work_report_id uuid,
  add column if not exists file_name text,
  add column if not exists inline_base64 text;

create table if not exists public.work_reports (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  technician_user_id uuid references auth.users (id) on delete set null,
  technician_code text,
  status app.report_status not null default 'draft',
  arrival_time text not null default '08:00',
  departure_time text not null default '09:00',
  work_done text not null default '',
  pending_actions text not null default '',
  client_name_signed text not null default '',
  signature_attachment_id uuid,
  signature_signed_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  source app.data_source not null default 'mobile',
  version integer not null default 1
);

create table if not exists public.bootstrap_accounts (
  email citext primary key,
  full_name text not null,
  role_code app.role_code not null,
  technician_code text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function app.handle_bootstrap_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role_id uuid;
  bootstrap_record public.bootstrap_accounts%rowtype;
begin
  select * into bootstrap_record
  from public.bootstrap_accounts
  where email = new.email
    and active = true
  limit 1;

  if bootstrap_record.email is null then
    return new;
  end if;

  select id into target_role_id
  from public.roles
  where code = bootstrap_record.role_code
  limit 1;

  if target_role_id is null then
    return new;
  end if;

  insert into public.user_profiles (
    user_id,
    role_id,
    full_name,
    technician_code,
    active,
    default_view,
    source
  )
  values (
    new.id,
    target_role_id,
    bootstrap_record.full_name,
    bootstrap_record.technician_code,
    true,
    case when bootstrap_record.role_code = 'technician' then 'tecnico' else 'dashboard' end,
    'system'
  )
  on conflict (user_id) do update
    set role_id = excluded.role_id,
        full_name = excluded.full_name,
        technician_code = excluded.technician_code,
        active = true,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists trg_bootstrap_auth_user on auth.users;
create trigger trg_bootstrap_auth_user
after insert on auth.users
for each row execute function app.handle_bootstrap_auth_user();

create index if not exists idx_work_reports_work_order on public.work_reports (work_order_id);
create index if not exists idx_work_reports_technician on public.work_reports (technician_user_id);
create index if not exists idx_material_usage_report on public.material_usage (work_report_id);
create index if not exists idx_attachments_report on public.attachments (work_report_id);
create index if not exists idx_user_profiles_technician_code on public.user_profiles (technician_code) where deleted_at is null;

create trigger trg_work_reports_audit before insert or update on public.work_reports
for each row execute function app.set_audit_columns();

create trigger trg_work_reports_audit_log after insert or update or delete on public.work_reports
for each row execute function app.write_audit_log();

alter table public.work_reports enable row level security;

drop policy if exists "profiles_self_or_admin_read" on public.user_profiles;
create policy "profiles_internal_read"
on public.user_profiles for select
using (
  user_id = auth.uid()
  or app.has_role(array['admin','office_planner','engineer','management_readonly'])
);

create policy "work_reports_read"
on public.work_reports for select
using (app.can_access_work_order(work_order_id));

create policy "work_reports_manage"
on public.work_reports for all
using (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and app.can_access_work_order(work_order_id))
)
with check (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and app.can_access_work_order(work_order_id))
);
