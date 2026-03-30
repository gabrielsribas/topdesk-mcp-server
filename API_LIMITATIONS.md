# Limitações da API TOPdesk e Workarounds

Este documento descreve limitações conhecidas da API REST do TOPdesk e soluções alternativas.

## 🚫 Limitações Críticas

### 1. **Filtros de Incidents Requerem FIQL**

#### ❌ Problema
O endpoint `GET /incidents` **NÃO aceita** parâmetros de filtro diretos como:
- `resolved=false`
- `closed=false`
- `operator=uuid`
- `operatorGroup=uuid`
- `category=uuid`
- `creationDateStart=2026-03-01`

A API **rejeita com erro 400** se você enviar esses parâmetros.

#### ✅ Solução
Use o parâmetro `query` com sintaxe **FIQL (Feed Item Query Language)**.

**Parâmetros aceitos pela API:**
```typescript
{
  pageStart?: number;    // Offset para paginação (padrão: 0)
  pageSize?: number;     // Quantidade máxima (1-10000, padrão: 10)
  query?: string;        // Filtro FIQL para seleção de incidents
  sort?: string;         // Ordenação (ex: "creationDate:desc,targetDate:asc")
  fields?: string;       // Campos a retornar (separados por vírgula)
  dateFormat?: "iso8601"; // Formato de datas
  all?: boolean;         // Incluir incidents parciais e arquivados
}
```

**Exemplos de FIQL:**

```bash
# Incidents não fechados
query="closed==false"

# Incidents de um operador específico (requer UUID)
query="operator.id==12345678-1234-1234-1234-123456789012"

# Incidents do grupo "Sustentação" (requer UUID do grupo)
query="operatorGroup.id==uuid-do-grupo-sustentacao"

# Incidents criados nos últimos 30 dias
query="creationDate=ge=2026-03-01T00:00:00Z"

# Combinando múltiplos filtros (AND)
query="closed==false;creationDate=ge=2026-03-01T00:00:00Z"

# Usando OR
query="priority.id==urgent-uuid,priority.id==high-uuid"
```

**Operadores FIQL:**
- `==` - igual
- `!=` - diferente
- `=lt=` - menor que (less than)
- `=le=` - menor ou igual (less or equal)
- `=gt=` - maior que (greater than)
- `=ge=` - maior ou igual (greater or equal)
- `;` - AND lógico
- `,` - OR lógico

**Documentação oficial:**
- Tutorial FIQL: https://developers.topdesk.com/tutorial.html#query
- Especificação: https://developers.topdesk.com/swagger/incident_specification_4.2.2.yaml

---

### 2. **Busca de Operadores por Nome**

#### ❌ Problema
O endpoint `/operators` **não suporta** parâmetro `query` ou qualquer filtro por nome.

Parâmetros aceitos:
- `pageStart` - offset de paginação
- `pageSize` - quantidade de resultados
- `archived` - incluir arquivados

#### ✅ Solução
1. Liste **todos** os operadores com `page_size` grande (ex: 1000)
2. Filtre localmente pelo nome desejado
3. Use o ID para filtrar incidents

**Workflow:**
```
User: "Liste chamados do operador Gabriel dos Santos Ribas"

AI deve:
1. Chamar topdesk_list_operators(page_size=1000)
2. Receber: [{id:"uuid1",name:"Gabriel dos Santos Ribas"}, ...]
3. Filtrar localmente: encontrar UUID do Gabriel
4. Chamar topdesk_list_incidents(query="operator.id==uuid1")
```

---

### 3. **Busca de Persons por Nome**

#### ❌ Problema
O endpoint `/persons` **não suporta** parâmetro `query` ou qualquer filtro por nome.

Idêntico ao problema de operators.

#### ✅ Solução
1. Liste todas as persons com `page_size` grande (ex: 1000)
2. Filtre localmente
3. Use o ID para operações subsequentes

---

### 4. **Grupos de Operadores Requerem Endpoint Separado**

#### ❌ Problema
Para filtrar incidents por **grupo de operadores** (ex: "Sustentação"), você precisa do UUID do grupo.

O endpoint `/operatorgroups` não está implementado ainda neste servidor MCP.

#### ✅ Solução (Temporária)
1. Liste incidents sem filtro de grupo
2. Examine manualmente os grupos nos resultados
3. Extraia o UUID do grupo desejado

#### 🔧 Solução (Futura)
Será implementado:
- `topdesk_list_operator_groups` - lista todos os grupos
- `topdesk_get_operator_group_by_id` - obtém grupo por ID

Então o workflow será:
```
1. topdesk_list_operator_groups(page_size=1000)
2. Filtrar localmente: encontrar UUID do grupo "Sustentação"
3. topdesk_list_incidents(query="operatorGroup.id==uuid")
```

---

### 5. **Filtros de Data Requerem ISO 8601**

