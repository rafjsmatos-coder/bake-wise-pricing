

## Plano: Detecção de nova versão do PWA com aviso ao usuário

### Problema atual

Com `registerType: "autoUpdate"`, o `vite-plugin-pwa` injeta automaticamente um script que chama `skipWaiting` silenciosamente. Porém, na prática, o navegador/PWA precisa de múltiplos ciclos de fechamento/abertura porque o novo service worker só assume controle após o antigo ser liberado, e os assets cacheados continuam servindo a versão antiga até um hard reload.

### Solução

Mudar de `autoUpdate` para `prompt` -- isso permite **detectar** quando um novo SW está disponível e **mostrar um banner** ao usuário com botão "Atualizar", que executa `skipWaiting` + `window.location.reload()`.

### Mudanças

**1. `vite.config.ts`** -- Mudar `registerType` de `"autoUpdate"` para `"prompt"`

**2. Criar `src/components/pwa/UpdatePrompt.tsx`** -- Componente que:
- Usa `useRegisterSW` do `virtual:pwa-register/react` (já incluído no vite-plugin-pwa)
- Detecta `needRefresh` (nova versão disponível)
- Mostra um banner fixo no topo/bottom: "Nova versão disponível" + botão "Atualizar"
- Ao clicar, chama `updateServiceWorker(true)` que executa skipWaiting + reload
- Botão "Depois" para fechar o banner temporariamente
- Estilizado com Tailwind, consistente com o tema do app

**3. `src/App.tsx`** -- Adicionar `<UpdatePrompt />` no nível raiz do app (fora das rotas)

### Detalhes técnicos

```typescript
// src/components/pwa/UpdatePrompt.tsx
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // Poll a cada 60s para detectar novas versões
      if (r) {
        setInterval(() => r.update(), 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 z-[100] bg-card border rounded-lg shadow-lg p-4 flex items-center gap-3">
      <p className="text-sm flex-1">Nova versão disponível!</p>
      <button onClick={() => setNeedRefresh(false)}>Depois</button>
      <button onClick={() => updateServiceWorker(true)}>Atualizar</button>
    </div>
  );
}
```

O `useRegisterSW` é provido pelo `vite-plugin-pwa` via `virtual:pwa-register/react` -- não precisa instalar nada extra. O polling a cada 60s garante que mesmo sem navegar, o app detecte a nova versão.

### Arquivos alterados

| Arquivo | Ação |
|---------|------|
| `vite.config.ts` | Mudar `registerType` para `"prompt"` |
| `src/components/pwa/UpdatePrompt.tsx` | Criar componente de aviso |
| `src/App.tsx` | Montar `<UpdatePrompt />` |

### Como testar

1. Publicar o app
2. Abrir no PWA instalado
3. Fazer qualquer mudança e publicar novamente
4. Aguardar até 60s -- o banner "Nova versão disponível" deve aparecer
5. Clicar "Atualizar" -- o app recarrega com a nova versão
6. Não precisa mais fechar/abrir múltiplas vezes

### Garantias

- Login/sessão não são afetados (o reload preserva a sessão do Supabase via localStorage)
- Não atualiza automaticamente -- o usuário decide quando
- Funciona tanto no navegador quanto no PWA instalado

