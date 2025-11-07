import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductosPorCategoria, getCategoria } from '../services/api';
import './Categoria.css';

const Categoria = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 12;

  useEffect(() => {
    cargarDatos();
    setPaginaActual(1); // Reset paginación al cambiar de categoría
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
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

  // Calcular productos de la página actual
  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;
  const productosActuales = productos.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(productos.length / productosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const handleComprar = (producto) => {
    navigate('/checkout', { state: { producto } });
  };

  const abrirImagen = (imagen) => {
    setImagenAmpliada(imagen);
  };

  const cerrarImagen = () => {
    setImagenAmpliada(null);
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
            {productos.length > 0 && (
              <p className="total-productos">{productos.length} {productos.length === 1 ? 'producto' : 'productos'}</p>
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
          <>
            {/* Info de paginación */}
            {totalPaginas > 1 && (
              <div className="info-paginacion">
                Mostrando {indicePrimero + 1} - {Math.min(indiceUltimo, productos.length)} de {productos.length} productos
              </div>
            )}

            <div className="productos-grid">
              {productosActuales.map((producto) => (
                <div key={producto._id} className="producto-card">
                  <div 
                    className="producto-imagen-container"
                    onClick={() => producto.imagen && abrirImagen(producto.imagen)}
                    style={{ cursor: producto.imagen ? 'pointer' : 'default' }}
                  >
                    {producto.imagen ? (
                      <>
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="producto-imagen"
                        />
                        <div className="imagen-overlay">
                          <span className="ver-imagen-text">🔍 Ver imagen</span>
                        </div>
                      </>
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

                    <button 
                      className="btn-comprar"
                      onClick={() => handleComprar(producto)}
                    >
                      🛒 Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="paginacion">
                <button 
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="btn-paginacion"
                >
                  ← Anterior
                </button>

                <div className="numeros-pagina">
                  {[...Array(totalPaginas)].map((_, index) => {
                    const numeroPagina = index + 1;
                    if (
                      numeroPagina === 1 ||
                      numeroPagina === totalPaginas ||
                      (numeroPagina >= paginaActual - 1 && numeroPagina <= paginaActual + 1)
                    ) {
                      return (
                        <button
                          key={numeroPagina}
                          onClick={() => cambiarPagina(numeroPagina)}
                          className={`btn-numero ${paginaActual === numeroPagina ? 'activo' : ''}`}
                        >
                          {numeroPagina}
                        </button>
                      );
                    } else if (
                      numeroPagina === paginaActual - 2 ||
                      numeroPagina === paginaActual + 2
                    ) {
                      return <span key={numeroPagina} className="puntos">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button 
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="btn-paginacion"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para imagen ampliada */}
      {imagenAmpliada && (
        <div className="modal-imagen-overlay" onClick={cerrarImagen}>
          <div className="modal-imagen-container">
            <button className="btn-cerrar-imagen" onClick={cerrarImagen}>
              ✕
            </button>
            <img 
              src={imagenAmpliada} 
              alt="Producto ampliado" 
              className="imagen-ampliada"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Categoria;