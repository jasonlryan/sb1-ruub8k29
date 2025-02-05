// Model Types
export interface MarketingChannel {
  id: string;
  name: string;
  monthlyBudget: number;
  costPerLead: number;
  leadsGenerated: number;
  notes: string;
  user_id: string;
}

export interface Employee {
  role: string;
  fte: number;
  salaryPerFte: number;
  monthlyTotal: number;
}

export interface FunnelConversion {
  channel: string;
  mql: number;
  mqlToSqlRate: number;
  sql: number;
  sqlToDealRate: number;
  deals: number;
  user_id: string;
}

export interface ActiveSubscriber {
  month: string;
  existingSubs: number;
  newDeals: number;
  churnedSubs: number;
  endingSubs: number;
  user_id: string;
}

export interface Subscription {
  tier: string;
  monthlyPrice: number;
  subscriberCount: number;
  mrr: number;
  user_id: string;
}

export interface OperatingExpense {
  category: string;
  monthlyCost: number;
  notes: string;
  user_id: string;
}

export interface FundingRound {
  round: string;
  amountRaised: number;
  valuationPre: number;
  equitySold: number;
  closeDate: string;
  user_id: string;
}

export interface COGS {
  category: string;
  monthlyCost: number;
  notes: string;
}

export interface Department {
  name: string;
  fte: number;
  salary: number;
  additionalCosts: number;
  monthlyTotal: number;
}

// Add strict typing for function parameters
export type TableSection = 
  | "marketing" 
  | "departments" 
  | "opex" 
  | "subscriptions" 
  | "activeSubscriber";

export type HandleAddRow = (section: TableSection, data?: Record<string, unknown>) => void;
export type HandleUpdateData<T> = (index: number, field: keyof T, value: string) => void;