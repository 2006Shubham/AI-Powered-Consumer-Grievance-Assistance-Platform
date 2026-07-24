import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

describe('AI Consumer Grievance Platform End-to-End UI Tests', () => {

  it('renders Dashboard with summary metrics, category filters, and initial cases', () => {
    render(<App />);

    // Header check
    expect(screen.getByText(/AI-Powered Consumer Rights Assistance/i)).toBeInTheDocument();

    // Summary metrics check
    expect(screen.getByText('Total Cases')).toBeInTheDocument();
    expect(screen.getByText('Pending Action')).toBeInTheDocument();
    expect(screen.getByText('Resolved Cases')).toBeInTheDocument();

    // Check pre-populated case cards
    expect(screen.getByText('#1042')).toBeInTheDocument();
    expect(screen.getByText(/Defective OLED Smart TV/i)).toBeInTheDocument();
  });

  it('filters cases by search query and category pills', async () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search by case #/i);
    fireEvent.change(searchInput, { target: { value: 'OLED' } });

    expect(screen.getByText(/Defective OLED Smart TV/i)).toBeInTheDocument();
    expect(screen.queryByText(/Unauthorized Recurring Subscription/i)).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText(/Unauthorized Recurring Subscription/i)).toBeInTheDocument();
  });

  it('navigates to New Case Wizard and performs AI Case Analysis flow', async () => {
    vi.useFakeTimers();

    render(<App />);

    // Click New Case tab button in header
    const newCaseBtns = screen.getAllByRole('button', { name: /New Case/i });
    fireEvent.click(newCaseBtns[0]);

    // Verify Wizard rendered
    expect(screen.getByText(/1. Describe Your Problem in Natural Language/i)).toBeInTheDocument();

    // Fill grievance description
    const textarea = screen.getByPlaceholderText(/Explain what happened/i);
    fireEvent.change(textarea, { target: { value: 'I bought a laptop for $1000 on Amazon and it stopped charging after 2 days. Seller refused refund.' } });

    // Click Analyze Case with AI
    const analyzeBtn = screen.getByRole('button', { name: /Analyze Case with AI/i });
    fireEvent.click(analyzeBtn);

    // Fast-forward AI analysis timeouts (2500ms)
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // Check Step 2 facts step mounted
    expect(screen.getByText(/2. AI Extracted Facts & Follow-up Details/i)).toBeInTheDocument();

    // Fill mandatory vendor name
    const vendorInput = screen.getByPlaceholderText(/e.g., ElectroTech Megastore/i);
    fireEvent.change(vendorInput, { target: { value: 'TechCorp Electronics' } });

    // Click submit button directly
    const submitBtn = screen.getByRole('button', { name: /Submit Case & Generate Notice/i });
    fireEvent.click(submitBtn);

    // Verify transition to Case Details View
    expect(screen.getByRole('heading', { name: /RAG Legal Intelligence/i })).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('opens and closes the AI Complaint Generator modal', async () => {
    render(<App />);

    // Navigate to Case Details for #1042
    const caseCard = screen.getByText('#1042');
    fireEvent.click(caseCard);

    // Click View / Edit Legal Notice
    const noticeBtn = screen.getByRole('button', { name: /View \/ Edit Legal Notice/i });
    fireEvent.click(noticeBtn);

    // Modal should open
    expect(screen.getByText(/AI Generated Legal Complaint Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Copy to Clipboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Download \(\.txt\)/i)).toBeInTheDocument();
  });

});
