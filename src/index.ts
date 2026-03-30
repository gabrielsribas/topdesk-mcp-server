#!/usr/bin/env node

/**
 * TOPdesk MCP Server
 * Model Context Protocol server para integração com TOPdesk IT Management
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { TopdeskClient } from './client/topdesk-client.js';
import { z } from 'zod';

// ========== Environment Variables ==========

const TOPDESK_BASE_URL = process.env.TOPDESK_BASE_URL;
const TOPDESK_USERNAME = process.env.TOPDESK_USERNAME;
const TOPDESK_PASSWORD = process.env.TOPDESK_PASSWORD;
const TOPDESK_API_TOKEN = process.env.TOPDESK_API_TOKEN;

if (!TOPDESK_BASE_URL) {
  console.error('Error: TOPDESK_BASE_URL environment variable is required');
  process.exit(1);
}

if (!TOPDESK_API_TOKEN && (!TOPDESK_USERNAME || !TOPDESK_PASSWORD)) {
  console.error(
    'Error: Either TOPDESK_API_TOKEN or TOPDESK_USERNAME/TOPDESK_PASSWORD must be provided'
  );
  process.exit(1);
}

// ========== TOPdesk Client ==========

const topdeskClient = new TopdeskClient({
  baseUrl: TOPDESK_BASE_URL,
  username: TOPDESK_USERNAME,
  password: TOPDESK_PASSWORD,
  apiToken: TOPDESK_API_TOKEN,
});

// ========== MCP Server ==========

const server = new Server(
  {
    name: 'topdesk-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ========== Tool Definitions ==========

const tools: Tool[] = [
  // ===== INCIDENTS =====
  {
    name: 'topdesk_list_incidents',
    description:
      'Lista incidents do TOPdesk com filtros opcionais. IMPORTANTE: Filtros como operator, caller, category, etc. requerem IDs (UUIDs), não nomes. Use query para buscar por texto livre ou primeiro obtenha o ID usando outros tools.',
    inputSchema: {
      type: 'object',
      properties: {
        archived: {
          type: 'boolean',
          description: 'Incluir incidents arquivados',
        },
        resolved: {
          type: 'boolean',
          description: 'Filtrar por incidents resolvidos',
        },
        closed: {
          type: 'boolean',
          description: 'Filtrar por incidents fechados',
        },
        start: {
          type: 'number',
          description: 'Índice inicial para paginação (padrão: 0)',
        },
        page_size: {
          type: 'number',
          description: 'Quantidade de resultados por página (padrão: 10, máx: 100)',
        },
        query: {
          type: 'string',
          description: 'Busca por texto livre em qualquer campo (use isto para buscar por nomes)',
        },
        caller: {
          type: 'string',
          description: 'ID (UUID) do solicitante - NÃO use nomes, use IDs',
        },
        operator: {
          type: 'string',
          description: 'ID (UUID) do operador - NÃO use nomes, use IDs. Se não souber o ID, liste todos os incidents sem filtro e examine os resultados.',
        },
        processingStatus: {
          type: 'string',
          description: 'ID do status de processamento',
        },
        category: {
          type: 'string',
          description: 'ID (UUID) da categoria - NÃO use nomes, use IDs',
        },
        subcategory: {
          type: 'string',
          description: 'ID (UUID) da subcategoria - NÃO use nomes, use IDs',
        },
      },
    },
  },
  {
    name: 'topdesk_get_incident_by_number',
    description:
      'Obtém um incident específico pelo número (ex: C2603-33650). Use este método quando você tiver o número do incident.',
    inputSchema: {
      type: 'object',
      properties: {
        number: {
          type: 'string',
          description: 'Número do incident (ex: C2603-33650)',
        },
      },
      required: ['number'],
    },
  },
  {
    name: 'topdesk_get_incident_by_id',
    description: 'Obtém um incident específico pelo ID único.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID do incident',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'topdesk_create_incident',
    description:
      'Cria um novo incident no TOPdesk. Requer pelo menos briefDescription.',
    inputSchema: {
      type: 'object',
      properties: {
        callerLookup: {
          type: 'string',
          description:
            'ID do solicitante (caller). Use para associar a um usuário existente.',
        },
        briefDescription: {
          type: 'string',
          description: 'Descrição breve do incident (obrigatório)',
        },
        request: {
          type: 'string',
          description: 'Descrição detalhada do incident',
        },
        action: {
          type: 'string',
          description: 'Ação realizada ou planejada',
        },
        status: {
          type: 'string',
          description: 'Status do incident',
        },
        category: {
          type: 'string',
          description: 'ID da categoria',
        },
        subcategory: {
          type: 'string',
          description: 'ID da subcategoria',
        },
        callType: {
          type: 'string',
          description: 'ID do tipo de chamado',
        },
        impact: {
          type: 'string',
          description: 'ID do impacto',
        },
        urgency: {
          type: 'string',
          description: 'ID da urgência',
        },
        priority: {
          type: 'string',
          description: 'ID da prioridade',
        },
        operator: {
          type: 'string',
          description: 'ID do operador responsável',
        },
        operatorGroup: {
          type: 'string',
          description: 'ID do grupo de operadores',
        },
      },
      required: ['briefDescription'],
    },
  },
  {
    name: 'topdesk_update_incident',
    description:
      'Atualiza um incident existente (PATCH - atualiza apenas os campos fornecidos). Pode atualizar por ID ou número.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID do incident (use id OU number, não ambos)',
        },
        number: {
          type: 'string',
          description: 'Número do incident (use id OU number, não ambos)',
        },
        briefDescription: {
          type: 'string',
          description: 'Descrição breve do incident',
        },
        request: {
          type: 'string',
          description: 'Descrição detalhada do incident',
        },
        action: {
          type: 'string',
          description: 'Ação realizada',
        },
        status: {
          type: 'string',
          description: 'Status do incident',
        },
        category: {
          type: 'string',
          description: 'ID da categoria',
        },
        subcategory: {
          type: 'string',
          description: 'ID da subcategoria',
        },
        operator: {
          type: 'string',
          description: 'ID do operador responsável',
        },
        processingStatus: {
          type: 'string',
          description: 'ID do status de processamento',
        },
        completed: {
          type: 'boolean',
          description: 'Marcar como completo',
        },
      },
    },
  },
  {
    name: 'topdesk_get_incident_progress_trail',
    description:
      'Obtém o histórico (progress trail) de um incident, incluindo todas as ações e atualizações.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID do incident (use id OU number)',
        },
        number: {
          type: 'string',
          description: 'Número do incident (use id OU number)',
        },
      },
    },
  },
  {
    name: 'topdesk_archive_incident',
    description: 'Arquiva um incident.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID do incident (use id OU number)',
        },
        number: {
          type: 'string',
          description: 'Número do incident (use id OU number)',
        },
        reason: {
          type: 'string',
          description: 'Motivo do arquivamento',
        },
      },
    },
  },
  {
    name: 'topdesk_escalate_incident',
    description: 'Escala um incident para um nível superior.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID do incident',
        },
        reason: {
          type: 'string',
          description: 'Motivo da escalação',
        },
      },
      required: ['id', 'reason'],
    },
  },
  {
    name: 'topdesk_deescalate_incident',
    description: 'Desescala um incident.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID do incident',
        },
        reason: {
          type: 'string',
          description: 'Motivo da desescalação',
        },
      },
      required: ['id', 'reason'],
    },
  },

  // ===== INCIDENT METADATA (Lookups) =====
  {
    name: 'topdesk_get_incident_call_types',
    description: 'Lista todos os tipos de chamado disponíveis para incidents.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'topdesk_get_incident_statuses',
    description: 'Lista todos os status disponíveis para incidents.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'topdesk_get_incident_categories',
    description: 'Lista todas as categorias disponíveis para incidents.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'topdesk_get_incident_subcategories',
    description: 'Lista todas as subcategorias disponíveis para incidents.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'topdesk_get_incident_priorities',
    description: 'Lista todas as prioridades disponíveis para incidents.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'topdesk_get_incident_impacts',
    description: 'Lista todos os impactos disponíveis para incidents.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'topdesk_get_incident_urgencies',
    description: 'Lista todas as urgências disponíveis para incidents.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ===== CHANGES =====
  {
    name: 'topdesk_list_changes',
    description: 'Lista mudanças (changes) do TOPdesk com filtros opcionais.',
    inputSchema: {
      type: 'object',
      properties: {
        archived: {
          type: 'boolean',
          description: 'Incluir changes arquivados',
        },
        closed: {
          type: 'boolean',
          description: 'Filtrar por changes fechados',
        },
        start: {
          type: 'number',
          description: 'Índice inicial para paginação',
        },
        page_size: {
          type: 'number',
          description: 'Quantidade de resultados por página',
        },
        status: {
          type: 'string',
          description: 'Status do change',
        },
        operator: {
          type: 'string',
          description: 'ID do operador',
        },
        requester: {
          type: 'string',
          description: 'ID do solicitante',
        },
      },
    },
  },
  {
    name: 'topdesk_get_change_by_id',
    description: 'Obtém um change específico pelo ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID do change',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'topdesk_create_change',
    description: 'Cria um novo change no TOPdesk.',
    inputSchema: {
      type: 'object',
      properties: {
        briefDescription: {
          type: 'string',
          description: 'Descrição breve do change (obrigatório)',
        },
        request: {
          type: 'string',
          description: 'Descrição detalhada do change',
        },
        requester: {
          type: 'string',
          description: 'ID do solicitante',
        },
        changeType: {
          type: 'string',
          description: 'Tipo de mudança',
        },
        category: {
          type: 'string',
          description: 'ID da categoria',
        },
        impact: {
          type: 'string',
          description: 'ID do impacto',
        },
        benefit: {
          type: 'string',
          description: 'ID do benefício',
        },
        operator: {
          type: 'string',
          description: 'ID do operador responsável',
        },
      },
      required: ['briefDescription'],
    },
  },
  {
    name: 'topdesk_update_change',
    description: 'Atualiza um change existente (PATCH).',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID do change',
        },
        briefDescription: {
          type: 'string',
          description: 'Descrição breve',
        },
        request: {
          type: 'string',
          description: 'Descrição detalhada',
        },
        category: {
          type: 'string',
          description: 'ID da categoria',
        },
        operator: {
          type: 'string',
          description: 'ID do operador responsável',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'topdesk_get_change_progress_trail',
    description: 'Obtém o histórico (progress trail) de um change.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID do change',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'topdesk_archive_change',
    description: 'Arquiva um change.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID do change',
        },
      },
      required: ['id'],
    },
  },

  // ===== CHANGE METADATA =====
  {
    name: 'topdesk_get_change_statuses',
    description: 'Lista todos os status disponíveis para changes.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'topdesk_get_change_benefits',
    description: 'Lista todos os benefícios disponíveis para changes.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'topdesk_get_change_impacts',
    description: 'Lista todos os impactos disponíveis para changes.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ===== SERVICES =====
  {
    name: 'topdesk_list_services',
    description: 'Lista serviços do TOPdesk.',
    inputSchema: {
      type: 'object',
      properties: {
        start: {
          type: 'number',
          description: 'Índice inicial para paginação',
        },
        page_size: {
          type: 'number',
          description: 'Quantidade de resultados por página',
        },
        query: {
          type: 'string',
          description: 'Busca por texto livre',
        },
        archived: {
          type: 'boolean',
          description: 'Incluir serviços arquivados',
        },
      },
    },
  },
  {
    name: 'topdesk_get_service_by_id',
    description: 'Obtém um serviço específico pelo ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID do serviço',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'topdesk_create_service',
    description: 'Cria um novo serviço no TOPdesk.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nome do serviço (obrigatório)',
        },
        description: {
          type: 'string',
          description: 'Descrição do serviço',
        },
        serviceType: {
          type: 'string',
          description: 'ID do tipo de serviço',
        },
      },
      required: ['name'],
    },
  },

  // ===== GENERAL =====
  {
    name: 'topdesk_get_api_version',
    description: 'Obtém a versão da API do TOPdesk.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'topdesk_get_product_version',
    description: 'Obtém a versão do produto TOPdesk.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'topdesk_search',
    description:
      'Realiza uma busca genérica na API do TOPdesk. Útil para buscar por texto livre.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Texto de busca',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'topdesk_get_categories',
    description: 'Lista todas as categorias disponíveis no TOPdesk.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // ===== OPERATORS & PERSONS =====
  {
    name: 'topdesk_list_operators',
    description:
      'Lista todos os operadores do TOPdesk. IMPORTANTE: A API não suporta busca por nome diretamente. Este tool retorna TODOS os operadores (com paginação). Depois você deve filtrar os resultados pelo nome desejado. Use page_size grande (ex: 1000) para obter mais resultados.',
    inputSchema: {
      type: 'object',
      properties: {
        archived: {
          type: 'boolean',
          description: 'Incluir operadores arquivados',
        },
        start: {
          type: 'number',
          description: 'Índice inicial para paginação',
        },
        page_size: {
          type: 'number',
          description: 'Quantidade de resultados (padrão: use 1000 para buscar muitos)',
        },
      },
    },
  },
  {
    name: 'topdesk_get_operator_by_id',
    description: 'Obtém detalhes de um operador específico pelo ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID (UUID) do operador',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'topdesk_list_persons',
    description:
      'Lista pessoas/usuários do TOPdesk. A API não suporta busca por nome diretamente. Este tool retorna TODAS as pessoas (com paginação). Filtre os resultados depois. Use page_size grande para obter mais resultados.',
    inputSchema: {
      type: 'object',
      properties: {
        archived: {
          type: 'boolean',
          description: 'Incluir pessoas arquivadas',
        },
        start: {
          type: 'number',
          description: 'Índice inicial para paginação',
        },
        page_size: {
          type: 'number',
          description: 'Quantidade de resultados',
        },
      },
    },
  },
  {
    name: 'topdesk_get_person_by_id',
    description: 'Obtém detalhes de uma pessoa específica pelo ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID (UUID) da pessoa',
        },
      },
      required: ['id'],
    },
  },
];

// ========== Tool Handlers ==========

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    // ===== INCIDENTS =====
    if (name === 'topdesk_list_incidents') {
      const incidents = await topdeskClient.listIncidents(args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(incidents, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_incident_by_number') {
      const { number } = args as { number: string };
      const incident = await topdeskClient.getIncidentByNumber(number);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(incident, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_incident_by_id') {
      const { id } = args as { id: string };
      const incident = await topdeskClient.getIncidentById(id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(incident, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_create_incident') {
      const incident = await topdeskClient.createIncident(args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(incident, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_update_incident') {
      const { id, number, ...updateData } = args as any;
      let incident;
      if (id) {
        incident = await topdeskClient.patchIncidentById(id, updateData);
      } else if (number) {
        incident = await topdeskClient.patchIncidentByNumber(
          number,
          updateData
        );
      } else {
        throw new Error('Either id or number must be provided');
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(incident, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_incident_progress_trail') {
      const { id, number } = args as { id?: string; number?: string };
      let trail;
      if (id) {
        trail = await topdeskClient.getIncidentProgressTrailById(id);
      } else if (number) {
        trail = await topdeskClient.getIncidentProgressTrailByNumber(number);
      } else {
        throw new Error('Either id or number must be provided');
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(trail, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_archive_incident') {
      const { id, number, reason } = args as {
        id?: string;
        number?: string;
        reason?: string;
      };
      if (id) {
        await topdeskClient.archiveIncidentById(id, reason);
      } else if (number) {
        await topdeskClient.archiveIncidentByNumber(number, reason);
      } else {
        throw new Error('Either id or number must be provided');
      }
      return {
        content: [
          {
            type: 'text',
            text: 'Incident archived successfully',
          },
        ],
      };
    }

    if (name === 'topdesk_escalate_incident') {
      const { id, reason } = args as { id: string; reason: string };
      await topdeskClient.escalateIncidentById(id, reason);
      return {
        content: [
          {
            type: 'text',
            text: 'Incident escalated successfully',
          },
        ],
      };
    }

    if (name === 'topdesk_deescalate_incident') {
      const { id, reason } = args as { id: string; reason: string };
      await topdeskClient.deescalateIncidentById(id, reason);
      return {
        content: [
          {
            type: 'text',
            text: 'Incident deescalated successfully',
          },
        ],
      };
    }

    // ===== INCIDENT METADATA =====
    if (name === 'topdesk_get_incident_call_types') {
      const callTypes = await topdeskClient.getIncidentCallTypes();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(callTypes, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_incident_statuses') {
      const statuses = await topdeskClient.getIncidentStatuses();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(statuses, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_incident_categories') {
      const categories = await topdeskClient.getIncidentCategories();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(categories, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_incident_subcategories') {
      const subcategories = await topdeskClient.getIncidentSubcategories();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(subcategories, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_incident_priorities') {
      const priorities = await topdeskClient.getIncidentPriorities();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(priorities, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_incident_impacts') {
      const impacts = await topdeskClient.getIncidentImpacts();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(impacts, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_incident_urgencies') {
      const urgencies = await topdeskClient.getIncidentUrgencies();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(urgencies, null, 2),
          },
        ],
      };
    }

    // ===== CHANGES =====
    if (name === 'topdesk_list_changes') {
      const changes = await topdeskClient.listChanges(args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(changes, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_change_by_id') {
      const { id } = args as { id: string };
      const change = await topdeskClient.getChangeById(id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(change, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_create_change') {
      const change = await topdeskClient.createChange(args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(change, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_update_change') {
      const { id, ...updateData } = args as any;
      const change = await topdeskClient.patchChangeById(id, updateData);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(change, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_change_progress_trail') {
      const { id } = args as { id: string };
      const trail = await topdeskClient.getChangeProgressTrailById(id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(trail, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_archive_change') {
      const { id } = args as { id: string };
      await topdeskClient.archiveChangeById(id);
      return {
        content: [
          {
            type: 'text',
            text: 'Change archived successfully',
          },
        ],
      };
    }

    // ===== CHANGE METADATA =====
    if (name === 'topdesk_get_change_statuses') {
      const statuses = await topdeskClient.getChangeStatuses();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(statuses, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_change_benefits') {
      const benefits = await topdeskClient.getChangeBenefits();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(benefits, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_change_impacts') {
      const impacts = await topdeskClient.getChangeImpacts();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(impacts, null, 2),
          },
        ],
      };
    }

    // ===== SERVICES =====
    if (name === 'topdesk_list_services') {
      const services = await topdeskClient.listServices(args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(services, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_service_by_id') {
      const { id } = args as { id: string };
      const service = await topdeskClient.getServiceById(id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(service, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_create_service') {
      const service = await topdeskClient.createService(args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(service, null, 2),
          },
        ],
      };
    }

    // ===== GENERAL =====
    if (name === 'topdesk_get_api_version') {
      const version = await topdeskClient.getApiVersion();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(version, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_product_version') {
      const version = await topdeskClient.getProductVersion();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(version, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_search') {
      const { query } = args as { query: string };
      const results = await topdeskClient.search(query);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_categories') {
      const categories = await topdeskClient.getCategories();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(categories, null, 2),
          },
        ],
      };
    }

    // ===== OPERATORS & PERSONS =====
    if (name === 'topdesk_list_operators') {
      const operators = await topdeskClient.listOperators(args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(operators, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_operator_by_id') {
      const { id } = args as { id: string };
      const operator = await topdeskClient.getOperatorById(id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(operator, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_list_persons') {
      const persons = await topdeskClient.listPersons(args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(persons, null, 2),
          },
        ],
      };
    }

    if (name === 'topdesk_get_person_by_id') {
      const { id } = args as { id: string };
      const person = await topdeskClient.getPersonById(id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(person, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// ========== Start Server ==========

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('TOPdesk MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
