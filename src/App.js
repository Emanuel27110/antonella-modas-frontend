import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import Home from './pages/Home';
import Categoria from './pages/Categoria';
import Login from './pages/Login';

// Páginas admin
import Dashboard from './pages/admin/Dashboard';
import Categorias from './pages/admin/Categorias';
import Productos from './pages/admin/Productos';
import RegistrarVenta from './pages/admin/RegistrarVenta';
import HistorialVentas from './pages/admin/HistorialVentas';
import Caja from './pages/admin/Caja';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/categoria/:id" element={<Categoria />} />
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas (admin) */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categorias"
              element={
                <ProtectedRoute>
                  <Categorias />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos"
              element={
                <ProtectedRoute>
                  <Productos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/venta"
              element={
                <ProtectedRoute>
                  <RegistrarVenta />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/historial-ventas"
              element={
                <ProtectedRoute>
                  <HistorialVentas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/caja"
              element={
                <ProtectedRoute>
                  <Caja />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;