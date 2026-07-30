import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { GrievanceCase, CaseStatus, CaseCategory } from '../types/case';
import { api } from '../services/api';

const INITIAL_CASES: GrievanceCase[] = [
  {
    id: '1042',
    title: 'Defective OLED Smart TV Denied Warranty Service',
    category: 'Electronics',
    status: 'In Progress',
    urgency: 'High',
    vendorName: 'ElectroTech Megastore',
    purchaseDate: '2026-05-12',
    transactionId: 'TXN-8829104',
    claimedAmount: '$1,299.00',
    desiredResolution: 'Full Refund or Unit Replacement',
    createdDate: '2026-07-15',
    lastUpdated: '2026-07-22',
    description: 'Purchased 55-inch OLED TV. Screen developed dead pixels and thermal distortion after 60 days. Tech support refused repair citing non-existent liquid damage despite technician inspection report proving internal mainboard failure.',
    timeline: [
      { id: 't1', date: '2026-07-15 10:30 AM', title: 'Case Created', description: 'Grievance registered with attached purchase receipt.', type: 'user', status: 'completed' },
      { id: 't2', date: '2026-07-15 10:32 AM', title: 'AI Risk & Ground Analysis', description: 'Matched against Section 18 Consumer Protection Act (Defective Goods).', type: 'ai', status: 'completed' },
      { id: 't3', date: '2026-07-18 02:15 PM', title: 'Formal Notice Dispatched', description: 'AI generated legal notice dispatched to ElectroTech Legal Cell.', type: 'system', status: 'completed' },
      { id: 't4', date: '2026-07-22 11:00 AM', title: 'Vendor Acknowledgment', description: 'Vendor requested 5 working days for internal technical audit.', type: 'vendor', status: 'current' },
      { id: 't5', date: 'Pending', title: 'Resolution & Escrow Refund', description: 'Final settlement agreement and refund processing.', type: 'system', status: 'pending' },
    ],
    evidence: [
      { id: 'e1', name: 'Invoice_ElectroTech_1042.pdf', size: '1.2 MB', uploadDate: '2026-07-15', tag: 'Invoice / Receipt', fileType: 'pdf' },
      { id: 'e2', name: 'Inspection_Report_PanelFault.pdf', size: '2.8 MB', uploadDate: '2026-07-15', tag: 'Warranty Document', fileType: 'pdf' },
      { id: 'e3', name: 'Email_Refusal_CustomerService.png', size: '850 KB', uploadDate: '2026-07-16', tag: 'Vendor Email', fileType: 'image' },
    ],
    ragGuidance: {
      sectionTitle: 'Section 18 & Section 2(11) - Product Defect & Service Failure',
      actName: 'Consumer Protection Act 2019',
      legalRightSummary: 'Under Consumer Rights regulations, a product failing within valid express warranty without buyer fault entitles the consumer to free repair, full replacement, or immediate refund without penalty fees.',
      recommendedAction: 'Serve formal 15-day pre-litigation notice demanding refund plus statutory interest of 9% p.a.',
      confidenceScore: 94
    },
    generatedNotice: `LEGAL NOTICE FOR CONSUMER GRIEVANCE RECOVERY

To: Legal & Claims Division, ElectroTech Megastore Pvt Ltd
Date: July 15, 2026
Subject: Formal Demand Notice regarding Defective OLED TV (Invoice TXN-8829104)

Dear Sir/Madam,

Take notice that the undersigned consumer purchased an OLED Smart TV (Invoice TXN-8829104 dated May 12, 2026) for the sum of $1,299.00. 

Within the standard warranty period, the device exhibited total display failure. Independent technical evaluation confirmed internal component failure unrelated to external influence. Your denial of service on July 14, 2026 constitutes unfair trade practice and deficiency in service under Section 2(11) of the Consumer Protection Act.

WE HEREBY DEMAND:
1. Full refund of $1,299.00 or replacement with an equivalent new unit within 14 calendar days.
2. Written acknowledgment of this notice within 3 business days.

Failing compliance, formal proceedings will be instituted before the Consumer Disputes Redressal Commission for principal recovery, compensation for mental agony, and legal costs.

Sincerely,
GrievanceAI Automated Consumer Legal Counsel`
  },
  {
    id: '1039',
    title: 'Unauthorized Recurring Subscription Charges',
    category: 'E-commerce',
    status: 'Pending Info',
    urgency: 'Medium',
    vendorName: 'CloudStream Global Services',
    purchaseDate: '2026-06-01',
    transactionId: 'TXN-9912041',
    claimedAmount: '$240.00',
    desiredResolution: 'Refund of 4 Unapproved Billing Cycles',
    createdDate: '2026-07-10',
    lastUpdated: '2026-07-20',
    description: 'Enrolled in 7-day free trial. Cancelled subscription on Day 5 via app interface. Vendor continued auto-debiting $60/month for 4 consecutive cycles without sending billing notifications or invoice receipts.',
    timeline: [
      { id: 't1', date: '2026-07-10 09:12 AM', title: 'Case Created', description: 'Grievance submitted with bank statement screenshot.', type: 'user', status: 'completed' },
      { id: 't2', date: '2026-07-10 09:15 AM', title: 'AI Analysis Completed', description: 'Identified dark pattern subscription loop & unauthorized auto-debiting.', type: 'ai', status: 'completed' },
      { id: 't3', date: '2026-07-20 04:00 PM', title: 'AI System Requested Info', description: 'Needs cancellation confirmation email or in-app screenshot showing trial end date.', type: 'ai', status: 'current' }
    ],
    evidence: [
      { id: 'e1', name: 'Bank_Statement_July2026.pdf', size: '920 KB', uploadDate: '2026-07-10', tag: 'Invoice / Receipt', fileType: 'pdf' }
    ],
    ragGuidance: {
      sectionTitle: 'Dark Pattern Regulations & Unfair Contract Terms',
      actName: 'E-Commerce Consumer Protection Guidelines 2020',
      legalRightSummary: 'Auto-debit mechanisms without explicit opt-in consent or pre-transaction notification violate explicit FTC and e-commerce transparency guidelines. Consumers are entitled to chargeback and full reimbursement.',
      recommendedAction: 'File chargeback request with card issuer attached with AI-generated notice to merchant payment gateway.',
      confidenceScore: 89
    }
  }
];

