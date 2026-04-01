create extension if not exists pgcrypto;
create extension if not exists citext;

create schema if not exists app;

create type app.role_code as enum (
  'admin',
  'office_planner',
  'engineer',
  'sales',
  'technician',
  'management_readonly'
);

create type app.data_source as enum ('web', 'mobile', 'offline_sync', 'system');
create type app.work_order_type as enum (
  'maintenance',
  'breakdown',
  'installation',
  'assembly',
  'commissioning',
  'inspection',
  'legalization',
  'technical_visit',
  'document_review',
  'technical_quote'
);
create type app.work_order_priority as enum ('low', 'normal', 'high', 'critical');
create type app.work_order_status as enum (
  'draft',
  'pending_assignment',
  'planned',
  'in_progress',
  'paused',
  'pending_material',
  'pending_signature',
  'pending_office_review',
  'closed',
  'billable',
  'invoiced',
  'cancelled',
  'reopened'
);
create type app.billing_status as enum ('not_ready', 'billable', 'invoiced', 'exported');

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code app.role_code not null unique,
  name text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id),
  full_name text not null,
  mobile text,
  department text,
  active boolean not null default true,
  default_view text default 'dashboard',
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  source app.data_source not null default 'system',
  version integer not null default 1
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  trade_name text not null,
  tax_id citext,
  billing_email citext,
  billing_terms text,
  service_notes text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  source app.data_source not null default 'web',
  version integer not null default 1
);

create table public.company_sites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  code text not null,
  name text not null,
  address text not null,
  city text,
  province text,
  postal_code text,
  lat numeric(10, 7),
  lng numeric(10, 7),
  access_notes text,
  hours_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  source app.data_source not null default 'web',
  version integer not null default 1,
  unique (company_id, code)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  site_id uuid references public.company_sites (id) on delete set null,
  name text not null,
  role text,
  phone text,
  email citext,
  is_primary boolean not null default false,
  contact_type text not null default 'operational',
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  source app.data_source not null default 'web',
  version integer not null default 1
);

create table public.asset_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  family text not null,
  default_attributes_schema_jsonb jsonb not null default '{}'::jsonb,
  requires_compliance boolean not null default false,
  default_checklist_jsonb jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.company_sites (id) on delete restrict,
  company_id uuid not null references public.companies (id) on delete restrict,
  asset_type_id uuid not null references public.asset_types (id) on delete restrict,
  parent_asset_id uuid references public.assets (id) on delete set null,
  serial_number text,
  manufacturer text not null,
  model text not null,
  year integer,
  commissioned_on date,
  status text not null default 'operational',
  attributes_jsonb jsonb not null default '{}'::jsonb,
  criticality text not null default 'medium',
  compliance_category text,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  source app.data_source not null default 'web',
  version integer not null default 1
);

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  type app.work_order_type not null,
  priority app.work_order_priority not null default 'normal',
  status app.work_order_status not null default 'draft',
  billing_status app.billing_status not null default 'not_ready',
  company_id uuid not null references public.companies (id) on delete restrict,
  site_id uuid not null references public.company_sites (id) on delete restrict,
  primary_asset_id uuid references public.assets (id) on delete set null,
  requester_contact_id uuid references public.contacts (id) on delete set null,
  engineer_owner_id uuid references auth.users (id) on delete set null,
  title text not null,
  description text not null,
  diagnosis text,
  planned_start timestamptz,
  planned_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  estimated_minutes integer not null default 0,
  quote_required boolean not null default false,
  external_ref text,
  status_changed_at timestamptz not null default timezone('utc', now()),
  closed_by uuid references auth.users (id) on delete set null,
  cancelled_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  source app.data_source not null default 'web',
  version integer not null default 1
);

create table public.work_order_status_history (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  from_status app.work_order_status,
  to_status app.work_order_status not null,
  reason text,
  changed_by uuid references auth.users (id) on delete set null,
  changed_at timestamptz not null default timezone('utc', now()),
  source app.data_source not null default 'web'
);

create table public.work_order_assignments (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role_in_job text not null default 'technician',
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  travel_zone text,
  is_primary boolean not null default false,
  assignment_status text not null default 'planned',
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  source app.data_source not null default 'web',
  version integer not null default 1
);

