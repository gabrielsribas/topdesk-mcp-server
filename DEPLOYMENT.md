# Deployment Guide - TOPdesk MCP Server

## 📦 Opções de Deploy

### 1. Local Development

Para desenvolvimento local com hot-reload:

```bash
# Terminal 1: Watch mode (recompila automaticamente)
npm run watch

# Terminal 2: Executar servidor
npm start
```

### 2. Production Local

Para uso em produção local:

```bash
# Build
npm run build

# Executar
npm start
```

### 3. Claude Desktop Integration

O método mais comum é integrar com Claude Desktop:

**Localização do arquivo de configuração:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

#### Opção A: Via GitHub (Recomendado) ⭐

Publique o projeto no GitHub e use via npx:

```json
{
  "mcpServers": {
    "topdesk": {
      "command": "npx",
      "args": ["-y", "github:seu-usuario/topdesk-mcp-server"],
      "env": {
        "TOPDESK_BASE_URL": "https://seu-topdesk.com.br/tas/api",
        "TOPDESK_USERNAME": "usuario",
        "TOPDESK_PASSWORD": "senha"
      }
    }
  }
}
```

**Vantagens**:
- ✅ Sem necessidade de instalação local
- ✅ Atualização automática (sempre usa última versão do branch)
- ✅ Funciona em qualquer máquina com Node.js
- ✅ Ideal para containers e CI/CD
- ✅ Não precisa publicar no NPM

**Como fazer**:

1. Crie repositório no GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin git@github.com:seu-usuario/topdesk-mcp-server.git
   git push -u origin main
   ```

2. Certifique-se que `dist/` está no repositório:
   ```bash
   # Remova dist/ do .gitignore se estiver lá
   git add dist/
   git commit -m "Add compiled dist files"
   git push
   ```

3. Use no Claude Desktop com `github:seu-usuario/topdesk-mcp-server`

**Branch específico**:
```json
{
  "command": "npx",
  "args": ["-y", "github:seu-usuario/topdesk-mcp-server#develop"]
}
```

#### Opção B: Local (Desenvolvimento)

```json
{
  "mcpServers": {
    "topdesk": {
      "command": "node",
      "args": ["/caminho/absoluto/para/topdesk-mcp-server/dist/index.js"],
      "env": {
        "TOPDESK_BASE_URL": "https://seu-topdesk.com.br/tas/api",
        "TOPDESK_USERNAME": "usuario",
        "TOPDESK_PASSWORD": "senha"
      }
    }
  }
}
```

### 4. Docker (Futuro)

Planejado para versões futuras:

```dockerfile
# Exemplo futuro
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

## 🔐 Segurança

### Variáveis de Ambiente

**Opção 1: Arquivo .env** (desenvolvimento)
```bash
TOPDESK_BASE_URL=https://...
TOPDESK_USERNAME=...
TOPDESK_PASSWORD=...
```

**Opção 2: Variáveis de Sistema** (produção)
```bash
export TOPDESK_BASE_URL=https://...
export TOPDESK_USERNAME=...
export TOPDESK_PASSWORD=...
```

**Opção 3: Claude Desktop Config** (mais comum)
- Credenciais diretamente no arquivo de configuração
- Arquivo geralmente tem permissões restritas do usuário

### API Token vs Username/Password

**Recomendado: API Token**
```bash
TOPDESK_BASE_URL=https://...
TOPDESK_API_TOKEN=seu_token_aqui
```

Vantagens:
- Mais seguro
- Pode ser revogado facilmente
- Não expõe senha do usuário
- Melhor para ambientes automatizados

### Permissões Necessárias

Usuário/Token precisa ter permissões para:
- Visualizar incidents, changes e services
- Criar/editar incidents, changes e services
- Acessar metadados (categorias, status, etc.)

## 📊 Monitoramento

### Logs

Todos os logs vão para `stderr` para não interferir com stdio MCP:

```typescript
console.error('[TOPdesk] GET /incidents');
console.error('TOPdesk MCP Server running on stdio');
```

**Capturar logs no Claude Desktop:**
- Logs aparecem no console de desenvolvedor do Claude Desktop
- Verificar documentação do Claude para localização dos logs

### Health Check

Para verificar se o servidor está funcionando:

```bash
# Via Claude Desktop
# Pergunte ao Claude: "Qual a versão da API do TOPdesk?"
# Deve retornar informações de versão
```

## 🔄 Atualizações

### Atualizar Dependências

```bash
# Ver dependências desatualizadas
npm outdated

# Atualizar (cuidado com breaking changes)
npm update

# Ou atualizar manualmente no package.json
npm install
```

### Atualizar o Servidor

```bash
# Pull das mudanças
git pull origin main

# Reinstalar dependências (se necessário)
npm install

# Rebuild
npm run build

# Reiniciar Claude Desktop (se aplicável)
```

## ⚡ Performance

### Timeout

Padrão: 30 segundos

Para ajustar, edite `src/client/topdesk-client.ts`:

```typescript
this.client = axios.create({
  baseURL: config.baseUrl,
  timeout: 60000, // 60 segundos
  // ...
});
```

### Rate Limiting

Atualmente não implementado. Se necessário:
- Implementar retry logic com exponential backoff
- Adicionar throttling de requisições
- Usar cache para metadados

### Caching (Futuro)

Para melhorar performance, cachear:
- Categorias
- Status
- Prioridades
- Outros metadados raramente alterados

## 🐛 Debugging

### Modo Debug

Adicionar logging extra:

```typescript
// Em topdesk-client.ts
this.client.interceptors.request.use((config) => {
  console.error(`[TOPdesk] ${config.method?.toUpperCase()} ${config.url}`);
  console.error(`[TOPdesk] Body:`, config.data);
  return config;
});
```

### Testar Conexão

```bash
# Testar autenticação via curl
curl -H "Authorization: Basic $(echo -n 'usuario:senha' | base64)" \
  https://seu-topdesk.com.br/tas/api/version
```

### Erros Comuns

**401 Unauthorized**
- Verificar credenciais
- Verificar se usuário tem permissões necessárias

**404 Not Found**
- Verificar URL base (deve incluir `/tas/api`)
- Verificar se endpoint existe na versão do TOPdesk

**Timeout**
- Aumentar timeout no cliente
- Verificar latência de rede

## 📦 Packaging (NPM - Futuro)

Para publicar no npm:

```bash
# Atualizar versão
npm version patch # ou minor, major

# Publicar
npm publish
```

Usuários poderão instalar via:

```bash
npm install -g topdesk-mcp-server
```

E usar diretamente no Claude Desktop:

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

## 🔄 CI/CD (Futuro)

Pipeline planejado:
1. Lint check
2. Type check
3. Build
4. Tests
5. Publish (se tag)

Exemplo GitHub Actions:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

## 📝 Checklist de Deploy

- [ ] Credenciais configuradas corretamente
- [ ] Build executado sem erros
- [ ] Caminho absoluto correto no config do Claude
- [ ] Permissões do usuário/token verificadas
- [ ] Claude Desktop reiniciado
- [ ] Teste básico realizado (ex: obter versão da API)
- [ ] Documentação atualizada
- [ ] CHANGELOG atualizado

## 🆘 Suporte

Se encontrar problemas durante deploy:
1. Verificar logs do Claude Desktop
2. Testar conexão com API TOPdesk manualmente
3. Verificar permissões de arquivo
4. Consultar QUICKSTART.md
5. Abrir issue no GitHub

---

**Última atualização**: 2026-03-27
