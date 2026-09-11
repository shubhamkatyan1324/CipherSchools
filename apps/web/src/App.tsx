import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { ToastProvider } from './components/ui/Toast';
import { HomePage } from './pages/HomePage';
import { ProblemDetailsPage } from './pages/ProblemDetailsPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { FeedbackPage } from './pages/FeedbackPage';
import { AttemptHistoryPage } from './pages/AttemptHistoryPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-cs-orange-500 selection:text-white">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/problem/:slug" element={<ProblemDetailsPage />} />
              <Route path="/problem/:slug/history" element={<AttemptHistoryPage />} />
              <Route path="/attempt/:id" element={<WorkspacePage />} />
              <Route path="/attempt/:id/feedback" element={<FeedbackPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
