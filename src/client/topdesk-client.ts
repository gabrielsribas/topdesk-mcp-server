/**
 * TOPdesk API Client
 * Cliente HTTP para comunicação com a API REST do TOPdesk
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  Incident,
  IncidentCreateBody,
  IncidentUpdateBody,
  IncidentListParams,
  Change,
  ChangeCreateBody,
  ChangeUpdateBody,
  ChangeListParams,
  Service,
  ServiceCreate,
  ServiceListParams,
  ProgressTrail,
  TimeSpent,
  IdAndName,
} from '../types/topdesk.js';

export interface TopdeskClientConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  apiToken?: string;
}

export class TopdeskClient {
  private client: AxiosInstance;

  constructor(config: TopdeskClientConfig) {
    if (!config.baseUrl) {
      throw new Error('TOPDESK_BASE_URL is required');
    }

    // Autenticação: suporta Basic Auth (username/password) ou API Token
    const auth = config.apiToken
      ? { Authorization: `Bearer ${config.apiToken}` }
      : config.username && config.password
      ? {
          Authorization: `Basic ${Buffer.from(
            `${config.username}:${config.password}`
          ).toString('base64')}`,
        }
      : {};

    if (!auth.Authorization) {
      throw new Error(
        'Authentication required: provide either username/password or apiToken'
      );
    }

    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...auth,
      },
      timeout: 30000,
    });

    // Interceptor para logging de requisições (debug)
    this.client.interceptors.request.use((config) => {
      console.error(`[TOPdesk] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Interceptor para tratamento de erros
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
  }

  // ========== INCIDENTS ==========

  /**
   * Lista incidents com filtros opcionais
   */
  async listIncidents(params?: IncidentListParams): Promise<Incident[]> {
    // Remove parâmetros vazios ou undefined para evitar erro 400
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([_, value]) =>
              value !== undefined &&
              value !== null &&
              value !== '' &&
              !(typeof value === 'number' && isNaN(value))
          )
        )
      : undefined;

    const response = await this.client.get<Incident[]>('/incidents', {
      params: cleanParams,
    });
    return response.data;
  }

  /**
   * Obtém incident por número (ex: C2603-33650)
   */
  async getIncidentByNumber(number: string): Promise<Incident> {
    const response = await this.client.get<Incident>(
      `/incidents/number/${number}`
    );
    return response.data;
  }

  /**
   * Obtém incident por ID
   */
  async getIncidentById(id: string): Promise<Incident> {
    const response = await this.client.get<Incident>(`/incidents/id/${id}`);
    return response.data;
  }

  /**
   * Cria um novo incident
   */
  async createIncident(data: IncidentCreateBody): Promise<Incident> {
    const response = await this.client.post<Incident>('/incidents', data);
    return response.data;
  }

  /**
   * Atualiza incident por ID (PUT - substitui todos os campos)
   */
  async updateIncidentById(
    id: string,
    data: IncidentUpdateBody
  ): Promise<Incident> {
    const response = await this.client.put<Incident>(
      `/incidents/id/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Atualiza incident por ID (PATCH - atualiza apenas campos fornecidos)
   */
  async patchIncidentById(
    id: string,
    data: Partial<IncidentUpdateBody>
  ): Promise<Incident> {
    const response = await this.client.patch<Incident>(
      `/incidents/id/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Atualiza incident por número (PATCH)
   */
  async patchIncidentByNumber(
    number: string,
    data: Partial<IncidentUpdateBody>
  ): Promise<Incident> {
    const response = await this.client.patch<Incident>(
      `/incidents/number/${number}`,
      data
    );
    return response.data;
  }

  /**
   * Obtém progress trail de um incident por ID
   */
  async getIncidentProgressTrailById(id: string): Promise<ProgressTrail[]> {
    const response = await this.client.get<ProgressTrail[]>(
      `/incidents/id/${id}/progresstrail`
    );
    return response.data;
  }

  /**
   * Obtém progress trail de um incident por número
   */
  async getIncidentProgressTrailByNumber(
    number: string
  ): Promise<ProgressTrail[]> {
    const response = await this.client.get<ProgressTrail[]>(
      `/incidents/number/${number}/progresstrail`
    );
    return response.data;
  }

  /**
   * Arquiva um incident por ID
   */
  async archiveIncidentById(id: string, reason?: string): Promise<void> {
    await this.client.put(`/incidents/id/${id}/archive`, { reason });
  }

  /**
   * Arquiva um incident por número
   */
  async archiveIncidentByNumber(
    number: string,
    reason?: string
  ): Promise<void> {
    await this.client.put(`/incidents/number/${number}/archive`, { reason });
  }

  /**
   * Escala um incident por ID
   */
  async escalateIncidentById(id: string, reason: string): Promise<void> {
    await this.client.put(`/incidents/id/${id}/escalate`, { reason });
  }

  /**
   * Desescala um incident por ID
   */
  async deescalateIncidentById(id: string, reason: string): Promise<void> {
    await this.client.put(`/incidents/id/${id}/deescalate`, { reason });
  }

  // ========== INCIDENT METADATA (Lookups) ==========

  async getIncidentCallTypes(): Promise<IdAndName[]> {
    const response = await this.client.get<IdAndName[]>(
      '/incidents/call_types'
    );
    return response.data;
  }

  async getIncidentStatuses(): Promise<IdAndName[]> {
    const response = await this.client.get<IdAndName[]>('/incidents/statuses');
    return response.data;
  }

  async getIncidentCategories(): Promise<IdAndName[]> {
    const response = await this.client.get<IdAndName[]>(
      '/incidents/categories'
    );
    return response.data;
  }

  async getIncidentSubcategories(): Promise<IdAndName[]> {
    const response = await this.client.get<IdAndName[]>(
      '/incidents/subcategories'
    );
    return response.data;
  }

  async getIncidentPriorities(): Promise<IdAndName[]> {
    const response = await this.client.get<IdAndName[]>(
      '/incidents/priorities'
    );
    return response.data;
  }

  async getIncidentImpacts(): Promise<IdAndName[]> {
    const response = await this.client.get<IdAndName[]>('/incidents/impacts');
    return response.data;
  }

  async getIncidentUrgencies(): Promise<IdAndName[]> {
    const response = await this.client.get<IdAndName[]>(
      '/incidents/urgencies'
    );
    return response.data;
  }

  // ========== CHANGES ==========

  /**
   * Lista changes (como operador)
   */
  async listChanges(params?: ChangeListParams): Promise<Change[]> {
    const response = await this.client.get<Change[]>('/operatorChanges', {
      params,
    });
    return response.data;
  }

  /**
   * Obtém change por ID
   */
  async getChangeById(id: string): Promise<Change> {
    const response = await this.client.get<Change>(`/operatorChanges/${id}`);
    return response.data;
  }

  /**
   * Cria um novo change
   */
  async createChange(data: ChangeCreateBody): Promise<Change> {
    const response = await this.client.post<Change>('/operatorChanges', data);
    return response.data;
  }

  /**
   * Atualiza change por ID (PATCH)
   */
  async patchChangeById(
    id: string,
    data: Partial<ChangeUpdateBody>
  ): Promise<Change> {
    const response = await this.client.patch<Change>(
      `/operatorChanges/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Arquiva um change
   */
  async archiveChangeById(id: string): Promise<void> {
    await this.client.post(`/operatorChanges/${id}/archive`);
  }

  /**
   * Desarquiva um change
   */
  async unarchiveChangeById(id: string): Promise<void> {
    await this.client.post(`/operatorChanges/${id}/unarchive`);
  }

  /**
   * Obtém progress trail de um change
   */
  async getChangeProgressTrailById(id: string): Promise<ProgressTrail[]> {
    const response = await this.client.get<ProgressTrail[]>(
      `/operatorChanges/${id}/progresstrail`
    );
    return response.data;
  }

  // ========== CHANGE METADATA (Lookups) ==========

  async getChangeStatuses(): Promise<IdAndName[]> {
    const response = await this.client.get<IdAndName[]>(
      '/changes/changeStatuses'
    );
    return response.data;
  }

  async getChangeBenefits(): Promise<IdAndName[]> {
    const response = await this.client.get<IdAndName[]>('/changes/benefits');
    return response.data;
  }

  async getChangeImpacts(): Promise<IdAndName[]> {
    const response = await this.client.get<IdAndName[]>('/changes/impacts');
    return response.data;
  }

  // ========== SERVICES ==========

  /**
   * Lista services
   */
  async listServices(params?: ServiceListParams): Promise<Service[]> {
    const response = await this.client.get<Service[]>('/services', { params });
    return response.data;
  }

  /**
   * Obtém service por ID
   */
  async getServiceById(id: string): Promise<Service> {
    const response = await this.client.get<Service>(`/services/${id}`);
    return response.data;
  }

  /**
   * Cria um novo service
   */
  async createService(data: ServiceCreate): Promise<Service> {
    const response = await this.client.post<Service>('/services', data);
    return response.data;
  }

  // ========== GENERAL ==========

  /**
   * Obtém versão da API
   */
  async getApiVersion(): Promise<{ version: string }> {
    const response = await this.client.get<{ version: string }>('/version');
    return response.data;
  }

  /**
   * Obtém versão do TOPdesk
   */
  async getProductVersion(): Promise<{ version: string }> {
    const response = await this.client.get<{ version: string }>(
      '/productVersion'
    );
    return response.data;
  }

  /**
   * Busca genérica na API
   */
  async search(query: string): Promise<any> {
    const response = await this.client.get('/search', {
      params: { query },
    });
    return response.data;
  }

  /**
   * Lista categorias e subcategorias
   */
  async getCategories(): Promise<IdAndName[]> {
    const response = await this.client.get<IdAndName[]>('/categories');
    return response.data;
  }
}
