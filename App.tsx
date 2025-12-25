import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Button from './components/Button';
import Dashboard from './pages/Dashboard';
import Details from './pages/Details';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Categories from './pages/Categories';
import Submit from './pages/Submit';
import Pricing from './pages/Pricing';
import SignIn from './pages/SignIn';
import Legal from './pages/Legal';
import Contact from './pages/Contact';
import ErrorPage from './pages/ErrorPage';
import { MOCK_LISTINGS } from './constants';
import { ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Network State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // Only show the error screen if loaded offline OR user tries to navigate while offline
  const [showErrorScreen, setShowErrorScreen] = useState(!navigator.onLine);

  // Fake initial loading for "Premium App" feel
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Network Status Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowErrorScreen(false); // Auto-recover when internet comes back
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      // NOTE: We do NOT set setShowErrorScreen(true) here. 
      // We wait for the user to try to do something.
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Centralized Navigation Handler
  // This intercepts all navigation attempts to check for connectivity
  const handleNavigate = (newView: ViewState) => {
    if (!isOnline) {
      setShowErrorScreen(true);
      return;
    }
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleListingClick = (id: string) => {
    if (!isOnline) {
      setShowErrorScreen(true);
      return;
    }
    setSelectedListingId(id);
    setView(ViewState.DETAILS);
    window.scrollTo(0, 0);
  };

  const selectedListing = MOCK_LISTINGS.find(l => l.id === selectedListingId);

  // Loading State
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-[100]">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
           <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center animate-bounce">
              <div className="w-4 h-4 bg-background rounded-sm" />
           </div>
           <p className="text-textMuted font-mono text-sm tracking-widest">LOADING CATALOG</p>
        </div>
      </div>
    );
  }

  // Offline/Error State
  if (showErrorScreen) {
    return (
      <ErrorPage 
        type="offline" 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  const renderContent = () => {
    switch (view) {
      case ViewState.DETAILS:
        if (selectedListing) {
          return <Details listing={selectedListing} onBack={() => handleNavigate(ViewState.EXPLORE)} />;
        }
        return <Explore onListingClick={handleListingClick} />; // Fallback
      
      case ViewState.DASHBOARD:
        return <Dashboard />;

      case ViewState.EXPLORE:
        return <Explore onListingClick={handleListingClick} />;

      case ViewState.CATEGORIES:
        return <Categories onNavigate={handleNavigate} />;

      case ViewState.SUBMIT:
        return <Submit />;

      case ViewState.PRICING:
        return <Pricing />;

      case ViewState.SIGN_IN:
        return <SignIn onNavigate={handleNavigate} />;

      case ViewState.PRIVACY:
        return <Legal type={ViewState.PRIVACY} />;

      case ViewState.TERMS:
        return <Legal type={ViewState.TERMS} />;

      case ViewState.CONTACT:
        return <Contact />;

      case ViewState.HOME:
      default:
        return <Home onNavigate={handleNavigate} onListingClick={handleListingClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain font-sans selection:bg-accent selection:text-black">
      <Navbar onNavigate={handleNavigate} currentView={view} />
      
      {/* Page Content */}
      <div className="min-h-[calc(100vh-400px)]">
        {renderContent()}
      </div>
      
      {/* Footer */}
      <footer className="border-t border-border bg-surface py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
           <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-white rounded-md"></div>
                <span className="font-display font-bold text-white">WebCatalog</span>
              </div>
              <p className="text-textMuted text-sm leading-relaxed">
                The premium marketplace for serious digital products. Built for the modern web.
              </p>
           </div>
           
           <div>
             <h4 className="font-bold text-white mb-6">Marketplace</h4>
             <ul className="space-y-4 text-sm text-textMuted">
               <li><button onClick={() => handleNavigate(ViewState.EXPLORE)} className="hover:text-white transition-colors">Explore</button></li>
               <li><button onClick={() => handleNavigate(ViewState.CATEGORIES)} className="hover:text-white transition-colors">Use Cases</button></li>
               <li><button onClick={() => handleNavigate(ViewState.PRICING)} className="hover:text-white transition-colors">Pricing</button></li>
             </ul>
           </div>
           
           <div>
             <h4 className="font-bold text-white mb-6">Support</h4>
             <ul className="space-y-4 text-sm text-textMuted">
               <li><button onClick={() => handleNavigate(ViewState.CONTACT)} className="hover:text-white transition-colors">Contact Us</button></li>
               <li><button onClick={() => handleNavigate(ViewState.PRIVACY)} className="hover:text-white transition-colors">Privacy Policy</button></li>
               <li><button onClick={() => handleNavigate(ViewState.TERMS)} className="hover:text-white transition-colors">Terms of Service</button></li>
             </ul>
           </div>
           
           <div>
              <h4 className="font-bold text-white mb-6">Stay Updated</h4>
              <p className="text-textMuted text-sm mb-4">New drops every Tuesday.</p>
              <div className="flex gap-2">
                 <input className="bg-black/30 border border-border rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-accent" placeholder="Email" />
                 <Button size="sm">Go</Button>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-border flex justify-between text-xs text-textMuted">
           <span>© 2024 WebCatalog Pro Inc.</span>
           <div className="flex gap-6">
             <button onClick={() => handleNavigate(ViewState.PRIVACY)} className="hover:text-white">Privacy</button>
             <button onClick={() => handleNavigate(ViewState.TERMS)} className="hover:text-white">Terms</button>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;