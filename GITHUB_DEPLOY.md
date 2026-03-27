# Guia de Deploy via GitHub

Este guia mostra como usar o servidor MCP diretamente do GitHub, **sem precisar publicar no NPM**.

## 🎯 Por que usar via GitHub?

### Vantagens
- ✅ **Sem instalação local**: Não precisa clonar o repositório
- ✅ **Sempre atualizado**: Usa a versão mais recente do branch automaticamente
- ✅ **Portável**: Funciona em qualquer máquina com Node.js
- ✅ **Ideal para containers**: Perfeito para Docker e ambientes efêmeros
- ✅ **Não precisa NPM**: Evita processo de publicação no NPM
- ✅ **Privado ou público**: Funciona com repositórios privados também

### Casos de Uso
- Desenvolvimento e testes
- Deploy em containers
- Distribuição para equipe interna
- Projetos que não quer/pode publicar no NPM

## 📦 Setup Inicial

### 1. Preparar Repositório GitHub

```bash
cd /home/gribas/repos/topdesk-mcp-server

# Inicializar git (se ainda não tiver)
git init

# IMPORTANTE: Certificar que dist/ está incluído
# Remova dist/ do .gitignore se estiver lá
nano .gitignore  # Remover linha 'dist/'

# Build o projeto
npm run build

# Adicionar tudo
git add .
git commit -m "feat: initial commit - TOPdesk MCP Server"

# Criar repositório no GitHub e conectar
git remote add origin git@github.com:seu-usuario/topdesk-mcp-server.git

# Push
git branch -M main
git push -u origin main
```

### 2. Verificar Estrutura no GitHub

Certifique-se que estes arquivos estão no repositório:
- ✅ `package.json`
- ✅ `dist/index.js`
- ✅ `dist/**/*` (todos os arquivos compilados)
- ✅ `README.md`
- ✅ `LICENSE`

## 🚀 Uso

### Opção 1: Claude Desktop

**Arquivo de configuração:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuração:**

```json
{
  "mcpServers": {
    "topdesk": {
      "command": "npx",
      "args": ["-y", "github:seu-usuario/topdesk-mcp-server"],
      "env": {
        "TOPDESK_BASE_URL": "https://your-instance.topdesk.net/tas/api",
        "TOPDESK_USERNAME": "seu_usuario",
        "TOPDESK_PASSWORD": "sua_senha"
      }
    }
  }
}
```

### Opção 2: Docker

```bash
docker run -it --rm \
  -e TOPDESK_BASE_URL="https://..." \
  -e TOPDESK_USERNAME="..." \
  -e TOPDESK_PASSWORD="..." \
  node:18-alpine \
  npx -y github:seu-usuario/topdesk-mcp-server
```

### Opção 3: Docker Compose

```yaml
version: '3.8'
services:
  topdesk-mcp:
    image: node:18-alpine
    command: npx -y github:seu-usuario/topdesk-mcp-server
    environment:
      - TOPDESK_BASE_URL=${TOPDESK_BASE_URL}
      - TOPDESK_USERNAME=${TOPDESK_USERNAME}
      - TOPDESK_PASSWORD=${TOPDESK_PASSWORD}
    stdin_open: true
    tty: true
```

### Opção 4: Terminal Direto

```bash
# Executar uma vez
npx -y github:seu-usuario/topdesk-mcp-server

# Com variáveis de ambiente
TOPDESK_BASE_URL="..." \
TOPDESK_USERNAME="..." \
TOPDESK_PASSWORD="..." \
npx -y github:seu-usuario/topdesk-mcp-server
```

## 🌿 Usando Branches Específicos

### Branch de Desenvolvimento

```json
{
  "command": "npx",
  "args": ["-y", "github:seu-usuario/topdesk-mcp-server#develop"]
}
```

### Tag/Release Específica

```json
{
  "command": "npx",
  "args": ["-y", "github:seu-usuario/topdesk-mcp-server#v1.0.0"]
}
```

### Commit Específico

```json
{
  "command": "npx",
  "args": ["-y", "github:seu-usuario/topdesk-mcp-server#abc123"]
}
```

## 🔒 Repositórios Privados

Para usar com repositórios privados:

### GitHub SSH (Recomendado)

