import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreatePage from './pages/CreatePage';
import ViewPage from './pages/ViewPage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';
import BrowsePage from './pages/BrowsePage';

function App() {
  return (
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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<Navigate to="/create" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

