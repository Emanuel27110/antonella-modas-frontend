import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductosPorCategoria, getCategoria } from '../services/api';
import './Categoria.css';

const Categoria = () => {
  const { id } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const [categoriaRes, productosRes] = await Promise.all([
        getCategoria(id),
        getProductosPorCategoria(id)
      ]);
      setCategoria(categoriaRes.data);
      setProductos(productosRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  if (cargando) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="categoria-page">
      <header className="categoria-header">
        <Link to="/" className="btn-volver">
          ← Volver al inicio
        </Link>
        <div className="header-content">
          <img src="/logo.jpg" alt="Antonella Modas" className="logo-small" />
          <div>
            <h1>{categoria?.nombre || 'Categoría'}</h1>
            {categoria?.descripcion && (
              <p className="categoria-desc">{categoria.descripcion}</p>
            )}
          </div>
        </div>
      </header>

      <div className="container">
        {productos.length === 0 ? (
          <div className="no-productos">
            <p>📦 No hay productos disponibles en esta categoría</p>
          </div>
        ) : (
          <div className="productos-grid">
            {productos.map((producto) => (
              <div key={producto._id} className="producto-card">
                <div className="producto-imagen-container">
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="producto-imagen"
                    />
                  ) : (
                    <div className="producto-sin-imagen">
                      📷 Sin imagen
                    </div>
                  )}
                </div>

                <div className="producto-info">
                  <h3 className="producto-nombre">{producto.nombre}</h3>
                  
                  {producto.descripcion && (
                    <p className="producto-descripcion">{producto.descripcion}</p>
                  )}

                  <div className="producto-precio">
                    {formatearPrecio(producto.precio)}
                  </div>

                  {producto.talles && producto.talles.length > 0 && (
                    <div className="producto-talles">
                      <span className="talles-label">Talles:</span>
                      <div className="talles-lista">
                        {producto.talles.map((talle, index) => (
                          <span key={index} className="talle-badge">
                            {talle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categoria;