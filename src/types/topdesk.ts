/**
 * TOPdesk API Types
 * Baseado na documentação oficial: https://developers.topdesk.com/
 */

// ========== Common Types ==========

export interface IdAndName {
  id: string;
  name: string;
}

export interface Dropdown {
  id?: string;
  name: string;
}

export interface Branch {
  id: string;
  name: string;
  clientReferenceNumber?: string;
}

export interface Caller {
  id: string;
  dynamicName?: string;
  branch?: Branch;
  budgetHolder?: IdAndName;
  department?: IdAndName;
  email?: string;
  mobileNumber?: string;
  phoneNumber?: string;
}

export interface Operator {
  id: string;
  name: string;
  avatar?: string;
}

export interface Operator {
  id: string;
  name: string;
  avatar?: string;
}

export interface Object {
  id: string;
  name: string;
  type?: IdAndName;
  make?: IdAndName;
  model?: IdAndName;
  branch?: Branch;
  location?: IdAndName;
  specification?: string;
  serialNumber?: string;
}

// ========== Incident Types ==========

export interface Incident {
  id: string;
  number: string;
  request?: string;
  briefDescription?: string;
  status: string;
  caller: Caller;
  callerBranch?: Branch;
  callerLookup?: IdAndName;
  callDate?: string;
  creationDate?: string;
  modificationDate?: string;
  closureDate?: string;
  creator?: Operator;
  modifier?: Operator;
  entryType?: IdAndName;
  callType?: IdAndName;
  category?: IdAndName;
  subcategory?: IdAndName;
  externalNumber?: string;
  mainIncident?: IdAndName;
  object?: Object;
  objectLocation?: IdAndName;
  branch?: Branch;
  location?: IdAndName;
  impact?: IdAndName;
  urgency?: IdAndName;
  priority?: IdAndName;
  duration?: IdAndName;
  targetDate?: string;
  onHold?: boolean;
  onHoldDate?: string;
  onHoldDuration?: number;
  operator?: Operator;
  operatorGroup?: IdAndName;
  supplier?: IdAndName;
  processingStatus?: IdAndName;
  completed?: boolean;
  closed?: boolean;
  costs?: number;
  escalationStatus?: string;
  escalationReason?: IdAndName;
  callbackRequired?: boolean;
  optionalFields1?: OptionalFields;
  optionalFields2?: OptionalFields;
}

export interface OptionalFields {
  boolean1?: boolean;
  boolean2?: boolean;
  boolean3?: boolean;
  boolean4?: boolean;
  boolean5?: boolean;
  number1?: number;
  number2?: number;
  number3?: number;
  number4?: number;
  number5?: number;
  date1?: string;
  date2?: string;
  date3?: string;
  date4?: string;
  date5?: string;
  text1?: string;
  text2?: string;
  text3?: string;
  text4?: string;
  text5?: string;
  memo1?: string;
  memo2?: string;
  memo3?: string;
  memo4?: string;
  memo5?: string;
  searchlist1?: Dropdown;
  searchlist2?: Dropdown;
  searchlist3?: Dropdown;
  searchlist4?: Dropdown;
  searchlist5?: Dropdown;
}

export interface IncidentCreateBody {
  callerLookup?: string;
  caller: {
    id?: string;
    dynamicName?: string;
    branch?: string;
    email?: string;
    mobileNumber?: string;
    phoneNumber?: string;
  };
  status?: string;
  briefDescription: string;
  request?: string;
  action?: string;
  actionInvisibleForCaller?: boolean;
  entryType?: string;
  callType?: string;
  category?: string;
  subcategory?: string;
  externalNumber?: string;
  object?: string;
  objectLocation?: string;
  branch?: string;
  location?: string;
  impact?: string;
  urgency?: string;
  priority?: string;
  duration?: string;
  targetDate?: string;
  onHold?: boolean;
  operator?: string;
  operatorGroup?: string;
  supplier?: string;
  processingStatus?: string;
  completed?: boolean;
  costs?: number;
  optionalFields1?: Partial<OptionalFields>;
  optionalFields2?: Partial<OptionalFields>;
}

