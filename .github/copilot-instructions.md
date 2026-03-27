# GitHub Copilot Instructions - TOPdesk MCP Server

## 🎯 Visão Geral do Projeto

Este é um **servidor Model Context Protocol (MCP)** especializado em integração com **TOPdesk IT Management**. O projeto é desenvolvido em TypeScript com foco em:

- Qualidade de código enterprise-grade
- Tipos fortemente tipados seguindo a especificação OpenAPI do TOPdesk
- Arquitetura modular e escalável
- Seguir rigorosamente a especificação MCP
- Não inventar, não alucinar, não criar ambiguidades

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios

```
topdesk-mcp-server/
├── src/
│   ├── index.ts              # Ponto de entrada do servidor MCP
│   ├── client/
│   │   └── topdesk-client.ts # Cliente HTTP para API TOPdesk
│   └── types/
│       └── topdesk.ts        # Definições de tipos TypeScript
├── dist/                     # Código compilado (gerado)
├── .github/
│   └── copilot-instructions.md # Este arquivo
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
└── CHANGELOG.md
```

### Componentes Principais

#### 1. **index.ts** - Servidor MCP
- Responsável pela inicialização do servidor MCP
- Define todos os tools disponíveis
- Implementa handlers para `ListToolsRequest` e `CallToolRequest`
- Gerencia lifecycle do servidor (start, shutdown)
- Usa `StdioServerTransport` para comunicação

#### 2. **topdesk-client.ts** - Cliente API
- Encapsula toda comunicação HTTP com TOPdesk
- Usa Axios para requisições HTTP
- Implementa autenticação (Basic Auth ou Token)
- Possui interceptors para logging e tratamento de erros
- Métodos organizados por módulo (Incidents, Changes, Services, General)

#### 3. **topdesk.ts** - Tipos TypeScript
- Define interfaces TypeScript baseadas na OpenAPI spec do TOPdesk
- Tipos para entidades: Incident, Change, Service, etc.
- Tipos para requests: CreateBody, UpdateBody, ListParams
- Tipos auxiliares: IdAndName, Dropdown, Operator, etc.

## 📋 Escopo do Projeto

### APIs Focadas (Prioridade Alta)
1. **General** - APIs gerais (versão, busca, categorias)
2. **Incidents** - Gerenciamento completo de incidents
3. **Change** - Gerenciamento completo de changes
4. **Services** - Gerenciamento de services

### APIs Secundárias (Futuro)
- Knowledge Base
- Reservations
- Assets
- Operations Management
- Visitors
- Supporting Files

## 🔧 Padrões de Código

### TypeScript
```typescript
// ✅ BOM - Tipos explícitos, interfaces bem definidas
export interface IncidentCreateBody {
  callerLookup?: string;
  briefDescription: string;
  request?: string;
  // ... outros campos
}

async createIncident(data: IncidentCreateBody): Promise<Incident> {
  const response = await this.client.post<Incident>('/incidents', data);
  return response.data;
}

// ❌ RUIM - Tipos any, sem validação
async createIncident(data: any): Promise<any> {
  return this.client.post('/incidents', data);
}
```

### MCP Tools
```typescript
// ✅ BOM - Schema bem definido, descrições claras
{
  name: 'topdesk_create_incident',
  description: 'Cria um novo incident no TOPdesk. Requer pelo menos briefDescription.',
  inputSchema: {
    type: 'object',
    properties: {
      briefDescription: {
        type: 'string',
        description: 'Descrição breve do incident (obrigatório)',
      },
      // ... outros campos
    },
    required: ['briefDescription'],
  },
}

// ❌ RUIM - Descrições vagas, schema incompleto
{
  name: 'create_incident',
  description: 'Creates incident',
  inputSchema: {
    type: 'object',
    properties: {
      description: { type: 'string' }
    }
  }
}
```

### Tratamento de Erros
```typescript
// ✅ BOM - Erros informativos, contexto preservado
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      throw new Error(`TOPdesk API error (${status}): ${message}`);
    }
    throw error;
  }
);

// ❌ RUIM - Erro genérico, sem contexto
catch (error) {
  throw new Error('API error');
}
```

