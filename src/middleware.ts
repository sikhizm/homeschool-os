import { auth } from '@/lib/auth/server';
export default auth.middleware({ loginUrl: '/auth/sign-in' });
export const config = { matcher: ['/dashboard/:path*', '/learn/:path*', '/library/:path*', '/settings/:path*', '/learners/:path*'] };
