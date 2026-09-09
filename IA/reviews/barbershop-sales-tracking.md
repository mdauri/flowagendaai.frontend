# Review — demo comercial e tracking

400 testes frontend passaram; build/prerender passou; Nginx validou 49 URLs canônicas, rotas noindex e URLs com parâmetros comerciais. E2E integrado em PostgreSQL verifica catálogo, três profissionais, booking confirmado, conflito 409, entrada direta, reload, segunda campanha e cinco eventos/atribuição no signup.

Preserva R$97/mês, R$970/ano, 14 dias, sem cartão, até três profissionais. Reutiliza componentes, estados e rotas; imagens sintéticas locais e logo original da barbearia fictícia. Nenhum admin/credencial exposto. Primeiro toque não sobrescrito; UUID v4 inválido/duplicado descartado; falha de analytics não invalida signup.

Finding corrigido: header noindex para /signup com query não era aplicado pelo matcher do Nginx; matcher agora reconhece query e validador cobre o caso. LandingPath dos eventos preserva entrada original. Correção mobile publicada em 372db8a mantida.

Riscos: API #16 precisa ser publicada antes do frontend; publicação pronta somente após smoke live e comprovação de persistência. Storage bloqueado usa memória durante o documento; não promete atribuição entre documentos sem storage. Visitante previamente atribuído mantém origem antiga. Não há identificação entre dispositivos.

Decisão: aprovado para CI e release controlado; gate produtivo depende do relatório integrado.
