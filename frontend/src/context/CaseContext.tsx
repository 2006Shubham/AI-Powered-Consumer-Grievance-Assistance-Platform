import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { GrievanceCase, CaseStatus, CaseCategory } from '../types/case';
import { api } from '../services/api';

const normalizeCategory = (cat?: string): CaseCategory => {
  if (!cat) return 'Electronics';
  const l = cat.toLowerCase();
  if (l.includes('electr')) return 'Electronics';
  if (l.includes('comm') || l.includes('e-comm') || l.includes('retail')) return 'E-commerce';
  if (l.includes('bank') || l.includes('pay') || l.includes('finan')) return 'Banking';
  if (l.includes('util') || l.includes('energy') || l.includes('power')) return 'Utilities';
  if (l.includes('tele') || l.includes('phone') || l.includes('broadband')) return 'Telecommunications';
  return 'Electronics';
};

const normalizeStatus = (st?: string): CaseStatus => {
  if (!st) return 'In Progress';
  const l = st.toLowerCase();
  if (l.includes('draft')) return 'Draft';
  if (l.includes('analyz')) return 'AI Analyzing';
  if (l.includes('pending')) return 'Pending Info';
  if (l.includes('escalat')) return 'Escalated';
  if (l.includes('resolv') || l.includes('closed')) return 'Resolved';
  return 'In Progress';
};

interface CaseContextType {
  cases: GrievanceCase[];
  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;
  getCaseById: (id: string) => GrievanceCase | undefined;
  addNewCase: (caseData: {
    title: string;
    description: string;
    category?: string;
    vendorName?: string;
    claimedAmount?: string;
    desiredResolution?: string;
  }) => Promise<string>;
  updateCaseStatus: (id: string, status: CaseStatus | string) => Promise<void>;
  submitFollowUpAnswers: (caseId: string, answers: Record<string, string>) => Promise<void>;
  activeTab: 'dashboard' | 'new-case' | 'case-details';
  setActiveTab: (tab: 'dashboard' | 'new-case' | 'case-details') => void;
  isLoadingCases: boolean;
  refreshCases: () => Promise<void>;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<GrievanceCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new-case' | 'case-details'>('dashboard');
  const [isLoadingCases, setIsLoadingCases] = useState<boolean>(true);

  const fetchBackendCases = async () => {
    setIsLoadingCases(true);
    try {
      const apiCases = await api.getCases();
      if (Array.isArray(apiCases) && apiCases.length > 0) {
        const mapped: GrievanceCase[] = apiCases.map((c: any) => {
          const id = c.id || c._id;
          return {
            id,
            title: c.title || 'Consumer Grievance',
            category: normalizeCategory(c.category),
            status: normalizeStatus(c.status),
            urgency: 'High',
            vendorName: c.vendor_name || c.vendorName || 'ElectroTech Megastore',
            purchaseDate: c.purchase_date || (c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            transactionId: c.transaction_id || `TXN-${id.substring(0, 6).toUpperCase()}`,
            claimedAmount: c.claimed_amount || '₹1,299.00',
            desiredResolution: c.desired_resolution || 'Full Refund',
            createdDate: c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            lastUpdated: c.updated_at ? c.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
            description: c.description || '',
            summary: c.summary,
            key_facts: c.key_facts || [],
            user_answers: c.user_answers || {},
            timeline: [
              {
                id: 't-init',
                date: c.created_at ? c.created_at.split('T')[0] : 'Today',
                title: 'Case Registered',
                description: 'Grievance submitted by consumer.',
                type: 'user',
                status: 'completed'
              }
            ],
            evidence: [],
            ragGuidance: {
              sectionTitle: `Statutory Protection (${normalizeCategory(c.category)})`,
              actName: 'Consumer Protection Act 2019',
              legalRightSummary: 'Statutory protection against unfair trade practices and product deficiency.',
              recommendedAction: 'Serve formal 15-day pre-litigation demand notice.',
              confidenceScore: 90
            }
          };
        });

        setCases(mapped);
        if (!activeCaseId && mapped.length > 0) {
          setActiveCaseId(mapped[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not fetch backend cases:', err);
    } finally {
      setIsLoadingCases(false);
    }
  };

  useEffect(() => {
    fetchBackendCases();
  }, []);

  const getCaseById = (id: string): GrievanceCase | undefined => {
    return cases.find(c => c.id === id) || cases[0];
  };

  const addNewCase = async (caseData: {
    title: string;
    description: string;
    category?: string;
    vendorName?: string;
    claimedAmount?: string;
    desiredResolution?: string;
  }): Promise<string> => {
    setIsLoadingCases(true);
    let newId = '';
    try {
      const created = await api.createCase({
        title: caseData.title,
        description: caseData.description,
        category: caseData.category,
        vendor_name: caseData.vendorName,
        claimed_amount: caseData.claimedAmount,
        desired_resolution: caseData.desiredResolution
      });
      newId = created.id || (created as any)._id;

      // Trigger AI analysis with Groq on backend
      try {
        await api.analyzeCase(newId);
      } catch (err) {
        console.warn('AI analysis error:', err);
      }

      // Fetch follow-up questions
      try {
        await api.getFollowUpQuestions(newId);
      } catch (err) {
        console.warn('Follow up questions error:', err);
      }

      await fetchBackendCases();
      setActiveCaseId(newId);
      setActiveTab('case-details');
      return newId;
    } catch (err) {
      console.error('Case creation error:', err);
      await fetchBackendCases();
      return newId || 'new';
    } finally {
      setIsLoadingCases(false);
    }
  };

  const updateCaseStatus = async (id: string, newStatus: CaseStatus | string) => {
    let backendStatus = 'preparing';
    if (newStatus === 'Resolved') backendStatus = 'resolved';
    else if (newStatus === 'Draft') backendStatus = 'draft';
    else if (newStatus === 'Submitted') backendStatus = 'submitted';
    else if (newStatus === 'In Progress') backendStatus = 'preparing';
    else backendStatus = String(newStatus).toLowerCase();

    try {
      await api.updateCaseStatus(id, backendStatus);
      await fetchBackendCases();
    } catch (err) {
      console.warn('Update status error:', err);
    }
  };

  const submitFollowUpAnswers = async (caseId: string, answers: Record<string, string>) => {
    try {
      await api.submitAnswers(caseId, answers);
      await fetchBackendCases();
    } catch (err) {
      console.warn('Submit answers error:', err);
    }
  };

  return (
    <CaseContext.Provider value={{
      cases,
      activeCaseId,
      setActiveCaseId,
      getCaseById,
      addNewCase,
      updateCaseStatus,
      submitFollowUpAnswers,
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
