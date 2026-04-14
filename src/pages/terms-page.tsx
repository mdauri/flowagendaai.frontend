import { Link } from "react-router-dom";

import { Card } from "@/components/landing/flow/card";
import { compositionPatterns, semanticTokens } from "@/design-system";

const updatedAt = "27 de março de 2026";

const sections = [
  {
    title: "1. Aceitação dos termos",
    content: [
      "Ao acessar, utilizar, contratar ou integrar o Agendoro, o usuário declara que leu, compreendeu e concorda com estes Termos de Uso e com a Política de Privacidade aplicável.",
      "Se o usuário estiver agindo em nome de uma empresa, declara possuir poderes para vincular a respectiva organização a estes termos.",
      "Caso não concorde com estes termos, o uso da plataforma e de suas integrações deve ser interrompido.",
    ],
  },
  {
    title: "2. Identificação do serviço",
    content: [
      "O Agendoro é uma plataforma voltada à organização de agendas, automações operacionais, sincronização de compromissos e integração com ferramentas de terceiros, incluindo serviços do Google quando autorizados pelo usuário.",
      "Responsável pelo serviço: DAURI DESENVOLVIMENTO E TECNOLOGIA LTDA.",
      "CNPJ: 46.320.035/0001-09.",
      "Endereço: Rua Dom Afonso, 191 - Jacarei - Sao Paulo.",
      "Contato geral e jurídico: privacidade@dauri.com.br.",
    ],
  },
  {
    title: "3. Elegibilidade e responsabilidade da conta",
    content: [
      "O usuário deve fornecer informações verdadeiras, atualizadas e completas sempre que utilizar o serviço ou contratar integrações.",
      "Cada usuário é responsável por proteger acessos, dispositivos, senhas, contas conectadas e credenciais utilizadas na plataforma.",
      "O usuário responde pelas atividades realizadas por sua conta ou pelas contas integradas sob sua autorização, salvo prova de uso indevido alheio ao seu controle razoável.",
    ],
  },
  {
    title: "4. Escopo do serviço",
    content: [
      "O Agendoro poderá oferecer funcionalidades de agenda, automação, sincronização, leitura de eventos, comunicação operacional e conexões com serviços externos, conforme a configuração contratada ou autorizada.",
      "Recursos podem ser adicionados, removidos, ajustados ou substituídos para fins de evolução do produto, segurança, conformidade regulatória ou estabilidade operacional.",
      "A disponibilidade de algumas funções poderá depender de provedores terceiros, permissões válidas, conectividade, APIs externas e configurações mantidas pelo próprio usuário.",
    ],
  },
  {
    title: "5. Integrações com Google",
    content: [
      "Quando houver integração com serviços do Google, o acesso ocorrerá somente mediante autorização do usuário ou do responsável pela conta conectada.",
      "O uso de dados recebidos de APIs do Google será limitado às funcionalidades diretamente solicitadas pelo usuário e necessárias à operação do serviço.",
      "Esses dados não serão vendidos, não serão usados para publicidade direcionada e não serão utilizados para desenvolver, treinar ou melhorar modelos generalistas de inteligência artificial.",
      "A manutenção da integração depende da validade das permissões concedidas, da disponibilidade dos serviços Google e do cumprimento contínuo das políticas aplicáveis do Google.",
    ],
  },
  {
    title: "6. Obrigações do usuário",
    content: [
      "O usuário concorda em utilizar o serviço de forma lícita, ética e compatível com estes termos, com a legislação aplicável e com as políticas dos serviços integrados.",
      "É vedado usar o Agendoro para fraude, spam, exploração indevida de APIs, coleta ilícita de dados, violação de privacidade, tentativa de acesso não autorizado ou qualquer atividade que comprometa terceiros ou a infraestrutura da plataforma.",
      "O usuário também concorda em não contornar limites técnicos, não interferir em mecanismos de segurança e não utilizar a plataforma para engenharia reversa indevida, exceto quando expressamente permitido por lei.",
    ],
  },
  {
    title: "7. Disponibilidade, suspensão e encerramento",
    content: [
      "O Agendoro buscará manter a disponibilidade razoável do serviço, mas não garante operação ininterrupta ou isenta de falhas, especialmente quando houver dependência de serviços externos.",
      "O acesso poderá ser suspenso, limitado ou encerrado em caso de uso abusivo, risco de segurança, exigência legal, violação destes termos, falhas em integrações externas ou necessidade técnica relevante.",
      "O usuário também poderá interromper o uso e revogar acessos de integrações externas, incluindo permissões da Conta Google, a qualquer momento.",
    ],
  },
  {
    title: "8. Dados, privacidade e revogação de integrações",
    content: [
      "O tratamento de dados pessoais e operacionais relacionados ao serviço segue a Política de Privacidade do Agendoro, que integra estes termos para todos os fins.",
      "O usuário poderá revogar o acesso do Agendoro à Conta Google nas configurações de permissões do próprio Google, hipótese em que funcionalidades dependentes da integração poderão deixar de operar.",
      "A revogação de integrações não elimina automaticamente obrigações legais, registros técnicos mínimos ou dados cuja retenção seja necessária para segurança, auditoria ou defesa de direitos.",
    ],
  },
  {
    title: "9. Propriedade intelectual",
    content: [
      "Salvo disposição expressa em contrário, o software, identidade visual, marca, textos, estrutura da plataforma, layout e conteúdos institucionais do Agendoro pertencem aos seus titulares de direito.",
      "Estes termos não transferem ao usuário qualquer direito de propriedade intelectual, exceto a licença limitada, revogável e não exclusiva de uso do serviço conforme sua finalidade legítima.",
    ],
  },
  {
    title: "10. Limitação de responsabilidade",
    content: [
      "Na máxima extensão permitida pela legislação aplicável, o Agendoro não será responsável por danos indiretos, lucros cessantes, perda de oportunidade, indisponibilidade causada por terceiros, falhas de provedores externos ou uso inadequado do serviço pelo usuário.",
      "A responsabilidade do Agendoro, quando cabível, estará limitada ao valor efetivamente pago pelo usuário pelo serviço no período contratual imediatamente anterior ao evento que originou a reclamação, salvo disposição legal imperativa em contrário.",
    ],
  },
  {
    title: "11. Alterações dos termos",
    content: [
      "Estes Termos de Uso poderão ser atualizados periodicamente para refletir mudanças legais, técnicas, comerciais ou operacionais.",
      "A data de última atualização indicada nesta página representa a versão vigente. O uso continuado do serviço após atualização constitui aceite da versão então aplicável, ressalvados direitos previstos em lei.",
    ],
  },
  {
    title: "12. Lei aplicável e foro",
    content: [
      "Estes termos serão interpretados de acordo com a legislação brasileira.",
      "Fica eleito o foro da comarca competente do domicílio do responsável legal do serviço, salvo hipótese legal de foro obrigatório diverso aplicável ao usuário.",
    ],
  },
];

