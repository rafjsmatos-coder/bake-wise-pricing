import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type MeasurementUnit = Database['public']['Enums']['measurement_unit'];

export interface ProductRecipe {
  id: string;
  recipe_id: string;
  quantity: number;
  recipe?: {
    id: string;
    name: string;
    yield_quantity: number;
    yield_unit: string;
  };
}

export interface ProductIngredient {
  id: string;
  ingredient_id: string;
  quantity: number;
  unit: MeasurementUnit;
  ingredient?: {
    id: string;
    name: string;
    cost_per_unit: number | null;
    unit: MeasurementUnit;
  };
}

export interface ProductDecoration {
  id: string;
  decoration_id: string;
  quantity: number;
  unit: MeasurementUnit;
  decoration?: {
    id: string;
    name: string;
    cost_per_unit: number | null;
    unit: MeasurementUnit;
  };
}

export interface ProductPackaging {
  id: string;
  packaging_id: string;
  quantity: number;
  packaging?: {
    id: string;
    name: string;
    cost_per_unit: number | null;
    unit: MeasurementUnit;
  };
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category_id: string | null;
  decoration_time_minutes: number | null;
  profit_margin_percent: number | null;
  additional_costs: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  product_recipes?: ProductRecipe[];
  product_ingredients?: ProductIngredient[];
  product_decorations?: ProductDecoration[];
  product_packaging?: ProductPackaging[];
}

export interface ProductFormData {
  name: string;
  category_id?: string | null;
  decoration_time_minutes?: number | null;
  profit_margin_percent?: number | null;
  additional_costs?: number | null;
  notes?: string | null;
  recipes?: { recipe_id: string; quantity: number }[];
  ingredients?: { ingredient_id: string; quantity: number; unit: MeasurementUnit }[];
  decorations?: { decoration_id: string; quantity: number; unit: MeasurementUnit }[];
  packaging?: { packaging_id: string; quantity: number }[];
}

export function useProducts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(id, name, color),
          product_recipes(id, recipe_id, quantity, recipe:recipes(id, name, yield_quantity, yield_unit)),
          product_ingredients(id, ingredient_id, quantity, unit, ingredient:ingredients(id, name, cost_per_unit, unit)),
          product_decorations(id, decoration_id, quantity, unit, decoration:decorations(id, name, cost_per_unit, unit)),
          product_packaging(id, packaging_id, quantity, packaging:packaging(id, name, cost_per_unit, unit))
        `)
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user?.id,
  });

  const createProduct = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      // Create the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: productData.name,
          category_id: productData.category_id || null,
          decoration_time_minutes: productData.decoration_time_minutes ?? 0,
          profit_margin_percent: productData.profit_margin_percent ?? 30,
          additional_costs: productData.additional_costs ?? 0,
          notes: productData.notes || null,
        })
        .select()
        .single();
      
      if (productError) throw productError;

      // Insert recipes
      if (productData.recipes?.length) {
        const { error } = await supabase
          .from('product_recipes')
          .insert(productData.recipes.map(r => ({
            product_id: product.id,
            recipe_id: r.recipe_id,
            quantity: r.quantity,
          })));
        if (error) throw error;
      }

      // Insert ingredients
      if (productData.ingredients?.length) {
        const { error } = await supabase
          .from('product_ingredients')
          .insert(productData.ingredients.map(i => ({
            product_id: product.id,
            ingredient_id: i.ingredient_id,
            quantity: i.quantity,
            unit: i.unit,
          })));
        if (error) throw error;
      }

      // Insert decorations
      if (productData.decorations?.length) {
        const { error } = await supabase
          .from('product_decorations')
          .insert(productData.decorations.map(d => ({
            product_id: product.id,
            decoration_id: d.decoration_id,
            quantity: d.quantity,
            unit: d.unit,
          })));
        if (error) throw error;
      }

      // Insert packaging
      if (productData.packaging?.length) {
        const { error } = await supabase
          .from('product_packaging')
          .insert(productData.packaging.map(p => ({
            product_id: product.id,
            packaging_id: p.packaging_id,
            quantity: p.quantity,
          })));
        if (error) throw error;
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro ao criar produto');
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...productData }: { id: string } & ProductFormData) => {
      // Update the product
      const { error: productError } = await supabase
        .from('products')
        .update({
          name: productData.name,
          category_id: productData.category_id || null,
          decoration_time_minutes: productData.decoration_time_minutes ?? 0,
          profit_margin_percent: productData.profit_margin_percent ?? 30,
          additional_costs: productData.additional_costs ?? 0,
          notes: productData.notes || null,
        })
        .eq('id', id);
      
      if (productError) throw productError;

      // Delete existing relations and re-insert
      await supabase.from('product_recipes').delete().eq('product_id', id);
      await supabase.from('product_ingredients').delete().eq('product_id', id);
      await supabase.from('product_decorations').delete().eq('product_id', id);
      await supabase.from('product_packaging').delete().eq('product_id', id);

      // Insert recipes
      if (productData.recipes?.length) {
        const { error } = await supabase
          .from('product_recipes')
          .insert(productData.recipes.map(r => ({
            product_id: id,
            recipe_id: r.recipe_id,
            quantity: r.quantity,
          })));
        if (error) throw error;
      }

      // Insert ingredients
      if (productData.ingredients?.length) {
        const { error } = await supabase
          .from('product_ingredients')
          .insert(productData.ingredients.map(i => ({
            product_id: id,
            ingredient_id: i.ingredient_id,
            quantity: i.quantity,
            unit: i.unit,
          })));
        if (error) throw error;
      }

      // Insert decorations
      if (productData.decorations?.length) {
        const { error } = await supabase
          .from('product_decorations')
          .insert(productData.decorations.map(d => ({
            product_id: id,
            decoration_id: d.decoration_id,
            quantity: d.quantity,
            unit: d.unit,
          })));
        if (error) throw error;
      }

      // Insert packaging
      if (productData.packaging?.length) {
        const { error } = await supabase
          .from('product_packaging')
          .insert(productData.packaging.map(p => ({
            product_id: id,
            packaging_id: p.packaging_id,
            quantity: p.quantity,
          })));
        if (error) throw error;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    },
  });

  return {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
