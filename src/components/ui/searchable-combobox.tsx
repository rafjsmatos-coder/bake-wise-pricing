import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ComboboxItem {
  id: string;
  name: string;
  description?: string;
}

interface SearchableComboboxProps {
  items: ComboboxItem[];
  selectedIds?: string[];
  onSelect: (id: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  title?: string;
  className?: string;
}

export function SearchableCombobox({
  items,
  selectedIds = [],
  onSelect,
  placeholder = "Selecionar item",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum item encontrado",
  title = "Selecionar",
  className,
}: SearchableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const availableItems = items.filter(item => !selectedIds.includes(item.id));

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const CommandContent = () => (
    <Command className="w-full">
      <CommandInput placeholder={searchPlaceholder} className="h-12" />
      <CommandList className="max-h-[300px]">
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        <CommandGroup>
          {availableItems.map((item) => (
            <CommandItem
              key={item.id}
              value={item.name}
              onSelect={() => handleSelect(item.id)}
              className="flex flex-col items-start py-3 min-h-[56px] cursor-pointer"
            >
              <span className="font-medium">{item.name}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full sm:w-[200px] min-h-[44px] justify-between", className)}
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 shrink-0 opacity-50" />
              <span className="truncate">{placeholder}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="p-2">
            <CommandContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full sm:w-[200px] min-h-[44px] justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">{placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <CommandContent />
      </PopoverContent>
    </Popover>
  );
}
