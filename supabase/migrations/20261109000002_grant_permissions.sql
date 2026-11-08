-- ==============================================================================
-- CẤP QUYỀN TRUY CẬP SCHEMA PUBLIC CHO ANON VÀ AUTHENTICATED ROLES
-- ==============================================================================

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.warehouses to anon, authenticated;
grant select on public.customer_levels to anon, authenticated;
grant select on public.system_settings to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant select on tables to anon, authenticated;
