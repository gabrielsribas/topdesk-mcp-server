# Exemplos de FIQL para Filtrar Incidents

## 🎯 O que é FIQL?

FIQL (Feed Item Query Language) é uma linguagem de query para filtrar recursos em APIs REST.  
É usada pela API do TOPdesk para filtrar incidents, changes e outros recursos.

**Documentação oficial:** https://developers.topdesk.com/tutorial.html#query

---

## 📝 Sintaxe Básica

### Operadores de Comparação

| Operador | Significado | Exemplo |
|----------|-------------|---------|
| `==` | Igual a | `closed==false` |
| `!=` | Diferente de | `priority.id!=low-uuid` |
| `=lt=` | Menor que | `creationDate=lt=2026-03-30T00:00:00Z` |
| `=le=` | Menor ou igual | `priority.name=le=Medium` |
| `=gt=` | Maior que | `modificationDate=gt=2026-03-01T00:00:00Z` |
| `=ge=` | Maior ou igual | `creationDate=ge=2026-03-01T00:00:00Z` |

### Operadores Lógicos

| Operador | Significado | Exemplo |
|----------|-------------|---------|
| `;` | AND lógico | `closed==false;priority.name==High` |
| `,` | OR lógico | `status.name==New,status.name==Open` |
| `()` | Agrupamento | `(closed==false;priority.name==High),completed==true` |

---

## 💡 Exemplos Práticos

### 1. Filtrar por Status

#### Incidents não fechados
```typescript
{
  query: "closed==false"
}
```

#### Incidents fechados
```typescript
{
  query: "closed==true"
}
```

#### Incidents não completados
```typescript
{
  query: "completed==false"
}
```

---

### 2. Filtrar por Datas

#### Criados hoje
```typescript
{
  query: "creationDate=ge=2026-03-30T00:00:00Z"
}
```

#### Criados nos últimos 7 dias
```typescript
// No código do AI, calcular: hoje - 7 dias
const dataInicio = new Date();
dataInicio.setDate(dataInicio.getDate() - 7);

{
  query: `creationDate=ge=${dataInicio.toISOString()}`
}
// Resultado: "creationDate=ge=2026-03-23T00:00:00Z"
```

#### Criados nos últimos 30 dias
```typescript
const dataInicio = new Date();
dataInicio.setDate(dataInicio.getDate() - 30);

{
  query: `creationDate=ge=${dataInicio.toISOString()}`
}
// Resultado: "creationDate=ge=2026-02-28T00:00:00Z"
```

#### Criados entre duas datas (intervalo)
```typescript
{
  query: "creationDate=ge=2026-03-01T00:00:00Z;creationDate=le=2026-03-31T23:59:59Z"
}
```

#### Modificados recentemente (últimas 24h)
```typescript
const ontem = new Date();
ontem.setDate(ontem.getDate() - 1);

{
  query: `modificationDate=ge=${ontem.toISOString()}`
}
```

---

### 3. Filtrar por Operador

#### Por ID do operador (CORRETO)
```typescript
// Primeiro, obtenha o ID:
// 1. Chamar topdesk_list_operators(page_size=1000)
// 2. Filtrar localmente: {id:"abc-123", name:"Gabriel dos Santos Ribas"}

{
  query: "operator.id==abc-123-def-456-ghi-789"
}
```

#### Por nome do operador (usando campo name)
```typescript
// Atenção: operator.name pode não funcionar em todos os casos
// Prefira sempre usar operator.id após listar os operadores
{
  query: "operator.name==Gabriel dos Santos Ribas"
}
```

---

### 4. Filtrar por Grupo de Operadores

#### Por ID do grupo (CORRETO - requer implementação de operator groups)
```typescript
// Workflow:
// 1. topdesk_list_operator_groups(page_size=1000)
// 2. Encontrar: {id:"xyz-789", groupName:"Sustentação"}
// 3. Usar o ID:

{
  query: "operatorGroup.id==xyz-789-abc-def-ghi-123"
}
```

#### Por nome do grupo (alternativa - pode não funcionar)
```typescript
{
  query: "operatorGroup.name==Sustentação"
}
```

---

### 5. Filtrar por Prioridade

#### Prioridade alta
```typescript
{
  query: "priority.name==High"
}
```

#### Prioridade alta ou urgente (OR)
```typescript
{
  query: "priority.name==High,priority.name==Urgent"
}
```

---

### 6. Filtrar por Categoria

#### Por ID da categoria
```typescript
// 1. Chamar topdesk_list_incident_categories()
// 2. Encontrar ID da categoria
// 3. Usar:

{
  query: "category.id==cat-uuid-123-456"
}
```

