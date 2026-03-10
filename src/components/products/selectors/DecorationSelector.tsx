import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDecorations } from '@/hooks/useDecorations';
import { Plus, X, Check, ChevronsUpDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, convertUnit, getCostPerUnit } from '@/lib/unit-conversion';
import type { Database } from '@/integrations/supabase/types';

type MeasurementUnit = Database['public']['Enums']['measurement_unit'];

const UNITS = [
  { value: 'un', label: 'Unidade(s)' },
  { value: 'kg', label: 'Quilograma(s)' },
  { value: 'g', label: 'Grama(s)' },
  { value: 'L', label: 'Litro(s)' },
  { value: 'ml', label: 'Mililitro(s)' },
  { value: 'm', label: 'Metro(s)' },
  { value: 'cm', label: 'Centímetro(s)' },
] as const;

export interface SelectedDecoration {
  decoration_id: string;
  quantity: number;
  unit: MeasurementUnit;
  name: string;
}

interface DecorationSelectorProps {
  selectedDecorations: SelectedDecoration[];
  onDecorationsChange: (decorations: SelectedDecoration[]) => void;
  linkedIds?: string[];
}

export function DecorationSelector({
  selectedDecorations,
  onDecorationsChange,
  linkedIds,
}: DecorationSelectorProps) {
  const hasLinked = linkedIds && linkedIds.length > 0;
  const { decorations } = useDecorations(hasLinked ? { includeInactive: true } : undefined);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [selectedDecoration, setSelectedDecoration] = useState<typeof decorations[0] | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<MeasurementUnit>('un');

  const availableDecorations = useMemo(() => {
    const selectedIds = new Set(selectedDecorations.map(d => d.decoration_id));
    return decorations.filter(d => !selectedIds.has(d.id) && d.is_active !== false);
  }, [decorations, selectedDecorations]);

  const handleSelectDecoration = (decoration: typeof decorations[0]) => {
    setSelectedDecoration(decoration);
    setUnit(decoration.unit);
    setOpen(false);
  };

  const handleAddDecoration = () => {
    if (!selectedDecoration || !quantity || Number(quantity) <= 0) return;

    const newDecoration: SelectedDecoration = {
      decoration_id: selectedDecoration.id,
      quantity: Number(quantity),
      unit,
      name: selectedDecoration.name,
    };

    onDecorationsChange([...selectedDecorations, newDecoration]);
    setSelectedDecoration(null);
    setQuantity('');
  };

  const handleRemoveDecoration = (decorationId: string) => {
    onDecorationsChange(selectedDecorations.filter(d => d.decoration_id !== decorationId));
  };

  const handleUpdateQuantity = (decorationId: string, newQuantity: number) => {
    onDecorationsChange(
      selectedDecorations.map(d => 
        d.decoration_id === decorationId ? { ...d, quantity: newQuantity } : d
      )
    );
  };

  const handleUpdateUnit = (decorationId: string, newUnit: MeasurementUnit) => {
    onDecorationsChange(
      selectedDecorations.map(d => 
        d.decoration_id === decorationId ? { ...d, unit: newUnit } : d
      )
    );
  };

  const getItemCost = (item: SelectedDecoration): number | null => {
    const dec = decorations.find(d => d.id === item.decoration_id);
    if (!dec) return null;
    const costPerUnit = Number(dec.purchase_price) / Number(dec.package_quantity);
    const convertedQty = convertUnit(item.quantity, item.unit, dec.unit) ?? item.quantity;
    return convertedQty * costPerUnit;
  };

  const CommandContent = (
    <Command>
      <CommandInput placeholder="Buscar decoração..." />
      <CommandList>
        <CommandEmpty>Nenhuma decoração encontrada.</CommandEmpty>
        <CommandGroup>
          {availableDecorations.map((decoration) => {
            const costInfo = getCostPerUnit(
              Number(decoration.purchase_price),
              Number(decoration.package_quantity),
              decoration.unit
            );
            return (
              <CommandItem
                key={decoration.id}
                value={decoration.name}
                onSelect={() => handleSelectDecoration(decoration)}
                className="py-3"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedDecoration?.id === decoration.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col flex-1">
                  <span>{decoration.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {decoration.decoration_categories?.name || 'Sem categoria'} · {costInfo.formatted}
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
      <Label className="text-base font-medium">Decorações</Label>

      {/* Add Decoration Section */}
      <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Decoration Selector */}
          <div className="sm:col-span-1">
            {isMobile ? (
              <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between min-h-[44px]"
                  >
                    {selectedDecoration ? (
                      <span className="truncate">{selectedDecoration.name}</span>
                    ) : (
                      <span className="text-muted-foreground">Selecionar decoração...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="p-4">
                  <div className="mt-4">
                    {CommandContent}
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between min-h-[44px]"
                  >
                    {selectedDecoration ? (
                      <span className="truncate">{selectedDecoration.name}</span>
                    ) : (
                      <span className="text-muted-foreground">Selecionar decoração...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  {CommandContent}
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Quantity */}
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Qtd"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={!selectedDecoration}
              autoComplete="off"
              className="flex-1 min-h-[44px]"
            />
            <Select
              value={unit}
              onValueChange={(value) => setUnit(value as MeasurementUnit)}
              disabled={!selectedDecoration}
            >
              <SelectTrigger className="w-20 min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[40vh]">
                {UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value} className="py-3">
                    {u.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Button */}
          <Button
            type="button"
            onClick={handleAddDecoration}
            disabled={!selectedDecoration || !quantity || Number(quantity) <= 0}
            className="w-full sm:w-auto min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Selected Decorations List */}
      {selectedDecorations.length > 0 ? (
        <div className="space-y-2">
          {selectedDecorations.map((item) => {
            const itemCost = getItemCost(item);
            return (
              <div
                key={item.decoration_id}
                className="flex flex-wrap items-center gap-2 p-3 border border-border rounded-lg bg-card"
              >
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{item.name}</span>
                    {decorations.find(d => d.id === item.decoration_id)?.is_active === false && (
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
                    step="0.01"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.decoration_id, Number(e.target.value))}
                    autoComplete="off"
                    className="w-16 sm:w-20 min-h-[44px]"
                  />
                  <Select
                    value={item.unit}
                    onValueChange={(value) => handleUpdateUnit(item.decoration_id, value as MeasurementUnit)}
                  >
                    <SelectTrigger className="w-16 sm:w-20 min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[40vh]">
                      {UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value} className="py-3">
                          {u.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDecoration(item.decoration_id)}
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
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma decoração adicionada</p>
          <p className="text-sm">Selecione decorações acima para adicionar ao produto</p>
        </div>
      )}
    </div>
  );
}