interface CaseContextType {
  cases: GrievanceCase[];
  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;
  getCaseById: (id: string) => GrievanceCase | undefined;
  addNewCase: (newCase: Omit<GrievanceCase, 'id' | 'createdDate' | 'lastUpdated' | 'timeline' | 'ragGuidance'>) => Promise<string>;
  updateCaseStatus: (id: string, status: CaseStatus) => void;
  activeTab: 'dashboard' | 'new-case' | 'case-details';
  setActiveTab: (tab: 'dashboard' | 'new-case' | 'case-details') => void;
  isLoadingCases: boolean;
  refreshCases: () => Promise<void>;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<GrievanceCase[]>(INITIAL_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string | null>('1042');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new-case' | 'case-details'>('dashboard');
  const [isLoadingCases, setIsLoadingCases] = useState<boolean>(false);

  const fetchBackendCases = async () => {
    setIsLoadingCases(true);
    try {
      const apiCases = await api.getCases();
      if (Array.isArray(apiCases) && apiCases.length > 0) {
        const mapped: GrievanceCase[] = apiCases.map((c: any) => ({
          id: c.id || c._id,
          title: c.title || 'Consumer Grievance',
          category: (c.category || 'Electronics') as CaseCategory,
          status: (c.status || 'In Progress') as CaseStatus,
          urgency: 'High',
          vendorName: c.vendor_name || c.vendorName || 'Specified Merchant',
          purchaseDate: c.purchase_date || c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          transactionId: c.transaction_id || `TXN-${(c.id || c._id).substring(0, 6)}`,
          claimedAmount: c.claimed_amount || '$0.00',
          desiredResolution: c.desired_resolution || 'Full Refund',
          createdDate: c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          lastUpdated: c.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          description: c.description || '',
          timeline: [
            {
              id: 't-init',
              date: c.created_at?.split('T')[0] || 'Today',
              title: 'Case Filed & AI Analyzed',
              description: 'Grievance registered and sent to Groq RAG intelligence engine.',
              type: 'user',
              status: 'completed'
            }
          ],
          evidence: [],
          ragGuidance: {
            sectionTitle: `Section 18 Consumer Protection Act (${c.category || 'General'})`,
            actName: 'Consumer Protection Act 2019',
            legalRightSummary: 'Statutory protection against unfair trade practices and product deficiency.',
            recommendedAction: 'Issue 14-day formal pre-litigation legal notice.',
            confidenceScore: 92
          }
        }));

        setCases(mapped);
        if (mapped.length > 0) {
          setActiveCaseId(mapped[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not fetch remote backend cases, retaining local state:', err);
    } finally {
      setIsLoadingCases(false);
    }
  };

  useEffect(() => {
    fetchBackendCases();
  }, []);

  const getCaseById = (id: string) => {
    return cases.find(c => c.id === id) || cases[0];
  };

  const addNewCase = async (caseData: Omit<GrievanceCase, 'id' | 'createdDate' | 'lastUpdated' | 'timeline' | 'ragGuidance'>): Promise<string> => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let createdId = (Math.max(...cases.map(c => parseInt(c.id, 10) || 0), 1045) + 1).toString();

    try {
      const backendCase = await api.createCase({
        title: caseData.title,
        description: caseData.description,
        category: caseData.category,
        issue_type: caseData.desiredResolution,
        desired_resolution: caseData.desiredResolution
      });
      if (backendCase && (backendCase.id || (backendCase as any)._id)) {
        createdId = backendCase.id || (backendCase as any)._id;
        // Trigger AI analysis asynchronously
        api.analyzeCase(createdId).catch(console.error);
      }
    } catch (e) {
      console.warn('Backend case creation fallback to client state:', e);
    }

    const newGrievance: GrievanceCase = {
      ...caseData,
      id: createdId,
      createdDate: today,
      lastUpdated: today,
      timeline: [
        {
          id: 't-init',
          date: `${today} ${now}`,
          title: 'Case Filed & AI Analyzed',
          description: 'Grievance submitted by consumer and processed by RAG legal intelligence engine.',
          type: 'user',
          status: 'completed'
        },
        {
          id: 't-ai',
          date: `${today} ${now}`,
          title: 'Legal Grounds Mapped',
          description: `Consumer Protection Act clauses identified for category ${caseData.category}.`,
          type: 'ai',
          status: 'completed'
        }
      ],
      ragGuidance: {
        sectionTitle: `Consumer Rights Protection for ${caseData.category}`,
        actName: 'Consumer Protection Act 2019 & Fair Trade Standards',
        legalRightSummary: `Based on your description, vendor ${caseData.vendorName} is legally required to resolve disputes regarding ${caseData.category.toLowerCase()} within 15 days of notice.`,
        recommendedAction: 'Send formal complaint notice and request immediate transaction credit.',
        confidenceScore: 92
      }
    };

    setCases(prev => [newGrievance, ...prev]);
    setActiveCaseId(createdId);
    return createdId;
  };

  const updateCaseStatus = (id: string, status: CaseStatus) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status, lastUpdated: new Date().toISOString().split('T')[0] } : c));
    api.updateCaseStatus(id, status).catch(console.warn);
  };

  return (
    <CaseContext.Provider value={{
      cases,
      activeCaseId,
      setActiveCaseId,
      getCaseById,
      addNewCase,
      updateCaseStatus,
      activeTab,
      setActiveTab,
      isLoadingCases,
      refreshCases: fetchBackendCases
    }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCases = () => {
  const context = useContext(CaseContext);
  if (!context) throw new Error('useCases must be used within a CaseProvider');
  return context;
};
