import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Mood, MoodLog } from '@chefmate/shared';

export function useMoodHistory(days = 7) {
  return useQuery<{ history: MoodLog[] }>({
    queryKey: ['mood', 'history', days],
    queryFn: async () => {
      const res = await api.get(`/mood/history?days=${days}`);
      return res.data;
    },
  });
}

export function useLogMood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { mood: Mood; note?: string }) => api.post('/mood/log', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mood'] }),
  });
}
