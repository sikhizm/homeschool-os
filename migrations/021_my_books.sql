BEGIN;
CREATE TABLE IF NOT EXISTS family_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 150),
  kind text NOT NULL CHECK (kind IN ('story','activity','drawing','learning')),
  page_count integer NOT NULL CHECK (page_count BETWEEN 1 AND 2000)
);
CREATE INDEX IF NOT EXISTS family_books_family_idx ON family_books(family_id);
CREATE TABLE IF NOT EXISTS family_book_assignments (
  book_id uuid REFERENCES family_books(id) ON DELETE CASCADE,
  learner_id uuid REFERENCES learners(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, learner_id)
);
CREATE TABLE IF NOT EXISTS family_book_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL,
  learner_id uuid NOT NULL,
  learning_date date NOT NULL,
  first_page integer NOT NULL CHECK (first_page > 0),
  last_page integer NOT NULL CHECK (last_page >= first_page AND last_page <= 2000),
  in_today_plan boolean NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  FOREIGN KEY (book_id, learner_id) REFERENCES family_book_assignments(book_id, learner_id) ON DELETE CASCADE,
  UNIQUE (book_id, learner_id, learning_date, first_page, last_page)
);
ALTER TABLE family_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_book_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_book_pages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON family_books, family_book_assignments, family_book_pages FROM PUBLIC;
COMMIT;
