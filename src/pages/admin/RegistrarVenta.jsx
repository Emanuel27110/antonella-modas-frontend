import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getProductosAdmin,
  crearVenta
} from '../../services/api';
import './RegistrarVenta.css';

const RegistrarVenta = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  
  const [formData, setFormData] = useState({
    metodoPago: 'efectivo',
    clienteNombre: '',
    clienteTelefono: '',
    notas: ''
  });

  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    // Filtrar productos por búsqueda
    if (busqueda.trim() === '') {
      setProductosFiltrados(productos.filter(p => p.visible && p.stock > 0));
    } else {
      const filtrados = productos.filter(p => 
        p.visible && 
        p.stock > 0 &&
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
      setProductosFiltrados(filtrados);
    }
  }, [busqueda, productos]);

  const cargarProductos = async () => {
    try {
      const response = await getProductosAdmin();
      const productosConStock = response.data.filter(p => p.stock > 0 && p.visible);
      setProductos(response.data);
      setProductosFiltrados(productosConStock);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      mostrarMensaje('error', 'Error al cargar productos');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
  };

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.producto._id === producto._id);

    if (itemExistente) {
      // Verificar que no supere el stock
      if (itemExistente.cantidad >= producto.stock) {
        mostrarMensaje('error', `Stock máximo: ${producto.stock}`);
        return;
      }
      
      // Incrementar cantidad
      setCarrito(carrito.map(item =>
        item.producto._id === producto._id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      // Agregar nuevo item
      setCarrito([...carrito, {
        producto: producto,
        cantidad: 1,
        precioUnitario: producto.precio
      }]);
    }
  };

  const cambiarCantidad = (productoId, nuevaCantidad) => {
    const producto = productos.find(p => p._id === productoId);
    
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(productoId);
      return;
    }

    if (nuevaCantidad > producto.stock) {
      mostrarMensaje('error', `Stock máximo: ${producto.stock}`);
      return;
    }

    setCarrito(carrito.map(item =>
      item.producto._id === productoId
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const cambiarPrecio = (productoId, nuevoPrecio) => {
    setCarrito(carrito.map(item =>
      item.producto._id === productoId
        ? { ...item, precioUnitario: Number(nuevoPrecio) }
        : item
    ));
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.producto._id !== productoId));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => 
      total + (item.cantidad * item.precioUnitario), 0
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
      mostrarMensaje('error', 'Agrega al menos un producto al carrito');
      return;
    }

    setProcesando(true);

    try {
      // Preparar datos de la venta
      const ventaData = {
        productos: carrito.map(item => ({
          producto: item.producto._id,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario
        })),
        metodoPago: formData.metodoPago,
        cliente: {
          nombre: formData.clienteNombre,
          telefono: formData.clienteTelefono
        },
        notas: formData.notas
      };

      await crearVenta(ventaData);
      
      mostrarMensaje('success', '✅ Venta registrada exitosamente');
      
      // Limpiar formulario
      setCarrito([]);
      setFormData({
        metodoPago: 'efectivo',
        clienteNombre: '',
        clienteTelefono: '',
        notas: ''
      });
      
      // Recargar productos (para actualizar stock)
      cargarProductos();

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/admin/historial-ventas');
      }, 2000);

    } catch (error) {
      console.error('Error al registrar venta:', error);
      mostrarMensaje('error', error.response?.data?.mensaje || 'Error al registrar venta');
    } finally {
      setProcesando(false);
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
                      <h1>💵 Registrar Venta</h1>
            <Link to="/admin/historial-ventas" className="btn-secondary">
              📋 Ver Historial
            </Link>
          </div>
        </div>
      </header>

      <div className="venta-container">
        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo === 'error' ? 'mensaje-error' : 'mensaje-exito'}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="venta-layout">
          {/* Panel izquierdo - Productos */}
          <div className="panel-productos">
            <div className="busqueda-productos">
              <input
                type="text"
                placeholder="🔍 Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-busqueda"
              />
            </div>

            <div className="productos-lista">
              {productosFiltrados.length === 0 ? (
                <p className="no-resultados">
                  {busqueda ? 'No se encontraron productos' : 'No hay productos con stock disponible'}
                </p>
              ) : (
                productosFiltrados.map((producto) => (
                  <div
                    key={producto._id}
                    className="producto-item"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    <div className="producto-item-imagen">
                      {producto.imagen ? (
                        <img src={producto.imagen} alt={producto.nombre} />
                      ) : (
                        <div className="sin-imagen-mini">📷</div>
                      )}
                    </div>
                    <div className="producto-item-info">
                      <h4>{producto.nombre}</h4>
                      <p className="producto-item-precio">{formatearPrecio(producto.precio)}</p>
                      <span className="producto-item-stock">Stock: {producto.stock}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel derecho - Carrito y formulario */}
          <div className="panel-carrito">
            <h2>🛒 Carrito de Venta</h2>

            {carrito.length === 0 ? (
              <div className="carrito-vacio">
                <p>El carrito está vacío</p>
                <p className="texto-ayuda">👈 Selecciona productos de la lista</p>
              </div>
            ) : (
              <>
                <div className="carrito-items">
                  {carrito.map((item) => (
                    <div key={item.producto._id} className="carrito-item">
                      <div className="carrito-item-info">
                        <h4>{item.producto.nombre}</h4>
                        <p className="stock-disponible">Stock disponible: {item.producto.stock}</p>
                      </div>

                      <div className="carrito-item-controles">
                        <div className="cantidad-control">
                          <label>Cantidad:</label>
                          <input
                            type="number"
                            min="1"
                            max={item.producto.stock}
                            value={item.cantidad}
                            onChange={(e) => cambiarCantidad(item.producto._id, Number(e.target.value))}
                          />
                        </div>

                        <div className="precio-control">
                          <label>Precio:</label>
                          <input
                            type="number"
                            min="0"
                            value={item.precioUnitario}
                            onChange={(e) => cambiarPrecio(item.producto._id, e.target.value)}
                          />
                        </div>

                        <div className="subtotal">
                          <strong>{formatearPrecio(item.cantidad * item.precioUnitario)}</strong>
                        </div>

                        <button
                          onClick={() => eliminarDelCarrito(item.producto._id)}
                          className="btn-eliminar-item"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="carrito-total">
                  <h3>Total: {formatearPrecio(calcularTotal())}</h3>
                </div>

                <form onSubmit={handleSubmit} className="form-venta">
                  <div className="form-group">
                    <label htmlFor="metodoPago">Método de Pago *</label>
                    <select
                      id="metodoPago"
                      name="metodoPago"
                      value={formData.metodoPago}
                      onChange={handleChange}
                      required
                    >
                      <option value="efectivo">💵 Efectivo</option>
                      <option value="transferencia">🏦 Transferencia</option>
                      <option value="tarjeta_debito">💳 Tarjeta Débito</option>
                      <option value="tarjeta_credito">💳 Tarjeta Crédito</option>
                      <option value="mercadopago">📱 Mercado Pago</option>
                      <option value="otro">🔄 Otro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="clienteNombre">Nombre del Cliente (opcional)</label>
                    <input
                      type="text"
                      id="clienteNombre"
                      name="clienteNombre"
                      value={formData.clienteNombre}
                      onChange={handleChange}
                      placeholder="Nombre del cliente"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="clienteTelefono">Teléfono del Cliente (opcional)</label>
                    <input
                      type="tel"
                      id="clienteTelefono"
                      name="clienteTelefono"
                      value={formData.clienteTelefono}
                      onChange={handleChange}
                      placeholder="3814123456"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="notas">Notas (opcional)</label>
                    <textarea
                      id="notas"
                      name="notas"
                      value={formData.notas}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Notas adicionales..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-finalizar-venta"
                    disabled={procesando}
                  >
                    {procesando ? 'Procesando...' : '✅ Finalizar Venta'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarVenta;