
Objetivo
- Eliminar o “carregamento infinito” (spinner) ao atualizar com F5 (principalmente no domínio precibake.com.br).
- Garantir que, mesmo se houver falha/atraso de rede na autenticação ou na verificação de assinatura, a UI nunca fique travada para sempre.
- Ajustar o banner de trial para realmente ficar “mobile-first” (botão e layout sem cortar).

O que eu observei no código atual (causa provável)
1) Há um caminho em src/hooks/useSubscription.tsx que pode deixar o estado travado em isLoading=true:
   - O estado inicial do provider começa com isLoading: true.
   - Quando authLoading vira false e user existe, checkSubscription() roda.
   - Se o token vier null (getFreshAccessToken() falhar), o código faz:
     console.error('[useSubscription] No token available');
     return;
     E NÃO seta isLoading=false nesse retorno.
   - Resultado: o Dashboard fica preso no spinner (porque Dashboard.tsx renderiza loader quando isLoading é true).

2) Há também risco de travar no loader do AuthProvider (src/hooks/useAuth.tsx) se getSession falhar/travar:
   - O useAuth não tem try/catch/finally nem timeout de segurança; se por algum motivo getSession não resolver e nenhum evento de auth ocorrer, loading pode ficar true para sempre.

Do I know what the issue is?
- Sim, parcialmente: o bug mais forte e consistente é o “early return” em useSubscription quando token é null sem finalizar isLoading.
- Há um segundo risco (menos comum, mas possível) no useAuth: ausência de tratamento de erro/timeout pode prender loading=true.

Estratégia de correção (sem depender de “sorte” do tempo de rede)
A ideia é transformar Auth + Subscription em um “boot flow” resiliente:
- Nenhuma verificação pode terminar com “return” sem garantir que o estado global saia de loading ou assuma um estado de erro/retry.
- Em caso de falha, mostramos um estado de “erro com botão de tentar novamente”, e não um spinner infinito.

Plano de implementação (código)
1) Ajuste no AuthProvider (src/hooks/useAuth.tsx)
   1.1) Colocar a inicialização do getSession em um bloco com try/catch/finally
   - Garantir setLoading(false) no finally, mesmo se houver erro.
   - Logar um erro claro no console se getSession falhar.

   1.2) Adicionar um “failsafe timeout” (ex.: 2500–4000ms)
   - Se por algum motivo loading continuar true após esse tempo, forçar setLoading(false).
   - Motivo: impedir UX travada para sempre em ambientes específicos (browser/privacidade/rede).

   1.3) Evitar atualizações duplicadas e “flapping”
   - Usar um flag local (ex.: didInitRef) para garantir que o primeiro boot finalize de forma consistente.

2) Ajuste no SubscriptionProvider (src/hooks/useSubscription.tsx)
   2.1) Nunca retornar sem finalizar o loading
   - No caso “token não disponível”, antes do return:
     - setState(prev => ({ ...prev, isLoading: false, error: 'TOKEN_MISSING' }))
     - opcional: tentar um refresh adicional e, se falhar, fazer signOut para limpar sessão quebrada.

   2.2) Separar “loading bloqueante inicial” de “refresh em background”
   - Adicionar ao state:
     - initialized: boolean (ou hasCheckedOnce)
     - error: string | null
   - Regra:
     - No boot: initialized=false → Dashboard pode mostrar spinner.
     - Depois da primeira conclusão (sucesso ou erro): initialized=true → nunca mais spinner infinito; se der erro, mostrar tela de erro com Retry.

   2.3) Timeout da verificação de assinatura (failsafe)
   - Quando iniciar o check de assinatura no boot, iniciar um timer (ex.: 4000–6000ms).
   - Se o timer estourar, setState({ isLoading:false, initialized:true, error:'TIMEOUT' }).
   - O usuário vê uma tela “Não foi possível validar sua assinatura agora” com botão “Tentar novamente”.

   2.4) Manter comportamento atual de não “piscar” a UI em polling
   - O polling de 60s deve continuar sem setar isLoading=true (para não “piscar” a tela).
   - Apenas atualiza status/canAccess silenciosamente.
   - Mas se o polling falhar, não deve derrubar o usuário para paywall automaticamente; apenas registrar erro e tentar novamente depois.

3) Ajuste no Dashboard (src/pages/Dashboard.tsx)
   3.1) Tratar explicitamente estados: loading vs erro vs paywall vs ok
   - Consumir do useSubscription também:
     - error
     - initialized (ou hasCheckedOnce)
     - checkSubscription (para botão de retry)
   - Fluxo sugerido:
     - Se isLoading && !initialized → spinner
     - Se error != null → “Tela de erro” com:
       - Botão “Tentar novamente” (chama checkSubscription)
       - Botão “Sair” (signOut) opcional
     - Se initialized && !canAccess → paywall
     - Se canAccess → dashboard normal

   3.2) Isso evita o pior caso: “ficar girando para sempre”.

4) Ajustes finais no TrialBanner (src/components/subscription/TrialBanner.tsx)
   - O layout já está melhor, mas para garantir em telas pequenas:
     - Deixar o botão como w-full no mobile e sm:w-auto no desktop.
     - Garantir que o texto possa quebrar linha (sem cortar) usando classes como break-words/leading-normal se necessário.
   - Validar no modo mobile (320–390px) e no desktop.

5) Check geral (rápido) de pontos que causam “loading infinito”
   - Procurar outros hooks/providers com padrão “return;” antes de setar estado final (loading false / erro).
   - Especialmente em hooks que rodam no boot e bloqueiam tela (auth, role, subscription).

Critérios de aceite (o que deve acontecer depois)
- Logado:
  - Abrir /dashboard e apertar F5 → no máximo alguns segundos e o dashboard aparece (sem spinner eterno).
  - Se a verificação falhar por rede, aparece uma tela de erro com “Tentar novamente”, não um spinner infinito.
- Deslogado:
  - F5 em / ou /dashboard → landing page aparece normalmente (sem spinner eterno).
- Mobile:
  - Banner de trial não corta texto e o botão não fica espremido (fica empilhado e clicável).

Notas importantes (produção vs preview)
- O print que você mandou é do domínio precibake.com.br (produção). Depois de aplicar essas correções no projeto, é necessário publicar para que o domínio público receba o código atualizado (senão você continua vendo o bug antigo em produção).

Implementação (o que eu vou editar)
- src/hooks/useAuth.tsx (resiliência + timeout + try/catch)
- src/hooks/useSubscription.tsx (state machine: initialized/error + finalizar loading em todos os caminhos + timeout)
- src/pages/Dashboard.tsx (UI para error/retry + lógica de render)
- src/components/subscription/TrialBanner.tsx (ajustes finais de responsividade)

Riscos e mitigação
- Risco: Em um cenário raro de auth instável, o timeout do AuthProvider pode “destravar” mostrando landing enquanto a sessão ainda está recuperando.
  - Mitigação: o user pode logar normalmente; e ao recuperar sessão, a UI corrige; e teremos botão de retry na assinatura.
