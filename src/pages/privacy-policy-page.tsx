import { Link } from "react-router-dom";

import { Card } from "@/components/landing/flow/card";
import { compositionPatterns, semanticTokens } from "@/design-system";

const updatedAt = "14 de abril de 2026";

const sections = [
  {
    title: "1. Identificação do controlador",
    content: [
      "Esta Política de Privacidade descreve como o Agendoro trata dados pessoais e dados operacionais relacionados ao uso da plataforma de agendamento, automação e gestão de compromissos.",
      "Controlador responsável: DAURI DESENVOLVIMENTO E TECNOLOGIA LTDA.",
      "CNPJ: 46.320.035/0001-09",
      "Endereço: Rua Dom Afonso, 191 - Jacarei - Sao Paulo",
      "Contato para privacidade e proteção de dados: privacidade@dauri.com.br",
    ],
  },
  {
    title: "2. Dados que podemos coletar",
    content: [
      "Podemos coletar dados fornecidos diretamente pelo usuário, como nome, telefone, e-mail, informações comerciais e detalhes necessários para configuração da agenda.",
      "Também podemos tratar dados operacionais de agendamento, como serviços, horários, profissionais vinculados, histórico de eventos e informações relacionadas à gestão da agenda dentro da própria plataforma.",
      "Podemos ainda registrar dados técnicos básicos de navegação, incluindo IP, tipo de dispositivo, navegador, páginas acessadas, data e hora de acesso, para segurança, estabilidade e prevenção de abuso.",
    ],
  },
  {
    title: "3. Finalidades do tratamento",
    content: [
      "Utilizamos os dados para operar a plataforma, configurar agendas, exibir eventos, automatizar fluxos e permitir o uso das funcionalidades contratadas.",
      "Os dados também podem ser usados para comunicação com o usuário, suporte operacional, prevenção de fraude, segurança da aplicação e melhoria da experiência do serviço solicitado.",
      "Toda a gestão de agenda e disponibilidade é realizada internamente pela plataforma Agendoro, sem dependência de integrações externas de calendário.",
    ],
  },
  {
    title: "4. Compartilhamento de dados",
    content: [
      "Os dados poderão ser compartilhados apenas com provedores de infraestrutura, hospedagem, monitoramento, armazenamento, autenticação ou mensageria que sejam necessários à prestação do serviço.",
      "Não comercializamos dados pessoais e não compartilhamos informações para fins de revenda, perfilamento comercial externo ou publicidade comportamental.",
      "O compartilhamento ocorrerá apenas quando necessário para a execução do serviço, para cumprimento de obrigação legal ou mediante solicitação válida de autoridade competente.",
    ],
  },
  {
    title: "5. Retenção e exclusão",
    content: [
      "Os dados serão mantidos pelo tempo necessário para cumprir as finalidades desta política, prestar o serviço contratado, atender obrigações legais e resguardar direitos em processos administrativos, regulatórios ou judiciais.",
      "Sempre que possível, os dados serão excluídos, anonimizados ou desassociados da identidade do titular após solicitação válida, encerramento da relação ou perda de necessidade operacional.",
      "Dados estritamente necessários para segurança, auditoria, prevenção de abuso ou cumprimento de obrigação legal poderão ser mantidos pelos prazos aplicáveis.",
    ],
  },
  {
    title: "6. Segurança e proteção das credenciais",
    content: [
      "Adotamos medidas técnicas e organizacionais razoáveis para proteger dados pessoais, credenciais de acesso e informações operacionais contra acesso não autorizado, perda, uso indevido, alteração e divulgação indevida.",
      "O acesso interno a dados e credenciais é restrito ao mínimo necessário para operação, suporte e manutenção do serviço.",
      "Credenciais de acesso e segredos operacionais devem ser armazenados em ambiente seguro, com proteção contra exposição indevida no cliente ou em repositórios públicos.",
    ],
  },
  {
    title: "7. Direitos do titular",
    content: [
      "O titular poderá solicitar, nos termos da legislação aplicável, confirmação de tratamento, acesso, correção, atualização, anonimização, exclusão, portabilidade, limitação de uso e revogação de consentimento quando aplicável.",
      "Solicitações relacionadas a privacidade e proteção de dados podem ser enviadas para privacidade@dauri.com.br",
    ],
  },
  {
    title: "8. Alterações desta política",
    content: [
      "Esta Política de Privacidade poderá ser atualizada periodicamente para refletir mudanças legais, operacionais, técnicas ou de produto.",
      "A data de atualização exibida nesta página indica a versão mais recente em vigor. Recomendamos revisão periódica do conteúdo.",
    ],
  },
];

export function PrivacyPolicyPage() {
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
              <Link
                to="/"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary transition hover:text-white"
              >
                Voltar para o Agendoro
              </Link>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                  Política de Privacidade
                </p>
                <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
                  Privacidade, uso de dados e funcionamento da plataforma
                  Agendoro
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-text-soft md:text-lg">
                  Este documento descreve como o Agendoro trata dados pessoais,
                  dados operacionais e informações relacionadas ao uso da
                  plataforma, sempre dentro do escopo das funcionalidades
                  contratadas pelo usuário.
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
                  style={{
                    backgroundColor: semanticTokens.surface.glassSubtle,
                  }}
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
