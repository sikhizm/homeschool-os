import {redirect} from 'next/navigation';

/** Preserve existing bookmarks while keeping personal books out of NCERT navigation. */
export default function LegacyMyBooksRoute() {
  redirect('/library/my-books');
}
