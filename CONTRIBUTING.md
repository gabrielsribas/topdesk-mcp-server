# Contribuindo para o TOPdesk MCP Server

Obrigado pelo interesse em contribuir! Este documento fornece diretrizes para contribuição.

## 🐛 Reportando Bugs

Antes de reportar um bug:
1. Verifique se já não foi reportado nas issues
2. Teste com a versão mais recente
3. Inclua informações de ambiente (Node.js version, OS, etc.)

Ao reportar, inclua:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Mensagens de erro (se aplicável)
- Versão do TOPdesk API

## ✨ Sugerindo Features

Para sugerir novas features:
1. Verifique se já não foi sugerida
2. Descreva claramente o caso de uso
3. Explique por que seria útil
4. Se possível, sugira implementação

## 🔧 Pull Requests

### Processo

1. Fork o repositório
2. Crie uma branch para sua feature: `git checkout -b feature/MinhaFeature`
3. Faça commits claros e descritivos
4. Adicione/atualize testes (quando aplicável)
5. Atualize documentação (README, CHANGELOG)
6. Teste localmente
7. Push para seu fork
8. Abra um Pull Request

### Diretrizes de Código

- **TypeScript**: Use tipos explícitos
- **Nomenclatura**: Siga convenções do projeto (veja copilot-instructions.md)
- **Comentários**: Comente código complexo
- **Formato**: Use Prettier (formato automático ao salvar)
- **Lint**: Código deve passar no ESLint

### Commits

Formato recomendado:
```
<tipo>: <descrição curta>

<descrição detalhada opcional>
```

Tipos:
- `feat`: Nova feature
- `fix`: Bug fix
- `docs`: Apenas documentação
- `style`: Formatação, sem mudança de código
- `refactor`: Refatoração de código
- `test`: Adicionar/modificar testes
- `chore`: Manutenção, deps, etc.

Exemplos:
```
feat: adiciona suporte para attachments em incidents

Implementa upload e download de arquivos anexados aos incidents.
Inclui novos tools: topdesk_upload_attachment e topdesk_download_attachment.

Closes #42
```

```
fix: corrige autenticação com API token

O header Authorization não estava sendo enviado corretamente
quando usando API token ao invés de username/password.
```

### Documentação

- **README.md**: Atualizar se adicionar features visíveis ao usuário
- **CHANGELOG.md**: Adicionar em [Unreleased] seguindo Keep a Changelog
- **copilot-instructions.md**: Atualizar se mudar arquitetura ou padrões
- **Comentários**: Atualizar JSDoc nos métodos públicos

### Testes

Quando implementados:
- Escrever testes unitários para novas features
- Garantir que testes existentes passem
- Testar edge cases
- Testar tratamento de erros

## 📚 Recursos

- [TOPdesk API Docs](https://developers.topdesk.com/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ❓ Dúvidas

Para dúvidas sobre desenvolvimento:
1. Consulte [copilot-instructions.md](.github/copilot-instructions.md)
2. Abra uma Discussion
3. Entre em contato com os maintainers

## 🎯 Áreas que Precisam de Ajuda

- [ ] Implementar testes unitários
- [ ] Adicionar suporte para attachments
- [ ] Implementar rate limiting
- [ ] Melhorar tratamento de erros
- [ ] Adicionar mais exemplos de uso
- [ ] Traduzir documentação

## 🙏 Agradecimentos

Toda contribuição é valiosa, seja código, documentação, testes ou reportando bugs. Obrigado por ajudar a melhorar este projeto!
