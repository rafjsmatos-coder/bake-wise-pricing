import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { 
  Package, 
  BookOpen, 
  ShoppingBag, 
  Sparkles, 
  Box,
  Search,
  Users
} from 'lucide-react';

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
  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  // Keyboard shortcut
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

  const filteredIngredients = useMemo(() => {
    if (!search) return ingredients.slice(0, 5);
    return ingredients.filter(i => 
      i.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);
  }, [ingredients, search]);

  const filteredRecipes = useMemo(() => {
    if (!search) return recipes.slice(0, 5);
    return recipes.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);
  }, [recipes, search]);

  const filteredProducts = useMemo(() => {
    if (!search) return products.slice(0, 5);
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);
  }, [products, search]);

  const filteredDecorations = useMemo(() => {
    if (!search) return decorations.slice(0, 5);
    return decorations.filter(d => 
      d.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);
  }, [decorations, search]);

  const filteredPackaging = useMemo(() => {
    if (!search) return packaging.slice(0, 5);
    return packaging.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);
  }, [packaging, search]);

  const filteredClients = useMemo(() => {
    if (!search) return clients.slice(0, 5);
    return clients.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);
  }, [clients, search]);

  const hasResults = filteredIngredients.length > 0 || 
    filteredRecipes.length > 0 || 
    filteredProducts.length > 0 || 
    filteredDecorations.length > 0 || 
    filteredPackaging.length > 0 ||
    filteredClients.length > 0;

  const handleSelect = (page: string) => {
    onOpenChange(false);
    onNavigate?.(page);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Buscar ingredientes, receitas, produtos..." 
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
        )}

        {filteredRecipes.length > 0 && (
          <>
            {filteredProducts.length > 0 && <CommandSeparator />}
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

        {filteredIngredients.length > 0 && (
          <>
            {(filteredProducts.length > 0 || filteredRecipes.length > 0) && <CommandSeparator />}
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
                  {ingredient.categories && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {ingredient.categories.name}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredDecorations.length > 0 && (
          <>
            <CommandSeparator />
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
            <CommandSeparator />
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
            <CommandSeparator />
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
