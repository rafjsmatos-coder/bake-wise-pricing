import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ensureSessionUserId } from '@/lib/ensure-session';
import type { Database } from '@/integrations/supabase/types';

type MeasurementUnit = Database['public']['Enums']['measurement_unit'];

export interface ProductRecipe {
  id: string;
  recipe_id: string;
  quantity: number;
  unit: string;
  recipe?: { id: string; name: string; yield_quantity: number; yield_unit: string; is_active?: boolean };
}

export interface ProductIngredient {
  id: string;
  ingredient_id: string;
  quantity: number;
  unit: MeasurementUnit;
  ingredient?: { id: string; name: string; cost_per_unit: number | null; unit: MeasurementUnit; is_active?: boolean };
}

export interface ProductDecoration {
  id: string;
  decoration_id: string;
  quantity: number;
  unit: MeasurementUnit;
  decoration?: { id: string; name: string; cost_per_unit: number | null; unit: MeasurementUnit; purchase_price?: number; package_quantity?: number; is_active?: boolean };
}

export interface ProductPackaging {
  id: string;
  packaging_id: string;
  quantity: number;
  packaging?: { id: string; name: string; cost_per_unit: number | null; unit: MeasurementUnit; is_active?: boolean };
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string; color: string | null } | null;
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
  recipes?: { recipe_id: string; quantity: number; unit: string }[];
  ingredients?: { ingredient_id: string; quantity: number; unit: MeasurementUnit }[];
  decorations?: { decoration_id: string; quantity: number; unit: MeasurementUnit }[];
  packaging?: { packaging_id: string; quantity: number }[];
}

export function useProducts(options?: { includeInactive?: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const includeInactive = options?.includeInactive ?? false;

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', user?.id, includeInactive],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = supabase
        .from('products')
        .select(`
          *,
          category:product_categories(id, name, color),
          product_recipes(id, recipe_id, quantity, unit, recipe:recipes(id, name, yield_quantity, yield_unit, is_active)),
          product_ingredients(id, ingredient_id, quantity, unit, ingredient:ingredients(id, name, cost_per_unit, unit, is_active)),
          product_decorations(id, decoration_id, quantity, unit, decoration:decorations(id, name, cost_per_unit, unit, purchase_price, package_quantity, is_active)),
          product_packaging(id, packaging_id, quantity, packaging:packaging(id, name, cost_per_unit, unit, is_active))
        `)
        .eq('user_id', user.id);
      if (!includeInactive) query = query.eq('is_active', true);
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user?.id,
  });

  const createProduct = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const userId = await ensureSessionUserId();
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          user_id: userId, name: productData.name, category_id: productData.category_id || null,
          decoration_time_minutes: productData.decoration_time_minutes ?? 0,
          profit_margin_percent: productData.profit_margin_percent ?? 30,
          additional_costs: productData.additional_costs ?? 0, notes: productData.notes || null,
        })
        .select().single();
      if (productError) throw productError;

      if (productData.recipes?.length) {
        const { error } = await supabase.from('product_recipes').insert(productData.recipes.map(r => ({ product_id: product.id, recipe_id: r.recipe_id, quantity: r.quantity, unit: r.unit })));
        if (error) throw error;
      }
      if (productData.ingredients?.length) {
        const { error } = await supabase.from('product_ingredients').insert(productData.ingredients.map(i => ({ product_id: product.id, ingredient_id: i.ingredient_id, quantity: i.quantity, unit: i.unit })));
        if (error) throw error;
      }
      if (productData.decorations?.length) {
        const { error } = await supabase.from('product_decorations').insert(productData.decorations.map(d => ({ product_id: product.id, decoration_id: d.decoration_id, quantity: d.quantity, unit: d.unit })));
        if (error) throw error;
      }
      if (productData.packaging?.length) {
        const { error } = await supabase.from('product_packaging').insert(productData.packaging.map(p => ({ product_id: product.id, packaging_id: p.packaging_id, quantity: p.quantity })));
        if (error) throw error;
      }
      return product;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); },
    onError: (error) => { console.error('Erro ao criar produto:', error); toast.error('Erro ao criar produto'); },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...productData }: { id: string } & ProductFormData) => {
      await ensureSessionUserId();
      const { error } = await supabase.rpc('update_product_with_relations', {
        p_product_id: id,
        p_name: productData.name,
        p_category_id: productData.category_id || null,
        p_decoration_time_minutes: productData.decoration_time_minutes ?? 0,
        p_profit_margin_percent: productData.profit_margin_percent ?? 30,
        p_additional_costs: productData.additional_costs ?? 0,
        p_notes: productData.notes || null,
        p_recipes: JSON.stringify(productData.recipes?.map(r => ({ recipe_id: r.recipe_id, quantity: r.quantity, unit: r.unit })) || []),
        p_ingredients: JSON.stringify(productData.ingredients?.map(i => ({ ingredient_id: i.ingredient_id, quantity: i.quantity, unit: i.unit })) || []),
        p_decorations: JSON.stringify(productData.decorations?.map(d => ({ decoration_id: d.decoration_id, quantity: d.quantity, unit: d.unit })) || []),
        p_packaging: JSON.stringify(productData.packaging?.map(p => ({ packaging_id: p.packaging_id, quantity: p.quantity })) || []),
      });
      if (error) throw error;
      return { id };
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); },
    onError: (error: any) => {
      console.error('Erro ao atualizar produto:', error);
      const msg = error?.message || 'Erro ao atualizar produto';
      toast.error(msg);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success('Produto excluído com sucesso!'); },
    onError: (error) => { console.error('Erro ao excluir produto:', error); toast.error('Erro ao excluir produto'); },
  });

  const duplicateProduct = useMutation({
    mutationFn: async (product: Product) => {
      await ensureSessionUserId();
      const productData: ProductFormData = {
        name: `${product.name} (cópia)`, category_id: product.category_id,
        decoration_time_minutes: product.decoration_time_minutes,
        profit_margin_percent: product.profit_margin_percent,
        additional_costs: product.additional_costs, notes: product.notes,
        recipes: product.product_recipes?.map(r => ({ recipe_id: r.recipe_id, quantity: r.quantity, unit: r.unit })) || [],
        ingredients: product.product_ingredients?.map(i => ({ ingredient_id: i.ingredient_id, quantity: i.quantity, unit: i.unit })) || [],
        decorations: product.product_decorations?.map(d => ({ decoration_id: d.decoration_id, quantity: d.quantity, unit: d.unit })) || [],
        packaging: product.product_packaging?.map(p => ({ packaging_id: p.packaging_id, quantity: p.quantity })) || [],
      };
      return createProduct.mutateAsync(productData);
    },
    onSuccess: () => { toast.success('Produto duplicado com sucesso!'); },
    onError: (error) => { console.error('Erro ao duplicar produto:', error); toast.error('Erro ao duplicar produto'); },
  });

  const deactivateProduct = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success('Produto desativado com sucesso!'); },
    onError: (error) => { console.error('Erro ao desativar produto:', error); toast.error('Erro ao desativar produto'); },
  });

  const reactivateProduct = useMutation({
    mutationFn: async (id: string) => {
      await ensureSessionUserId();
      const { error } = await supabase.from('products').update({ is_active: true }).eq('id', id);
      if (error) throw error;
    },
    retry: 1,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success('Produto reativado com sucesso!'); },
    onError: (error) => { console.error('Erro ao reativar produto:', error); toast.error('Erro ao reativar produto'); },
  });

  return {
    products, isLoading, error,
    createProduct, updateProduct, deleteProduct, duplicateProduct, deactivateProduct, reactivateProduct,
  };
}
