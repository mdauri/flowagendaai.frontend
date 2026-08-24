# Onboarding videos

Os arquivos `<videoKey>.webm` desta pasta sao artefatos regeneraveis pelo comando:

```bash
npm run generate-onboarding-videos
```

O pipeline deve publicar os oito videos gerados com a mesma versao do frontend. Nao adicionar dados pessoais ou gravacoes reais.

O comando copia apenas videos de cenarios aprovados para esta pasta e falha se o
cenario nao produzir um anexo de video. Artefatos em `test-results` podem ser
gravacoes de falha e nao devem ser publicados manualmente.

Durante a geracao, o bootstrap visual de autenticacao de 3,5 s e removido dos
assets finais; o fluxo didatico comeca no primeiro conteudo util do onboarding.
