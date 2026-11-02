BEGIN;
DO $$
DECLARE family_type text;
BEGIN
 SELECT format_type(atttypid,atttypmod) INTO family_type FROM pg_attribute
 WHERE attrelid='public.families'::regclass AND attname='id' AND NOT attisdropped;
 IF family_type IS NULL THEN RAISE EXCEPTION 'families.id missing'; END IF;
 EXECUTE format('CREATE TABLE IF NOT EXISTS public.family_daily_plans(
 family_id %s NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
 learning_date date NOT NULL,
 budget_minutes integer NOT NULL CHECK (budget_minutes BETWEEN 10 AND 180),
 slots jsonb NOT NULL DEFAULT ''[]''::jsonb CHECK (jsonb_typeof(slots)=''array''),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(family_id,learning_date)
 )',family_type);
END $$;
ALTER TABLE public.family_daily_plans ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.family_daily_plans FROM PUBLIC;
COMMIT;
