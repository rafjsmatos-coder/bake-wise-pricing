import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import precibakeLogo from '@/assets/precibake-logo.jpeg';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={precibakeLogo} alt="PreciBake" className="h-10 object-contain" />
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
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-3xl">Política de Privacidade</CardTitle>
            <p className="text-muted-foreground mt-2">
              Última atualização: Janeiro de 2026
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Informações que Coletamos</h2>
              <p className="text-muted-foreground mb-2">
                Coletamos as seguintes informações quando você utiliza o PreciBake:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><strong>Dados de cadastro:</strong> Nome, endereço de e-mail e senha (criptografada)</li>
                <li><strong>Dados de perfil:</strong> Nome do negócio, telefone, endereço (opcionais)</li>
                <li><strong>Dados de uso:</strong> Ingredientes, receitas, produtos e configurações cadastradas</li>
                <li><strong>Dados de pagamento:</strong> Processados de forma segura pelo Stripe (não armazenamos dados de cartão)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Como Usamos suas Informações</h2>
              <p className="text-muted-foreground mb-2">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Fornecer e manter nossos serviços</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar comunicações importantes sobre sua conta</li>
                <li>Melhorar a experiência do usuário e desenvolver novas funcionalidades</li>
                <li>Responder a solicitações de suporte</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground mb-2">
                Compartilhamos dados apenas com:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><strong>Stripe:</strong> Para processamento seguro de pagamentos</li>
                <li><strong>Provedores de infraestrutura:</strong> Para hospedagem e armazenamento de dados</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                <strong>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Segurança dos Dados</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
                <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
                <li>Criptografia de senhas</li>
                <li>Controle de acesso baseado em autenticação</li>
                <li>Backups regulares</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Seus Direitos</h2>
              <p className="text-muted-foreground mb-2">
                Você tem direito a:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><strong>Acessar:</strong> Solicitar uma cópia dos seus dados pessoais</li>
                <li><strong>Corrigir:</strong> Atualizar informações incorretas ou desatualizadas</li>
                <li><strong>Excluir:</strong> Solicitar a exclusão da sua conta e dados</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Para exercer esses direitos, entre em contato através da página de Suporte.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Retenção de Dados</h2>
              <p className="text-muted-foreground">
                Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da conta, 
                seus dados são removidos em até 30 dias, exceto quando a retenção for necessária 
                para cumprir obrigações legais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
              <p className="text-muted-foreground">
                Utilizamos cookies essenciais para manter sua sessão de login ativa. 
                Não utilizamos cookies de rastreamento ou publicidade.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Alterações nesta Política</h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta política periodicamente. Notificaremos sobre alterações 
                significativas por e-mail ou através de um aviso em nosso site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contato</h2>
              <p className="text-muted-foreground">
                Para dúvidas sobre esta política de privacidade ou sobre o tratamento dos seus dados, 
                entre em contato através da página de Suporte dentro do sistema.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
