import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVentas, eliminarVenta } from '../../services/api';
import './HistorialVentas.css';

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroMetodo, setFiltroMetodo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    cargarVentas();
  }, []);

  useEffect(() => {
    filtrarVentas();
  }, [ventas, filtroMetodo, busqueda]);

  const cargarVentas = async () => {
    try {
      const response = await getVentas();
      setVentas(response.data);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      mostrarMensaje('error', 'Error al cargar ventas');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  const filtrarVentas = () => {
    let filtradas = [...ventas];

    // Filtrar por método de pago
    if (filtroMetodo !== 'todos') {
      filtradas = filtradas.filter(v => v.metodoPago === filtroMetodo);
    }

    // Filtrar por búsqueda
    if (busqueda.trim() !== '') {
      filtradas = filtradas.filter(v => 
        v.cliente?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.vendedor?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.productos.some(p => p.nombreProducto.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }

    setVentasFiltradas(filtradas);
  };

  const verDetalle = (venta) => {
    setVentaDetalle(venta);
  };

  const cerrarDetalle = () => {
    setVentaDetalle(null);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás segura de eliminar esta venta? El stock se restaurará.')) {
      try {
        await eliminarVenta(id);
        mostrarMensaje('success', 'Venta eliminada y stock restaurado');
        cargarVentas();
        cerrarDetalle();
      } catch (error) {
        console.error('Error al eliminar venta:', error);
        mostrarMensaje('error', 'Error al eliminar venta');
      }
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetodoPagoTexto = (metodo) => {
    const metodos = {
      efectivo: '💵 Efectivo',
      transferencia: '🏦 Transferencia',
      tarjeta_debito: '💳 Débito',
      tarjeta_credito: '💳 Crédito',
      mercadopago: '📱 Mercado Pago',
      otro: '🔄 Otro'
    };
    return metodos[metodo] || metodo;
  };

  const calcularTotalVentas = () => {
    return ventasFiltradas.reduce((total, venta) => total + venta.total, 0);
  };

  if (cargando) {
    return <div className="loading">Cargando historial...</div>;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-content">
          <div className="header-actions">
            <Link to="/admin/dashboard" className="btn-volver">
              ← Dashboard
            </Link>
                      <h1>📋 Historial de Ventas</h1>
            <Link to="/admin/venta" className="btn-primary">
              + Nueva Venta
            </Link>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo === 'error' ? 'mensaje-error' : 'mensaje-exito'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="filtros-container">
          <div className="filtro-busqueda">
            <input
              type="text"
              placeholder="🔍 Buscar por cliente, vendedor o producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />
          </div>

          <div className="filtro-metodo">
            <label htmlFor="filtroMetodo">Método de pago:</label>
            <select
              id="filtroMetodo"
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta_debito">Tarjeta Débito</option>
              <option value="tarjeta_credito">Tarjeta Crédito</option>
              <option value="mercadopago">Mercado Pago</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        {/* Resumen */}
        <div className="resumen-ventas">
          <div className="resumen-card">
            <span className="resumen-label">Total de ventas:</span>
            <span className="resumen-valor">{ventasFiltradas.length}</span>
          </div>
          <div className="resumen-card destacado">
            <span className="resumen-label">Total recaudado:</span>
            <span className="resumen-valor">{formatearPrecio(calcularTotalVentas())}</span>
          </div>
        </div>

        {/* Lista de ventas */}
        {ventasFiltradas.length === 0 ? (
          <div className="empty-state">
            <p>📦 No hay ventas registradas</p>
            <Link to="/admin/venta" className="btn-primary">
              Registrar primera venta
            </Link>
          </div>
        ) : (
          <div className="ventas-grid">
            {ventasFiltradas.map((venta) => (
              <div key={venta._id} className="venta-card" onClick={() => verDetalle(venta)}>
                <div className="venta-card-header">
                  <span className="venta-fecha">{formatearFecha(venta.createdAt)}</span>
                  <span className="venta-metodo">{getMetodoPagoTexto(venta.metodoPago)}</span>
                </div>

                <div className="venta-card-body">
                  <div className="venta-productos-resumen">
                    {venta.productos.map((item, index) => (
                      <div key={index} className="producto-resumen-item">
                        <span>{item.nombreProducto}</span>
                        <span className="cantidad-badge">x{item.cantidad}</span>
                      </div>
                    ))}
                  </div>

                  {venta.cliente?.nombre && (
                    <div className="venta-cliente">
                      <strong>Cliente:</strong> {venta.cliente.nombre}
                    </div>
                  )}

                  <div className="venta-vendedor">
                    <strong>Vendedor:</strong> {venta.vendedor?.nombre}
                  </div>
                </div>

                <div className="venta-card-footer">
                  <span className="venta-total">{formatearPrecio(venta.total)}</span>
                  <button className="btn-ver-detalle">Ver detalle →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {ventaDetalle && (
        <div className="modal-overlay" onClick={cerrarDetalle}>
          <div className="modal modal-detalle" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalle de Venta</h2>
              <button onClick={cerrarDetalle} className="btn-cerrar">×</button>
            </div>

            <div className="modal-body">
              <div className="detalle-seccion">
                <h3>📅 Información General</h3>
                <div className="detalle-grid">
                  <div>
                    <strong>Fecha:</strong>
                    <p>{formatearFecha(ventaDetalle.createdAt)}</p>
                  </div>
                  <div>
                    <strong>Método de pago:</strong>
                    <p>{getMetodoPagoTexto(ventaDetalle.metodoPago)}</p>
                  </div>
                  <div>
                    <strong>Vendedor:</strong>
                    <p>{ventaDetalle.vendedor?.nombre}</p>
                  </div>
                  {ventaDetalle.cliente?.nombre && (
                    <div>
                      <strong>Cliente:</strong>
                      <p>{ventaDetalle.cliente.nombre}</p>
                      {ventaDetalle.cliente.telefono && (
                        <p className="telefono">{ventaDetalle.cliente.telefono}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="detalle-seccion">
                <h3>🛍️ Productos</h3>
                <div className="productos-detalle">
                  {ventaDetalle.productos.map((item, index) => (
                    <div key={index} className="producto-detalle-item">
                      <div className="producto-detalle-info">
                        <strong>{item.nombreProducto}</strong>
                        <span className="producto-detalle-cantidad">Cantidad: {item.cantidad}</span>
                      </div>
                      <div className="producto-detalle-precios">
                        <span>Precio unit.: {formatearPrecio(item.precioUnitario)}</span>
                        <strong>Subtotal: {formatearPrecio(item.precioTotal)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {ventaDetalle.notas && (
                <div className="detalle-seccion">
                  <h3>📝 Notas</h3>
                  <p>{ventaDetalle.notas}</p>
                </div>
              )}

              <div className="detalle-total">
                <h3>Total: {formatearPrecio(ventaDetalle.total)}</h3>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={cerrarDetalle} className="btn-cancelar">
                Cerrar
              </button>
              <button
                onClick={() => handleEliminar(ventaDetalle._id)}
                className="btn-eliminar"
              >
                🗑️ Eliminar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialVentas;