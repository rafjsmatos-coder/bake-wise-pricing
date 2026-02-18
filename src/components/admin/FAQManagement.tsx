import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2, HelpCircle, FolderPlus } from 'lucide-react';
import { useFAQ } from '@/hooks/useFAQ';
import { FAQCategoryForm } from './FAQCategoryForm';
import { FAQItemForm } from './FAQItemForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { FAQCategory, FAQItem } from '@/hooks/useFAQ';

export function FAQManagement() {
  
  const { categories, items, isLoading, refetch } = useFAQ({ includeUnpublished: true });

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'item'; id: string; name: string } | null>(null);

  const handleTogglePublished = async (item: FAQItem) => {
    const { error } = await supabase
      .from('faq_items')
      .update({ is_published: !item.is_published })
      .eq('id', item.id);
    if (error) {
      toast.error('Erro', { description: error.message });
    } else {
      refetch();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const table = deleteTarget.type === 'category' ? 'faq_categories' : 'faq_items';
    const { error } = await supabase.from(table).delete().eq('id', deleteTarget.id);
    if (error) {
      toast.error('Erro ao excluir', { description: error.message });
    } else {
      toast.success('Excluído com sucesso!');
      refetch();
    }
    setDeleteTarget(null);
  };

  const handleMoveCategory = async (category: FAQCategory, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex(c => c.id === category.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const other = sorted[swapIdx];
    await Promise.all([
      supabase.from('faq_categories').update({ display_order: other.display_order }).eq('id', category.id),
      supabase.from('faq_categories').update({ display_order: category.display_order }).eq('id', other.id),
    ]);
    refetch();
  };

  const handleMoveItem = async (item: FAQItem, direction: 'up' | 'down') => {
    const categoryItems = items
      .filter(i => i.category_id === item.category_id)
      .sort((a, b) => a.display_order - b.display_order);
    const idx = categoryItems.findIndex(i => i.id === item.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categoryItems.length) return;

    const other = categoryItems[swapIdx];
    await Promise.all([
      supabase.from('faq_items').update({ display_order: other.display_order }).eq('id', item.id),
      supabase.from('faq_items').update({ display_order: item.display_order }).eq('id', other.id),
    ]);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
        <Button onClick={() => { setEditingItem(null); setDefaultCategoryId(''); setShowItemForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Pergunta
        </Button>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhuma categoria de FAQ</h3>
          <p className="text-muted-foreground text-sm">Crie categorias para organizar as perguntas</p>
        </div>
      ) : (
        sortedCategories.map((category, catIdx) => {
          const categoryItems = items
            .filter(i => i.category_id === category.id)
            .sort((a, b) => a.display_order - b.display_order);

          return (
            <Card key={category.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <h3 className="font-medium">{category.name}</h3>
                  <Badge variant="secondary">{categoryItems.length}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" disabled={catIdx === 0} onClick={() => handleMoveCategory(category, 'up')}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled={catIdx === sortedCategories.length - 1} onClick={() => handleMoveCategory(category, 'down')}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(category); setShowCategoryForm(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: 'category', id: category.id, name: category.name })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {categoryItems.map((item, itemIdx) => (
                <div key={item.id} className="flex items-start justify-between gap-2 pl-6 py-2 border-t">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.question}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground truncate flex-1">{item.answer}</p>
                      {(item as any).view_count > 0 && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          👁 {(item as any).view_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch checked={item.is_published} onCheckedChange={() => handleTogglePublished(item)} />
                    <Button variant="ghost" size="icon" disabled={itemIdx === 0} onClick={() => handleMoveItem(item, 'up')}>
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled={itemIdx === categoryItems.length - 1} onClick={() => handleMoveItem(item, 'down')}>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setShowItemForm(true); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: 'item', id: item.id, name: item.question })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="ml-6"
                onClick={() => { setEditingItem(null); setDefaultCategoryId(category.id); setShowItemForm(true); }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar pergunta
              </Button>
            </Card>
          );
        })
      )}

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <FAQCategoryForm
            category={editingCategory}
            onSuccess={() => { setShowCategoryForm(false); refetch(); }}
            onCancel={() => setShowCategoryForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Item Form Dialog */}
      <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Pergunta' : 'Nova Pergunta'}</DialogTitle>
          </DialogHeader>
          <FAQItemForm
            item={editingItem}
            categories={categories}
            defaultCategoryId={defaultCategoryId}
            onSuccess={() => { setShowItemForm(false); refetch(); }}
            onCancel={() => setShowItemForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.name}"?
              {deleteTarget?.type === 'category' && ' Todas as perguntas desta categoria serão excluídas.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
