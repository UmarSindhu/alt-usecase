import React, { useEffect } from 'react';
import { 
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation 
} from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/pages/HomePage';
import UseCasePage from '@/pages/UseCasePage';
import CategoryPage from '@/pages/CategoryPage';
import TagPage from '@/pages/TagPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import LoginPage from '@/pages/LoginPage';
import CategoriesPage from '@/pages/CategoriesPage';
import SuggestionsPage from '@/pages/SuggestionsPage';
import AboutPage from '@/pages/AboutPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { initGA, trackPageView } from '@/lib/utils/analytics';

const TrackingWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.PROD) {
      initGA();
      trackPageView(window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (import.meta.env.PROD) {
      trackPageView(location.pathname + location.search);
    }
  }, [location]);

  return children;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading...</p>
    </div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <HelmetProvider>
        <ThemeProvider defaultTheme="system" storageKey="altusecase-theme">
          <AuthProvider>
            <TrackingWrapper>
              <Helmet>
                <title>Alt Use Case</title>
                <meta name="description" content="Discover alternative, creative, or practical use cases for any object, tool, or skill." />
              </Helmet>
              <MainLayout>
                <Outlet />
              </MainLayout>
              <Toaster />
            </TrackingWrapper>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'use/:slug', element: <UseCasePage /> },
      { path: 'category', element: <CategoriesPage /> },
      { path: 'category/:categoryName', element: <CategoryPage /> },
      { path: 'tag/:tagName', element: <TagPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'suggestions', element: <SuggestionsPage /> },
      { 
        path: 'manage/*',
        element: <ProtectedRoute><AdminDashboardPage /></ProtectedRoute>
      },
      { path: 'login', element: <LoginPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_normalizeFormMethod: true
  }
});

/* Temporary work around for dimissing the dimiss prop error on li tag */
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    if (!args[0]?.includes?.('Invalid value for prop `dismiss`')) {
      originalError(...args);
    }
  };
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;