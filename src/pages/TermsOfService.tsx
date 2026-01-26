import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Cake, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <Cake className="w-5 h-5 text-accent" />
              </div>
              <span className="font-bold text-xl text-foreground">PreciBake</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-3xl">Termos de Uso</CardTitle>
            <p className="text-muted-foreground mt-2">
              Última atualização: Janeiro de 2026
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground">
                Ao acessar ou usar o PreciBake, você concorda em cumprir estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground">
                O PreciBake é uma plataforma de gestão e precificação para confeitarias e 
                negócios de alimentos artesanais. O serviço permite:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
                <li>Cadastrar e gerenciar ingredientes com controle de custos</li>
                <li>Criar receitas com cálculo automático de custos</li>
                <li>Montar produtos combinando receitas, decorações e embalagens</li>
                <li>Calcular preços de venda com base em margens de lucro</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Conta de Usuário</h2>
              <p className="text-muted-foreground mb-2">
                Para usar o PreciBake, você deve:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Ter pelo menos 18 anos de idade</li>
                <li>Fornecer informações precisas e completas ao se registrar</li>
                <li>Manter a confidencialidade da sua senha</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Você é responsável por todas as atividades que ocorrem em sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Período de Teste e Assinatura</h2>
              <p className="text-muted-foreground mb-2">
                <strong>Período de Teste:</strong> Oferecemos 14 dias de teste gratuito com acesso 
                completo a todas as funcionalidades. Não é necessário cartão de crédito para iniciar o teste.
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Assinatura Premium:</strong> Após o período de teste, é necessário assinar 
                o plano Premium para continuar usando o serviço. O valor atual é de R$ 49,90/mês.
              </p>
              <p className="text-muted-foreground">
                <strong>Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento. 
                O acesso continua até o final do período pago.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Pagamentos</h2>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Os pagamentos são processados de forma segura pelo Stripe</li>
                <li>As cobranças são recorrentes e mensais</li>
                <li>Não oferecemos reembolso para períodos parciais</li>
                <li>Você pode atualizar seu método de pagamento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Uso Aceitável</h2>
              <p className="text-muted-foreground mb-2">
                Você concorda em não:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Violar leis ou regulamentos aplicáveis</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Interferir no funcionamento do serviço</li>
                <li>Usar o serviço para fins ilegais ou fraudulentos</li>
                <li>Compartilhar sua conta com terceiros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Propriedade Intelectual</h2>
              <p className="text-muted-foreground">
                O PreciBake e todo o seu conteúdo, recursos e funcionalidades são de propriedade 
                exclusiva da empresa e protegidos por leis de direitos autorais. Você não pode 
                copiar, modificar, distribuir ou criar obras derivadas sem autorização.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Seus Dados</h2>
              <p className="text-muted-foreground">
                Você mantém a propriedade de todos os dados que cadastra no sistema (ingredientes, 
                receitas, produtos, etc.). Podemos usar esses dados apenas para fornecer o serviço 
                e conforme descrito em nossa Política de Privacidade.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground">
                O PreciBake é fornecido "como está". Não garantimos que o serviço será ininterrupto 
                ou livre de erros. Os cálculos de custos e preços são ferramentas de apoio à decisão 
                e você é responsável pelas decisões finais de precificação do seu negócio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Modificações do Serviço</h2>
              <p className="text-muted-foreground">
                Reservamo-nos o direito de modificar ou descontinuar o serviço (ou qualquer parte dele) 
                a qualquer momento, com ou sem aviso prévio. Não seremos responsáveis perante você ou 
                terceiros por qualquer modificação, suspensão ou descontinuação do serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Alterações nos Termos</h2>
              <p className="text-muted-foreground">
                Podemos revisar estes termos a qualquer momento. Se fizermos alterações materiais, 
                notificaremos você por e-mail ou por meio de um aviso em nosso site. O uso continuado 
                do serviço após as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Lei Aplicável</h2>
              <p className="text-muted-foreground">
                Estes termos são regidos pelas leis da República Federativa do Brasil. 
                Qualquer disputa será resolvida nos tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contato</h2>
              <p className="text-muted-foreground">
                Para dúvidas sobre estes Termos de Uso, entre em contato através da página de Suporte 
                dentro do sistema.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
