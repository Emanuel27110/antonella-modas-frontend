import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  getProductosStockBajo, 
  getResumenCaja,
  getProductosAdmin 
} from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useContext(AuthContext);
  
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [resumenCaja, setResumenCaja] = useState(null);
  const [totalProductos, setTotalProductos] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [stockBajoRes, cajaRes, productosRes] = await Promise.all([
        getProductosStockBajo(),
        getResumenCaja(),
        getProductosAdmin()
      ]);

      setProductosStockBajo(stockBajoRes.data.productos || []);
      setResumenCaja(cajaRes.data);
      setTotalProductos(productosRes.data.length);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  if (cargando) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Panel de Administración</h1>
            <p>Bienvenida, {usuario?.nombre} 👋</p>
          </div>
          <div className="header-actions">
            <Link to="/" className="btn-catalogo">
              🛍️ Ver Catálogo
            </Link>
            <button onClick={handleLogout} className="btn-logout">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Tarjetas de resumen */}
        <div className="cards-grid">
          <div className="card card-ventas">
            <div className="card-icon">💰</div>
            <div className="card-info">
              <h3>Ventas del Día</h3>
              <p className="card-value">{formatearPrecio(resumenCaja?.hoy?.total || 0)}</p>
              <span className="card-detail">{resumenCaja?.hoy?.cantidad || 0} ventas</span>
            </div>
          </div>

          <div className="card card-productos">
            <div className="card-icon">📦</div>
            <div className="card-info">
              <h3>Total Productos</h3>
              <p className="card-value">{totalProductos}</p>
              <span className="card-detail">En catálogo</span>
            </div>
          </div>

          <div className="card card-stock">
            <div className="card-icon">⚠️</div>
            <div className="card-info">
              <h3>Stock Bajo</h3>
              <p className="card-value">{productosStockBajo.length}</p>
              <span className="card-detail">Productos</span>
            </div>
          </div>

          <div className="card card-mes">
            <div className="card-icon">📊</div>
            <div className="card-info">
              <h3>Ventas del Mes</h3>
              <p className="card-value">{formatearPrecio(resumenCaja?.mes?.total || 0)}</p>
              <span className="card-detail">{resumenCaja?.mes?.cantidad || 0} ventas</span>
            </div>
          </div>
        </div>

        {/* Alerta de stock bajo */}
        {productosStockBajo.length > 0 && (
          <div className="alerta-stock">
            <h3>⚠️ Productos con Stock Bajo</h3>
            <div className="stock-bajo-lista">
              {productosStockBajo.slice(0, 5).map((producto) => (
                <div key={producto._id} className="stock-bajo-item">
                  <div>
                    <strong>{producto.nombre}</strong>
                    <span className="categoria-badge">
                      {producto.categoria?.nombre}
                    </span>
                  </div>
                  <div className="stock-info">
                    <span className="stock-cantidad">
                      Stock: {producto.stock}
                    </span>
                    {producto.stock === 0 && (
                      <span className="badge badge-danger">Agotado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {productosStockBajo.length > 5 && (
              <p className="ver-mas">
                Y {productosStockBajo.length - 5} productos más...
              </p>
            )}
          </div>
        )}

        {/* Menú de navegación */}
        <div className="menu-grid">
          <Link to="/admin/categorias" className="menu-card">
            <div className="menu-icon">📁</div>
            <h3>Categorías</h3>
            <p>Gestionar categorías del catálogo</p>
          </Link>

          <Link to="/admin/productos" className="menu-card">
            <div className="menu-icon">🛍️</div>
            <h3>Productos</h3>
            <p>Administrar productos y stock</p>
          </Link>

          <Link to="/admin/venta" className="menu-card menu-destacado">
            <div className="menu-icon">💵</div>
            <h3>Registrar Venta</h3>
            <p>Nueva venta (descuenta stock)</p>
          </Link>

          <Link to="/admin/historial-ventas" className="menu-card">
            <div className="menu-icon">📋</div>
            <h3>Historial de Ventas</h3>
            <p>Ver todas las ventas realizadas</p>
          </Link>

          <Link to="/admin/caja" className="menu-card">
            <div className="menu-icon">💰</div>
            <h3>Caja / Reportes</h3>
            <p>Estadísticas y ganancias</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;