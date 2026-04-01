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
