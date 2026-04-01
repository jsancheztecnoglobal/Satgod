insert into public.roles (code, name, description)
values
  ('admin', 'Administrador', 'Acceso total y configuración'),
  ('office_planner', 'Oficina / Planificación', 'Planificación diaria y cierre administrativo'),
  ('engineer', 'Ingeniería', 'Supervisión técnica y compliance'),
  ('sales', 'Comercial', 'Visitas y solicitudes comerciales'),
  ('technician', 'Técnico', 'Ejecución en campo'),
  ('management_readonly', 'Gerencia / Lectura', 'Visión ejecutiva y reporting')
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description;

insert into public.asset_types (code, name, family, requires_compliance)
values
  ('compressor', 'Compresor', 'air_compressed', true),
  ('dryer', 'Secador', 'air_treatment', true),
  ('tank', 'Depósito', 'pressure_equipment', true),
  ('filter', 'Filtro', 'air_treatment', false),
  ('line', 'Línea', 'distribution', false),
  ('accessory', 'Accesorio', 'distribution', false)
on conflict (code) do update
set
  name = excluded.name,
  family = excluded.family,
  requires_compliance = excluded.requires_compliance;

insert into public.material_catalog (sku, name, unit, family, default_cost, default_price)
values
  ('KIT-GA90-P6M', 'Kit mantenimiento compresor GA90 P6M', 'ud', 'maintenance', 195.00, 295.00),
  ('PURGA-1/2', 'Válvula de purga 1/2', 'ud', 'spares', 42.00, 78.00),
  ('FILT-DF220', 'Cartucho filtro DF220', 'ud', 'filters', 27.00, 49.00)
on conflict (sku) do update
set
  name = excluded.name,
  unit = excluded.unit,
  family = excluded.family,
  default_cost = excluded.default_cost,
  default_price = excluded.default_price;

insert into public.bootstrap_accounts (email, full_name, role_code, technician_code)
values
  ('admin@tecnoglobal.local', 'Administrador Tecnoglobal', 'admin', null),
  ('oficina@tecnoglobal.local', 'Oficina Planificacion', 'office_planner', null),
  ('ingenieria@tecnoglobal.local', 'Ingenieria Tecnoglobal', 'engineer', null),
  ('comercial@tecnoglobal.local', 'Comercial Tecnoglobal', 'sales', null),
  ('gerencia@tecnoglobal.local', 'Gerencia Tecnoglobal', 'management_readonly', null),
  ('tecnico1@tecnoglobal.local', 'Tecnico 1', 'technician', 'tecnico1'),
  ('tecnico2@tecnoglobal.local', 'Tecnico 2', 'technician', 'tecnico2'),
  ('tecnico3@tecnoglobal.local', 'Tecnico 3', 'technician', 'tecnico3'),
  ('tecnico4@tecnoglobal.local', 'Tecnico 4', 'technician', 'tecnico4'),
  ('tecnico5@tecnoglobal.local', 'Tecnico 5', 'technician', 'tecnico5'),
  ('tecnico6@tecnoglobal.local', 'Tecnico 6', 'technician', 'tecnico6'),
  ('tecnico7@tecnoglobal.local', 'Tecnico 7', 'technician', 'tecnico7'),
  ('tecnico8@tecnoglobal.local', 'Tecnico 8', 'technician', 'tecnico8')
on conflict (email) do update
set
  full_name = excluded.full_name,
  role_code = excluded.role_code,
  technician_code = excluded.technician_code,
  active = true;
