# TOPdesk MCP Server - Quick Start Guide

## 🚀 Início Rápido

### 1. Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd topdesk-mcp-server

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
nano .env  # ou seu editor preferido
```

### 2. Configuração

Edite o arquivo `.env`:

```bash
TOPDESK_BASE_URL=https://centraldeservicos.bancosemear.com.br/tas/api
TOPDESK_USERNAME=seu_usuario
TOPDESK_PASSWORD=sua_senha
```

### 3. Build

```bash
npm run build
```

### 4. Teste Local

```bash
npm start
```

O servidor deve iniciar e exibir: `TOPdesk MCP Server running on stdio`

### 5. Configuração no Claude Desktop

Adicione ao arquivo de configuração do Claude:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "topdesk": {
      "command": "node",
      "args": ["/caminho/completo/para/topdesk-mcp-server/dist/index.js"],
      "env": {
        "TOPDESK_BASE_URL": "https://centraldeservicos.bancosemear.com.br/tas/api",
        "TOPDESK_USERNAME": "seu_usuario",
        "TOPDESK_PASSWORD": "sua_senha"
      }
    }
  }
}
```

**Importante**: Substitua `/caminho/completo/para/topdesk-mcp-server` pelo caminho absoluto real.

### 6. Reinicie o Claude Desktop

Após adicionar a configuração, reinicie o Claude Desktop para carregar o servidor MCP.

## 🎯 Testando

No Claude Desktop, você pode testar com comandos como:

- "Liste os últimos incidents"
- "Obtenha o incident C2603-33650"
- "Crie um novo incident sobre problema de rede"
- "Liste todas as categorias disponíveis"
- "Obtenha a versão da API do TOPdesk"

## 📚 Exemplos de Uso

### Listar Incidents Abertos

```
Liste os incidents que não estão fechados, limitado a 10 resultados
```

### Buscar Incident Específico

```
Obtenha os detalhes do incident número C2603-33650
```

### Criar Novo Incident

```
Crie um novo incident com a descrição "Sistema lento", 
categoria de Hardware, impacto alto e urgência normal
```

### Atualizar Incident

```
Atualize o incident C2603-33650 adicionando a ação 
"Servidor reiniciado, sistema voltou ao normal" e 
marque como completo
```

### Listar Categorias

```
Liste todas as categorias disponíveis para incidents
```

### Buscar Changes

```
Liste os changes abertos com status pending
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"

Certifique-se de executar `npm install` e `npm run build`.

### Erro: "TOPDESK_BASE_URL is required"

Verifique se as variáveis de ambiente estão configuradas corretamente.

### Erro: "401 Unauthorized"

Verifique suas credenciais (username/password) no arquivo de configuração.

### Claude Desktop não reconhece o servidor

1. Verifique se o caminho no config está correto (absoluto)
2. Verifique se o arquivo `dist/index.js` existe
3. Reinicie o Claude Desktop
4. Verifique os logs do Claude Desktop

## 📖 Documentação Completa

Consulte [README.md](README.md) para documentação completa.

## 🤝 Suporte

- Issues: Abra uma issue no GitHub
- Documentação: [TOPdesk API Docs](https://developers.topdesk.com/)
- MCP Spec: [Model Context Protocol](https://modelcontextprotocol.io/)
