-- Additive: keeps existing plans, completion records and learner classes unchanged.
BEGIN;
SELECT pg_advisory_xact_lock(704186035);
ALTER TABLE learning_activities
 ADD COLUMN IF NOT EXISTS resource_key text,
 ADD COLUMN IF NOT EXISTS resource_href text,
 ADD COLUMN IF NOT EXISTS subject_label text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS support_mode text NOT NULL DEFAULT 'parent' CHECK(support_mode IN ('parent','independent','shared')),
 ADD COLUMN IF NOT EXISTS start_minute integer CHECK(start_minute BETWEEN 0 AND 1439),
 ADD COLUMN IF NOT EXISTS shared_group uuid,
 ADD COLUMN IF NOT EXISTS skipped boolean NOT NULL DEFAULT false,
 ADD COLUMN IF NOT EXISTS understanding text CHECK(understanding IN ('independent','help','change','unfinished')),
 ADD COLUMN IF NOT EXISTS actual_minutes integer CHECK(actual_minutes BETWEEN 0 AND 480),
 ADD COLUMN IF NOT EXISTS evidence_url text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS next_action text NOT NULL DEFAULT '' CHECK(next_action IN ('','continue','repeat','change')),
 ADD COLUMN IF NOT EXISTS next_notes text NOT NULL DEFAULT '' CHECK(length(next_notes)<=1000);
CREATE UNIQUE INDEX IF NOT EXISTS workflow_resource_day ON learning_activities(learner_id,learning_date,resource_key) WHERE resource_key IS NOT NULL;
DO $$
DECLARE lt text; ft text;
BEGIN
 SELECT format_type(atttypid,atttypmod) INTO lt FROM pg_attribute WHERE attrelid='learners'::regclass AND attname='id';
 SELECT format_type(atttypid,atttypmod) INTO ft FROM pg_attribute WHERE attrelid='families'::regclass AND attname='id';
 EXECUTE format('CREATE TABLE IF NOT EXISTS learner_subject_levels(learner_id %s REFERENCES learners(id),subject text NOT NULL,level integer NOT NULL CHECK(level BETWEEN 1 AND 10),PRIMARY KEY(learner_id,subject))',lt);
 EXECUTE format('CREATE TABLE IF NOT EXISTS learning_saved_resources(learner_id %s REFERENCES learners(id),resource_key text NOT NULL,title text NOT NULL,href text NOT NULL,subject text NOT NULL,PRIMARY KEY(learner_id,resource_key))',lt);
 EXECUTE format('CREATE TABLE IF NOT EXISTS learning_day_preferences(family_id %s REFERENCES families(id),learning_date date NOT NULL,mode text NOT NULL CHECK(mode IN (''minimum'',''normal'',''flexible'')),budget integer NOT NULL CHECK(budget BETWEEN 10 AND 480),PRIMARY KEY(family_id,learning_date))',ft);
END $$;
ALTER TABLE learner_subject_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_saved_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_day_preferences ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON learner_subject_levels,learning_saved_resources,learning_day_preferences FROM PUBLIC;
COMMIT;
