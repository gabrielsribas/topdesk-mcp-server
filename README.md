# TOPdesk MCP Server

[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-blue)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Servidor Model Context Protocol (MCP) para integração com TOPdesk IT Management. Este servidor permite que modelos de IA interajam com a API REST do TOPdesk para gerenciar incidents, changes, services e outras funcionalidades.

## ⚠️ Disclaimer

**This is an unofficial, independent project and is not affiliated with, endorsed by, or supported by TOPdesk.**

- This project is a third-party integration that uses the publicly available TOPdesk REST API
- "TOPdesk" is a registered trademark of TOPdesk
- This software is provided "as is" under the MIT License
- For official TOPdesk products and support, visit [topdesk.com](https://www.topdesk.com/)

---

## 🎯 Funcionalidades

### 📋 Incident Management
- Listar, buscar e filtrar incidents
- Obter incident por número ou ID
- Criar novos incidents
- Atualizar incidents existentes
- Visualizar histórico (progress trail)
- Arquivar, escalar e desescalar incidents
- Consultar metadados (categorias, status, prioridades, etc.)

### 🔄 Change Management
- Listar e filtrar changes
- Obter change por ID
- Criar e atualizar changes
- Visualizar histórico de changes
- Arquivar changes
- Consultar metadados de changes

### 🛠️ Service Management
- Listar e buscar services
- Obter detalhes de services
- Criar novos services

### 🌐 General APIs
- Busca genérica na API
- Consultar versões (API e produto)
- Listar categorias globais

## 📦 Instalação

### Pré-requisitos
- Node.js >= 18.0.0
- Conta TOPdesk com acesso à API

### Passos de Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd topdesk-mcp-server

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Edite o arquivo .env com suas credenciais
# TOPDESK_BASE_URL=https://sua-instancia.topdesk.net/tas/api
# TOPDESK_USERNAME=seu_usuario
# TOPDESK_PASSWORD=sua_senha

# Compile o projeto
npm run build
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes configurações:

```bash
# URL base da API TOPdesk (obrigatório)
TOPDESK_BASE_URL=https://your-instance.topdesk.net/tas/api

# Autenticação por usuário/senha (opção 1)
TOPDESK_USERNAME=seu_usuario
TOPDESK_PASSWORD=sua_senha

# OU autenticação por token (opção 2)
# TOPDESK_API_TOKEN=seu_token_api
```

### Configuração no Claude Desktop

Para usar com Claude Desktop, adicione ao seu arquivo de configuração:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### Opção 1: Via GitHub (Recomendado - Sem instalar localmente)

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

**Vantagens**:
- ✅ Não precisa clonar o repositório
- ✅ Sempre usa a versão mais recente do branch
- ✅ Funciona em qualquer máquina com Node.js
- ✅ Ideal para containers e ambientes efêmeros

#### Opção 2: Local (Desenvolvimento)

```json
{
  "mcpServers": {
    "topdesk": {
      "command": "node",
      "args": ["/caminho/absoluto/para/topdesk-mcp-server/dist/index.js"],
      "env": {
        "TOPDESK_BASE_URL": "https://your-instance.topdesk.net/tas/api",
        "TOPDESK_USERNAME": "seu_usuario",
        "TOPDESK_PASSWORD": "sua_senha"
      }
    }
  }
}
```

**Importante**: Substitua `seu-usuario` pelo seu usuário do GitHub onde o repositório está publicado.

## 🚀 Uso

### Executar Localmente

```bash
# Modo desenvolvimento (com recompilação automática)
npm run dev

# Modo produção
npm start
```

### Exemplos de Tools Disponíveis

#### Listar Incidents

```javascript
// Tool: topdesk_list_incidents
{
  "page_size": 10,
  "closed": false,
  "operator": "operador-id"
}
```

#### Obter Incident por Número

```javascript
// Tool: topdesk_get_incident_by_number
{
  "number": "C2603-33650"
}
```

#### Criar Novo Incident

```javascript
// Tool: topdesk_create_incident
{
  "briefDescription": "Sistema lento",
  "request": "O sistema está muito lento desde esta manhã. Vários usuários reportaram o problema.",
  "category": "categoria-id",
  "impact": "impacto-id",
  "urgency": "urgencia-id",
  "operator": "operador-id"
}
```

#### Atualizar Incident

```javascript
// Tool: topdesk_update_incident
{
  "number": "C2603-33650",
  "action": "Reiniciado o servidor. Sistema voltou ao normal.",
  "processingStatus": "status-id",
  "completed": true
}
```

#### Listar Changes

```javascript
// Tool: topdesk_list_changes
{
  "page_size": 20,
  "closed": false,
  "status": "pending"
}
```

## 📚 API Reference

### Incidents Tools

| Tool | Descrição |
|------|-----------|
| `topdesk_list_incidents` | Lista incidents com filtros |
| `topdesk_get_incident_by_number` | Obtém incident por número |
| `topdesk_get_incident_by_id` | Obtém incident por ID |
| `topdesk_create_incident` | Cria novo incident |
| `topdesk_update_incident` | Atualiza incident |
| `topdesk_get_incident_progress_trail` | Obtém histórico do incident |
| `topdesk_archive_incident` | Arquiva incident |
| `topdesk_escalate_incident` | Escala incident |
| `topdesk_deescalate_incident` | Desescala incident |
| `topdesk_get_incident_call_types` | Lista tipos de chamado |
| `topdesk_get_incident_statuses` | Lista status |
| `topdesk_get_incident_categories` | Lista categorias |
| `topdesk_get_incident_subcategories` | Lista subcategorias |
| `topdesk_get_incident_priorities` | Lista prioridades |
| `topdesk_get_incident_impacts` | Lista impactos |
| `topdesk_get_incident_urgencies` | Lista urgências |

### Changes Tools

| Tool | Descrição |
|------|-----------|
| `topdesk_list_changes` | Lista changes |
| `topdesk_get_change_by_id` | Obtém change por ID |
| `topdesk_create_change` | Cria novo change |
| `topdesk_update_change` | Atualiza change |
| `topdesk_get_change_progress_trail` | Obtém histórico do change |
| `topdesk_archive_change` | Arquiva change |
| `topdesk_get_change_statuses` | Lista status de changes |
| `topdesk_get_change_benefits` | Lista benefícios |
| `topdesk_get_change_impacts` | Lista impactos |

### Services Tools

| Tool | Descrição |
|------|-----------|
| `topdesk_list_services` | Lista services |
| `topdesk_get_service_by_id` | Obtém service por ID |
| `topdesk_create_service` | Cria novo service |

### General Tools

| Tool | Descrição |
|------|-----------|
| `topdesk_get_api_version` | Obtém versão da API |
| `topdesk_get_product_version` | Obtém versão do TOPdesk |
| `topdesk_search` | Busca genérica |
| `topdesk_get_categories` | Lista categorias |

## 🏗️ Arquitetura

```
topdesk-mcp-server/
├── src/
│   ├── index.ts              # Servidor MCP principal
│   ├── client/
│   │   └── topdesk-client.ts # Cliente HTTP para API TOPdesk
│   └── types/
│       └── topdesk.ts        # Tipos TypeScript da API
├── dist/                     # Código compilado
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔒 Segurança

- **Autenticação**: Suporta Basic Auth (username/password) ou API Token
- **Variáveis de ambiente**: Credenciais armazenadas em `.env` (não commitado)
- **HTTPS**: Todas as comunicações via HTTPS
- **Timeout**: Requisições com timeout de 30 segundos

## 🐛 Troubleshooting

### Erro de Autenticação

```
TOPdesk API error (401): Unauthorized
```

**Solução**: Verifique se as credenciais em `.env` estão corretas.

### Erro de Conexão

```
TOPdesk API error: connect ETIMEDOUT
```

**Solução**: Verifique se a URL base está correta e se há conectividade de rede.

### Tool não encontrado

```
Error: Unknown tool: topdesk_xxx
```

**Solução**: Verifique se o nome do tool está correto. Consulte a lista de tools disponíveis.

## 📖 Documentação Adicional

- [TOPdesk API Documentation](https://developers.topdesk.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Minha nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para histórico de versões.

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## ⚖️ Legal

This project is **not affiliated with TOPdesk.** TOPdesk® is a registered trademark. All product names, trademarks, and registered trademarks are property of their respective owners.

This software interacts with the TOPdesk REST API according to its published documentation and terms of service. Users are responsible for ensuring their use of the TOPdesk API complies with TOPdesk's terms and conditions.

## 👥 Autores

Desenvolvido por uma equipe sênior especializada em MCP Servers e integrações de IT Management.

## 🙏 Agradecimentos

- [TOPdesk](https://www.topdesk.com/) pela API robusta
- [Anthropic](https://www.anthropic.com/) pelo MCP SDK
- Comunidade Open Source
