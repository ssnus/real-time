import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { BoardsPage } from './pages/BoardsPage';
import { BoardPage } from './pages/BoardPage';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: '#64748b'
      }}>
        Загрузка...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/boards" element={
        <ProtectedRoute>
          <BoardsPage />
        </ProtectedRoute>
      } />
      <Route path="/boards/:boardId" element={
        <ProtectedRoute>
          <BoardPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;