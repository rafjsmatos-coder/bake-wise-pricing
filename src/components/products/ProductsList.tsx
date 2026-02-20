import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, ShoppingBag, Loader2, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCategoriesList } from '@/components/product-categories/ProductCategoriesList';
import { useProducts, Product } from '@/hooks/useProducts';
import { toast } from 'sonner';
import { useRecipes } from '@/hooks/useRecipes';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useProductCategories } from '@/hooks/useProductCategories';
import { ProductCard } from './ProductCard';
import { ProductForm } from './ProductForm';
import { ProductDetails } from './ProductDetails';
import { calculateProductCost } from '@/lib/product-cost-calculator';
import { calculateRecipeCost } from '@/lib/recipe-cost-calculator';
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

interface ProductsListProps {
  initialSearch?: string;
}

export function ProductsList({ initialSearch = '' }: ProductsListProps) {
  const { products, isLoading, deleteProduct, duplicateProduct } = useProducts();
  const { recipes } = useRecipes();
  const { settings } = useUserSettings();
  const { categories } = useProductCategories();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialSearch]);

  // Calculate recipe costs
  const recipeCosts = useMemo(() => {
    const costs: Record<string, number> = {};
    for (const recipe of recipes) {
      const recipeIngredients = recipe.recipe_ingredients || [];
      const ingredientsData = recipeIngredients.map((ri: any) => ri.ingredient).filter(Boolean);
      const result = calculateRecipeCost(
        recipeIngredients.map((ri: any) => ({
          ingredient_id: ri.ingredient_id,
          ingredientId: ri.ingredient_id,
          quantity: ri.quantity,
          unit: ri.unit,
        })),
        ingredientsData,
        recipe.yield_quantity,
        recipe.yield_unit as any || 'un',
        recipe.safety_margin_percent || 15,
        recipe.additional_costs || 0,
        recipe.prep_time_minutes || 0,
        recipe.oven_time_minutes || 0,
        settings ? {
          ovenType: settings.oven_type || 'gas',
          includeGasCost: settings.include_gas_cost || false,
          gasCostPerHour: settings.gas_cost_per_hour || 0,
          electricOvenCostPerHour: settings.electric_oven_cost_per_hour || 0,
          defaultOvenType: settings.default_oven_type || 'gas',
          includeEnergyCost: settings.include_energy_cost || false,
          energyCostPerHour: settings.energy_cost_per_hour || 0,
          includeLaborCost: settings.include_labor_cost || false,
          laborCostPerHour: settings.labor_cost_per_hour || 0,
        } : undefined,
        null // recipeOvenType - will be from recipe when needed
      );
      costs[recipe.id] = result.totalCost;
    }
    return costs;
  }, [recipes, settings]);

  // Calculate product costs
  const productCosts = useMemo(() => {
    const costs: Record<string, { production: number; selling: number }> = {};
    for (const product of products) {
      const breakdown = calculateProductCost({
        product,
        recipeCosts,
        laborCostPerHour: settings?.labor_cost_per_hour || 0,
        indirectOperationalCostPercent: settings?.indirect_operational_cost_percent || 5,
      });
      costs[product.id] = {
        production: breakdown.totalProductionCost,
        selling: breakdown.suggestedSellingPrice,
      };
    }
    return costs;
  }, [products, recipeCosts, settings]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || 
        (categoryFilter === 'uncategorized' ? !product.category_id : product.category_id === categoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
  };

  const handleDelete = async () => {
    if (deletingProduct) {
      await deleteProduct.mutateAsync(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  const handleDuplicate = async (product: Product) => {
    await duplicateProduct.mutateAsync(product);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingProduct(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">Produtos</h1>
          <p className="text-muted-foreground">
            {products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Todos</TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6 mt-4">

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-10 min-h-[44px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="uncategorized">Sem categoria</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color || '#6366f1' }}
                  />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">
            {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum resultado encontrado'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {products.length === 0
              ? 'Comece adicionando seu primeiro produto'
              : 'Tente ajustar os filtros de busca'}
          </p>
          {products.length === 0 && (
            <Button onClick={() => setFormOpen(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeiro Produto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              productionCost={productCosts[product.id]?.production || 0}
              sellingPrice={productCosts[product.id]?.selling || 0}
              onEdit={() => handleEdit(product)}
              onDelete={() => setDeletingProduct(product)}
              onView={() => handleView(product)}
              onDuplicate={() => handleDuplicate(product)}
            />
          ))}
        </div>
      )}

      <ProductForm
        open={formOpen}
        onOpenChange={handleFormClose}
        product={editingProduct}
        recipeCosts={recipeCosts}
      />

      <ProductDetails
        open={!!viewingProduct}
        onOpenChange={(open) => !open && setViewingProduct(null)}
        product={viewingProduct}
        recipeCosts={recipeCosts}
        laborCostPerHour={settings?.labor_cost_per_hour || 0}
        indirectOperationalCostPercent={settings?.indirect_operational_cost_percent || 5}
        onEdit={() => {
          if (viewingProduct) {
            setViewingProduct(null);
            handleEdit(viewingProduct);
          }
        }}
        onDuplicate={() => {
          if (viewingProduct) {
            setViewingProduct(null);
            handleDuplicate(viewingProduct);
          }
        }}
      />

      </TabsContent>

      <TabsContent value="categories" className="mt-4">
        <ProductCategoriesList />
      </TabsContent>
      </Tabs>

      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingProduct?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
