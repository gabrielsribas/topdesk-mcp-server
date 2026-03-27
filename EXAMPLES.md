# Exemplos de Uso - TOPdesk MCP Server

Este documento contém exemplos práticos de como usar os tools do TOPdesk MCP Server.

## 📋 Incidents

### Exemplo 1: Listar Últimos Incidents Abertos

**Comando no Claude:**
```
Liste os últimos 10 incidents que não estão fechados
```

**Tool usado:** `topdesk_list_incidents`

**Parâmetros:**
```json
{
  "page_size": 10,
  "closed": false
}
```

**Resposta esperada:**
Lista de incidents com id, number, briefDescription, status, caller, etc.

---

### Exemplo 2: Buscar Incident por Número

**Comando no Claude:**
```
Obtenha os detalhes completos do incident C2603-33650
```

**Tool usado:** `topdesk_get_incident_by_number`

**Parâmetros:**
```json
{
  "number": "C2603-33650"
}
```

**Resposta esperada:**
Objeto Incident completo com todos os campos.

---

### Exemplo 3: Criar Incident Simples

**Comando no Claude:**
```
Crie um novo incident com a descrição "Impressora não funciona" 
para o usuário joão.silva@empresa.com
```

**Tool usado:** `topdesk_create_incident`

**Parâmetros mínimos:**
```json
{
  "briefDescription": "Impressora não funciona",
  "caller": {
    "email": "joao.silva@empresa.com"
  }
}
```

---

### Exemplo 4: Criar Incident Completo

**Comando no Claude:**
```
Crie um incident sobre problema de rede com:
- Descrição: "Rede lenta no escritório"
- Categoria: "Infraestrutura"
- Subcategoria: "Rede"
- Impacto: Alto
- Urgência: Normal
- Operador: João Santos
```

**Tool usado:** `topdesk_create_incident`

**Processo:**
1. Primeiro obter IDs usando metadata tools:
   - `topdesk_get_incident_categories` → Pegar ID de "Infraestrutura"
   - `topdesk_get_incident_subcategories` → Pegar ID de "Rede"
   - `topdesk_get_incident_impacts` → Pegar ID de "Alto"
   - `topdesk_get_incident_urgencies` → Pegar ID de "Normal"

2. Criar incident:
```json
{
  "briefDescription": "Rede lenta no escritório",
  "request": "Vários usuários reportaram lentidão na rede desde esta manhã",
  "category": "categoria-id-infraestrutura",
  "subcategory": "subcategoria-id-rede",
  "impact": "impacto-id-alto",
  "urgency": "urgencia-id-normal",
  "operator": "operador-id-joao"
}
```

---

### Exemplo 5: Atualizar Incident

**Comando no Claude:**
```
Atualize o incident C2603-33650 adicionando a ação:
"Switch principal reiniciado. Rede voltou ao normal."
e marque como completo
```

**Tool usado:** `topdesk_update_incident`

**Parâmetros:**
```json
{
  "number": "C2603-33650",
  "action": "Switch principal reiniciado. Rede voltou ao normal.",
  "completed": true
}
```

---

### Exemplo 6: Ver Histórico de Incident

**Comando no Claude:**
```
Mostre o histórico completo de ações do incident C2603-33650
```

**Tool usado:** `topdesk_get_incident_progress_trail`

**Parâmetros:**
```json
{
  "number": "C2603-33650"
}
```

**Resposta esperada:**
Array de ProgressTrail entries com datas, operadores e ações.

---

### Exemplo 7: Arquivar Incident

**Comando no Claude:**
```
Arquive o incident C2603-33650 com o motivo "Problema resolvido"
```

**Tool usado:** `topdesk_archive_incident`

**Parâmetros:**
```json
{
  "number": "C2603-33650",
  "reason": "Problema resolvido"
}
```

---

### Exemplo 8: Filtrar Incidents por Categoria

**Comando no Claude:**
```
Liste todos os incidents da categoria "Hardware" que não estão fechados
```

**Processo:**
1. Obter ID da categoria:
```json
// Tool: topdesk_get_incident_categories
// Procurar categoria "Hardware" e pegar o ID
```

2. Listar incidents:
```json
{
  "category": "categoria-id-hardware",
  "closed": false,
  "page_size": 50
}
```

---

## 🔄 Changes

### Exemplo 9: Listar Changes Pendentes

**Comando no Claude:**
```
Liste todos os changes com status pendente
```

**Tool usado:** `topdesk_list_changes`

**Parâmetros:**
```json
{
  "closed": false,
  "page_size": 20
}
```

---

### Exemplo 10: Criar Change Request

**Comando no Claude:**
```
Crie um change request para:
- Descrição: "Atualização do servidor de aplicação"
- Solicitante: maria.santos@empresa.com
- Tipo: Standard
- Impacto: Médio
```

**Tool usado:** `topdesk_create_change`

**Parâmetros:**
```json
{
  "briefDescription": "Atualização do servidor de aplicação",
  "request": "Atualização da versão 2.1 para 2.3 do servidor de aplicação principal",
  "requester": "requester-id-maria",
  "changeType": "Standard",
  "impact": "impacto-id-medio"
}
```