create table public.work_logs (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  log_type text not null default 'note',
  body text not null,
  visibility text not null default 'internal',
  device_created_at timestamptz,
  geo_lat numeric(10, 7),
  geo_lng numeric(10, 7),
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  source app.data_source not null default 'web',
  version integer not null default 1
);

create table public.labor_entries (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  labor_type text not null default 'onsite',
  started_at timestamptz not null,
  ended_at timestamptz not null,
  minutes integer not null,
  overtime boolean not null default false,
  billable boolean not null default true,
  cost_rate_snapshot numeric(12, 2),
  approved_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  source app.data_source not null default 'mobile',
  version integer not null default 1
);

create table public.material_catalog (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  unit text not null,
  family text,
  default_cost numeric(12, 2),
  default_price numeric(12, 2),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.material_usage (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  material_id uuid not null references public.material_catalog (id) on delete restrict,
  user_id uuid references auth.users (id) on delete set null,
  quantity numeric(12, 3) not null check (quantity > 0),
  unit_cost_snapshot numeric(12, 2),
  source_stock_type text,
  notes text,
  approved_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  source app.data_source not null default 'mobile',
  version integer not null default 1
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  work_order_id uuid references public.work_orders (id) on delete cascade,
  bucket text not null,
  path text not null,
  file_kind text not null default 'document',
  mime_type text,
  size_bytes bigint,
  checksum_sha256 text,
  captured_at timestamptz,
  captured_by uuid references auth.users (id) on delete set null,
  upload_status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  source app.data_source not null default 'mobile',
  version integer not null default 1,
  unique (bucket, path)
);

create table public.signatures (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders (id) on delete cascade,
  signer_name text not null,
  signer_role text,
  signed_at timestamptz not null,
  strokes_json jsonb not null default '[]'::jsonb,
  image_path text,
  hash_sha256 text,
  consent_text_version text,
  device_meta_jsonb jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  source app.data_source not null default 'mobile',
  version integer not null default 1
);

create table public.compliance_records (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets (id) on delete cascade,
  regulation_code text not null,
  record_type text not null,
  authority text,
  certificate_number text,
  issue_date date,
  due_date date,
  status text not null default 'draft',
  responsible_user_id uuid references auth.users (id) on delete set null,
  document_attachment_id uuid references public.attachments (id) on delete set null,
  recurrence_rule text,
  last_completed_on date,
  next_due_on date,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  source app.data_source not null default 'web',
  version integer not null default 1
);

create table public.maintenance_plans (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.assets (id) on delete cascade,
  asset_type_id uuid references public.asset_types (id) on delete cascade,
  cadence_type text not null,
  cadence_value integer not null check (cadence_value > 0),
  estimated_minutes integer not null default 0,
  auto_generate_window_days integer not null default 30,
  checklist_template_jsonb jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  last_generated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  source app.data_source not null default 'web',
  version integer not null default 1,
  constraint maintenance_plans_target_check
    check (asset_id is not null or asset_type_id is not null)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null default 'in_app',
  topic text not null,
  payload_jsonb jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  read_at timestamptz,
  status text not null default 'pending',
  dedupe_key text,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid,
  source app.data_source not null default 'system',
  version integer not null default 1
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  actor_user_id uuid,
  request_id text,
  before_jsonb jsonb,
  after_jsonb jsonb,
  reason text,
  occurred_at timestamptz not null default timezone('utc', now()),
  source_ip inet,
  user_agent text,
  source app.data_source not null default 'system'
);

create index idx_user_profiles_role on public.user_profiles (role_id) where deleted_at is null;
create index idx_companies_trade_name on public.companies (trade_name) where deleted_at is null;
create unique index idx_companies_tax_id on public.companies (tax_id) where tax_id is not null and deleted_at is null;
create index idx_company_sites_company on public.company_sites (company_id) where deleted_at is null;
create index idx_contacts_company_site on public.contacts (company_id, site_id) where deleted_at is null;
create index idx_assets_site on public.assets (site_id) where deleted_at is null;
create index idx_assets_company on public.assets (company_id) where deleted_at is null;
create index idx_assets_serial on public.assets (serial_number) where serial_number is not null and deleted_at is null;
create index idx_work_orders_status_planned on public.work_orders (status, planned_start) where deleted_at is null;
create index idx_work_orders_company on public.work_orders (company_id) where deleted_at is null;
create index idx_work_orders_site on public.work_orders (site_id) where deleted_at is null;
create index idx_work_orders_asset on public.work_orders (primary_asset_id) where deleted_at is null;
create index idx_status_history_work_order on public.work_order_status_history (work_order_id, changed_at desc);
create index idx_assignments_user_start on public.work_order_assignments (user_id, scheduled_start);
create index idx_assignments_work_order on public.work_order_assignments (work_order_id);
create index idx_work_logs_work_order on public.work_logs (work_order_id, created_at desc);
create index idx_labor_entries_work_order on public.labor_entries (work_order_id);
create index idx_labor_entries_user_start on public.labor_entries (user_id, started_at);
create index idx_material_usage_work_order on public.material_usage (work_order_id);
create index idx_attachments_entity on public.attachments (entity_type, entity_id);
create index idx_attachments_work_order on public.attachments (work_order_id);
create index idx_signatures_work_order on public.signatures (work_order_id);
create index idx_compliance_asset_due on public.compliance_records (asset_id, due_date);
create index idx_notifications_user on public.notifications (user_id, read_at);
create index idx_audit_logs_entity on public.audit_logs (entity_type, entity_id, occurred_at desc);

create or replace function app.set_audit_columns()
returns trigger
language plpgsql
security invoker
as $$
begin
  if tg_op = 'INSERT' then
    if new.created_at is null then
      new.created_at := timezone('utc', now());
    end if;
    if new.created_by is null then
      new.created_by := auth.uid();
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    new.updated_at := timezone('utc', now());
    new.updated_by := auth.uid();
    if new.version is not null then
      new.version := coalesce(old.version, 0) + 1;
    end if;
  end if;

  return new;
end;
$$;

create or replace function app.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.code::text
  from public.user_profiles up
  join public.roles r on r.id = up.role_id
  where up.user_id = auth.uid()
    and up.active = true
    and up.deleted_at is null
  limit 1
$$;

create or replace function app.has_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(app.current_role() = any(allowed_roles), false)
$$;

create or replace function app.can_access_work_order(target_work_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    app.has_role(array['admin','office_planner','engineer','sales','management_readonly'])
    or exists (
      select 1
      from public.work_order_assignments woa
      where woa.work_order_id = target_work_order_id
        and woa.user_id = auth.uid()
    )
$$;

create or replace function app.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  entity_identifier uuid;
begin
  entity_identifier := coalesce(new.id, old.id);

  insert into public.audit_logs (
    entity_type,
    entity_id,
    action,
    actor_user_id,
    before_jsonb,
    after_jsonb,
    source
  )
  values (
    tg_table_name,
    entity_identifier,
    lower(tg_op),
    auth.uid(),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
    coalesce(new.source, old.source, 'system')
  );

  return coalesce(new, old);
end;
$$;

create trigger trg_user_profiles_audit before insert or update on public.user_profiles
for each row execute function app.set_audit_columns();
create trigger trg_companies_audit before insert or update on public.companies
for each row execute function app.set_audit_columns();
create trigger trg_company_sites_audit before insert or update on public.company_sites
for each row execute function app.set_audit_columns();
create trigger trg_contacts_audit before insert or update on public.contacts
for each row execute function app.set_audit_columns();
create trigger trg_assets_audit before insert or update on public.assets
for each row execute function app.set_audit_columns();
create trigger trg_work_orders_audit before insert or update on public.work_orders
for each row execute function app.set_audit_columns();
create trigger trg_work_order_assignments_audit before insert or update on public.work_order_assignments
for each row execute function app.set_audit_columns();
create trigger trg_work_logs_audit before insert or update on public.work_logs
for each row execute function app.set_audit_columns();
create trigger trg_labor_entries_audit before insert or update on public.labor_entries
for each row execute function app.set_audit_columns();
create trigger trg_material_usage_audit before insert or update on public.material_usage
for each row execute function app.set_audit_columns();
create trigger trg_attachments_audit before insert or update on public.attachments
for each row execute function app.set_audit_columns();
create trigger trg_signatures_audit before insert or update on public.signatures
for each row execute function app.set_audit_columns();
create trigger trg_compliance_records_audit before insert or update on public.compliance_records
for each row execute function app.set_audit_columns();
create trigger trg_maintenance_plans_audit before insert or update on public.maintenance_plans
for each row execute function app.set_audit_columns();
create trigger trg_notifications_audit before insert or update on public.notifications
for each row execute function app.set_audit_columns();

create trigger trg_companies_audit_log after insert or update or delete on public.companies
for each row execute function app.write_audit_log();
create trigger trg_assets_audit_log after insert or update or delete on public.assets
for each row execute function app.write_audit_log();
create trigger trg_work_orders_audit_log after insert or update or delete on public.work_orders
for each row execute function app.write_audit_log();
create trigger trg_work_logs_audit_log after insert or update or delete on public.work_logs
for each row execute function app.write_audit_log();
create trigger trg_labor_entries_audit_log after insert or update or delete on public.labor_entries
for each row execute function app.write_audit_log();
create trigger trg_material_usage_audit_log after insert or update or delete on public.material_usage
for each row execute function app.write_audit_log();
create trigger trg_attachments_audit_log after insert or update or delete on public.attachments
for each row execute function app.write_audit_log();
create trigger trg_signatures_audit_log after insert or update or delete on public.signatures
for each row execute function app.write_audit_log();
create trigger trg_compliance_records_audit_log after insert or update or delete on public.compliance_records
for each row execute function app.write_audit_log();

alter table public.user_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_sites enable row level security;
alter table public.contacts enable row level security;
alter table public.asset_types enable row level security;
alter table public.assets enable row level security;
alter table public.work_orders enable row level security;
alter table public.work_order_status_history enable row level security;
alter table public.work_order_assignments enable row level security;
alter table public.work_logs enable row level security;
alter table public.labor_entries enable row level security;
alter table public.material_catalog enable row level security;
alter table public.material_usage enable row level security;
alter table public.attachments enable row level security;
alter table public.signatures enable row level security;
alter table public.compliance_records enable row level security;
alter table public.maintenance_plans enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_self_or_admin_read"
on public.user_profiles for select
using (user_id = auth.uid() or app.has_role(array['admin']));

create policy "profiles_admin_manage"
on public.user_profiles for all
using (app.has_role(array['admin']))
with check (app.has_role(array['admin']));

create policy "companies_internal_read"
on public.companies for select
using (
  app.has_role(array['admin','office_planner','engineer','sales','management_readonly'])
  or exists (
    select 1 from public.work_orders wo
    where wo.company_id = companies.id
      and app.can_access_work_order(wo.id)
  )
);

create policy "companies_internal_manage"
on public.companies for all
using (app.has_role(array['admin','office_planner','engineer','sales']))
with check (app.has_role(array['admin','office_planner','engineer','sales']));

create policy "sites_internal_read"
on public.company_sites for select
using (
  app.has_role(array['admin','office_planner','engineer','sales','management_readonly'])
  or exists (
    select 1 from public.work_orders wo
    where wo.site_id = company_sites.id
      and app.can_access_work_order(wo.id)
  )
);

create policy "sites_internal_manage"
on public.company_sites for all
using (app.has_role(array['admin','office_planner','engineer','sales']))
with check (app.has_role(array['admin','office_planner','engineer','sales']));

create policy "contacts_internal_read"
on public.contacts for select
using (
  app.has_role(array['admin','office_planner','engineer','sales','management_readonly'])
  or exists (
    select 1 from public.work_orders wo
    where wo.company_id = contacts.company_id
      and app.can_access_work_order(wo.id)
  )
);

create policy "contacts_internal_manage"
on public.contacts for all
using (app.has_role(array['admin','office_planner','engineer','sales']))
with check (app.has_role(array['admin','office_planner','engineer','sales']));

create policy "asset_types_internal_read"
on public.asset_types for select
using (app.has_role(array['admin','office_planner','engineer','sales','technician','management_readonly']));

create policy "asset_types_internal_manage"
on public.asset_types for all
using (app.has_role(array['admin','engineer']))
with check (app.has_role(array['admin','engineer']));

create policy "assets_internal_read"
on public.assets for select
using (
  app.has_role(array['admin','office_planner','engineer','sales','management_readonly'])
  or exists (
    select 1 from public.work_orders wo
    where wo.primary_asset_id = assets.id
      and app.can_access_work_order(wo.id)
  )
);

create policy "assets_internal_manage"
on public.assets for all
using (app.has_role(array['admin','office_planner','engineer']))
with check (app.has_role(array['admin','office_planner','engineer']));

create policy "work_orders_read"
on public.work_orders for select
using (app.can_access_work_order(id));

create policy "work_orders_manage"
on public.work_orders for all
using (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and app.can_access_work_order(id))
)
with check (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and app.can_access_work_order(id))
);

