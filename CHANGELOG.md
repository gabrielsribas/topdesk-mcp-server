# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### 🔥 BREAKING CHANGES

#### Incident Filters - Agora Usa FIQL
- **CRÍTICO**: `IncidentListParams` completamente reescrito para refletir API real do TOPdesk
- **REMOVIDOS** parâmetros que não existem na API: `resolved`, `closed`, `operator`, `category`, `caller`, etc.
- **ADICIONADOS** parâmetros reais da API: `pageStart`, `pageSize`, `query` (FIQL), `sort`, `fields`, `dateFormat`, `all`
- Filtros complexos agora requerem **FIQL** (Feed Item Query Language) no parâmetro `query`
- Exemplo: `query: "closed==false;creationDate=ge=2026-03-01T00:00:00Z"`

### ✨ Adicionado
- Arquivo `FIQL_EXAMPLES.md` com exemplos práticos de queries FIQL
- Documentação expandida em `API_LIMITATIONS.md` sobre uso de FIQL
- Exemplos de filtros: por data, operador, grupo, prioridade, categoria, etc.
- **Guideline de Context Window**: Como usar `fields` para evitar overflow

### 📝 Mudado
- Tool `topdesk_list_incidents` agora aceita parâmetros corretos da API do TOPdesk
- **Descrição do tool atualizada** para recomendar uso de `fields` e evitar context overflow
- **Recomendação**: `pageSize ≤ 20` sem fields, `pageSize = 50-100` com fields específico
- Interface `IncidentListParams` em `types/topdesk.ts` corrigida com comentários detalhados
- **Tools create/update incident** agora deixam CLARO que campos relacionais requerem UUIDs:
  - `operator` → UUID (não nome "Gabriel dos Santos Ribas")
  - `operatorGroup` → UUID (não nome "Sustentação")
  - `caller`, `category`, `priority`, etc. → todos requerem UUID

### 🐛 Corrigido
- **Erro 400** ao filtrar incidents com parâmetros não suportados pela API
- Parâmetros `resolved=false`, `closed=false` causavam rejeição pela API
- Filtros diretos como `operator=uuid` não funcionavam (requerem FIQL: `query="operator.id==uuid"`)
- **Context Window Overflow** ao listar 100+ incidents sem especificar campos
- **Erro 400 ao atualizar incident com nome de operador** - agora exige UUID explicitamente
- **Erro 400 ao listar operators/persons/changes/services** - mapeamento `page_size` → `pageSize` e `start` → `pageStart` adicionado
- **Erro 400 ao criar/atualizar incident com UUID direto** - campos relacionais agora transformados para objeto `{id: uuid}`

### 📚 Documentação
- Adicionado tutorial completo de FIQL em `FIQL_EXAMPLES.md`
- Atualizado `API_LIMITATIONS.md` com:
  - Seção sobre FIQL obrigatório
  - **Nova seção sobre Context Window Overflow**
  - **Nova seção sobre Create/Update requerem UUIDs**
  - Guideline de tamanho: pageSize vs fields
  - Tabela de mapeamento: campo → tool para obter UUID
- Documentado operadores FIQL: `==`, `!=`, `=lt=`, `=le=`, `=gt=`, `=ge=`, `;`, `,`
- Exemplos práticos para casos comuns: últimos 7/30 dias, por grupo, por operador, etc.
- **Campos recomendados** para diferentes casos de uso
- **Workflow completo** para atribuir incident a operador usando UUID

### ⚡ Performance
- Recomendação de usar `fields` para reduzir tamanho da resposta em 90%+
- Exemplo: 100 incidents com fields ~20KB vs sem fields ~200KB

### 🔧 Técnico
- Adicionado mapeamento automático de parâmetros snake_case → camelCase em:
  - `listOperators`: `page_size` → `pageSize`, `start` → `pageStart`
  - `listPersons`: `page_size` → `pageSize`, `start` → `pageStart`
  - `listChanges`: `page_size` → `pageSize`, `start` → `pageStart`
  - `listServices`: `page_size` → `pageSize`, `start` → `pageStart`
- Isso permite que MCP tools usem snake_case (padrão Python) enquanto API recebe camelCase (padrão JavaScript)
- **Adicionada transformação automática de campos relacionais:**
  - `operator: "uuid"` → `operator: {id: "uuid"}`
  - `category: "uuid"` → `category: {id: "uuid"}`
  - Aplica-se a: operator, operatorGroup, category, subcategory, priority, impact, urgency, callType, entryType, processingStatus, object, branch, mainIncident, escalationReason
  - Método `transformRelationalFields()` aplicado em create/update incidents

---

## [1.0.0] - 2026-03-27

### ✨ Adicionado

#### Incident Management
- Tool `topdesk_list_incidents` - Listar incidents com filtros avançados
- Tool `topdesk_get_incident_by_number` - Obter incident por número (ex: C2603-33650)
- Tool `topdesk_get_incident_by_id` - Obter incident por ID único
- Tool `topdesk_create_incident` - Criar novos incidents
- Tool `topdesk_update_incident` - Atualizar incidents (PATCH)
- Tool `topdesk_get_incident_progress_trail` - Visualizar histórico completo
- Tool `topdesk_archive_incident` - Arquivar incidents
- Tool `topdesk_escalate_incident` - Escalar incidents
- Tool `topdesk_deescalate_incident` - Desescalar incidents

