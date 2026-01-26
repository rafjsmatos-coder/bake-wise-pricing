
# Correção Crítica: Domínio precibake.com.br Bloqueado pelo CORS

## Problema Identificado

O site em `precibake.com.br` está mostrando "período de teste expirou" porque o **domínio personalizado não está configurado na lista de origens CORS permitidas**.

### Diagnóstico Técnico

1. **Arquivo problemático**: `supabase/functions/_shared/cors.ts`

2. **Lista atual de origens permitidas**:
   ```typescript
   const ALLOWED_ORIGINS = [
     'https://bake-wise-pricing.lovable.app',
     'https://id-preview--c0021bd6-83d4-45de-aa94-e9d690844ef1.lovable.app',
     'http://localhost:5173',
     'http://localhost:3000',
   ];
   ```

3. **O que acontece**:
   - Usuário acessa `precibake.com.br`
   - Frontend tenta chamar `check-subscription`
   - Edge function recebe origem `https://precibake.com.br`
   - CORS verifica: domínio NÃO está na lista e NÃO termina com `.lovable.app` ou `.lovableproject.com`
   - Edge function retorna com header CORS apontando para origem errada
   - Browser bloqueia a resposta (CORS error)
   - `useSubscription.tsx` captura o erro e define `status: 'expired'`
   - SubscriptionPaywall é exibido

4. **Verificação do banco de dados**: A assinatura está correta:
   - Usuário: Pamella Izadora (p.souza1794@gmail.com)
   - Status: `trial`
   - Trial End: `2026-03-09` (43 dias restantes)
   - O problema é puramente de CORS, não de dados

---

## Solução

Adicionar `precibake.com.br` (com e sem `www`) à lista de origens permitidas.

### Arquivo a Modificar

**`supabase/functions/_shared/cors.ts`**

```typescript
const ALLOWED_ORIGINS = [
  'https://bake-wise-pricing.lovable.app',
  'https://id-preview--c0021bd6-83d4-45de-aa94-e9d690844ef1.lovable.app',
  'https://precibake.com.br',      // ADICIONAR
  'https://www.precibake.com.br',  // ADICIONAR
  'http://localhost:5173',
  'http://localhost:3000',
];
```

---

## Fluxo Corrigido

```text
Antes (bloqueado):
┌─────────────────┐    ┌────────────────────┐    ┌─────────────────┐
│ precibake.com.br│───>│ check-subscription │───>│ CORS BLOCKED    │
└─────────────────┘    └────────────────────┘    │ status: expired │
                                                  └─────────────────┘

Depois (funcionando):
┌─────────────────┐    ┌────────────────────┐    ┌─────────────────┐
│ precibake.com.br│───>│ check-subscription │───>│ CORS OK         │
└─────────────────┘    └────────────────────┘    │ status: trial   │
                                                  │ days: 43        │
                                                  └─────────────────┘
```

---

## Resumo da Implementação

| Ação | Arquivo | Alteração |
|------|---------|-----------|
| Adicionar domínios | `supabase/functions/_shared/cors.ts` | Incluir `precibake.com.br` e `www.precibake.com.br` |
| Reimplantar | Edge Functions | Todas as funções usam este arquivo compartilhado |

---

## Edge Functions Afetadas

Todas as edge functions que usam `cors.ts` serão corrigidas:
- `check-subscription`
- `create-checkout`
- `customer-portal`
- `stripe-webhook`
- `admin-users`
- `check-admin-role`

---

## Verificação Pós-Correção

1. Acessar `precibake.com.br` logado
2. Verificar que o Dashboard carrega normalmente
3. Confirmar que o banner mostra "Trial: X dias restantes"
4. Testar criação de checkout (botão Assinar Premium)