export function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: compositionPatterns.overlay.legalPage }}
      />

      <div className="relative z-10 px-6 py-10 md:px-10 lg:px-16 lg:py-14">
        <div className="mx-auto max-w-4xl">
          <Card padding="md" radiusSize="xl" className="md:p-8">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
              <div className="flex flex-wrap gap-4 text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
                <Link to="/" className="transition hover:text-white">
                  Voltar para o Agendoro
                </Link>
                <Link
                  to="/politica-de-privacidade"
                  className="transition hover:text-white"
                >
                  Política de Privacidade
                </Link>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                  Termos de Uso
                </p>
                <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
                  Regras de uso do Agendoro e de integrações com serviços Google
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-text-soft md:text-lg">
                  Este documento estabelece as condições de acesso e uso do
                  Agendoro, inclusive no que se refere a funcionalidades de
                  agenda, automação e integrações com APIs do Google quando
                  autorizadas pelo usuário.
                </p>
                <p className="mt-4 text-sm text-text-muted">
                  Última atualização: {updatedAt}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {sections.map((section) => (
                <Card
                  key={section.title}
                  padding="sm"
                  radiusSize="lg"
                  className="md:p-6"
                  style={{ backgroundColor: semanticTokens.surface.glassSubtle }}
                >
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-text-soft md:text-base">
                    {section.content.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
