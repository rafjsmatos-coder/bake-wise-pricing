import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useProducts, Product } from '@/hooks/useProducts';
import { useRecipes } from '@/hooks/useRecipes';
import { useUserSettings } from '@/hooks/useUserSettings';
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

export function ProductsList() {
  const { products, isLoading, deleteProduct } = useProducts();
  const { recipes } = useRecipes();
  const { settings } = useUserSettings();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
          includeGasCost: settings.include_gas_cost || false,
          gasCostPerHour: settings.gas_cost_per_hour || 0,
          includeEnergyCost: settings.include_energy_cost || false,
          energyCostPerHour: settings.energy_cost_per_hour || 0,
          includeLaborCost: settings.include_labor_cost || false,
          laborCostPerHour: settings.labor_cost_per_hour || 0,
        } : undefined
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
      });
      costs[product.id] = {
        production: breakdown.totalProductionCost,
        selling: breakdown.suggestedSellingPrice,
      };
    }
    return costs;
  }, [products, recipeCosts, settings]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingProduct(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seus produtos e precificação</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Nenhum produto encontrado com esta busca.'
                : 'Nenhum produto cadastrado ainda.'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Produto
              </Button>
            )}
          </CardContent>
        </Card>
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
            />
          ))}
        </div>
      )}

      <ProductForm
        open={formOpen}
        onOpenChange={handleFormClose}
        product={editingProduct}
      />

      <ProductDetails
        open={!!viewingProduct}
        onOpenChange={(open) => !open && setViewingProduct(null)}
        product={viewingProduct}
        recipeCosts={recipeCosts}
        laborCostPerHour={settings?.labor_cost_per_hour || 0}
      />

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
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
