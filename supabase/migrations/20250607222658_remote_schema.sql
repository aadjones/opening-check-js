alter table "public"."opening_deviations" drop constraint "opening_deviations_color_check";

alter table "public"."opening_deviations" add column "deviation_uci" text;

alter table "public"."opening_deviations" add column "pgn" text;

alter table "public"."opening_deviations" add column "reference_uci" text;

alter table "public"."profiles" disable row level security;

CREATE UNIQUE INDEX opening_deviations_unique ON public.opening_deviations USING btree (user_id, game_id, move_number, color);

CREATE UNIQUE INDEX unique_user_game ON public.opening_deviations USING btree (user_id, game_id);

alter table "public"."opening_deviations" add constraint "opening_deviations_unique" UNIQUE using index "opening_deviations_unique";

alter table "public"."opening_deviations" add constraint "unique_user_game" UNIQUE using index "unique_user_game";

alter table "public"."opening_deviations" add constraint "opening_deviations_color_check" CHECK ((color = ANY (ARRAY['white'::text, 'black'::text, 'White'::text, 'Black'::text]))) not valid;

alter table "public"."opening_deviations" validate constraint "opening_deviations_color_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_profile_columns()
 RETURNS TABLE(column_name text)
 LANGUAGE sql
AS $function$
  select column_name
  from information_schema.columns
  where table_name = 'profiles'
$function$
;


