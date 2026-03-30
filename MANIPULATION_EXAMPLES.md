# Exemplos de Manipulação de Incidents

Este documento mostra exemplos práticos de manipulação de incidents no TOPdesk via MCP Server.

## ✅ Alta Taxa de Sucesso (Recomendado)

### 1. Atualizar Descrições e Textos

```typescript
// Atualizar descrição breve
topdesk_update_incident({
  number: "C2603-34823",
  briefDescription: "Problema no backup - servidor principal"
})

// Adicionar detalhamento
topdesk_update_incident({
  number: "C2603-34823",
  request: "Cliente reporta erro 'connection timeout' ao tentar backup manual"
})

// Adicionar ação/comentário
topdesk_update_incident({
  number: "C2603-34823",
  action: "Verificado servidor - espaço em disco estava cheio. Liberado 50GB.",
  actionInvisibleForCaller: false  // Visível para o solicitante
})
```

### 2. Controlar Estado do Incident

```typescript
// Marcar como completo
topdesk_update_incident({
  number: "C2603-34823",
  completed: true
})

// Colocar em espera
topdesk_update_incident({
  number: "C2603-34823",
  onHold: true
})

// Tirar de espera
topdesk_update_incident({
  number: "C2603-34823",
  onHold: false
})
```

### 3. Arquivar e Desarquivar

```typescript
// Arquivar incident
topdesk_archive_incident({
  number: "C2603-34823",
  reason: "Problema resolvido e validado pelo cliente"
})

// Nota: Desarquivar requer tool separado (se implementado)
```

### 4. Escalar Incident

```typescript
// Escalar sem especificar destino
topdesk_escalate_incident({
  number: "C2603-34823",
  reason: "Cliente VIP com urgência - necessita atenção imediata"
})

// Desescalar
topdesk_deescalate_incident({
  number: "C2603-34823",
  reason: "Problema resolvido na primeira linha"
})
```

### 5. Definir Prioridade/Impacto por NOME

```typescript
// Agora aceita nomes! Não precisa mais de UUID
topdesk_update_incident({
  number: "C2603-34823",
  priority: "High",        // ✅ Aceita nome
  impact: "Department",    // ✅ Aceita nome
  urgency: "High"         // ✅ Aceita nome
})

// Também aceita UUID se você tiver
topdesk_update_incident({
  number: "C2603-34823",
  priority: "12345678-1234-1234-1234-123456789012"  // ✅ UUID
})
```

### 6. Definir Categoria por NOME

```typescript
// Aceita nomes de categorias conhecidas
topdesk_update_incident({
  number: "C2603-34823",
  category: "Hardware",           // ✅ Nome
  subcategory: "Servidor"         // ✅ Nome
})

// Ou obter lista primeiro
// 1. topdesk_list_incident_categories()
// 2. Ver nomes disponíveis
// 3. Usar nome exato
```

### 7. Criar Incident Completo (Com Nomes)

```typescript
topdesk_create_incident({
  briefDescription: "Falha no sistema de backup",
  request: "Backup noturno não completou. Erro de conexão com storage.",
  priority: "High",
  impact: "Department",
  urgency: "High",
  category: "Infrastructure",
  subcategory: "Backup"
})
```

### 8. Copiar Configuração de Outro Incident

```typescript
// Workflow: Obter → Copiar → Criar
// 1. Obter incident modelo
const modelo = topdesk_get_incident_by_number({
  number: "C2603-12345"
})

// 2. Extrair campos relevantes e criar novo
topdesk_create_incident({
  briefDescription: "Novo problema similar",
  category: modelo.category.name,      // Usa nome
  priority: modelo.priority.name,      // Usa nome
  operatorGroup: modelo.operatorGroup.id  // Usa UUID (se tiver)
})
```

---

## ⚠️ Cuidado com Estes Campos

### Operator e OperatorGroup (Problemático)

```typescript
// ❌ NÃO FUNCIONA - Operator requer UUID válido do contexto de incidents
topdesk_update_incident({
  number: "C2603-34823",
  operator: "Nome do Operador"  // ❌ Vai dar erro
})

// ❌ Também não funciona com UUID de /operators
const ops = topdesk_list_operators()
topdesk_update_incident({
  number: "C2603-34823",
  operator: ops[0].id  // ❌ Pode dar "cannot be found"
})

// ✅ Workaround: Obter operador de incident existente
const incidents = topdesk_list_incidents({
  query: "operator.name==Gabriel dos Santos Ribas",
  pageSize: 1,
  fields: "operator"
})

topdesk_update_incident({
  number: "C2603-34823",
  operator: incidents[0].operator.id  // ✅ UUID válido de incident
})
```

---

## 💡 Workflows Práticos

### Workflow 1: Criar Incident Completo

```typescript
// Passo 1: Listar categorias disponíveis
const categories = topdesk_list_incident_categories()
// Resultado: [{name: "Hardware"}, {name: "Software"}, ...]

// Passo 2: Listar prioridades
const priorities = topdesk_get_incident_priorities()
// Resultado: [{name: "P1"}, {name: "P2"}, {name: "P3"}]

// Passo 3: Criar com nomes conhecidos
topdesk_create_incident({
  briefDescription: "Problema identificado",
  request: "Detalhes completos...",
  category: "Hardware",           // Nome da lista
  priority: "P1",                 // Nome da lista
  impact: "Department",
  urgency: "High"
})
```

