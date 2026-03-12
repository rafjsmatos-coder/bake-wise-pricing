import { useState, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Eye, EyeOff, RotateCcw, Save, Loader2, Info } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { toast } from 'sonner';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

const AVAILABLE_VARIABLES = [
  { key: '{cliente}', label: 'Nome do cliente', example: 'Maria' },
  { key: '{itens}', label: 'Lista de itens', example: '• 1x Bolo de Chocolate - R$ 80,00\n• 2x Brigadeiro - R$ 10,00' },
  { key: '{total}', label: 'Resumo de valores', example: '\nTotal: R$ 100,00' },
  { key: '{entrega}', label: 'Data de entrega', example: '\nEntrega: 25/02/2026 às 14:00' },
  { key: '{data_entrega}', label: 'Data de entrega (texto)', example: '25/02/2026 às 14:00' },
  { key: '{observacoes}', label: 'Observações do pedido', example: '\nObservações: Sem glúten' },
];

const DEFAULT_TEMPLATES = {
  quote: `Olá {cliente}! Segue o orçamento do seu pedido:\n\n{itens}\n{total}{entrega}{observacoes}\n\nObrigado(a) pela preferência! 🎂`,
  confirmation: `Olá {cliente}! ✅\n\nSeu pedido foi *confirmado*!{entrega}\n\nObrigado(a) pela confiança! 🎂`,
  reminder: `Olá {cliente}! 😊\n\nLembrando que a entrega do seu pedido está marcada para *{data_entrega}*.\n\n{itens}\n\nAlguma dúvida, é só me chamar! 🎂`,
};

interface TemplateEditorProps {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  defaultValue: string;
}

function TemplateEditor({ title, description, value, onChange, onReset, defaultValue }: TemplateEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const previewText = useMemo(() => {
    let text = value;
    AVAILABLE_VARIABLES.forEach((v) => {
      text = text.split(v.key).join(v.example);
    });
    return text;
  }, [value]);

  const isDefault = value === defaultValue;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-8 px-2"
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
            <span className="text-xs">{showPreview ? 'Editar' : 'Preview'}</span>
          </Button>
          {!isDefault && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-2 text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Padrão</span>
            </Button>
          )}
        </div>
      </div>

      {showPreview ? (
        <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap break-words border border-border">
          {previewText}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="text-sm font-mono"
          placeholder="Digite o template da mensagem..."
        />
      )}
    </div>
  );
}

export function WhatsAppTemplatesSection() {
  const { settings, isLoading, updateSettings } = useUserSettings();
  const [quoteTemplate, setQuoteTemplate] = useState('');
  const [confirmationTemplate, setConfirmationTemplate] = useState('');
  const [reminderTemplate, setReminderTemplate] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state from settings
  if (settings && !initialized) {
    setQuoteTemplate(settings.whatsapp_quote_template || DEFAULT_TEMPLATES.quote);
    setConfirmationTemplate(settings.whatsapp_confirmation_template || DEFAULT_TEMPLATES.confirmation);
    setReminderTemplate(settings.whatsapp_reminder_template || DEFAULT_TEMPLATES.reminder);
    setInitialized(true);
  }

  const isDirty = initialized && settings && (
    quoteTemplate !== (settings.whatsapp_quote_template || DEFAULT_TEMPLATES.quote) ||
    confirmationTemplate !== (settings.whatsapp_confirmation_template || DEFAULT_TEMPLATES.confirmation) ||
    reminderTemplate !== (settings.whatsapp_reminder_template || DEFAULT_TEMPLATES.reminder)
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings.mutateAsync({
        whatsapp_quote_template: quoteTemplate,
        whatsapp_confirmation_template: confirmationTemplate,
        whatsapp_reminder_template: reminderTemplate,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mensagens do WhatsApp</h1>
        <p className="text-muted-foreground">
          Personalize os textos enviados aos seus clientes pelo WhatsApp.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Edite tranquilamente! Se algo der errado, use o botão "Padrão" para restaurar o texto original.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Variables reference */}
        <div className="p-4 bg-card border border-border rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Variáveis disponíveis</span>
            <HoverCard>
              <HoverCardTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">
                  Use estas variáveis no seu template. Elas serão substituídas pelos dados reais do pedido ao enviar a mensagem.
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_VARIABLES.map((v) => (
              <Badge key={v.key} variant="secondary" className="font-mono text-xs cursor-default">
                {v.key}
                <span className="ml-1.5 font-sans text-muted-foreground">— {v.label}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Quote template */}
        <div className="p-6 bg-card border border-border rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
              <MessageCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold">Templates de Mensagem</h2>
              <p className="text-sm text-muted-foreground">Edite cada tipo de mensagem abaixo</p>
            </div>
          </div>

          <div className="space-y-6 divide-y divide-border">
            <TemplateEditor
              title="📋 Orçamento"
              description="Enviado ao cliente com detalhes e valores do pedido"
              value={quoteTemplate}
              onChange={setQuoteTemplate}
              onReset={() => setQuoteTemplate(DEFAULT_TEMPLATES.quote)}
              defaultValue={DEFAULT_TEMPLATES.quote}
            />

            <div className="pt-6">
              <TemplateEditor
                title="✅ Confirmação"
                description="Enviado quando o pedido é confirmado"
                value={confirmationTemplate}
                onChange={setConfirmationTemplate}
                onReset={() => setConfirmationTemplate(DEFAULT_TEMPLATES.confirmation)}
                defaultValue={DEFAULT_TEMPLATES.confirmation}
              />
            </div>

            <div className="pt-6">
              <TemplateEditor
                title="🔔 Lembrete de Entrega"
                description="Enviado para lembrar o cliente sobre a entrega"
                value={reminderTemplate}
                onChange={setReminderTemplate}
                onReset={() => setReminderTemplate(DEFAULT_TEMPLATES.reminder)}
                defaultValue={DEFAULT_TEMPLATES.reminder}
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Templates
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
