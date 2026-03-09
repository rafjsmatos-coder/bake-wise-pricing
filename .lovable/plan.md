

# Diagnóstico: App fora do ar em produção

## Situação

- **Preview (Lovable)**: Funcionando normalmente — os logs mostram o app rodando sem erros de `supabaseUrl`.
- **Produção (precibake.com.br)**: Erro `supabaseUrl is required` — tela branca.
- **`.env`**: Contém os valores corretos (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`).
- **`client.ts`**: Não foi modificado — está correto.

## Causa raiz

O erro ocorre porque o build publicado em produção não tem as variáveis de ambiente embutidas. Isso provavelmente aconteceu porque a última alteração (fix do import do Resend na edge function) causou uma falha no deploy que impediu as env vars de serem injetadas no build de produção.

## Plano de resolução

### Ação única: Republicar o projeto

1. **Publicar novamente** o projeto pelo Lovable para que o build de produção seja regenerado com as variáveis de ambiente corretas.
2. Não é necessária nenhuma alteração de código — o preview já funciona.

### Se a republicação não resolver

Podemos adicionar uma proteção no `client.ts` com fallback, mas isso **não deve ser necessário** pois o Lovable Cloud injeta automaticamente as variáveis no build.

### Nota importante

Não é possível editar `src/integrations/supabase/client.ts` (arquivo auto-gerado). A solução correta é garantir que o build de produção receba as env vars, o que acontece automaticamente ao republicar.

**Ação necessária do usuário**: Clicar em "Publish" no Lovable para republicar o projeto.

