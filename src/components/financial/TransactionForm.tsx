import { useState, useEffect } from 'react';
import { TransactionFormData, FinancialTransaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/hooks/useFinancial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: FinancialTransaction | null;
  defaultType?: 'income' | 'expense';
  onSubmit: (data: TransactionFormData) => void;
  isLoading?: boolean;
}

export function TransactionForm({ open, onOpenChange, transaction, defaultType, onSubmit, isLoading }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(defaultType || 'income');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setCategory(transaction.category);
      setDescription(transaction.description);
      setAmountStr(String(transaction.amount).replace('.', ','));
      setDate(transaction.date);
    } else {
      setType(defaultType || 'income');
      setCategory('');
      setDescription('');
      setAmountStr('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transaction, open, defaultType]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (!category || !description || isNaN(amount) || amount <= 0) return;
    onSubmit({ type, category, description, amount, date });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[100dvh] overflow-y-auto overflow-x-hidden sm:max-h-[85vh]" style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => { setType(v as any); setCategory(''); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Entrada</SelectItem>
                <SelectItem value="expense">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a transação..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0,00"
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-base"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || !category || !description || !amountStr}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {transaction ? 'Salvar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
