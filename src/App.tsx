import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import CreatePage from './pages/CreatePage';
import ViewPage from './pages/ViewPage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';
import BrowsePage from './pages/BrowsePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/create" element={<CreatePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/view/:id" element={<ViewPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<BrowsePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

