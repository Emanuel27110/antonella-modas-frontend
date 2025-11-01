import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategorias } from '../services/api';
import './Home.css';

const Home = () => {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const response = await getCategorias();
      setCategorias(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="loading">Cargando catálogo...</div>;
  }

  return (
    <div className="home">
      <header className="home-header">
        <div className="logo-container">
          <img src="/logo.jpg" alt="Antonella Modas" className="logo" />
        </div>
        <h1>Antonella Modas</h1>
        <p className="home-subtitle">✨ Amamos la moda ✨</p>
      </header>

      <div className="container">
        {categorias.length === 0 ? (
          <div className="no-categorias">
            <p>📦 No hay categorías disponibles</p>
          </div>
        ) : (
          <div className="categorias-grid">
            {categorias.map((categoria) => (
              <Link
                key={categoria._id}
                to={`/categoria/${categoria._id}`}
                className="categoria-card"
              >
                <div className="categoria-icon">👗</div>
                <h2 className="categoria-nombre">{categoria.nombre}</h2>
                {categoria.descripcion && (
                  <p className="categoria-descripcion">{categoria.descripcion}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/logo.jpg" alt="Antonella Modas" />
            <p>Amamos la moda</p>
          </div>

          <div className="footer-redes">
            <h3>Seguinos</h3>
            <div className="redes-lista">
              <a href="https://wa.me/5493814095323" target="_blank" rel="noopener noreferrer" className="red-social whatsapp">
                <span>📱</span> WhatsApp
              </a>
              <a href="https://www.instagram.com/antonella.modas02/" target="_blank" rel="noopener noreferrer" className="red-social instagram">
                <span>📸</span> Instagram
              </a>
              <a href="https://www.facebook.com/antonella.mod.month" target="_blank" rel="noopener noreferrer" className="red-social facebook">
                <span>👍</span> Facebook
              </a>
            </div>
          </div>

          <div className="footer-info">
            <h3>Contacto</h3>
            <p>📍 Tucumán, Argentina</p>
            <p>✉️ info@antonellamodas.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Antonella Modas - Todos los derechos reservados</p>
          <Link to="/login" className="btn-admin-footer">
            🔐 Acceso Admin
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;