#### Por nome da categoria
```typescript
{
  query: "category.name==Hardware"
}
```

---

### 7. Filtrar por Solicitante (Caller)

#### Por ID do solicitante
```typescript
{
  query: "caller.id==person-uuid-123-456"
}
```

#### Por email do solicitante
```typescript
{
  query: "caller.email==usuario@exemplo.com.br"
}
```

---

### 8. Combinações Complexas

#### Não fechados E criados nos últimos 7 dias
```typescript
const dataInicio = new Date();
dataInicio.setDate(dataInicio.getDate() - 7);

{
  query: `closed==false;creationDate=ge=${dataInicio.toISOString()}`
}
```

#### Não fechados E alta prioridade E do grupo Sustentação
```typescript
{
  query: "closed==false;priority.name==High;operatorGroup.id==grupo-uuid-123"
}
```

#### Do operador X OU do operador Y
```typescript
{
  query: "operator.id==uuid-operador-1,operator.id==uuid-operador-2"
}
```

#### Criados no último mês E (prioridade alta OU urgente)
```typescript
const mesPassado = new Date();
mesPassado.setMonth(mesPassado.getMonth() - 1);

{
  query: `creationDate=ge=${mesPassado.toISOString()};(priority.name==High,priority.name==Urgent)`
}
```

---

## 🔧 Caso de Uso Completo

### Pergunta: "Liste chamados do time Sustentação dos últimos 30 dias"

**Passo 1: Obter ID do grupo "Sustentação"**
```typescript
// Tool: topdesk_list_operator_groups (quando implementado)
// Resultado: [{id:"123-abc", groupName:"Sustentação"}, ...]
```

**Passo 2: Calcular data de 30 dias atrás**
```typescript
const dataInicio = new Date();
dataInicio.setDate(dataInicio.getDate() - 30);
// Resultado: 2026-02-28T12:34:56.789Z
```

**Passo 3: Construir query FIQL**
```typescript
const query = `operatorGroup.id==123-abc;creationDate=ge=${dataInicio.toISOString()}`;
// Resultado: "operatorGroup.id==123-abc;creationDate=ge=2026-02-28T12:34:56.789Z"
```

**Passo 4: Listar incidents**
```typescript
// Tool: topdesk_list_incidents
{
  query: "operatorGroup.id==123-abc;creationDate=ge=2026-02-28T12:34:56.789Z",
  pageSize: 100,
  sort: "creationDate:desc"
}
```

---

## ⚡ Dicas de Performance

### 1. Use campos indexados para ordenação
```typescript
{
  sort: "creationDate:desc"  // ✅ Rápido
}
{
  sort: "briefDescription:asc"  // ❌ Lento
}
```

Campos recomendados para `sort`:
- `creationDate`
- `modificationDate`
- `callDate`
- `targetDate`
- `closedDate`
- `id`

### 2. Selecione apenas os campos necessários
```typescript
{
  fields: "id,number,briefDescription,operator,creationDate"
}
```

Isso acelera a resposta da API e reduz o tamanho do payload.

### 3. Use paginação para grandes volumes
```typescript
{
  pageStart: 0,
  pageSize: 100,  // Máximo recomendado
  query: "closed==false"
}
```

---

## 🚨 Erros Comuns

### ❌ Usar nomes ao invés de IDs em relações
```typescript
// ERRADO:
query: "operator.id==Gabriel dos Santos Ribas"

// CORRETO:
// 1. Liste operadores
// 2. Encontre ID
// 3. Use o ID:
query: "operator.id==uuid-123-456"
```

### ❌ Formato de data incorreto
```typescript
// ERRADO:
query: "creationDate=ge=2026-03-01"
query: "creationDate=ge=01/03/2026"

// CORRETO:
query: "creationDate=ge=2026-03-01T00:00:00Z"
```

### ❌ Esquecer de URL-encode
```typescript
// Se usar espaços ou caracteres especiais, faça URL encode
const nomeOperador = "João da Silva";
const encoded = encodeURIComponent(nomeOperador);
query: `operator.name==${encoded}`
```

---

## 📚 Recursos Adicionais

- **Tutorial oficial FIQL:** https://developers.topdesk.com/tutorial.html#query
- **Especificação OpenAPI:** https://developers.topdesk.com/swagger/incident_specification_4.2.2.yaml
- **RFC FIQL (draft):** https://tools.ietf.org/html/draft-nottingham-atompub-fiql-00

---

**Última atualização:** 2026-03-30
