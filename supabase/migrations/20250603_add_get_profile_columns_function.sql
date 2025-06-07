-- Utility function for schema validation in tests
create or replace function public.get_profile_columns()
returns table(column_name text)
language sql
as $$
  select column_name
  from information_schema.columns
  where table_name = 'profiles'
$$; 