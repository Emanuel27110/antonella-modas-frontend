import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getProductosAdmin,
  getCategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  cambiarVisibilidad,
  subirImagen
} from '../../services/api';
import './Productos.css';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroStock, setFiltroStock] = useState('todos');
  const [filtroVisibilidad, setFiltroVisibilidad] = useState('todos');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 12;
  
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    stockMinimo: 5,
    talles: '',
    imagen: '',
    descripcion: '',
    categoria: '',
    visible: true
  });
  
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    filtrarProductos();
    setPaginaActual(1);
  }, [productos, busqueda, filtroCategoria, filtroStock, filtroVisibilidad]);

  const cargarDatos = async () => {
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        getProductosAdmin(),
        getCategorias()
      ]);
      setProductos(productosRes.data);
      setProductosFiltrados(productosRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarMensaje('error', 'Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  const filtrarProductos = () => {
    let filtrados = [...productos];

    // Filtrar por búsqueda
    if (busqueda.trim() !== '') {
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (filtroCategoria !== 'todos') {
      filtrados = filtrados.filter(p => p.categoria?._id === filtroCategoria);
    }

    // Filtrar por stock
    if (filtroStock === 'bajo') {
      filtrados = filtrados.filter(p => p.stock <= p.stockMinimo);
    } else if (filtroStock === 'agotado') {
      filtrados = filtrados.filter(p => p.stock === 0);
    }

    // Filtrar por visibilidad
    if (filtroVisibilidad !== 'todos') {
      const esVisible = filtroVisibilidad === 'visible';
      filtrados = filtrados.filter(p => p.visible === esVisible);
    }

    setProductosFiltrados(filtrados);
  };

  // Calcular productos de la página actual
  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;
  const productosActuales = productosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
  };

  const abrirModal = (producto = null) => {
    if (producto) {
      setModoEdicion(true);
      setProductoEditando(producto);
      setFormData({
        nombre: producto.nombre,
        precio: producto.precio,
        stock: producto.stock || 0,
        stockMinimo: producto.stockMinimo || 5,
        talles: producto.talles?.join(', ') || '',
        imagen: producto.imagen || '',
        descripcion: producto.descripcion || '',
        categoria: producto.categoria?._id || '',
        visible: producto.visible
      });
    } else {
      setModoEdicion(false);
      setProductoEditando(null);
      setFormData({
        nombre: '',
        precio: '',
        stock: 0,
        stockMinimo: 5,
        talles: '',
        imagen: '',
        descripcion: '',
        categoria: '',
        visible: true
      });
    }
    setImagenSeleccionada(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
    setProductoEditando(null);
    setImagenSeleccionada(null);
    setFormData({
      nombre: '',
      precio: '',
      stock: 0,
      stockMinimo: 5,
      talles: '',
      imagen: '',
      descripcion: '',
      categoria: '',
      visible: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenSeleccionada(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let urlImagen = formData.imagen;

      if (imagenSeleccionada) {
        setSubiendoImagen(true);
        const formDataImagen = new FormData();
        formDataImagen.append('imagen', imagenSeleccionada);

        const responseImagen = await subirImagen(formDataImagen);
        urlImagen = responseImagen.data.url;
        setSubiendoImagen(false);
      }

      const datosProducto = {
        nombre: formData.nombre,
        precio: Number(formData.precio),
        stock: Number(formData.stock),
        stockMinimo: Number(formData.stockMinimo),
        talles: formData.talles ? formData.talles.split(',').map(t => t.trim()) : [],
        imagen: urlImagen,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        visible: formData.visible
      };

      if (modoEdicion) {
        await actualizarProducto(productoEditando._id, datosProducto);
        mostrarMensaje('success', 'Producto actualizado correctamente');
      } else {
        await crearProducto(datosProducto);
        mostrarMensaje('success', 'Producto creado correctamente');
      }

      cargarDatos();
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      mostrarMensaje('error', error.response?.data?.mensaje || 'Error al guardar producto');
      setSubiendoImagen(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás segura de eliminar el producto "${nombre}"?`)) {
      try {
        await eliminarProducto(id);
        mostrarMensaje('success', 'Producto eliminado correctamente');
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        mostrarMensaje('error', 'Error al eliminar producto');
      }
    }
  };

  const handleCambiarVisibilidad = async (id) => {
    try {
      await cambiarVisibilidad(id);
      mostrarMensaje('success', 'Visibilidad actualizada');
      cargarDatos();
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
      mostrarMensaje('error', 'Error al cambiar visibilidad');
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
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-content">
          <div className="header-actions">
            <Link to="/admin/dashboard" className="btn-volver">
              ← Dashboard
            </Link>
            <h1>🛍️ Gestión de Productos</h1>
            <button onClick={() => abrirModal()} className="btn-primary">
              + Nuevo Producto
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo === 'error' ? 'mensaje-error' : 'mensaje-exito'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Filtros */}
        <div className="filtros-productos">
          <div className="filtro-busqueda">
            <input
              type="text"
              placeholder="🔍 Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />
          </div>

          <div className="filtros-row">
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="todos">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.nombre}</option>
              ))}
            </select>

            <select value={filtroStock} onChange={(e) => setFiltroStock(e.target.value)}>
              <option value="todos">Todo el stock</option>
              <option value="bajo">Stock bajo</option>
              <option value="agotado">Agotado</option>
            </select>

            <select value={filtroVisibilidad} onChange={(e) => setFiltroVisibilidad(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="visible">Visibles</option>
              <option value="oculto">Ocultos</option>
            </select>
          </div>
        </div>

        {/* Resumen */}
        <div className="resumen-productos">
          <div className="resumen-card">
            <span className="resumen-label">Total productos:</span>
            <span className="resumen-valor">{productosFiltrados.length}</span>
          </div>
          {totalPaginas > 1 && (
            <div className="resumen-card">
              <span className="resumen-label">Página:</span>
              <span className="resumen-valor">{paginaActual} / {totalPaginas}</span>
            </div>
          )}
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>📦 No hay productos que coincidan con los filtros</p>
            <button onClick={() => abrirModal()} className="btn-primary">
              Crear nuevo producto
            </button>
          </div>
        ) : (
          <>
            <div className="productos-grid-admin">
              {productosActuales.map((producto) => (
                <div key={producto._id} className="producto-card-admin">
                  <div className="producto-imagen-admin">
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre} />
                    ) : (
                      <div className="sin-imagen">📷</div>
                    )}
                    {!producto.visible && (
                      <span className="badge-oculto">Oculto</span>
                    )}
                    {producto.stock <= producto.stockMinimo && (
                      <span className="badge-stock-bajo">
                        {producto.stock === 0 ? 'Sin stock' : 'Stock bajo'}
                      </span>
                    )}
                  </div>

                  <div className="producto-info-admin">
                    <h3>{producto.nombre}</h3>
                    <p className="producto-categoria">{producto.categoria?.nombre}</p>
                    <p className="producto-precio">{formatearPrecio(producto.precio)}</p>
                    
                    <div className="producto-stock">
                      <span className={`stock-badge ${producto.stock === 0 ? 'stock-agotado' : producto.stock <= producto.stockMinimo ? 'stock-bajo' : 'stock-ok'}`}>
                        📦 Stock: {producto.stock}
                      </span>
                    </div>

                    {producto.talles?.length > 0 && (
                      <p className="producto-talles">Talles: {producto.talles.join(', ')}</p>
                    )}

                    <div className="producto-acciones">
                      <button onClick={() => abrirModal(producto)} className="btn-editar-sm">
                        ✏️
                      </button>
                      <button
                        onClick={() => handleCambiarVisibilidad(producto._id)}
                        className={producto.visible ? 'btn-ocultar-sm' : 'btn-mostrar-sm'}
                        title={producto.visible ? 'Ocultar' : 'Mostrar'}
                      >
                        {producto.visible ? '👁️' : '🙈'}
                      </button>
                      <button
                        onClick={() => handleEliminar(producto._id, producto.nombre)}
                        className="btn-eliminar-sm"
                      >
                        🗑️
                      </button>
                    </div>
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

      {/* Modal */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal modal-grande" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={cerrarModal} className="btn-cerrar">×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre del Producto *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Collar de Plata"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="categoria">Categoría *</label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="precio">Precio *</label>
                  <input
                    type="number"
                    id="precio"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="15000"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock">Stock *</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="10"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stockMinimo">Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    id="stockMinimo"
                    name="stockMinimo"
                    value={formData.stockMinimo}
                    onChange={handleChange}
                    min="0"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="talles">Talles (separados por comas)</label>
                <input
                  type="text"
                  id="talles"
                  name="talles"
                  value={formData.talles}
                  onChange={handleChange}
                  placeholder="S, M, L, XL (opcional)"
                />
                <small>Si no aplica, dejar vacío</small>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Descripción del producto..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="imagen">Imagen del Producto</label>
                <input
                  type="file"
                  id="imagen"
                  accept="image/*"
                  onChange={handleImagenChange}
                />
                {imagenSeleccionada && (
                  <p className="archivo-seleccionado">
                    ✅ {imagenSeleccionada.name}
                  </p>
                )}
                {formData.imagen && !imagenSeleccionada && (
                  <div className="imagen-actual">
                    <img src={formData.imagen} alt="Actual" />
                  </div>
                )}
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="visible"
                    checked={formData.visible}
                    onChange={handleChange}
                  />
                  <span>Producto visible en el catálogo</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={cerrarModal} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={subiendoImagen}>
                  {subiendoImagen ? 'Subiendo imagen...' : modoEdicion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;