---

### Exemplo 11: Atualizar Change

**Comando no Claude:**
```
Atualize o change CH-2024-001 mudando o status 
para "Em progresso" e adicionando nota sobre início da execução
```

**Tool usado:** `topdesk_update_change`

**Parâmetros:**
```json
{
  "id": "change-id-uuid",
  "processingStatus": "status-id-em-progresso"
}
```

---

### Exemplo 12: Ver Histórico de Change

**Comando no Claude:**
```
Mostre todo o histórico de ações do change CH-2024-001
```

**Tool usado:** `topdesk_get_change_progress_trail`

**Parâmetros:**
```json
{
  "id": "change-id-uuid"
}
```

---

## 🛠️ Services

### Exemplo 13: Listar Todos os Serviços

**Comando no Claude:**
```
Liste todos os serviços ativos do TOPdesk
```

**Tool usado:** `topdesk_list_services`

**Parâmetros:**
```json
{
  "archived": false,
  "page_size": 50
}
```

---

### Exemplo 14: Criar Novo Serviço

**Comando no Claude:**
```
Crie um novo serviço chamado "Email Corporativo"
com descrição "Serviço de email para todos os colaboradores"
```

**Tool usado:** `topdesk_create_service`

**Parâmetros:**
```json
{
  "name": "Email Corporativo",
  "description": "Serviço de email para todos os colaboradores",
  "active": true
}
```

---

## 🌐 General

### Exemplo 15: Verificar Versão

**Comando no Claude:**
```
Qual a versão da API do TOPdesk?
```

**Tool usado:** `topdesk_get_api_version`

**Parâmetros:**
```json
{}
```

---

### Exemplo 16: Buscar por Texto

**Comando no Claude:**
```
Busque no TOPdesk por "impressora"
```

**Tool usado:** `topdesk_search`

**Parâmetros:**
```json
{
  "query": "impressora"
}
```

---

### Exemplo 17: Listar Categorias Globais

**Comando no Claude:**
```
Quais são todas as categorias disponíveis no TOPdesk?
```

**Tool usado:** `topdesk_get_categories`

**Parâmetros:**
```json
{}
```

---

## 🎯 Workflows Comuns

### Workflow 1: Criar Incident com Categoria

```
1. "Liste as categorias de incident disponíveis"
   → topdesk_get_incident_categories

2. "Liste as subcategorias da categoria Hardware"
   → topdesk_get_incident_subcategories

3. "Crie um incident sobre mouse quebrado, categoria Hardware, subcategoria Periféricos"
   → topdesk_create_incident (usando IDs obtidos)
```

---

### Workflow 2: Investigar Incident

```
1. "Liste os últimos incidents abertos"
   → topdesk_list_incidents

2. "Obtenha detalhes do incident C2603-33650"
   → topdesk_get_incident_by_number

3. "Mostre o histórico desse incident"
   → topdesk_get_incident_progress_trail

4. "Atualize o incident adicionando que o problema foi identificado"
   → topdesk_update_incident
```

---

### Workflow 3: Gerenciar Change Request

```
1. "Liste os changes pendentes"
   → topdesk_list_changes

2. "Obtenha detalhes do change CH-2024-001"
   → topdesk_get_change_by_id

3. "Atualize o change para em progresso"
   → topdesk_update_change

4. "Mostre o histórico do change"
   → topdesk_get_change_progress_trail

5. "Arquive o change após conclusão"
   → topdesk_archive_change
```

---

## 💡 Dicas

### Obter Metadados Primeiro

Antes de criar/atualizar, obtenha os IDs necessários:

```
# Sempre útil ter à mão:
- topdesk_get_incident_categories
- topdesk_get_incident_subcategories
- topdesk_get_incident_priorities
- topdesk_get_incident_impacts
- topdesk_get_incident_urgencies
- topdesk_get_incident_statuses
```

### Filtros Úteis

**Paginação:**
```json
{
  "start": 0,
  "page_size": 100
}
```

**Filtro por Data:**
```json
{
  "creationDateStart": "2024-01-01",
  "creationDateEnd": "2024-01-31"
}
```

**Múltiplos Filtros:**
```json
{
  "closed": false,
  "operator": "operador-id",
  "category": "categoria-id",
  "page_size": 50
}
```

---

## 🚨 Erros Comuns

### Erro: "briefDescription is required"

**Problema:** Tentou criar incident sem descrição.

**Solução:**
```json
{
  "briefDescription": "Descrição obrigatória aqui"
}
```

### Erro: "Invalid category ID"

**Problema:** ID de categoria inválido.

**Solução:** Obter ID correto via `topdesk_get_incident_categories` primeiro.

### Erro: "Either id or number must be provided"

**Problema:** Tentou atualizar/buscar sem informar identificador.

**Solução:**
```json
{
  "id": "uuid-do-incident"
}
// OU
{
  "number": "C2603-33650"
}
```

---

Para mais exemplos, consulte:
- [README.md](README.md)
- [QUICKSTART.md](QUICKSTART.md)
- [TOPdesk API Docs](https://developers.topdesk.com/)