### Workflow 2: Atualizar Múltiplos Campos

```typescript
// Atualização completa em uma chamada
topdesk_update_incident({
  number: "C2603-34823",
  briefDescription: "Atualização do título",
  action: "Novo comentário: problema parcialmente resolvido",
  priority: "Normal",
  completed: false,
  onHold: false
})
```

### Workflow 3: Adicionar Comentário ao Progress Trail

```typescript
// Comentário simples
topdesk_update_incident({
  number: "C2603-34823",
  action: "Cliente confirmou que problema foi resolvido"
})

// Comentário invisível para cliente (somente operadores)
topdesk_update_incident({
  number: "C2603-34823",
  action: "Nota interna: precisa follow-up na próxima semana",
  actionInvisibleForCaller: true
})
```

### Workflow 4: Gerenciar Ciclo de Vida Completo

```typescript
// 1. Criar
const incident = topdesk_create_incident({
  briefDescription: "Novo problema",
  priority: "Normal"
})

// 2. Atualizar durante investigação
topdesk_update_incident({
  number: incident.number,
  action: "Em investigação - analisando logs",
  priority: "High"  // Aumentou prioridade
})

// 3. Marcar como completo
topdesk_update_incident({
  number: incident.number,
  action: "Problema resolvido - servidor reiniciado",
  completed: true
})

// 4. Arquivar
topdesk_archive_incident({
  number: incident.number,
  reason: "Resolvido e validado"
})
```

### Workflow 5: Escalar Baseado em Tempo

```typescript
// Buscar incidents antigos não resolvidos
const oldIncidents = topdesk_list_incidents({
  query: "completed==false;creationDate=lt=2026-03-20T00:00:00Z",
  pageSize: 50,
  fields: "id,number,briefDescription,creationDate"
})

// Escalar cada um
for (const inc of oldIncidents) {
  topdesk_escalate_incident({
    number: inc.number,
    reason: `Incident aberto há mais de 10 dias sem resolução`
  })
}
```

---

## 📊 Casos de Uso Reais

### Caso 1: Triagem Automática

```
Prompt: "Crie um novo chamado de categoria Hardware, 
         subcategoria Impressora, prioridade Normal, 
         com descrição: 'Impressora não responde na sala 201'"

AI executa:
topdesk_create_incident({
  briefDescription: "Impressora não responde na sala 201",
  category: "Hardware",
  subcategory: "Impressora",
  priority: "Normal",
  impact: "Person"
})
```

### Caso 2: Atualização em Massa

```
Prompt: "Todos os chamados de Hardware criados hoje devem ter prioridade Alta"

AI executa:
1. Lista incidents: query="category.name==Hardware;creationDate=ge=2026-03-30T00:00:00Z"
2. Para cada incident: topdesk_update_incident({number: X, priority: "High"})
```

### Caso 3: Adicionar Contexto

```
Prompt: "Adicione ao chamado C2603-34823 a informação: 
         'Cliente reportou que problema voltou após atualização do Windows'"

AI executa:
topdesk_update_incident({
  number: "C2603-34823",
  action: "Atualização: Cliente reportou que problema voltou após atualização do Windows"
})
```

### Caso 4: Fechar Chamados Antigos

```
Prompt: "Marque como completo todos os chamados de mais de 60 dias 
         que não tiveram atualizações"

AI executa:
1. Lista: query="completed==false;modificationDate=lt=2026-01-30T00:00:00Z"
2. Para cada: topdesk_update_incident({number: X, completed: true, 
                action: "Fechado automaticamente - sem atividade há 60+ dias"})
3. Depois: topdesk_archive_incident({number: X, reason: "Inatividade"})
```

---

## 🚫 O Que NÃO Fazer

### ❌ Não tente atribuir operador diretamente

```typescript
// NÃO FUNCIONA
topdesk_update_incident({
  operator: "João Silva"  // ❌ Erro
})
```

### ❌ Não use IDs de /operators diretamente

```typescript
// PROBLEMÁTICO
const ops = topdesk_list_operators()
topdesk_update_incident({
  operator: ops[0].id  // ❌ Pode não ser válido
})
```

### ❌ Não crie incident sem briefDescription

```typescript
// NÃO FUNCIONA
topdesk_create_incident({
  category: "Hardware"  // ❌ Falta briefDescription
})
```

---

## 💡 Dicas Finais

1. **Use nomes sempre que possível** - category, priority, impact, urgency aceitam nomes
2. **Teste com GET primeiro** - veja estrutura de incident existente antes de UPDATE
3. **Use fields em listagens** - evite context overflow
4. **Adicione action para documentar** - vai para progress trail
5. **Valide nomes disponíveis** - liste categories/priorities primeiro
6. **Copie configurações** - reutilize metadados de incidents bem configurados
7. **Evite operator direto** - use workaround de buscar em incidents existentes

---

**Última atualização:** 2026-03-30  
**Versão do servidor:** 1.0.0+
