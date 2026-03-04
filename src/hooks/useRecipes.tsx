import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ensureSessionUserId } from '@/lib/ensure-session';
import type { MeasurementUnit } from '@/lib/unit-conversion';

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: MeasurementUnit;
  created_at: string;
  ingredients?: {
    id: string;
    name: string;
    purchase_price: number;
    package_quantity: number;
    unit: MeasurementUnit;
    cost_per_unit: number;
    is_active?: boolean;
  };
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  category_id: string;
  yield_quantity: number;
  yield_unit: string;
  prep_time_minutes: number;
  oven_time_minutes: number | null;
  oven_type: 'gas' | 'electric' | null;
  instructions: string | null;
  safety_margin_percent: number | null;
  additional_costs: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  recipe_categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
  recipe_ingredients?: RecipeIngredient[];
}

export interface CreateRecipeIngredientData {
  ingredient_id: string;
  quantity: number;
  unit: MeasurementUnit;
}

export interface CreateRecipeData {
  name: string;
  category_id: string;
  yield_quantity: number;
  yield_unit: string;
  prep_time_minutes: number;
  oven_time_minutes?: number | null;
  oven_type?: 'gas' | 'electric' | null;
  instructions?: string | null;
  safety_margin_percent?: number | null;
  additional_costs?: number;
  notes?: string | null;
  ingredients: CreateRecipeIngredientData[];
}

export interface UpdateRecipeData extends Partial<Omit<CreateRecipeData, 'ingredients'>> {
  ingredients?: CreateRecipeIngredientData[];
}

const RECIPE_SELECT = `
  *,
  recipe_categories (id, name, color),
  recipe_ingredients (
    id, recipe_id, ingredient_id, quantity, unit, created_at,
    ingredients (id, name, purchase_price, package_quantity, unit, cost_per_unit, is_active)
  )
`;

export function useRecipes(options?: { includeInactive?: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const includeInactive = options?.includeInactive ?? false;

  const recipesQuery = useQuery({
    queryKey: ['recipes', user?.id, includeInactive],
    queryFn: async () => {
      let query = supabase.from('recipes').select(RECIPE_SELECT);
      if (!includeInactive) query = query.eq('is_active', true);
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data as Recipe[];
    },
    enabled: !!user,
  });

  const createRecipe = useMutation({
    mutationFn: async (data: CreateRecipeData) => {
      const userId = await ensureSessionUserId();
      const { ingredients, ...recipeData } = data;
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes').insert({ user_id: userId, ...recipeData }).select().single();
      if (recipeError) throw recipeError;

      if (ingredients.length > 0) {
        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredients.map(ing => ({ recipe_id: recipe.id, ingredient_id: ing.ingredient_id, quantity: ing.quantity, unit: ing.unit })));
        if (ingredientsError) throw ingredientsError;
      }

      const { data: fullRecipe, error: fetchError } = await supabase
        .from('recipes').select(RECIPE_SELECT).eq('id', recipe.id).single();
      if (fetchError) throw fetchError;
      return fullRecipe as Recipe;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recipes'] }); toast.success('Receita criada com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao criar receita', { description: error.message }); },
  });

  const updateRecipe = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRecipeData }) => {
      await ensureSessionUserId();
      const { ingredients, ...recipeData } = data;
      if (Object.keys(recipeData).length > 0) {
        const { error: recipeError } = await supabase.from('recipes').update(recipeData).eq('id', id);
        if (recipeError) throw recipeError;
      }
      if (ingredients !== undefined) {
        await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
        if (ingredients.length > 0) {
          const { error: ingredientsError } = await supabase
            .from('recipe_ingredients')
            .insert(ingredients.map(ing => ({ recipe_id: id, ingredient_id: ing.ingredient_id, quantity: ing.quantity, unit: ing.unit })));
          if (ingredientsError) throw ingredientsError;
        }
      }
      const { data: fullRecipe, error: fetchError } = await supabase
        .from('recipes').select(RECIPE_SELECT).eq('id', id).single();
      if (fetchError) throw fetchError;
      return fullRecipe as Recipe;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recipes'] }); toast.success('Receita atualizada com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao atualizar receita', { description: error.message }); },
  });

  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recipes'] }); toast.success('Receita excluída com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao excluir receita', { description: error.message }); },
  });

  const duplicateRecipe = useMutation({
    mutationFn: async (recipe: Recipe) => {
      await ensureSessionUserId();
      const newRecipeData: CreateRecipeData = {
        name: `${recipe.name} (cópia)`, category_id: recipe.category_id,
        yield_quantity: Number(recipe.yield_quantity), yield_unit: recipe.yield_unit,
        prep_time_minutes: recipe.prep_time_minutes, oven_time_minutes: recipe.oven_time_minutes,
        instructions: recipe.instructions, safety_margin_percent: recipe.safety_margin_percent,
        additional_costs: Number(recipe.additional_costs), notes: recipe.notes,
        ingredients: recipe.recipe_ingredients?.map(ing => ({
          ingredient_id: ing.ingredient_id, quantity: Number(ing.quantity), unit: ing.unit,
        })) || [],
      };
      return createRecipe.mutateAsync(newRecipeData);
    },
    onSuccess: () => { toast.success('Receita duplicada com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao duplicar receita', { description: error.message }); },
  });

  const deactivateRecipe = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('recipes').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recipes'] }); toast.success('Receita desativada com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao desativar receita', { description: error.message }); },
  });

  const reactivateRecipe = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('recipes').update({ is_active: true }).eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recipes'] }); toast.success('Receita reativada com sucesso!'); },
    onError: (error: Error) => { toast.error('Erro ao reativar receita', { description: error.message }); },
  });

  return {
    recipes: recipesQuery.data || [],
    isLoading: recipesQuery.isLoading,
    error: recipesQuery.error,
    createRecipe, updateRecipe, deleteRecipe, duplicateRecipe, deactivateRecipe, reactivateRecipe,
  };
}
