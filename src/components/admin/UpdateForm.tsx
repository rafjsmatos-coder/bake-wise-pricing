import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import type { SystemUpdate } from '@/hooks/useSystemUpdates';

interface UpdateFormProps {
  update?: SystemUpdate | null;
  onSave: (data: { title: string; content: string; type: string; is_published: boolean }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UpdateForm({ update, onSave, onCancel, isLoading }: UpdateFormProps) {
  const [title, setTitle] = useState(update?.title || '');
  const [content, setContent] = useState(update?.content || '');
  const [type, setType] = useState<string>(update?.type || 'improvement');
  const [isPublished, setIsPublished] = useState(update?.is_published || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), type, is_published: isPublished });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">
          {update ? 'Editar Atualização' : 'Nova Atualização'}
        </h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Nova funcionalidade de duplicação de receitas"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feature">⭐ Novidade</SelectItem>
              <SelectItem value="improvement">📈 Melhoria</SelectItem>
              <SelectItem value="fix">🔧 Correção</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Descreva a atualização em detalhes..."
            rows={6}
            required
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Switch
            id="published"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
          <Label htmlFor="published" className="cursor-pointer">
            {isPublished ? 'Publicado - visível para os usuários' : 'Rascunho - não visível'}
          </Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !title.trim() || !content.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {update ? 'Salvar Alterações' : 'Criar Atualização'}
        </Button>
      </div>
    </form>
  );
}
