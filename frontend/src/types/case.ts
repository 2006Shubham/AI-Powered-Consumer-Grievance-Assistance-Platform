export type CaseCategory = 'Electronics' | 'E-commerce' | 'Banking' | 'Utilities' | 'Telecommunications';

export type CaseStatus = 'Draft' | 'AI Analyzing' | 'Pending Info' | 'In Progress' | 'Escalated' | 'Resolved';

export type CaseUrgency = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'system' | 'user' | 'ai' | 'vendor';
  status: 'completed' | 'current' | 'pending';
}

export interface EvidenceFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  tag: 'Invoice / Receipt' | 'Warranty Document' | 'Vendor Email' | 'Product Photo / Screenshot';
  fileType: string;
}

export interface RAGGuidance {
  sectionTitle: string;
  actName: string;
  legalRightSummary: string;
  recommendedAction: string;
  confidenceScore: number;
}

export interface GrievanceCase {
  id: string;
  title: string;
  category: CaseCategory;
  status: CaseStatus;
  urgency: CaseUrgency;
  vendorName: string;
  purchaseDate: string;
  transactionId: string;
  claimedAmount: string;
  desiredResolution: string;
  createdDate: string;
  lastUpdated: string;
  description: string;
  timeline: TimelineEvent[];
  evidence: EvidenceFile[];
  ragGuidance: RAGGuidance;
  generatedNotice?: string;
}