```bash
# 1. Configure SSH keys no GitHub
ssh-keygen -t ed25519 -C "seu-email@example.com"

# 2. Adicione a chave pública ao GitHub
# Settings > SSH and GPG keys > New SSH key

# 3. Use normalmente
npx -y github:seu-usuario/topdesk-mcp-server
```

### GitHub Personal Access Token

```bash
# 1. Crie um Personal Access Token no GitHub
# Settings > Developer settings > Personal access tokens > Tokens (classic)
# Marque 'repo' scope

# 2. Configure token
npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN

# 3. Use normalmente
npx -y github:seu-usuario/topdesk-mcp-server
```

## 🔄 Atualização

### Forçar Nova Versão

```bash
# Limpar cache do npx
npx clear-npx-cache

# Ou deletar cache manualmente
rm -rf ~/.npm/_npx

# Próxima execução vai baixar a versão mais recente
npx -y github:seu-usuario/topdesk-mcp-server
```

### Workflow de Release

```bash
# 1. Fazer mudanças
git add .
git commit -m "feat: nova funcionalidade"

# 2. Push
git push

# 3. (Opcional) Criar tag
git tag -a v1.1.0 -m "Release 1.1.0"
git push --tags

# 4. Usuários podem usar automaticamente OU especificar versão
# Automático (latest): github:user/repo
# Tag específica: github:user/repo#v1.1.0
```

## 📋 Checklist de Deploy

- [ ] `dist/` está no repositório (não no .gitignore)
- [ ] `package.json` tem campo `bin` configurado
- [ ] Build executado sem erros (`npm run build`)
- [ ] Repositório é público OU você configurou autenticação
- [ ] README tem instruções claras
- [ ] Testado localmente com `npx github:user/repo`

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
# Certifique-se que dist/ está no repositório
git add dist/ -f
git commit -m "Add dist files"
git push
```

### Erro: "Permission denied"

```bash
# Para repos privados, configure SSH:
ssh -T git@github.com  # Testar conexão

# Ou use HTTPS com token
```

### Erro: "Command not found"

```bash
# Certifique-se que package.json tem:
{
  "bin": {
    "topdesk-mcp-server": "./dist/index.js"
  }
}
```

### Cache antigo

```bash
# Limpar cache do npx
rm -rf ~/.npm/_npx
```

## 🎯 Comparação: GitHub vs NPM vs Local

| Característica | GitHub | NPM | Local |
|----------------|--------|-----|-------|
| Instalação | ❌ Não precisa | ❌ Não precisa | ✅ Precisa clonar |
| Publicação | Privado/Público | Sempre público | N/A |
| Atualização | Automática | Manual (`npm update`) | Manual (git pull) |
| Versionamento | Branches/Tags | Semver | Commits |
| Uso offline | ❌ Primeira vez precisa internet | ✅ Cache local | ✅ Local |
| Distribuição | Git URL | Nome do pacote | Caminho absoluto |
| Ideal para | Equipes, containers | Público geral | Desenvolvimento |

## 💡 Dicas

### Múltiplos Ambientes

```json
{
  "mcpServers": {
    "topdesk-prod": {
      "command": "npx",
      "args": ["-y", "github:user/topdesk-mcp-server#main"],
      "env": { "TOPDESK_BASE_URL": "https://prod.topdesk.com/tas/api" }
    },
    "topdesk-dev": {
      "command": "npx",
      "args": ["-y", "github:user/topdesk-mcp-server#develop"],
      "env": { "TOPDESK_BASE_URL": "https://dev.topdesk.com/tas/api" }
    }
  }
}
```

### Monorepo

Se seu MCP server é parte de um monorepo:

```bash
# Estrutura
monorepo/
├── packages/
│   └── topdesk-mcp-server/
│       └── dist/
└── package.json

# Use subdirectory
npx -y github:user/monorepo/packages/topdesk-mcp-server
```

## 📞 Suporte

- GitHub Issues: https://github.com/seu-usuario/topdesk-mcp-server/issues
- Discussões: https://github.com/seu-usuario/topdesk-mcp-server/discussions

---

**Pronto para usar!** 🚀

Basta fazer:
```bash
git push
```

E depois:
```bash
npx -y github:seu-usuario/topdesk-mcp-server
```
