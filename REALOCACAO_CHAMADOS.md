# 🎯 Guia de Realocação de Chamados

Este guia mostra como **mudar o grupo solucionador** (operatorGroup) de incidents - essencial quando chamados são criados na fila errada!

## 🚀 Workflow Recomendado (FUNCIONA!)

### Passo 1: Descobrir Grupos Válidos

```typescript
// Use esta ferramenta CRÍTICA para descobrir grupos válidos
topdesk_extract_valid_operator_groups({
  pageSize: 200  // Analisa 200 incidents recentes
})

// Retorna:
{
  "totalIncidentsAnalyzed": 200,
  "uniqueGroupsFound": 15,
  "groups": [
    {
      "id": "abc-123-def-456",
      "name": "Sustentação"
    },
    {
      "id": "xyz-789-ghi-012",
      "name": "Infraestrutura"
    },
    {
      "id": "qwe-345-rty-678",
      "name": "Service Desk"
    }
  ],
  "usage": "Use os IDs destes grupos - eles são VÁLIDOS!"
}
```

**Por quê funciona?** Porque estamos extraindo grupos que **já aparecem em incidents reais**, então sabemos que são válidos para atribuição!

### Passo 2: Realocar o Chamado

```typescript
// Agora use o UUID do grupo para realocar
topdesk_update_incident({
  number: "C2603-34823",
  operatorGroup: "abc-123-def-456"  // UUID de "Sustentação"
})
```

---

## 💡 Casos de Uso Práticos

### Caso 1: Chamado Criado na Fila Errada

```
Situação: "Chamado C2603-34823 foi criado no Service Desk mas deveria estar na Sustentação"

Prompt para AI:
"Extraia os grupos válidos e mova o chamado C2603-34823 para o grupo Sustentação"

Workflow AI:
1. topdesk_extract_valid_operator_groups({ pageSize: 200 })
2. Localiza grupo "Sustentação" → id: "abc-123-def-456"
3. topdesk_update_incident({
     number: "C2603-34823",
     operatorGroup: "abc-123-def-456"
   })
```

### Caso 2: Realocação em Massa

```
Situação: "Todos os chamados de Hardware devem ir para Infraestrutura"

Prompt:
"Liste chamados de categoria Hardware dos últimos 7 dias e mova para grupo Infraestrutura"

Workflow AI:
1. topdesk_extract_valid_operator_groups()
2. Encontra Infraestrutura → id: "xyz-789"
3. topdesk_list_incidents({
     query: "category.name==Hardware;creationDate=ge=2026-03-23T00:00:00Z",
     fields: "id,number"
   })
4. Para cada incident:
   topdesk_update_incident({
     number: incident.number,
     operatorGroup: "xyz-789",
     action: "Realocado automaticamente para Infraestrutura"
   })
```

### Caso 3: Verificar Grupo Atual Antes de Mover

```
Prompt:
"Qual o grupo atual do chamado C2603-34823? 
Se for Service Desk, mova para Sustentação"

Workflow AI:
1. topdesk_get_incident_by_number({ number: "C2603-34823" })
2. Verifica: incident.operatorGroup.name === "Service Desk"
3. topdesk_extract_valid_operator_groups()
4. Encontra Sustentação → id
5. topdesk_update_incident({
     number: "C2603-34823",
     operatorGroup: id-sustentacao
   })
```

### Caso 4: Realocação com Contexto

```
Prompt:
"Mova chamado C2603-34823 para Sustentação e adicione comentário 
explicando a realocação"

Workflow AI:
topdesk_update_incident({
  number: "C2603-34823",
  operatorGroup: "abc-123-def-456",
  action: "Chamado realocado para Sustentação - problema identificado como relacionado a aplicação"
})
```

---

## 🔍 Alternativa: Listar Todos os Grupos

Se você preferir ver TODOS os grupos disponíveis (não apenas os que aparecem em incidents):

```typescript
// Lista todos os grupos
topdesk_list_operator_groups({
  page_size: 1000
})

// Retorna todos os grupos configurados
// ATENÇÃO: Alguns podem não ser válidos para incidents!
```

**⚠️ Problema:** Grupos listados por `/operatorgroups` podem não ser todos válidos para incidents (similar ao problema de operators).

**✅ Recomendação:** Use sempre `topdesk_extract_valid_operator_groups` primeiro!

---

## 📊 Workflow Completo Passo a Passo

### Cenário Real: Triagem Incorreta

**Situação Inicial:**
- 5 chamados foram criados no "Service Desk"
- Deveriam estar em "Sustentação" (aplicações)
- Números: C2603-34823, C2603-34824, C2603-34825, C2603-34826, C2603-34827

**Prompt para AI:**
```
"Extraia grupos válidos, identifique o ID do grupo Sustentação, 
e realoque os chamados C2603-34823 até C2603-34827 para esse grupo. 
Adicione comentário em cada um explicando a realocação."
```

**Execução AI:**

