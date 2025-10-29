import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export function useAdminGuard() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const isAdmin = user?.role === 'admin' || user?.admin === true;

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('useAdminGuard: User not authenticated, redirecting to login');
      router.replace('/login');
      return;
    }

    if (!isAdmin) {
      console.log('useAdminGuard: User not admin, redirecting back');
      router.back();
    }
  }, [isAuthenticated, isAdmin, router]);

  return { isAdmin, user, isAuthenticated };
}

export function useIsAdmin() {
  const user = useSelector((state: RootState) => state.auth.user);
  return user?.role === 'admin' || user?.admin === true;
}
