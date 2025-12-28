# Relatório de QA

Use este template para reportar bugs encontrados durante os testes.

## Template de Bug

**Título:** [Curta descrição do erro]
**Severidade:** [Crítica / Alta / Média / Baixa]
**Ambiente:** [Mobile Android / Desktop Chrome / iOS Safari]

**Passos para Reproduzir:**
1. Logar como ...
2. Ir para a página ...
3. Clicar em ...

**Comportamento Esperado:**
O sistema deveria ...

**Comportamento Atual:**
O sistema ...

**Evidência:**
[Screenshot ou Link do Vídeo]

---

## Bugs Conhecidos (Roadmap de Correção)

- [ ] **Mobile Safari**: Vídeo em PIP pode ter comportamento inesperado em versões antigas do iOS.
- [ ] **Billing**: Em casos de desconexão abrupta, o último minuto pode não ser cobrado corretamente (necessita Webhooks no Backend).
- [ ] **Upload de Imagens**: Atualmente aceita apenas URLs externas. Necessário implementar upload direto para R2/S3.
