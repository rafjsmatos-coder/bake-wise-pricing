import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  display_order: number;
  created_at: string;
}

export interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface FAQCategoryWithItems extends FAQCategory {
  items: FAQItem[];
}

function removeAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function fuzzyMatch(text: string, query: string): boolean {
  const normalizedText = removeAccents(text.toLowerCase());
  const normalizedQuery = removeAccents(query.toLowerCase());
  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  return words.every(word => normalizedText.includes(word));
}

export function useFAQ(options?: { includeUnpublished?: boolean }) {
  const categoriesQuery = useQuery({
    queryKey: ['faq-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq_categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as FAQCategory[];
    },
  });

  const itemsQuery = useQuery({
    queryKey: ['faq-items', options?.includeUnpublished],
    queryFn: async () => {
      let query = supabase
        .from('faq_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (!options?.includeUnpublished) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FAQItem[];
    },
  });

  const categories = categoriesQuery.data || [];
  const items = itemsQuery.data || [];

  const getCategoriesWithItems = (searchQuery?: string): FAQCategoryWithItems[] => {
    const filteredItems = searchQuery
      ? items.filter(item => fuzzyMatch(item.question, searchQuery) || fuzzyMatch(item.answer, searchQuery))
      : items;

    return categories
      .map(cat => ({
        ...cat,
        items: filteredItems.filter(item => item.category_id === cat.id),
      }))
      .filter(cat => cat.items.length > 0);
  };

  const searchItems = (query: string): FAQItem[] => {
    if (!query.trim()) return [];
    return items.filter(item => fuzzyMatch(item.question, query) || fuzzyMatch(item.answer, query));
  };

  return {
    categories,
    items,
    isLoading: categoriesQuery.isLoading || itemsQuery.isLoading,
    getCategoriesWithItems,
    searchItems,
    refetch: () => {
      categoriesQuery.refetch();
      itemsQuery.refetch();
    },
  };
}