#### ❌ Problema
Datas devem estar no formato ISO 8601 com timezone.

**Não funciona:**
- `2026-03-01`
- `01/03/2026`
- `2026-03-01 00:00:00`

#### ✅ Solução
Use sempre ISO 8601 com timezone:
```
2026-03-01T00:00:00Z          # UTC
2026-03-01T00:00:00-03:00     # São Paulo (UTC-3)
2026-03-01T00:00:00+00:00     # UTC alternativo
```

**Exemplo para "últimos 30 dias":**
```javascript
const dataInicio = new Date();
dataInicio.setDate(dataInicio.getDate() - 30);
const query = `creationDate=ge=${dataInicio.toISOString()}`;
```

---

### 6. **IDs vs Nomes - Sempre Use UUIDs**

#### ❌ Problema
Todos os filtros relacionais requerem **IDs (UUIDs)**, não nomes:
- `operator.id` - UUID do operador
- `caller.id` - UUID do solicitante
- `category.id` - UUID da categoria
- `operatorGroup.id` - UUID do grupo
- `branch.id` - UUID da filial
- `object.id` - UUID do objeto

Tentar usar nomes resulta em **erro 400**.

#### ✅ Solução
Sempre obtenha o ID primeiro:
1. Liste a entidade (operators, categories, etc.)
2. Encontre o ID pelo nome
3. Use o ID no filtro FIQL

**Exemplo completo:**
```
User: "Liste chamados do time Sustentação dos últimos 7 dias"

AI workflow:
1. topdesk_list_operator_groups(page_size=1000)
   → Encontra: {id:"abc123",groupName:"Sustentação"}

2. Calcular data: hoje - 7 dias = 2026-03-23T00:00:00Z

3. topdesk_list_incidents({
     query: "operatorGroup.id==abc123;creationDate=ge=2026-03-23T00:00:00Z",
     pageSize: 100,
     sort: "creationDate:desc"
   })
```

---

## 📊 Tabela Resumo de Endpoints

| Endpoint | Suporta query? | Filtros disponíveis | Solução |
|----------|----------------|---------------------|---------|
| `/incidents` | ✅ Sim (FIQL) | query, pageStart, pageSize, sort, fields, all | Use FIQL no parâmetro query |
| `/operators` | ❌ Não | pageStart, pageSize, archived | Liste todos + filtre localmente |
| `/persons` | ❌ Não | pageStart, pageSize, archived | Liste todos + filtre localmente |
| `/operatorgroups` | ⚠️ Não implementado | - | Feature futura |
| `/incidents/categories` | N/A | - | Retorna lista completa |
| `/incidents/statuses` | N/A | - | Retorna lista completa |

---

## 🔍 Debugging - Como Identificar Problema 400

### Sintomas
```
TOPdesk API error (400): Request failed with status code 400
```

### Diagnóstico
1. **Verifique os parâmetros enviados**
   ```
   [TOPdesk] GET /incidents?resolved=false&closed=false&operator=Gabriel
   ```
   ❌ `resolved`, `closed`, `operator` não são aceitos diretamente

2. **Verifique se há parâmetros vazios**
   ```
   [TOPdesk] GET /operators?query=
   ```
   ❌ String vazia causa erro 400

3. **Verifique se está usando nomes ao invés de IDs**
   ```
   query="operator.id==Gabriel dos Santos Ribas"
   ```
   ❌ Requer UUID, não nome

### Soluções
1. Use FIQL no parâmetro `query` para incidents
2. Remova parâmetros não suportados
3. Obtenha IDs antes de usar em filtros
4. Certifique-se de que strings não estão vazias

---

## 🚀 Próximas Implementações

Para resolver as limitações, será implementado:

1. **Tools para Operator Groups**
   - `topdesk_list_operator_groups` - lista grupos de operadores
   - `topdesk_get_operator_group_by_id` - obtém grupo por ID

2. **Helper Tools para FIQL**
   - `topdesk_build_fiql_query` - auxilia na construção de queries FIQL
   - Validação de sintaxe FIQL

3. **Cache de Metadados**
   - Cache local de operadores/grupos/categorias
   - Reduz necessidade de listar repetidamente

4. **Exemplos e Templates**
   - Queries FIQL pré-configuradas
   - Templates para casos comuns (últimos 7/30 dias, por grupo, etc.)

---

## 📚 Referências

- [TOPdesk API Documentation](https://developers.topdesk.com/)
- [FIQL Tutorial](https://developers.topdesk.com/tutorial.html#query)
- [Incident API Specification (YAML)](https://developers.topdesk.com/swagger/incident_specification_4.2.2.yaml)
- [RFC FIQL (Unofficial)](https://tools.ietf.org/html/draft-nottingham-atompub-fiql-00)

---

**Última atualização:** 2026-03-30  
**Versão da API:** Incident Management 4.2.2
