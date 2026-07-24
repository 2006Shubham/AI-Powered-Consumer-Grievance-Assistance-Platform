import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { GrievanceCase, CaseStatus } from '../types/case';

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
  },
  {
    id: '1035',
    title: 'Incorrect Billing & Surge Multiplier Overcharge',
    category: 'Utilities',
    status: 'AI Analyzing',
    urgency: 'Low',
    vendorName: 'City Power & Grid Co.',
    purchaseDate: '2026-07-01',
    transactionId: 'UTL-55291',
    claimedAmount: '$450.00',
    desiredResolution: 'Meter Audit & Bill Adjustment',
    createdDate: '2026-07-21',
    lastUpdated: '2026-07-21',
    description: 'Electricity bill for June 2026 spiked 400% higher than average historical consumption. Smart meter log shows zero occupancy for 10 days during vacation period.',
    timeline: [
      { id: 't1', date: '2026-07-21 02:00 PM', title: 'Case Filed', description: 'Initial grievance details submitted.', type: 'user', status: 'completed' },
      { id: 't2', date: '2026-07-21 02:05 PM', title: 'AI Analysis in Progress', description: 'Cross-referencing utility regulation rate caps.', type: 'ai', status: 'current' }
    ],
    evidence: [
      { id: 'e1', name: 'June_Electricity_Bill.pdf', size: '1.5 MB', uploadDate: '2026-07-21', tag: 'Invoice / Receipt', fileType: 'pdf' }
    ],
    ragGuidance: {
      sectionTitle: 'Regulatory Utility Tariff Guidelines & Meter Accuracy Codes',
      actName: 'State Utility Regulatory Commission Regulations',
      legalRightSummary: 'Utility providers are mandated to conduct free secondary meter testing when consumption anomalies exceed 200% of 6-month historical baseline.',
      recommendedAction: 'Request emergency meter calibration and hold disputed bill portion in escrow.',
      confidenceScore: 91
    }
  },
  {
    id: '1028',
    title: 'Unauthorized Flight Cancellation Fee Deduction',
    category: 'E-commerce',
    status: 'Resolved',
    urgency: 'Medium',
    vendorName: 'SkyFly Airways Direct',
    purchaseDate: '2026-04-10',
    transactionId: 'PNR-X9K201',
    claimedAmount: '$580.00',
    desiredResolution: 'Full Refund into Original Payment Method',
    createdDate: '2026-06-01',
    lastUpdated: '2026-06-18',
    description: 'Airline cancelled flight due to operational reasons but credited funds into non-refundable travel voucher instead of cash refund.',
    timeline: [
      { id: 't1', date: '2026-06-01', title: 'Case Filed', description: 'Grievance submitted regarding voucher force-credit.', type: 'user', status: 'completed' },
      { id: 't2', date: '2026-06-05', title: 'Legal Demand Served', description: 'Aviation Consumer Protection notice issued.', type: 'system', status: 'completed' },
      { id: 't3', date: '2026-06-18', title: 'Full Refund Issued', description: 'Airline processed $580.00 cash refund to original credit card.', type: 'vendor', status: 'completed' }
    ],
    evidence: [
      { id: 'e1', name: 'Flight_Cancellation_Email.pdf', size: '600 KB', uploadDate: '2026-06-01', tag: 'Vendor Email', fileType: 'pdf' },
      { id: 'e2', name: 'Voucher_Issue_Screenshot.png', size: '1.1 MB', uploadDate: '2026-06-01', tag: 'Product Photo / Screenshot', fileType: 'image' }
    ],
    ragGuidance: {
      sectionTitle: 'Aviation Passenger Charter - Involuntary Cancellation Clause',
      actName: 'Civil Aviation Consumer Rules',
      legalRightSummary: 'When an airline cancels a flight, passengers have absolute statutory entitlement to a 100% refund in original currency. Credit vouchers cannot be imposed.',
      recommendedAction: 'Case resolved successfully.',
      confidenceScore: 98
    }
  },
  {
    id: '1019',
    title: 'Fraudulent Sim Swapping & Unauthorized Banking Debit',
    category: 'Banking',
    status: 'Escalated',
    urgency: 'Critical',
    vendorName: 'Apex National Bank & Telecom',
    purchaseDate: '2026-05-30',
    transactionId: 'BANK-401923',
    claimedAmount: '$3,450.00',
    desiredResolution: 'Full Reimbursement & Cyber Fraud Investigation',
    createdDate: '2026-06-12',
    lastUpdated: '2026-07-02',
    description: 'Unauthorized SIM swap occurred without SMS authentication warning, leading to 2 unauthorized wire transfers. Bank delayed account freeze by 4 hours after initial hotline fraud alert.',
    timeline: [
      { id: 't1', date: '2026-06-12', title: 'Case Filed', description: 'Emergency cyber grievance logged.', type: 'user', status: 'completed' },
      { id: 't2', date: '2026-06-14', title: 'AI Escalation to Ombudsman', description: 'Drafted Banking Ombudsman petition for zero-liability policy.', type: 'ai', status: 'completed' },
      { id: 't3', date: '2026-07-02', title: 'Escalated to Financial Regulatory Board', description: 'Hearing scheduled for August 2026.', type: 'system', status: 'current' }
    ],
    evidence: [
      { id: 'e1', name: 'Cyber_Police_FIR_Report.pdf', size: '3.4 MB', uploadDate: '2026-06-12', tag: 'Warranty Document', fileType: 'pdf' },
      { id: 'e2', name: 'Call_Log_Bank_Hotline.png', size: '720 KB', uploadDate: '2026-06-12', tag: 'Product Photo / Screenshot', fileType: 'image' }
    ],
    ragGuidance: {
      sectionTitle: 'Zero Liability Customer Policy for Unauthorised Electronic Banking Transactions',
      actName: 'Central Banking Regulatory Guidelines',
      legalRightSummary: 'If customer reports unauthorized transaction within 3 days without customer negligence, bank carries 100% liability to reverse funds within 10 working days.',
      recommendedAction: 'File petition with Banking Ombudsman requesting immediate temporary credit.',
      confidenceScore: 96
    }
  }
];

