import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.mock('react-markdown', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('remark-gfm', () => ({
  default: () => () => {},
}));

vi.mock('./context/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('./context/AuthContext')>('./context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: '6a63032400ff5e28a50d703c', name: 'Demo Consumer', email: 'demo@example.com', created_at: '2026-07-24T00:00:00Z' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

vi.mock('./services/api', () => ({
  api: {
    getUser: vi.fn().mockReturnValue({
      id: '6a63032400ff5e28a50d703c',
      name: 'Demo Consumer',
      email: 'demo@example.com',
      created_at: '2026-07-24T00:00:00Z'
    }),
    login: vi.fn(),
    signup: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
    getCases: vi.fn().mockResolvedValue([
      {
        id: '6a63032400ff5e28a50d703c',
        title: 'HP Pavilion Laptop - Motherboard Failure & False CID Warranty Denial',
        category: 'electronics',
        status: 'preparing',
        vendor_name: 'HP India & Flipkart',
        claimed_amount: '₹68,990',
        created_at: '2026-08-14T10:00:00Z',
        updated_at: '2026-08-15T10:00:00Z',
        description: 'HP laptop logic board failed within 45 days, service center falsely claimed liquid ingress.'
      },
      {
        id: '6a63032400ff5e28a50d703d',
        title: 'Samsung Galaxy S23 - Persistent Green Line Display Defect post One UI Update',
        category: 'electronics',
        status: 'preparing',
        vendor_name: 'Samsung India',
        claimed_amount: '₹54,999',
        created_at: '2026-05-18T10:00:00Z',
        updated_at: '2026-05-19T10:00:00Z',
        description: 'Green line on AMOLED screen after official software update.'
      }
    ]),
    createCase: vi.fn().mockResolvedValue({ id: '6a63032400ff5e28a50d703e', title: 'New Consumer Grievance' }),
    analyzeCase: vi.fn().mockResolvedValue({}),
    getFollowUpQuestions: vi.fn().mockResolvedValue({ questions: [] }),
    updateCaseStatus: vi.fn().mockResolvedValue({}),
    getComplaint: vi.fn().mockResolvedValue(null),
    generateComplaint: vi.fn().mockResolvedValue({ content: 'Legal Notice Draft' }),
    askAIChat: vi.fn().mockResolvedValue({ answer: 'Analysis answer' }),
    getEvidence: vi.fn().mockResolvedValue([]),
    getTimeline: vi.fn().mockResolvedValue([])
  }
}));

describe('AI Consumer Grievance Platform End-to-End UI Tests', () => {

  it('renders Dashboard with summary metrics, capital at stake, and seeded Indian cases', async () => {
    render(<App />);

    // Header check
    expect(screen.getByText(/Smart Resolution Platform/i)).toBeInTheDocument();

    // Summary metrics check
    expect(screen.getByText(/Consumer Grievance Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Capital at Stake/i)).toBeInTheDocument();

    // Wait for cases to appear
    await waitFor(() => {
      expect(screen.getByText(/HP Pavilion Laptop - Motherboard Failure/i)).toBeInTheDocument();
      expect(screen.getByText(/Samsung Galaxy S23/i)).toBeInTheDocument();
    });
  });

  it('filters cases by search query for Indian brands', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/HP Pavilion Laptop/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by product, company/i);
    fireEvent.change(searchInput, { target: { value: 'Samsung' } });

    expect(screen.getByText(/Samsung Galaxy S23/i)).toBeInTheDocument();
    expect(screen.queryByText(/HP Pavilion Laptop/i)).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText(/HP Pavilion Laptop/i)).toBeInTheDocument();
  });

  it('navigates to New Grievance wizard and renders Indian preset scenarios', async () => {
    render(<App />);

    // Click New Grievance tab button in header
    const newCaseBtns = screen.getAllByRole('button', { name: /New Grievance/i });
    fireEvent.click(newCaseBtns[0]);

    // Verify Wizard rendered with Indian scenarios
    await waitFor(() => {
      expect(screen.getByText(/Register Consumer Grievance/i)).toBeInTheDocument();
      expect(screen.getByText(/Popular Indian Consumer Scenarios/i)).toBeInTheDocument();
      expect(screen.getByText(/HP Laptop Motherboard Warranty Denial/i)).toBeInTheDocument();
      expect(screen.getByText(/Samsung Galaxy Green Line Post-Update/i)).toBeInTheDocument();
    });
  });

  it('navigates to Case Details view from case card click', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/HP Pavilion Laptop/i)).toBeInTheDocument();
    });

    const caseHeading = screen.getByText(/HP Pavilion Laptop/i);
    const caseCard = caseHeading.closest('.cursor-pointer') || caseHeading;
    fireEvent.click(caseCard);

    await waitFor(() => {
      expect(screen.getByText(/Case Information & Facts/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Case Assistant/i).length).toBeGreaterThanOrEqual(1);
    }, { timeout: 4000 });
  });

});
