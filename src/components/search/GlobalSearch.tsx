import { useState, useEffect, useMemo } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useIngredients } from '@/hooks/useIngredients';
import { useRecipes } from '@/hooks/useRecipes';
import { useProducts } from '@/hooks/useProducts';
import { useDecorations } from '@/hooks/useDecorations';
import { usePackaging } from '@/hooks/usePackaging';
import { useClients } from '@/hooks/useClients';
import { useOrders } from '@/hooks/useOrders';
import { useFinancial } from '@/hooks/useFinancial';
import { 
  Package, 
  BookOpen, 
  ShoppingBag, 
  Sparkles, 
  Box,
  Search,
  Users,
  ClipboardList,
  Wallet
} from 'lucide-react';
import { formatCurrency } from '@/lib/product-cost-calculator';
import { format, parseISO } from 'date-fns';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (page: string) => void;
}

export function GlobalSearch({ open, onOpenChange, onNavigate }: GlobalSearchProps) {
  const [search, setSearch] = useState('');
  
  const { ingredients } = useIngredients();
  const { recipes } = useRecipes();
  const { products } = useProducts();
  const { decorations } = useDecorations();
  const { packagingItems: packaging } = usePackaging();
  const { clients } = useClients();
  const { orders } = useOrders();
  const { transactions } = useFinancial();

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const q = search.toLowerCase();

  const filteredIngredients = useMemo(() => {
    if (!search) return ingredients.slice(0, 5);
    return ingredients.filter(i => 
      i.name.toLowerCase().includes(q) ||
      i.brand?.toLowerCase().includes(q) ||
      i.supplier?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [ingredients, q, search]);

  const filteredRecipes = useMemo(() => {
    if (!search) return recipes.slice(0, 5);
    return recipes.filter(r => r.name.toLowerCase().includes(q)).slice(0, 5);
  }, [recipes, q, search]);

  const filteredProducts = useMemo(() => {
    if (!search) return products.slice(0, 5);
    return products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5);
  }, [products, q, search]);

  const filteredDecorations = useMemo(() => {
    if (!search) return decorations.slice(0, 5);
    return decorations.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.brand?.toLowerCase().includes(q) ||
      d.supplier?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [decorations, q, search]);

  const filteredPackaging = useMemo(() => {
    if (!search) return packaging.slice(0, 5);
    return packaging.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.supplier?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [packaging, q, search]);

  const filteredClients = useMemo(() => {
    if (!search) return clients.slice(0, 5);
    return clients.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.whatsapp?.toLowerCase().includes(q) ||
      c.instagram?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [clients, q, search]);

  const filteredOrders = useMemo(() => {
    if (!search) return [];
    return orders.filter(o =>
      o.client?.name?.toLowerCase().includes(q) ||
      o.notes?.toLowerCase().includes(q) ||
      o.order_items?.some(item => item.product?.name?.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [orders, q, search]);

  const filteredTransactions = useMemo(() => {
    if (!search) return [];
    return transactions.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [transactions, q, search]);

  const hasResults = filteredIngredients.length > 0 || 
    filteredRecipes.length > 0 || 
    filteredProducts.length > 0 || 
    filteredDecorations.length > 0 || 
    filteredPackaging.length > 0 ||
    filteredClients.length > 0 ||
    filteredOrders.length > 0 ||
    filteredTransactions.length > 0;

  const handleSelect = (page: string) => {
    onOpenChange(false);
    onNavigate?.(page);
  };

  let groupIndex = 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Buscar produtos, receitas, pedidos, clientes..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {!hasResults && search && (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-6">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p>Nenhum resultado para "{search}"</p>
            </div>
          </CommandEmpty>
        )}

        {filteredProducts.length > 0 && (
          <>
            {groupIndex++ > 0 && <CommandSeparator />}
            <CommandGroup heading="Produtos">
              {filteredProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`product-${product.name}`}
                  onSelect={() => handleSelect('products')}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span>{product.name}</span>
                  {product.category && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {product.category.name}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredRecipes.length > 0 && (
          <>
            {groupIndex++ > 0 && <CommandSeparator />}
            <CommandGroup heading="Receitas">
              {filteredRecipes.map((recipe) => (
                <CommandItem
                  key={recipe.id}
                  value={`recipe-${recipe.name}`}
                  onSelect={() => handleSelect('recipes')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{recipe.name}</span>
                  {recipe.recipe_categories && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {recipe.recipe_categories.name}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredOrders.length > 0 && (
          <>
            {groupIndex++ > 0 && <CommandSeparator />}
            <CommandGroup heading="Pedidos">
              {filteredOrders.map((order) => (
                <CommandItem
                  key={order.id}
                  value={`order-${order.client?.name}-${order.id}`}
                  onSelect={() => handleSelect('orders')}
                  className="flex items-center gap-2"
                >
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span>{order.client?.name || 'Cliente removido'}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatCurrency(order.total_amount)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredIngredients.length > 0 && (
          <>
            {groupIndex++ > 0 && <CommandSeparator />}
            <CommandGroup heading="Ingredientes">
              {filteredIngredients.map((ingredient) => (
                <CommandItem
                  key={ingredient.id}
                  value={`ingredient-${ingredient.name}`}
                  onSelect={() => handleSelect('ingredients')}
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{ingredient.name}</span>
                  {ingredient.brand && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {ingredient.brand}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredDecorations.length > 0 && (
          <>
            {groupIndex++ > 0 && <CommandSeparator />}
            <CommandGroup heading="Decorações">
              {filteredDecorations.map((decoration) => (
                <CommandItem
                  key={decoration.id}
                  value={`decoration-${decoration.name}`}
                  onSelect={() => handleSelect('decorations')}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span>{decoration.name}</span>
                  {decoration.decoration_categories && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {decoration.decoration_categories.name}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredPackaging.length > 0 && (
          <>
            {groupIndex++ > 0 && <CommandSeparator />}
            <CommandGroup heading="Embalagens">
              {filteredPackaging.map((pack) => (
                <CommandItem
                  key={pack.id}
                  value={`packaging-${pack.name}`}
                  onSelect={() => handleSelect('packaging')}
                  className="flex items-center gap-2"
                >
                  <Box className="h-4 w-4 text-muted-foreground" />
                  <span>{pack.name}</span>
                  {pack.category && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {pack.category.name}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredClients.length > 0 && (
          <>
            {groupIndex++ > 0 && <CommandSeparator />}
            <CommandGroup heading="Clientes">
              {filteredClients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={`client-${client.name}`}
                  onSelect={() => handleSelect('clients')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{client.name}</span>
                  {client.phone && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {client.phone}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredTransactions.length > 0 && (
          <>
            {groupIndex++ > 0 && <CommandSeparator />}
            <CommandGroup heading="Transações">
              {filteredTransactions.map((t) => (
                <CommandItem
                  key={t.id}
                  value={`transaction-${t.description}-${t.id}`}
                  onSelect={() => handleSelect('cashflow')}
                  className="flex items-center gap-2"
                >
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span>{t.description}</span>
                  <span className={`text-xs ml-auto ${t.type === 'income' ? 'text-green-600' : 'text-destructive'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
        {' '}para abrir a busca
      </div>
    </CommandDialog>
  );
}
