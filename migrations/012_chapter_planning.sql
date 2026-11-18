ALTER TABLE learning_planning_periods ADD COLUMN IF NOT EXISTS chapter_ids text[] NOT NULL DEFAULT '{}';
