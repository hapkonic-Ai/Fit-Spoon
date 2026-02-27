import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface StreakData {
  current: number;
  longest: number;
  lastActiveDate: string;
}

export function useStreakData() {
  return useQuery<StreakData>({
    queryKey: ['streak'],
    queryFn: async () => {
      const res = await api.get('/user/streak');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
