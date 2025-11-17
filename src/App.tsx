import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n/config';

// Eager load critical pages for better UX
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Lazy load all other pages to reduce initial bundle size
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const CreateListingPage = lazy(() => import('./pages/CreateListingPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const GuildsPage = lazy(() => import('./pages/GuildsPage'));
const CreateGuildPage = lazy(() => import('./pages/CreateGuildPage'));
const GuildDetailPage = lazy(() => import('./pages/GuildDetailPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const CreateProjectPage = lazy(() => import('./pages/CreateProjectPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ProjectPaymentPage = lazy(() => import('./pages/ProjectPaymentPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const EscrowPage = lazy(() => import('./pages/EscrowPage'));
const SecureCheckoutPage = lazy(() => import('./pages/SecureCheckoutPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminOverviewPage = lazy(() => import('./pages/AdminOverviewPage'));
const AdminTransactionsPage = lazy(() => import('./pages/AdminTransactionsPage'));
const AdminGuildsPage = lazy(() => import('./pages/AdminGuildsPage'));
const AdminAIAnalyticsPage = lazy(() => import('./pages/AdminAIAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const SelectPlanPage = lazy(() => import('./pages/SelectPlanPage'));
const PlanSuccessPage = lazy(() => import('./pages/PlanSuccessPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const AIChatInterface = lazy(() => import('./components/ai/AIChatInterface'));

import AdminAuthGuard from './components/auth/AdminAuthGuard';
import AuthGuard from './components/auth/AuthGuard';
import { AIChatContext } from './context/AIChatContext';
import { AdminProvider } from './contexts/AdminContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './context/CartContext';
import { globalStyles } from './styles/globalStyles';
import { startTokenManager, stopTokenManager } from './utils/tokenManager';
import { startKeepAlive, stopKeepAlive } from './utils/keepAlive';

// Loading component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid var(--border-color)',
      borderTop: '4px solid var(--primary-color)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  globalStyles();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const { i18n } = useTranslation();

  // Initialize language from localStorage on app load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('avalanche_language');

    // Validate that the saved language is a valid language code
    const validLanguages = ['en', 'es', 'fr', 'de'];

    if (savedLanguage && validLanguages.includes(savedLanguage)) {
      if (savedLanguage !== i18n.language) {
        console.log('App: Applying saved language:', savedLanguage);
        i18n.changeLanguage(savedLanguage);
      }
    } else {
      // Clean up invalid language value
      console.log('App: Invalid language in localStorage, cleaning up:', savedLanguage);
      localStorage.removeItem('avalanche_language');
      localStorage.setItem('avalanche_language', 'en');
      i18n.changeLanguage('en');
    }
  }, [i18n]);

  // Start token manager if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    if (token) {
      startTokenManager();
    }

    // Cleanup on unmount
    return () => {
      stopTokenManager();
    };
  }, []);

  // Start keep-alive service to prevent Render backend from spinning down
  useEffect(() => {
    startKeepAlive();

    // Cleanup on unmount
    return () => {
      stopKeepAlive();
    };
  }, []);

  return (
    <CartProvider>
      <AIChatContext.Provider value={{ isAIChatOpen, setIsAIChatOpen }}>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/select-plan" element={<SelectPlanPage />} />
              <Route path="/plan-success" element={<PlanSuccessPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/create" element={<CreateListingPage />} />
          <Route path="/marketplace/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/:productId" element={<CheckoutPage />} />
          <Route path="/secure-checkout" element={<SecureCheckoutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/guilds" element={<GuildsPage />} />
          <Route path="/guilds/create" element={<CreateGuildPage />} />
          <Route path="/guilds/:id" element={<GuildDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/create" element={<CreateProjectPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/payment" element={<ProjectPaymentPage />} />
          <Route path="/escrow" element={<AuthGuard><EscrowPage /></AuthGuard>} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><SettingsPage /></AuthGuard>} />
          <Route path="/wallet" element={<AuthGuard><WalletPage /></AuthGuard>} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route path="/help" element={<HelpPage />} />

          {/* Admin Routes - Login not protected, all other admin routes protected */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminOverviewPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/dashboard" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminOverviewPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/transactions" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminTransactionsPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/guilds" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminGuildsPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/ai-analytics" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminAIAnalyticsPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/users" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminDashboardPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/settings" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminSettingsPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
            </Routes>

            {/* AI chat interface (when clicking sparkles icon in header) */}
            <AIChatInterface isOpen={isAIChatOpen} onToggle={setIsAIChatOpen} />
          </Suspense>
        </Router>
    </AIChatContext.Provider>
    </CartProvider>
  );
}

export default App;
