import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/jwt-auth';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'leader') {
    redirect('/leader/home');
  }

  redirect('/home');
}



