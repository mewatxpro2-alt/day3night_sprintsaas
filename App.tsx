import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Categories from './pages/Categories';
import Dashboard from './pages/Dashboard';
import Submit from './pages/Submit';
import Pricing from './pages/Pricing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Legal from './pages/Legal';
import Contact from './pages/Contact';
import ErrorPage from './pages/ErrorPage';
import Details from './pages/Details';
import About from './pages/About';
import SellerProfile from './pages/SellerProfile';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Placeholder from './pages/Placeholder';
import Licensing from './pages/Licensing';
import HowItWorks from './pages/HowItWorks';
import RevenueModel from './pages/RevenueModel';
import SellerGuidelines from './pages/SellerGuidelines';
import LicenseTypes from './pages/LicenseTypes';
import ScrollToTop from './components/ScrollToTop';
import Documentation from './pages/Documentation';
import FAQs from './pages/FAQs';
import Blog from './pages/Blog';
import AuditProcess from './pages/AuditProcess';
import TrustSecurity from './pages/TrustSecurity';
import BlogPostPage from './pages/BlogPost';
import Sitemap from './pages/Sitemap';
// Admin Pages
import AdminOverview from './pages/admin/Overview';
import AdminSubmissions from './pages/admin/Submissions';
import BlogManager from './pages/admin/BlogManager';
import BlogEditor from './pages/admin/BlogEditor';
import AdminKits from './pages/admin/Kits';
import AdminUsers from './pages/admin/Users';
import AdminConversations from './pages/admin/Conversations';
import AdminOrders from './pages/admin/Orders';
import AdminDisputes from './pages/admin/Disputes';
import AdminSettings from './pages/admin/Settings';
import AdminModerationLog from './pages/admin/ModerationLog';
import AdminAbuseReports from './pages/admin/AbuseReports';
import AdminTickets from './pages/admin/Tickets';
// Seller Pages
import SellerDashboard from './pages/seller/Dashboard';
import SellerOrders from './pages/seller/Orders';
import SellerPayouts from './pages/seller/Payouts';
import SellerBankSetup from './pages/seller/BankSetup';
import SellerListings from './pages/seller/Listings';
import SellerMySubmissions from './pages/seller/MySubmissions';
// Buyer Pages
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/OrderDetails';
import MessagesPage from './pages/Messages';
import RaiseDispute from './pages/RaiseDispute';
import WishlistPage from './pages/dashboard/Wishlist';
import RequestRefund from './pages/RequestRefund';
// Ticket Pages
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import CreateTicket from './pages/CreateTicket';
// Admin Pages - Extended
import AdminRefunds from './pages/admin/Refunds';
import AdminWithdrawals from './pages/admin/Withdrawals';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-[100]">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 bg-accent-primary rounded-xl flex items-center justify-center animate-bounce">
            <div className="w-4 h-4 bg-background rounded-sm" />
          </div>
          <p className="text-textMuted font-mono text-sm tracking-widest">LOADING</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public routes with MainLayout (Navbar + Footer) */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="mvp-kits" element={<Explore />} />
          <Route path="use-cases" element={<Categories />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Legal type="PRIVACY" />} />
          <Route path="terms" element={<Legal type="TERMS" />} />
          <Route path="licensing" element={<Licensing />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="revenue-model" element={<RevenueModel />} />
          <Route path="seller-guidelines" element={<SellerGuidelines />} />
          <Route path="license-types" element={<LicenseTypes />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="faqs" element={<FAQs />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="sitemap" element={<Sitemap />} />
          <Route path="audit-process" element={<AuditProcess />} />
          <Route path="trust-security" element={<TrustSecurity />} />
          <Route path="listing/:id" element={<Details />} />
          <Route path="seller/:id" element={<SellerProfile />} />
          <Route path="checkout/:listingId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="payment-success/:orderId" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        </Route>

        {/* Auth routes with AuthLayout (no Navbar/Footer) */}
        <Route element={<AuthLayout />}>
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
        </Route>

        {/* Protected routes - User Dashboard */}
        <Route element={<MainLayout />}>
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="dashboard/orders" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="dashboard/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="submit" element={<ProtectedRoute><Submit /></ProtectedRoute>} />
        </Route>

        {/* Order Pages */}
        <Route element={<MainLayout />}>
          <Route path="order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          <Route path="order/:id/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="order/:id/dispute" element={<ProtectedRoute><RaiseDispute /></ProtectedRoute>} />
          <Route path="order/:orderId/refund" element={<ProtectedRoute><RequestRefund /></ProtectedRoute>} />
        </Route>
        <Route path="messages/:orderId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

        {/* Ticket Pages */}
        <Route element={<MainLayout />}>
          <Route path="tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
          <Route path="tickets/new" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
          <Route path="tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
        </Route>

        {/* Seller routes */}
        <Route element={<MainLayout />}>
          <Route path="seller" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
          <Route path="seller/orders" element={<ProtectedRoute><SellerOrders /></ProtectedRoute>} />
          <Route path="seller/listings" element={<ProtectedRoute><SellerListings /></ProtectedRoute>} />
          <Route path="seller/submissions" element={<ProtectedRoute><SellerMySubmissions /></ProtectedRoute>} />
          <Route path="seller/payouts" element={<ProtectedRoute><SellerPayouts /></ProtectedRoute>} />
          <Route path="seller/bank" element={<ProtectedRoute><SellerBankSetup /></ProtectedRoute>} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="submissions" element={<AdminSubmissions />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="blog/new" element={<BlogEditor />} />
          <Route path="blog/edit/:id" element={<BlogEditor />} />
          <Route path="kits" element={<AdminKits />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="messages" element={<AdminConversations />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="moderation-log" element={<AdminModerationLog />} />
          <Route path="abuse-reports" element={<AdminAbuseReports />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="refunds" element={<AdminRefunds />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
        </Route>

        {/* Fallback Error Page */}
        <Route path="/coming-soon" element={<MainLayout><Placeholder /></MainLayout>} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;