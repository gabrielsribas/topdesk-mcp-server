# 📦 Publishing Guide - TOPdesk MCP Server

## Como Publicar no NPM

### 1️⃣ Preparação

#### Criar Conta no NPM (se ainda não tiver)
```bash
# Acesse: https://www.npmjs.com/signup
# Crie sua conta gratuita
```

#### Login no NPM
```bash
npm login
# Digite: username, password, email
```

#### Verificar Login
```bash
npm whoami
# Deve mostrar seu username
```

### 2️⃣ Configurar package.json

✅ Já configurado! Os campos importantes são:

```json
{
  "name": "topdesk-mcp-server",  // Nome único no NPM
  "version": "1.0.0",             // Versão semântica
  "description": "...",
  "bin": {                        // Permite usar via npx
    "topdesk-mcp-server": "./dist/index.js"
  },
  "files": [                      // Arquivos a publicar
    "dist/**/*",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

### 3️⃣ Verificar Nome Disponível

```bash
# Verificar se o nome está disponível
npm view topdesk-mcp-server

# Se retornar erro 404, está disponível!
# Se retornar dados, o nome já existe (escolha outro)
```

### 4️⃣ Build e Testes

```bash
# Limpar build anterior
rm -rf dist/

# Build novo
npm run build

# Testar localmente
npm start

# Verificar o que será publicado
npm pack --dry-run
```

### 5️⃣ Publicar

#### Primeira Publicação

```bash
# Publicar versão 1.0.0
npm publish

# Se quiser publicar como scoped package (recomendado):
# Primeiro mude o name no package.json para: @seu-usuario/topdesk-mcp-server
npm publish --access public
```

#### Atualizações Futuras

```bash
# Atualizar versão (patch: 1.0.1)
npm version patch

# Ou minor (1.1.0)
npm version minor

# Ou major (2.0.0)
npm version major

# Isso cria um git tag automaticamente
# Depois publique:
npm publish
```

### 6️⃣ Usar Após Publicado

#### Via npx (Sem Instalar)

```bash
# Executar diretamente
npx topdesk-mcp-server

# Com -y para não pedir confirmação
npx -y topdesk-mcp-server
```

#### Via Instalação Global

```bash
# Instalar globalmente
npm install -g topdesk-mcp-server

# Usar diretamente
topdesk-mcp-server
```

#### Via Instalação Local

```bash
# Em um projeto
npm install topdesk-mcp-server

# Usar via npx
npx topdesk-mcp-server
```

### 7️⃣ Configuração Claude Desktop (Após Publicar)

**Antes** (usando caminho local):
```json
{
  "mcpServers": {
    "topdesk": {
      "command": "node",
      "args": ["/caminho/absoluto/para/topdesk-mcp-server/dist/index.js"],
      "env": { ... }
    }
  }
}
```

**Depois** (usando npx):
```json
{
  "mcpServers": {
    "topdesk": {
      "command": "npx",
      "args": ["-y", "topdesk-mcp-server"],
      "env": {
        "TOPDESK_BASE_URL": "https://...",
        "TOPDESK_USERNAME": "...",
        "TOPDESK_PASSWORD": "..."
      }
    }
  }
}
```

Ou se instalar globalmente:
```json
{
  "mcpServers": {
    "topdesk": {
      "command": "topdesk-mcp-server",
      "env": { ... }
    }
  }
}
```

## 🎯 Vantagens de Publicar no NPM

### ✅ Para Usuários
- Instalação simples: `npx topdesk-mcp-server`
- Sem precisar clonar repositório
- Sem precisar fazer build manual
- Atualizações fáceis
- Funciona em qualquer SO

### ✅ Para Você
- Distribuição facilitada
- Versionamento automático
- Estatísticas de downloads
- Comunidade pode contribuir
- Credibilidade profissional

## 📝 Checklist Pré-Publicação

- [ ] Código buildado sem erros (`npm run build`)
- [ ] Testes passando (quando implementados)
- [ ] README.md atualizado
- [ ] CHANGELOG.md atualizado
- [ ] Versão correta no package.json
- [ ] LICENSE presente
- [ ] .npmignore configurado
- [ ] Git repository limpo
- [ ] Testado localmente
- [ ] Nome disponível no NPM

## 🔄 Workflow de Release

### Release Patch (1.0.0 → 1.0.1)

```bash
# 1. Fazer mudanças e commitar
git add .
git commit -m "fix: corrige autenticação com API token"

# 2. Atualizar CHANGELOG.md
# Mover itens de [Unreleased] para [1.0.1]

# 3. Bump version e criar tag
npm version patch -m "chore: release v%s"

# 4. Push com tags
git push && git push --tags

# 5. Publicar no NPM
npm publish

# 6. (Opcional) Criar release no GitHub
```

### Release Minor (1.0.0 → 1.1.0)

```bash
# Mesmo processo, mas:
npm version minor -m "feat: adiciona suporte para attachments v%s"
```

### Release Major (1.0.0 → 2.0.0)

```bash
# Para breaking changes:
npm version major -m "feat!: nova arquitetura v%s"
```

## 🚀 Publicação Automatizada (CI/CD)

### GitHub Actions (Futuro)

Criar `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📊 Após Publicar

### Ver Estatísticas
```bash
# Downloads
npm view topdesk-mcp-server

# Versões publicadas
npm view topdesk-mcp-server versions

# Informações completas
npm info topdesk-mcp-server
```

### Atualizar README no NPM

O NPM usa o README.md do repositório automaticamente.
Qualquer push de atualização do README será refletido.

### Deprecar Versão (se necessário)

```bash
# Deprecar versão antiga
npm deprecate topdesk-mcp-server@1.0.0 "Use version 1.1.0 or higher"

# Remover publicação (cuidado! só nas primeiras 72h)
npm unpublish topdesk-mcp-server@1.0.0
```

## 🛡️ Segurança

### NPM Token

Para CI/CD, crie um token:
```bash
npm token create
# Guarde o token em segredo (GitHub Secrets, etc.)
```

### 2FA

Habilite autenticação de dois fatores:
```bash
npm profile enable-2fa auth-and-writes
```

## 🎓 Boas Práticas

1. **Versionamento Semântico**
   - MAJOR: Breaking changes
   - MINOR: Novas features (compatível)
   - PATCH: Bug fixes

2. **CHANGELOG.md**
   - Sempre atualizar antes de release
   - Seguir formato Keep a Changelog

3. **Git Tags**
   - Criar tag para cada release
   - Formato: `v1.0.0`

4. **README.md**
   - Manter atualizado
   - Incluir badges (npm version, downloads, etc.)

5. **Tests**
   - Adicionar testes antes de publicar
   - Rodar testes em CI/CD

## 📞 Suporte

- NPM Docs: https://docs.npmjs.com/
- Semantic Versioning: https://semver.org/
- Keep a Changelog: https://keepachangelog.com/

---

**Pronto para publicar?** 🚀

```bash
# Quick publish:
npm login
npm run build
npm publish
```