export interface IncidentUpdateBody {
  callerLookup?: string;
  status?: string;
  briefDescription?: string;
  request?: string;
  action?: string;
  actionInvisibleForCaller?: boolean;
  entryType?: string;
  callType?: string;
  category?: string;
  subcategory?: string;
  externalNumber?: string;
  object?: string;
  objectLocation?: string;
  branch?: string;
  location?: string;
  impact?: string;
  urgency?: string;
  priority?: string;
  duration?: string;
  targetDate?: string;
  onHold?: boolean;
  operator?: string;
  operatorGroup?: string;
  supplier?: string;
  processingStatus?: string;
  completed?: boolean;
  costs?: number;
  majorCall?: boolean;
  publishToSsd?: boolean;
  optionalFields1?: Partial<OptionalFields>;
  optionalFields2?: Partial<OptionalFields>;
}

export interface ProgressTrail {
  number: number;
  entryDate: string;
  creator: Operator;
  memoText?: string;
  category?: string;
  invisible?: boolean;
}

export interface TimeSpent {
  id: string;
  incidentId: string;
  operator: Operator;
  timeSpent: number;
  entryDate: string;
  notes?: string;
  reason?: IdAndName;
}

// ========== Change Management Types ==========

export interface ChangeRequester {
  id?: string;
  name?: string;
  branch?: IdAndName;
  location?: IdAndName;
  department?: IdAndName;
  budgetHolder?: IdAndName;
  email?: string;
  phoneNumber?: string;
  mobilePhoneNumber?: string;
}

export interface ChangeAssignee {
  id?: string;
  name?: string;
  groupId?: string;
  groupName?: string;
  type?: string;
}

export interface SimpleChangeData {
  plannedStartDate?: string;
  startDate?: string;
  plannedImplementationDate?: string;
  implementationDate?: string;
  closedDate?: string;
  assignee?: ChangeAssignee;
}

export interface ChangePhase {
  plannedEndDate?: string;
  endDate?: string;
  rejectedDate?: string;
  noGoDate?: string;
  authorizer?: ChangeAssignee;
}

export interface ChangePhases {
  prfc?: ChangePhase;
  rfc?: ChangePhase;
  progress?: ChangePhase;
  evaluation?: ChangePhase;
}

export interface Change {
  id: string;
  number: string;
  briefDescription?: string;
  // Legacy fields (sem fields parameter)
  status?: string | IdAndName;
  requester?: Caller | ChangeRequester;
  requesterName?: string;
  request?: string;
  changeType?: string;
  changeTemplate?: IdAndName;
  // New API schema fields (com fields parameter)
  type?: IdAndName;
  category?: IdAndName;
  subcategory?: IdAndName;
  benefit?: IdAndName;
  impact?: IdAndName;
  priority?: IdAndName;
  object?: Object;
  branch?: Branch | IdAndName;
  location?: IdAndName;
  creator?: Operator;
  creationDate?: string;
  modifier?: Operator;
  modificationDate?: string;
  lastModificationDate?: string;
  requestDate?: string;
  submitDate?: string;
  operator?: Operator;
  operatorGroup?: IdAndName;
  coordinator?: ChangeAssignee | IdAndName;
  supplier?: IdAndName;
  processingStatus?: string | IdAndName;
  completed?: boolean;
  closed?: boolean;
  archived?: boolean;
  closureDate?: string;
  costs?: number;
  emergencyChange?: boolean;
  urgent?: boolean;
  externalNumber?: string;
  withEvaluation?: boolean;
  // Simple change data (dates and assignee)
  simple?: SimpleChangeData;
  // Phases data (for extensive changes)
  phases?: ChangePhases;
  optionalFields1?: OptionalFields;
  optionalFields2?: OptionalFields;
}

export interface ChangeCreateBody {
  briefDescription: string;
  requester?: string;
  requesterName?: string;
  request?: string;
  changeType?: string;
  changeTemplate?: string;
  category?: string;
  subcategory?: string;
  benefit?: string;
  impact?: string;
  priority?: string;
  object?: string;
  branch?: string;
  location?: string;
  operator?: string;
  operatorGroup?: string;
  supplier?: string;
  processingStatus?: string;
  optionalFields1?: Partial<OptionalFields>;
  optionalFields2?: Partial<OptionalFields>;
}

export interface ChangeUpdateBody {
  briefDescription?: string;
  requester?: string;
  requesterName?: string;
  request?: string;
  category?: string;
  subcategory?: string;
  benefit?: string;
  impact?: string;
  priority?: string;
  object?: string;
  branch?: string;
  location?: string;
  operator?: string;
  operatorGroup?: string;
  supplier?: string;
  processingStatus?: string;
  optionalFields1?: Partial<OptionalFields>;
  optionalFields2?: Partial<OptionalFields>;
}

