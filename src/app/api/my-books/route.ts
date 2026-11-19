import {auth} from '@/lib/auth/server';
import {getSql} from '@/lib/db';
import {bookKinds} from '@/lib/my-books';

const today = () => new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Kolkata'}).format(new Date());
const json = (data: unknown, status = 200) => Response.json(data, {status, headers: {'Cache-Control': 'private, no-store'}});
async function scope() {
  const {data: session} = await auth.getSession();
  if (!session?.user) return null;
  const sql = getSql();
  const [family] = await sql`SELECT family_id, role FROM family_members WHERE auth_user_id = ${session.user.id}
    ORDER BY created_at, family_id LIMIT 1`;
  return family ? {sql, familyId: String(family.family_id), canEdit: family.role === 'owner'} : null;
}

export async function GET(request: Request) {
  try {
    const member = await scope();
    if (!member) return json({error: 'Family sign-in required.'}, 401);
    const {sql, familyId, canEdit} = member;
    const day = today();
    const daily = new URL(request.url).searchParams.get('today') === '1';
    const [entries, books, learners, assignments] = await Promise.all([
      sql`SELECT p.id, p.book_id, p.learner_id, p.learning_date::text, p.first_page, p.last_page, p.completed,
        b.title, b.kind, l.display_name AS learner_name
        FROM family_book_pages p JOIN family_books b ON b.id = p.book_id
        JOIN learners l ON l.id = p.learner_id AND l.family_id = b.family_id AND l.archived_at IS NULL
        WHERE b.family_id::text = ${familyId}
          AND (NOT ${daily} OR (p.learning_date = ${day}::date AND p.in_today_plan))
        ORDER BY p.learning_date DESC, b.title, p.first_page, p.id`,
      daily ? [] : sql`SELECT id, title, kind, page_count FROM family_books WHERE family_id::text = ${familyId} ORDER BY title, id`,
      daily ? [] : sql`SELECT id, display_name FROM learners WHERE family_id::text = ${familyId} AND archived_at IS NULL ORDER BY created_at, id`,
      daily ? [] : sql`SELECT a.book_id, a.learner_id FROM family_book_assignments a
        JOIN family_books b ON b.id = a.book_id JOIN learners l ON l.id = a.learner_id AND l.family_id = b.family_id
        WHERE b.family_id::text = ${familyId} AND l.archived_at IS NULL`,
    ]);
    return json({books, learners, assignments, entries, canEdit});
  } catch (error) {
    return json({error: (error as {code?: string}).code === '42P01'
      ? 'My Books needs migration 021 before it can store books.' : 'Could not load My Books.'}, 503);
  }
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({error: 'Same-origin request required.'}, 403);
  try {
    const member = await scope();
    if (!member?.canEdit) return json({error: 'Family owner access required.'}, 403);
    const {sql, familyId} = member;
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== 'object') return json({error: 'Invalid request.'}, 400);
    if (input.action === 'create') {
      const title = typeof input.title === 'string' ? input.title.trim() : '';
      if (!title || title.length > 150 || !Object.hasOwn(bookKinds, input.kind) ||
        !Number.isInteger(input.pageCount) || input.pageCount < 1 || input.pageCount > 2000) {
        return json({error: 'Enter a book title, type and page count from 1 to 2,000.'}, 400);
      }
      await sql`INSERT INTO family_books (family_id, title, kind, page_count)
        VALUES (${familyId}::uuid, ${title}, ${input.kind}, ${input.pageCount})`;
      return json({saved: true});
    }
    if (input.action === 'complete') {
      const rows = await sql`UPDATE family_book_pages p SET completed = true
        FROM family_books b, learners l WHERE p.book_id = b.id AND p.learner_id = l.id
          AND l.family_id = b.family_id AND l.archived_at IS NULL AND b.family_id::text = ${familyId}
          AND p.id::text = ${String(input.entryId ?? '')} AND p.in_today_plan AND p.learning_date = ${today()}::date
        RETURNING p.id`;
      return rows.length ? json({saved: true}) : json({error: 'Activity unavailable.'}, 404);
    }
    const book = String(input.bookId ?? ''), learner = String(input.learnerId ?? '');
    if (input.action === 'assign') {
      const rows = await sql`WITH eligible AS (
          SELECT b.id AS book_id, l.id AS learner_id FROM family_books b
          JOIN learners l ON l.family_id = b.family_id AND l.archived_at IS NULL
          WHERE b.family_id::text = ${familyId} AND b.id::text = ${book} AND l.id::text = ${learner}
        ), saved AS (INSERT INTO family_book_assignments SELECT * FROM eligible ON CONFLICT DO NOTHING)
        SELECT book_id FROM eligible`;
      return rows.length ? json({saved: true}) : json({error: 'Book or learner unavailable.'}, 404);
    }
    if (input.action !== 'plan' && input.action !== 'log') return json({error: 'Unknown book action.'}, 400);
    const first = input.firstPage, last = input.lastPage;
    if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last < first || last > 2000)
      return json({error: 'Choose a valid page range.'}, 400);
    const scheduled = input.action === 'plan';
    const rows = await sql`INSERT INTO family_book_pages AS p
        (book_id, learner_id, learning_date, first_page, last_page, in_today_plan, completed)
      SELECT b.id, l.id, ${today()}::date, ${first}::int, ${last}::int, ${scheduled}, ${!scheduled}
      FROM family_book_assignments a JOIN family_books b ON b.id = a.book_id
      JOIN learners l ON l.id = a.learner_id AND l.family_id = b.family_id AND l.archived_at IS NULL
      WHERE b.family_id::text = ${familyId} AND b.id::text = ${book} AND l.id::text = ${learner}
        AND b.page_count >= ${last}::int
      ON CONFLICT (book_id, learner_id, learning_date, first_page, last_page) DO UPDATE
      SET in_today_plan = p.in_today_plan OR EXCLUDED.in_today_plan, completed = p.completed OR EXCLUDED.completed
      RETURNING p.id`;
    return rows.length ? json({saved: true}) : json({error: 'Choose an assigned learner and pages within this book.'}, 400);
  } catch {
    return json({error: 'Could not save the book activity.'}, 503);
  }
}
