grant usage on schema app to authenticated, anon;

grant usage on type
  app.role_code,
  app.data_source,
  app.work_order_type,
  app.work_order_priority,
  app.work_order_status,
  app.billing_status,
  app.report_status
to authenticated, anon;

grant execute on all functions in schema app to authenticated, anon;

alter default privileges in schema app
grant execute on functions to authenticated, anon;