create policy "status_history_read"
on public.work_order_status_history for select
using (app.can_access_work_order(work_order_id));

create policy "status_history_insert"
on public.work_order_status_history for insert
with check (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and app.can_access_work_order(work_order_id))
);

create policy "assignments_read"
on public.work_order_assignments for select
using (app.can_access_work_order(work_order_id));

create policy "assignments_manage"
on public.work_order_assignments for all
using (app.has_role(array['admin','office_planner','engineer']))
with check (app.has_role(array['admin','office_planner','engineer']));

create policy "work_logs_read"
on public.work_logs for select
using (app.can_access_work_order(work_order_id));

create policy "work_logs_manage"
on public.work_logs for all
using (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and app.can_access_work_order(work_order_id))
)
with check (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and app.can_access_work_order(work_order_id))
);

create policy "labor_entries_read"
on public.labor_entries for select
using (app.can_access_work_order(work_order_id));

create policy "labor_entries_manage"
on public.labor_entries for all
using (
  app.has_role(array['admin','office_planner','engineer'])
  or user_id = auth.uid()
)
with check (
  app.has_role(array['admin','office_planner','engineer'])
  or user_id = auth.uid()
);

create policy "material_catalog_internal_read"
on public.material_catalog for select
using (app.has_role(array['admin','office_planner','engineer','technician','management_readonly']));

