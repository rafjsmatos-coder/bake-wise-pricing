import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { usePackaging } from '@/hooks/usePackaging';
import { Plus, X, Check, ChevronsUpDown, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/unit-conversion';

export interface SelectedPackaging {
  packaging_id: string;
  quantity: number;
  name: string;
}

interface PackagingSelectorProps {
  selectedPackaging: SelectedPackaging[];
  onPackagingChange: (packaging: SelectedPackaging[]) => void;
  linkedIds?: string[];
}

export function PackagingSelector({
  selectedPackaging,
  onPackagingChange,
  linkedIds,
}: PackagingSelectorProps) {
  const hasLinked = linkedIds && linkedIds.length > 0;
  const { packagingItems } = usePackaging(hasLinked ? { includeInactive: true } : undefined);
  
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof packagingItems[0] | null>(null);
  const [quantity, setQuantity] = useState<string>('');

  const availablePackaging = useMemo(() => {
    const selectedIds = new Set(selectedPackaging.map(p => p.packaging_id));
    return packagingItems.filter(p => !selectedIds.has(p.id) && (p as any).is_active !== false);
  }, [packagingItems, selectedPackaging]);

  const handleSelectPackaging = (pkg: typeof packagingItems[0]) => {
    setSelectedItem(pkg);
    setOpen(false);
  };

  const handleAddPackaging = () => {
    if (!selectedItem || !quantity || Number(quantity) <= 0) return;

    const newPackaging: SelectedPackaging = {
      packaging_id: selectedItem.id,
      quantity: Number(quantity),
      name: selectedItem.name,
    };

    onPackagingChange([...selectedPackaging, newPackaging]);
    setSelectedItem(null);
    setQuantity('');
  };

  const handleRemovePackaging = (packagingId: string) => {
    onPackagingChange(selectedPackaging.filter(p => p.packaging_id !== packagingId));
  };

  const handleUpdateQuantity = (packagingId: string, newQuantity: number) => {
    onPackagingChange(
      selectedPackaging.map(p => 
        p.packaging_id === packagingId ? { ...p, quantity: newQuantity } : p
      )
    );
  };

  const getItemCost = (item: SelectedPackaging): number | null => {
    const pkg = packagingItems.find(p => p.id === item.packaging_id);
    if (!pkg) return null;
    const costPerUnit = Number(pkg.purchase_price) / Number(pkg.package_quantity);
    return item.quantity * costPerUnit;
  };

  const CommandContent = (
    <Command>
      <CommandInput placeholder="Buscar embalagem..." />
      <CommandList>
        <CommandEmpty>Nenhuma embalagem encontrada.</CommandEmpty>
        <CommandGroup>
          {availablePackaging.map((pkg) => {
            const costPerUnit = Number(pkg.purchase_price) / Number(pkg.package_quantity);
            return (
               <CommandItem
                 key={pkg.id}
                 value={pkg.name}
                 onSelect={() => handleSelectPackaging(pkg)}
                 className="py-3 aria-selected:bg-accent"
               >
                 <Check
                   className={cn(
                     "mr-2 h-4 w-4",
                     selectedItem?.id === pkg.id ? "opacity-100" : "opacity-0"
                   )}
                 />
                 <div className="flex flex-col flex-1">
                   <span className="aria-selected:text-accent-foreground">{pkg.name}</span>
                   <span className="text-xs text-muted-foreground aria-selected:text-accent-foreground/90">
                     {pkg.dimensions || pkg.category?.name || 'Sem categoria'} · {formatCurrency(costPerUnit)}/un
                   </span>
                 </div>
               </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Embalagens</Label>

      {/* Add Packaging Section */}
      <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Packaging Selector */}
          <div className="sm:col-span-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between min-h-[44px]"
                >
                  {selectedItem ? (
                    <span className="truncate">{selectedItem.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Selecionar embalagem...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[300px] p-0">
                {CommandContent}
              </PopoverContent>
            </Popover>
          </div>

          {/* Quantity */}
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              step="1"
              min="1"
              placeholder="Qtd"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={!selectedItem}
              autoComplete="off"
              className="flex-1 min-h-[44px]"
            />
            <span className="text-sm text-muted-foreground">un</span>
          </div>

          {/* Add Button */}
          <Button
            type="button"
            onClick={handleAddPackaging}
            disabled={!selectedItem || !quantity || Number(quantity) <= 0}
            className="w-full sm:w-auto min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Selected Packaging List */}
      {selectedPackaging.length > 0 ? (
        <div className="space-y-2">
          {selectedPackaging.map((item) => {
            const itemCost = getItemCost(item);
            return (
              <div
                key={item.packaging_id}
                className="flex flex-wrap items-center gap-2 p-3 border border-border rounded-lg bg-card"
              >
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{item.name}</span>
                    {(packagingItems.find(p => p.id === item.packaging_id) as any)?.is_active === false && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">(Inativo)</span>
                    )}
                  </div>
                  {itemCost != null && (
                    <p className="text-xs text-primary font-medium ml-6">
                      {formatCurrency(itemCost)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.packaging_id, Number(e.target.value))}
                    autoComplete="off"
                    className="w-16 sm:w-20 min-h-[44px]"
                  />
                  <span className="text-sm text-muted-foreground">un</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePackaging(item.packaging_id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive min-h-[44px] min-w-[44px]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
          <Box className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma embalagem adicionada</p>
          <p className="text-sm">Selecione embalagens acima para adicionar ao produto</p>
        </div>
      )}
    </div>
  );
}