#### Incident Metadata
- Tool `topdesk_get_incident_call_types` - Lista tipos de chamado
- Tool `topdesk_get_incident_statuses` - Lista status disponíveis
- Tool `topdesk_get_incident_categories` - Lista categorias
- Tool `topdesk_get_incident_subcategories` - Lista subcategorias
- Tool `topdesk_get_incident_priorities` - Lista prioridades
- Tool `topdesk_get_incident_impacts` - Lista impactos
- Tool `topdesk_get_incident_urgencies` - Lista urgências

#### Change Management
- Tool `topdesk_list_changes` - Listar changes com filtros
- Tool `topdesk_get_change_by_id` - Obter change por ID
- Tool `topdesk_create_change` - Criar novos changes
- Tool `topdesk_update_change` - Atualizar changes (PATCH)
- Tool `topdesk_get_change_progress_trail` - Visualizar histórico de change
- Tool `topdesk_archive_change` - Arquivar changes

#### Change Metadata
- Tool `topdesk_get_change_statuses` - Lista status de changes
- Tool `topdesk_get_change_benefits` - Lista benefícios
- Tool `topdesk_get_change_impacts` - Lista impactos de changes

#### Service Management
- Tool `topdesk_list_services` - Listar services
- Tool `topdesk_get_service_by_id` - Obter service por ID
- Tool `topdesk_create_service` - Criar novos services

#### General APIs
- Tool `topdesk_get_api_version` - Consultar versão da API
- Tool `topdesk_get_product_version` - Consultar versão do TOPdesk
- Tool `topdesk_search` - Busca genérica na API
- Tool `topdesk_get_categories` - Listar categorias globais

#### Infraestrutura
- Cliente HTTP robusto com autenticação Basic Auth
- Suporte para autenticação via API Token
- Tipos TypeScript completos para API TOPdesk
- Tratamento de erros com mensagens descritivas
- Interceptors para logging e debug
- Timeout configurável (30s)
- Validação de variáveis de ambiente
- Estrutura de projeto MCP modular

#### Documentação
- README.md completo com exemplos de uso
- CHANGELOG.md seguindo Keep a Changelog
- .github/copilot-instructions.md com orientações técnicas
- Arquivo .env.example com configurações necessárias
- Comentários detalhados no código
- Documentação inline dos types TypeScript

### 🔧 Configuração
- TypeScript 5.5 com configuração estrita
- Suporte para ES2022 e Node16 modules
- Build automatizado via tsc
- Scripts npm para dev e produção
- Git ignore configurado

### 📦 Dependências
- @modelcontextprotocol/sdk: ^1.0.4
- axios: ^1.7.2
- zod: ^3.23.8
- typescript: ^5.5.4
- @types/node: ^22.0.0

### 🎯 Foco Inicial
- APIs principais: General, Incidents, Change e Services
- Cobertura completa de operações CRUD
- Metadados e lookups para auxiliar criação/atualização
- Progress trail para auditoria e histórico

---

## [Unreleased]

### ✨ Adicionado

#### Operators & Persons Management
- Tool `topdesk_list_operators` - Buscar operadores por nome ou listar todos
- Tool `topdesk_get_operator_by_id` - Obter detalhes de operador específico
- Tool `topdesk_list_persons` - Buscar pessoas/usuários por nome
- Tool `topdesk_get_person_by_id` - Obter detalhes de pessoa específica
- Método `listOperators()` no cliente com suporte a busca por query
- Método `getOperatorById()` no cliente
- Método `listPersons()` no cliente com suporte a busca por query
- Método `getPersonById()` no cliente
- Tipo `Operator` em types/topdesk.ts

### 🐛 Corrigido
- Filtro automático de parâmetros vazios em `listIncidents()` para evitar erro 400
- Descrições melhoradas nos tools indicando que filtros requerem IDs, não nomes
- Orientação clara sobre uso do parâmetro `query` para busca por texto livre

### 📝 Documentação
- Adicionado DOCKER.md com guia completo de uso em containers
- Documentação sobre como buscar operadores antes de filtrar incidents
- Exemplos de workflow: buscar operador por nome e depois filtrar incidents

---

## [1.0.0] - 2026-03-27
- Suporte para attachments em incidents e changes
- Time spent registration em incidents
- Requester APIs (SSP users)
- Knowledge Base integration
- Assets management
- Reservations
- Operations Management
- Custom fields handling aprimorado
- Webhooks support
- Batch operations
- Rate limiting handling
- Retry logic com exponential backoff
- Cache de metadados
- Testes unitários e integração
- CI/CD pipeline
- Docker support

---

## Notas de Versão

### Sobre Autenticação
- Suporte para Basic Auth (username/password)
- Suporte para API Token (mais seguro)
- Credenciais via variáveis de ambiente

### Sobre Paginação
- Parâmetros `start` e `page_size` suportados
- Limite padrão: 10 resultados
- Máximo recomendado: 100 por página

### Sobre Filtros
- Filtros combinados com lógica AND
- Suporte para filtros por data
- Filtros específicos por módulo

### Breaking Changes
- Nenhum (primeira versão)

### Deprecated
- Nenhum (primeira versão)

### Segurança
- Todas as comunicações via HTTPS
- Credenciais não são logadas
- Timeout para evitar hanging requests
- Validação de entrada nos tools

### Known Issues
- Nenhum no momento

---

**Formato do Changelog:**
- ✨ Adicionado: Novas features
- 🔧 Alterado: Mudanças em funcionalidades existentes
- 🐛 Corrigido: Bug fixes
- 🗑️ Removido: Features removidas
- 🔒 Segurança: Vulnerabilidades corrigidas
- 📝 Documentação: Apenas mudanças de docs
- ⚡ Performance: Melhorias de performance
- ♻️ Refatoração: Code refactoring