// ========== Change Activity Types ==========

export interface ChangeActivityParent {
  id: string;
  number: string;
}

export interface ActivityAssignee {
  id?: string;
  name?: string;
  groupId?: string;
  groupName?: string;
  type?: 'manager' | 'operator';
}

export interface ChangeActivity {
  id: string;
  number: string;
  briefDescription?: string;
  change?: ChangeActivityParent;
  activityType?: 'normal' | 'authorization';
  assignee?: ActivityAssignee;
  processingStatus?: 'waiting' | 'ready_to_start' | 'in_progress' | 'finished' | 'skipped' | 'authorized' | 'rejected';
  status?: IdAndName;
  plannedStartDate?: string;
  startDate?: string;
  plannedFinalDate?: string;
  finalDate?: string;
  resolvedDate?: string;
  archived?: boolean;
  creationDate?: string;
  lastModificationDate?: string;
  template?: IdAndName;
  archiveReason?: IdAndName;
  category?: IdAndName;
  subcategory?: IdAndName;
  externalNumber?: string;
  rejectedDate?: string;
  rejectionReason?: IdAndName;
  skippedDate?: string;
  skippedReason?: IdAndName;
  approvedDate?: string;
  creator?: IdAndName;
  modifier?: IdAndName;
  supplier?: IdAndName;
  plannedChangePhase?: 'rfc' | 'progress' | 'evaluation';
  requests?: string;
  progressTrail?: string;
  optionalFields1?: OptionalFields;
  optionalFields2?: OptionalFields;
  costs?: number;
  currentPlanCosts?: number;
  originalPlanCosts?: number;
  realizedCosts?: number;
  remainingCosts?: number;
  timeSpent?: number;
  currentPlanTimeSpent?: number;
  originalPlanTimeSpent?: number;
  remainingTimeSpent?: number;
}

export interface ChangeActivityListParams {
  query?: string;
  fields?: string;
  sort?: string;
  page_size?: number;
  start?: number;
  archived?: boolean;
}

// ========== Services Types ==========

export interface Service {
  id: string;
  name: string;
  description?: string;
  serviceType?: IdAndName;
  active?: boolean;
  category?: IdAndName;
  supplier?: IdAndName;
  supportTeam?: IdAndName;
  manager?: Operator;
}

export interface ServiceCreate {
  name: string;
  description?: string;
  serviceType?: string;
  active?: boolean;
  category?: string;
  supplier?: string;
  supportTeam?: string;
  manager?: string;
}

// ========== Query Parameters ==========

/**
 * Parâmetros para listagem de incidents.
 * Nota: A API do TOPdesk não aceita filtros diretos como "resolved", "closed", etc.
 * Use FIQL (Feed Item Query Language) no parâmetro "query" para filtros complexos.
 * Exemplos de FIQL:
 * - Incidents não fechados: query="closed==false"
 * - Por operador: query="operator.id==uuid-here"
 * - Por grupo: query="operatorGroup.id==uuid-here"
 * - Últimos 30 dias: query="creationDate=ge=2026-03-01T00:00:00Z"
 * Tutorial FIQL: https://developers.topdesk.com/tutorial.html#query
 */
export interface IncidentListParams {
  pageStart?: number; // Offset para paginação (padrão: 0)
  pageSize?: number; // Quantidade máxima de incidents (1-10000, padrão: 10)
  query?: string; // Filtro FIQL para seleção de incidents
  sort?: string; // Ordenação (ex: "creationDate:desc,targetDate:asc")
  fields?: string; // Campos a retornar (separados por vírgula)
  dateFormat?: 'iso8601'; // Formato de datas
  all?: boolean; // Retorna todos incidents incluindo parciais e arquivados
  closureDateStart?: string;
  closureDateEnd?: string;
}

export interface ChangeListParams {
  archived?: boolean;
  closed?: boolean;
  open?: boolean;
  start?: number;
  page_size?: number;
  query?: string;
  sort?: string;
  fields?: string;
  status?: string;
  operator?: string;
  operatorGroup?: string;
  requester?: string;
  changeType?: string;
  processingStatus?: string;
  phase?: string;
}

export interface ServiceListParams {
  start?: number;
  page_size?: number;
  query?: string;
  archived?: boolean;
}

// ========== Response Types ==========

export interface ListResponse<T> {
  results?: T[];
}

export interface ErrorResponse {
  message: string;
  errors?: string[];
}