## 🎯 Convenções de Nomenclatura

### Tools MCP
- Padrão: `topdesk_<módulo>_<ação>`
- Exemplos:
  - `topdesk_list_incidents`
  - `topdesk_get_incident_by_number`
  - `topdesk_create_change`
  - `topdesk_get_change_progress_trail`

### Métodos do Cliente
- Padrão: `<ação><Entidade><Complemento>`
- Exemplos:
  - `listIncidents()`
  - `getIncidentByNumber()`
  - `createIncident()`
  - `patchIncidentById()`

### Tipos TypeScript
- Entidades: PascalCase sem sufixo (`Incident`, `Change`, `Service`)
- Request Bodies: `<Entidade>CreateBody`, `<Entidade>UpdateBody`
- Query Params: `<Entidade>ListParams`
- Responses: `ListResponse<T>`, `ErrorResponse`

## 📚 Referências da API TOPdesk

### Documentação Consultada
- [General API](https://developers.topdesk.com/explorer/?page=general)
- [Incident API](https://developers.topdesk.com/explorer/?page=incident)
- [Change API](https://developers.topdesk.com/explorer/?page=change)
- [Services API](https://developers.topdesk.com/explorer/?page=services)

### Endpoints Principais

#### Incidents
```
GET    /incidents                  # Lista incidents
GET    /incidents/number/{number}  # Obtém por número (ex: C2603-33650)
GET    /incidents/id/{id}          # Obtém por ID
POST   /incidents                  # Cria incident
PATCH  /incidents/id/{id}          # Atualiza incident
GET    /incidents/id/{id}/progresstrail  # Histórico
PUT    /incidents/id/{id}/archive  # Arquiva
PUT    /incidents/id/{id}/escalate # Escala
```

#### Changes
```
GET    /operatorChanges            # Lista changes
GET    /operatorChanges/{id}       # Obtém change
POST   /operatorChanges            # Cria change
PATCH  /operatorChanges/{id}       # Atualiza change
GET    /operatorChanges/{id}/progresstrail  # Histórico
POST   /operatorChanges/{id}/archive        # Arquiva
```

#### Services
```
GET    /services                   # Lista services
GET    /services/{id}              # Obtém service
POST   /services                   # Cria service
```

## 🔐 Autenticação

### Basic Auth (Padrão)
```typescript
const auth = {
  Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
};
```

### API Token (Alternativa)
```typescript
const auth = {
  Authorization: `Bearer ${apiToken}`
};
```

### Variáveis de Ambiente
- `TOPDESK_BASE_URL` - URL base da API (obrigatório)
- `TOPDESK_USERNAME` - Username para Basic Auth
- `TOPDESK_PASSWORD` - Password para Basic Auth
- `TOPDESK_API_TOKEN` - Token para Bearer Auth (alternativa)

## 🛠️ Comandos Úteis

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Compilar com watch mode
npm run watch

# Executar servidor
npm start

# Desenvolvimento (build + run)
npm run dev
```

## 🐛 Debugging

### Logs
- Cliente TOPdesk loga todas as requisições via `console.error`
- Formato: `[TOPdesk] <METHOD> <URL>`
- Logs vão para stderr para não interferir com MCP stdio

### Erros Comuns

1. **401 Unauthorized**
   - Verificar credenciais em `.env`
   - Validar formato Base64 do Basic Auth

2. **404 Not Found**
   - Verificar se endpoint existe na versão do TOPdesk
   - Conferir URL base (deve terminar com `/tas/api`)

3. **422 Unprocessable Entity**
   - Validar campos obrigatórios no body
   - Verificar IDs de referência (categoria, operador, etc.)

4. **Timeout**
   - Padrão: 30 segundos
   - Verificar conectividade de rede

## 📝 Documentação

### Manter Atualizado
1. **README.md** - Documentação principal para usuários
2. **CHANGELOG.md** - Histórico de mudanças (seguir Keep a Changelog)
3. **copilot-instructions.md** - Este arquivo (orientações técnicas)

### Não Criar Documentação Excessiva
- ❌ Não criar arquivos de docs individuais para cada feature
- ❌ Não duplicar informação entre arquivos
- ✅ Manter README conciso e objetivo
- ✅ CHANGELOG com mudanças relevantes

## 🧪 Testing (Futuro)

### Planejado
- Testes unitários com Jest
- Mocks do cliente Axios
- Testes de integração com API sandbox
- Validação de schemas Zod

## 🔄 Workflow de Desenvolvimento

### Adicionar Novo Tool

1. **Criar método no cliente** (`topdesk-client.ts`)
   ```typescript
   async getIncidentByNumber(number: string): Promise<Incident> {
     const response = await this.client.get<Incident>(`/incidents/number/${number}`);
     return response.data;
   }
   ```

2. **Adicionar tool definition** (`index.ts`)
   ```typescript
   {
     name: 'topdesk_get_incident_by_number',
     description: '...',
     inputSchema: { ... }
   }
   ```

3. **Implementar handler** (`index.ts`)
   ```typescript
   if (name === 'topdesk_get_incident_by_number') {
     const { number } = args as { number: string };
     const incident = await topdeskClient.getIncidentByNumber(number);
     return { content: [{ type: 'text', text: JSON.stringify(incident, null, 2) }] };
   }
   ```

4. **Atualizar README** - Adicionar à tabela de tools

5. **Atualizar CHANGELOG** - Adicionar em [Unreleased]

### Adicionar Nova Entidade

1. **Definir tipos** (`topdesk.ts`)
2. **Implementar cliente** (`topdesk-client.ts`)
3. **Criar tools MCP** (`index.ts`)
4. **Documentar** (README + CHANGELOG)

## 🎓 Aprendizados e Fixes Importantes

### Fix: Tipos de Erro no Axios
```typescript
// ❌ PROBLEMA: error tem tipo implícito any
(error) => { ... }

// ✅ SOLUÇÃO: Tipar explicitamente
(error: any) => { 
  if (error.response) { ... }
}
```

### Fix: Console no Node.js
```typescript
// ✅ Usar console.error para logging (não interfere com stdio)
console.error(`[TOPdesk] ${method} ${url}`);

// ❌ NUNCA usar console.log (interfere com MCP stdio)
console.log('...');
```

### Fix: Buffer no TypeScript
```typescript
// ✅ Buffer está disponível automaticamente no Node.js
const encoded = Buffer.from(`${user}:${pass}`).toString('base64');

// Certificar que tsconfig.json inclui @types/node
```

### Best Practice: Parâmetros Opcionais
```typescript
// ✅ BOM - Suporta id OU number
async getIncidentProgressTrail(id?: string, number?: string) {
  if (id) return this.getById(id);
  if (number) return this.getByNumber(number);
  throw new Error('Either id or number must be provided');
}

// ❌ RUIM - Força apenas um método
async getIncidentProgressTrailById(id: string) { ... }
```

## 🚀 Próximos Passos

### Roadmap Técnico
1. ✅ Estrutura base do projeto
2. ✅ Cliente TOPdesk com autenticação
3. ✅ Tools para Incidents (completo)
4. ✅ Tools para Changes
5. ✅ Tools para Services
6. ✅ Tools para General APIs
7. 🔄 Testes automatizados
8. 🔄 CI/CD pipeline
9. 🔄 Docker support
10. 🔄 Rate limiting & retry logic

### Features Planejadas
- Attachments support
- Time spent registration
- Custom fields helpers
- Batch operations
- Cache de metadados
- Webhooks integration

## 📞 Suporte

Para questões técnicas:
1. Consultar [TOPdesk API Docs](https://developers.topdesk.com/)
2. Verificar este arquivo (copilot-instructions.md)
3. Consultar CHANGELOG para mudanças recentes
4. Verificar issues conhecidas no README

---

**Última atualização**: 2026-03-27
**Versão do projeto**: 1.0.0
**Mantido por**: Equipe de desenvolvimento sênior especializada em MCP Servers