create policy "material_catalog_manage"
on public.material_catalog for all
using (app.has_role(array['admin','office_planner','engineer']))
with check (app.has_role(array['admin','office_planner','engineer']));

create policy "material_usage_read"
on public.material_usage for select
using (app.can_access_work_order(work_order_id));

create policy "material_usage_manage"
on public.material_usage for all
using (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and app.can_access_work_order(work_order_id))
)
with check (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and app.can_access_work_order(work_order_id))
);

create policy "attachments_read"
on public.attachments for select
using (
  app.has_role(array['admin','office_planner','engineer','management_readonly'])
  or (work_order_id is not null and app.can_access_work_order(work_order_id))
);

create policy "attachments_manage"
on public.attachments for all
using (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and work_order_id is not null and app.can_access_work_order(work_order_id))
)
with check (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and work_order_id is not null and app.can_access_work_order(work_order_id))
);

create policy "signatures_read"
on public.signatures for select
using (app.can_access_work_order(work_order_id));

create policy "signatures_manage"
on public.signatures for all
using (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and app.can_access_work_order(work_order_id))
)
with check (
  app.has_role(array['admin','office_planner','engineer'])
  or (app.current_role() = 'technician' and app.can_access_work_order(work_order_id))
);

create policy "compliance_read"
on public.compliance_records for select
using (
  app.has_role(array['admin','office_planner','engineer','management_readonly'])
  or exists (
    select 1 from public.work_orders wo
    where wo.primary_asset_id = compliance_records.asset_id
      and app.can_access_work_order(wo.id)
  )
);

create policy "compliance_manage"
on public.compliance_records for all
using (app.has_role(array['admin','office_planner','engineer']))
with check (app.has_role(array['admin','office_planner','engineer']));

create policy "maintenance_plans_read"
on public.maintenance_plans for select
using (app.has_role(array['admin','office_planner','engineer','management_readonly']));

create policy "maintenance_plans_manage"
on public.maintenance_plans for all
using (app.has_role(array['admin','engineer']))
with check (app.has_role(array['admin','engineer']));

create policy "notifications_own_read"
on public.notifications for select
using (user_id = auth.uid() or app.has_role(array['admin','office_planner','engineer']));

create policy "notifications_own_update"
on public.notifications for update
using (user_id = auth.uid() or app.has_role(array['admin','office_planner','engineer']))
with check (user_id = auth.uid() or app.has_role(array['admin','office_planner','engineer']));

create policy "notifications_internal_insert"
on public.notifications for insert
with check (app.has_role(array['admin','office_planner','engineer']));

create policy "audit_logs_read"
on public.audit_logs for select
using (app.has_role(array['admin','office_planner','engineer','management_readonly']));
