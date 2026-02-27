import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { RecipeCard, Recipe } from '@chefmate/shared';

export function useRecipes(params?: { cuisine?: string; difficulty?: string; page?: number }) {
  return useQuery<{ recipes: RecipeCard[]; total: number }>({
    queryKey: ['recipes', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.cuisine) searchParams.set('cuisine', params.cuisine);
      if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
      if (params?.page) searchParams.set('page', String(params.page));
      const res = await api.get(`/recipes?${searchParams}`);
      return res.data;
    },
  });
}

export function useRecipe(id: string) {
  return useQuery<{ recipe: Recipe }>({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const res = await api.get(`/recipes/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useSavedRecipes() {
  return useQuery<{ recipes: RecipeCard[] }>({
    queryKey: ['recipes', 'saved'],
    queryFn: async () => {
      const res = await api.get('/recipes/saved');
      return res.data;
    },
  });
}

export function useSaveRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/recipes/${id}/save`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes', 'saved'] }),
  });
}

export function useSearchRecipes(query: string) {
  return useQuery<{ recipes: RecipeCard[] }>({
    queryKey: ['recipes', 'search', query],
    queryFn: async () => {
      const res = await api.get(`/recipes/search?q=${encodeURIComponent(query)}`);
      return res.data;
    },
    enabled: query.trim().length > 2,
  });
}

export function useGenerateRecipe() {
  return useMutation({
    mutationFn: (params: {
      ingredients: string[];
      mood?: string;
      dietary?: string;
      skill?: string;
      cuisine?: string;
    }) => api.post('/recipes/generate', params),
  });
}
