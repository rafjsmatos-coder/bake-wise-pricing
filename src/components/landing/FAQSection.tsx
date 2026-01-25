import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: 'Posso cancelar quando quiser?',
      answer: 'Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento diretamente pelo sistema, sem burocracia.'
    },
    {
      question: 'Quais são as formas de pagamento?',
      answer: 'Aceitamos cartão de crédito (todas as bandeiras) e boleto bancário. O pagamento é processado de forma segura pelo Stripe.'
    },
    {
      question: 'Funciona pra quem vende sob encomenda?',
      answer: 'Sim! O sistema foi feito pensando em quem trabalha com encomendas. Você cadastra suas receitas uma vez e usa para precificar cada pedido.'
    },
    {
      question: 'Preciso cadastrar tudo manual?',
      answer: 'Os ingredientes e receitas precisam ser cadastrados por você, mas isso é feito uma única vez. Depois, o sistema calcula tudo automaticamente.'
    },
    {
      question: 'Serve para iniciantes?',
      answer: 'Com certeza! O sistema é simples e intuitivo. Temos um tour guiado que te ensina a usar todas as funcionalidades passo a passo.'
    },
    {
      question: 'Como funciona o período de teste?',
      answer: 'Você tem 14 dias para testar todas as funcionalidades sem pagar nada e sem precisar cadastrar cartão. Se gostar, assina. Se não, não paga nada.'
    },
    {
      question: 'Posso usar no celular?',
      answer: 'Sim! O sistema é totalmente responsivo e funciona perfeitamente em celulares, tablets e computadores.'
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Tire suas dúvidas antes de começar
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-background border border-border rounded-lg px-4"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