```typescript
// 1. Extrair grupos válidos
const validGroups = await topdesk_extract_valid_operator_groups({ pageSize: 200 });
// Resultado: Sustentação = "abc-123-def-456"

// 2. Realocar cada chamado
const chamados = [
  "C2603-34823", "C2603-34824", "C2603-34825", 
  "C2603-34826", "C2603-34827"
];

for (const numero of chamados) {
  await topdesk_update_incident({
    number: numero,
    operatorGroup: "abc-123-def-456",
    action: "Chamado realocado para Sustentação - classificação incorreta na triagem inicial"
  });
}
```

---

## 🎯 Dicas e Best Practices

### ✅ Sempre Faça:

1. **Use `topdesk_extract_valid_operator_groups` primeiro**
   - Garante que os UUIDs funcionarão
   - Mais rápido que listar todos os grupos

2. **Adicione comentário na realocação**
   ```typescript
   action: "Realocado para [Grupo] - [motivo]"
   ```

3. **Verifique grupo atual antes se necessário**
   ```typescript
   const incident = topdesk_get_incident_by_number(...)
   if (incident.operatorGroup.name === "Service Desk") {
     // Realocar
   }
   ```

4. **Use FIQL para realocações em massa**
   ```typescript
   query: "operatorGroup.name==ServiceDesk;category.name==Hardware"
   ```

### ❌ Evite:

1. **Não use nomes diretamente em operatorGroup**
   ```typescript
   operatorGroup: "Sustentação"  // ❌ NÃO FUNCIONA
   operatorGroup: "abc-123-uuid"  // ✅ UUID funciona
   ```

2. **Não liste operators com `/operators` e use como grupo**
   - São coisas diferentes!
   - Operator = pessoa individual
   - OperatorGroup = equipe/fila

3. **Não esqueça de documentar a mudança**
   - Sempre adicione `action` explicando por quê moveu

---

## 🔧 Troubleshooting

### Erro: "operatorGroup.id cannot be found"

**Causa:** UUID do grupo não é válido no contexto de incidents.

**Solução:**
```typescript
// Não faça:
const groups = topdesk_list_operator_groups()
operatorGroup: groups[0].id  // ❌ Pode não ser válido

// Faça:
const validGroups = topdesk_extract_valid_operator_groups()
operatorGroup: validGroups.groups[0].id  // ✅ Garantido válido
```

### Nenhum Grupo Retornado

**Causa:** Incidents analisados não têm operatorGroup preenchido.

**Solução:**
```typescript
// Aumente o pageSize para analisar mais incidents
topdesk_extract_valid_operator_groups({ pageSize: 500 })

// Ou analise incidents mais antigos
topdesk_list_incidents({
  query: "creationDate=ge=2026-01-01T00:00:00Z",
  pageSize: 500,
  fields: "operatorGroup"
})
```

### Grupo Existe Mas Não Aparece

**Causa:** Grupo pode ser novo e ainda não ter incidents atribuídos.

**Solução:**
```typescript
// Obtenha ID do grupo de um incident que você sabe que está nele
const incident = topdesk_get_incident_by_number({ number: "C2603-XXXXX" })
const groupId = incident.operatorGroup.id
// Use esse ID - é válido!
```

---

## 📈 Estatísticas e Análises

### Descobrir Distribuição de Chamados por Grupo

```
Prompt: "Analise os últimos 200 incidents e me mostre quantos chamados 
cada grupo tem atualmente"

AI executa:
1. topdesk_extract_valid_operator_groups({ pageSize: 200 })
2. Conta quantas vezes cada grupo aparece
3. Retorna estatísticas
```

### Identificar Grupos Sobrecarregados

```
Prompt: "Quais grupos têm mais chamados em aberto? 
Sugira redistribuição se necessário"

AI analisa:
1. Lista incidents abertos por grupo
2. Identifica grupos com > 50 chamados
3. Sugere mover chamados menos críticos para grupos com menos carga
```

---

## 🎉 Exemplos de Prompts Prontos

```
1. "Extraia grupos válidos e mostre a lista"

2. "Mova o chamado C2603-34823 para o grupo Sustentação"

3. "Liste todos os chamados do Service Desk dos últimos 7 dias 
   e mova os de categoria Hardware para Infraestrutura"

4. "Qual o grupo atual do chamado X? Se for Y, mude para Z"

5. "Realoque em massa todos os chamados criados hoje que estão 
   no grupo errado baseado na categoria"

6. "Mostre estatísticas: quantos chamados cada grupo tem em aberto?"

7. "Identifique chamados de alta prioridade no Service Desk 
   e realoque para grupos especializados"

8. "Audite chamados antigos e realoque os que estão há mais de 30 dias 
   em grupos de triagem para grupos definitivos"
```

---

**Última atualização:** 2026-03-30  
**Status:** ✅ FUNCIONA - Testado e validado  
**Complexidade:** Baixa - Workflow simples e confiável
