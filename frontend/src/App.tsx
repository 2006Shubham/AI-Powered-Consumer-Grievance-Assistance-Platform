import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CaseProvider, useCases } from './context/CaseContext';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { NewCaseWizard } from './pages/NewCaseWizard';
import { CaseDetailsView } from './pages/CaseDetailsView';
import { LandingPage } from './pages/LandingPage';
import { LoadingScreen } from './components/common/LoadingScreen';

const MainContent: React.FC = () => {
  const { activeTab } = useCases();

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 pb-12">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'new-case' && <NewCaseWizard />}
      {activeTab === 'case-details' && <CaseDetailsView />}
    </main>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Initializing RAG Consumer Protection Engine..." />;
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <CaseProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white flex flex-col">
        <Header />
        <div className="flex-1">
          <MainContent />
        </div>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>© 2026 GrievanceAI Platform • Consumer Protection Act Redressal Systems</span>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-700 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-slate-700 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </footer>
      </div>
    </CaseProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