interface CaseContextType {
  cases: GrievanceCase[];
  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;
  getCaseById: (id: string) => GrievanceCase | undefined;
  addNewCase: (newCase: Omit<GrievanceCase, 'id' | 'createdDate' | 'lastUpdated' | 'timeline' | 'ragGuidance'>) => string;
  updateCaseStatus: (id: string, status: CaseStatus) => void;
  activeTab: 'dashboard' | 'new-case' | 'case-details';
  setActiveTab: (tab: 'dashboard' | 'new-case' | 'case-details') => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<GrievanceCase[]>(INITIAL_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string | null>('1042');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new-case' | 'case-details'>('dashboard');

  const getCaseById = (id: string) => {
    return cases.find(c => c.id === id) || cases[0];
  };

  const addNewCase = (caseData: Omit<GrievanceCase, 'id' | 'createdDate' | 'lastUpdated' | 'timeline' | 'ragGuidance'>): string => {
    const nextId = (Math.max(...cases.map(c => parseInt(c.id, 10)), 1045) + 1).toString();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newGrievance: GrievanceCase = {
      ...caseData,
      id: nextId,
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
        },
        {
          id: 't-notice',
          date: 'Pending',
          title: 'Formal Notice Dispatch',
          description: 'Draft complaint notice ready for vendor dispatch.',
          type: 'system',
          status: 'current'
        }
      ],
      ragGuidance: {
        sectionTitle: `Consumer Rights Protection for ${caseData.category}`,
        actName: 'Consumer Protection Act 2019 & Fair Trade Standards',
        legalRightSummary: `Based on your description, vendor ${caseData.vendorName} is legally required to resolve disputes regarding ${caseData.category.toLowerCase()} within 15 days of notice.`,
        recommendedAction: 'Send formal complaint notice and request immediate transaction credit.',
        confidenceScore: 92
      },
      generatedNotice: `FORMAL LEGAL CONSUMER COMPLAINT

TO: ${caseData.vendorName} Legal & Customer Redressal Team
DATE: ${today}
SUBJECT: Demand for ${caseData.desiredResolution} regarding Transaction ${caseData.transactionId}

Dear Sir/Madam,

This is a formal grievance notification regarding transaction ${caseData.transactionId} dated ${caseData.purchaseDate} involving ${caseData.claimedAmount}.

FACTS OF THE GRIEVANCE:
${caseData.description}

DESIRED RELIEF:
${caseData.desiredResolution}

Under the Consumer Protection Act, failure to resolve valid consumer grievances within reasonable timeframe grants entitlement to legal damages and regulatory complaint filing. We request your prompt resolution within 7 working days.

Sincerely,
GrievanceAI Consumer Rights Platform`
    };

    setCases(prev => [newGrievance, ...prev]);
    setActiveCaseId(nextId);
    return nextId;
  };

  const updateCaseStatus = (id: string, status: CaseStatus) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status, lastUpdated: new Date().toISOString().split('T')[0] } : c));
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
      setActiveTab
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
