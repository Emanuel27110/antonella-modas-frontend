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
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '', // 🆕 NUEVO
    stockMinimo: 5, // 🆕 NUEVO
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

  const cargarDatos = async () => {
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        getProductosAdmin(),
        getCategorias()
      ]);
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarMensaje('error', 'Error al cargar datos');
    } finally {
      setCargando(false);
    }
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
        stock: producto.stock || 0, // 🆕 NUEVO
        stockMinimo: producto.stockMinimo || 5, // 🆕 NUEVO
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
        stock: 0, // 🆕 NUEVO
        stockMinimo: 5, // 🆕 NUEVO
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

      // Subir imagen si se seleccionó una nueva
      if (imagenSeleccionada) {
        setSubiendoImagen(true);
        const formDataImagen = new FormData();
        formDataImagen.append('imagen', imagenSeleccionada);

        const responseImagen = await subirImagen(formDataImagen);
        urlImagen = responseImagen.data.url;
        setSubiendoImagen(false);
      }

      // Preparar datos del producto
      const datosProducto = {
        nombre: formData.nombre,
        precio: Number(formData.precio),
        stock: Number(formData.stock), // 🆕 NUEVO
        stockMinimo: Number(formData.stockMinimo), // 🆕 NUEVO
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

        {productos.length === 0 ? (
          <div className="empty-state">
            <p>📦 No hay productos creados</p>
            <button onClick={() => abrirModal()} className="btn-primary">
              Crear primer producto
            </button>
          </div>
        ) : (
          <div className="productos-grid-admin">
            {productos.map((producto) => (
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
                  {/* 🆕 NUEVO: Badge de stock bajo */}
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
                  
                  {/* 🆕 NUEVO: Mostrar stock */}
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
        )}
      </div>

      {/* Modal (continuará en el siguiente mensaje por límite de caracteres) */}
      {/* Modal de crear/editar producto */}
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

                {/* 🆕 NUEVO: Campo de stock */}
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

                {/* 🆕 NUEVO: Stock mínimo */}
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