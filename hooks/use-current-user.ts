import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/app/actions/users';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
