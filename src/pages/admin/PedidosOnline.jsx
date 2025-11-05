import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getPedidos, 
  actualizarEstadoPedido, 
  actualizarEstadoPago,
  eliminarPedido 
} from '../../services/api';
import './PedidosOnline.css';

const PedidosOnline = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPago, setFiltroPago] = useState('todos');
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    filtrarPedidos();
  }, [pedidos, filtroEstado, filtroPago]);

  const cargarPedidos = async () => {
    try {
      const response = await getPedidos();
      setPedidos(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      mostrarMensaje('error', 'Error al cargar pedidos');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  const filtrarPedidos = () => {
    let filtrados = [...pedidos];

    if (filtroEstado !== 'todos') {
      filtrados = filtrados.filter(p => p.estadoPedido === filtroEstado);
    }

    if (filtroPago !== 'todos') {
      filtrados = filtrados.filter(p => p.estadoPago === filtroPago);
    }

    setPedidosFiltrados(filtrados);
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await actualizarEstadoPedido(id, { 
        estado: nuevoEstado,
        observacion: `Cambiado a ${nuevoEstado}` 
      });
      mostrarMensaje('success', 'Estado actualizado correctamente');
      cargarPedidos();
      if (pedidoDetalle?._id === id) {
        const updatedPedido = await getPedidos();
        setPedidoDetalle(updatedPedido.data.find(p => p._id === id));
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarMensaje('error', error.response?.data?.mensaje || 'Error al actualizar estado');
    }
  };

  const handleCambiarEstadoPago = async (id, nuevoEstado) => {
    try {
      await actualizarEstadoPago(id, { estadoPago: nuevoEstado });
      mostrarMensaje('success', 'Estado de pago actualizado');
      cargarPedidos();
      if (pedidoDetalle?._id === id) {
        const updatedPedido = await getPedidos();
        setPedidoDetalle(updatedPedido.data.find(p => p._id === id));
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarMensaje('error', 'Error al actualizar pago');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás segura de eliminar este pedido? Si estaba confirmado, el stock se restaurará.')) {
      try {
        await eliminarPedido(id);
        mostrarMensaje('success', 'Pedido eliminado correctamente');
        cargarPedidos();
        setPedidoDetalle(null);
      } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('error', 'Error al eliminar pedido');
      }
    }
  };

  const verDetalle = (pedido) => {
    setPedidoDetalle(pedido);
  };

  const cerrarDetalle = () => {
    setPedidoDetalle(null);
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

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { texto: '⏳ Pendiente', clase: 'badge-pendiente' },
      confirmado: { texto: '✅ Confirmado', clase: 'badge-confirmado' },
      preparando: { texto: '📦 Preparando', clase: 'badge-preparando' },
      enviado: { texto: '🚚 Enviado', clase: 'badge-enviado' },
      entregado: { texto: '✔️ Entregado', clase: 'badge-entregado' },
      cancelado: { texto: '❌ Cancelado', clase: 'badge-cancelado' }
    };
    return badges[estado] || badges.pendiente;
  };

  const getPagoBadge = (estado) => {
    const badges = {
      pendiente: { texto: '⏳ Pendiente', clase: 'pago-pendiente' },
      aprobado: { texto: '✅ Aprobado', clase: 'pago-aprobado' },
      rechazado: { texto: '❌ Rechazado', clase: 'pago-rechazado' }
    };
    return badges[estado] || badges.pendiente;
  };

  const getMetodoPagoTexto = (metodo) => {
    const metodos = {
      efectivo: '💵 Efectivo',
      transferencia: '🏦 Transferencia',
      tarjeta: '💳 Tarjeta'
    };
    return metodos[metodo] || metodo;
  };

  if (cargando) {
    return <div className="loading">Cargando pedidos...</div>;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-content">
          <div className="header-actions">
            <Link to="/admin/dashboard" className="btn-volver">
              ← Dashboard
            </Link>
            <h1>🛒 Pedidos Online</h1>
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
        <div className="filtros-container">
          <div className="filtro-group">
            <label htmlFor="filtroEstado">Estado del pedido:</label>
            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmado">Confirmados</option>
              <option value="preparando">Preparando</option>
              <option value="enviado">Enviados</option>
              <option value="entregado">Entregados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>

          <div className="filtro-group">
            <label htmlFor="filtroPago">Estado de pago:</label>
            <select
              id="filtroPago"
              value={filtroPago}
              onChange={(e) => setFiltroPago(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        </div>

        {/* Resumen */}
        <div className="resumen-pedidos">
          <div className="resumen-card">
            <span className="resumen-label">Total pedidos:</span>
            <span className="resumen-valor">{pedidosFiltrados.length}</span>
          </div>
          <div className="resumen-card">
            <span className="resumen-label">Pendientes:</span>
            <span className="resumen-valor destacado">
              {pedidos.filter(p => p.estadoPedido === 'pendiente').length}
            </span>
          </div>
        </div>

        {/* Lista de pedidos */}
        {pedidosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>📦 No hay pedidos para mostrar</p>
          </div>
        ) : (
          <div className="pedidos-grid">
            {pedidosFiltrados.map((pedido) => {
              const estadoBadge = getEstadoBadge(pedido.estadoPedido);
              const pagoBadge = getPagoBadge(pedido.estadoPago);

              return (
                <div key={pedido._id} className="pedido-card" onClick={() => verDetalle(pedido)}>
                  <div className="pedido-header">
                    <div>
                      <strong className="numero-pedido">{pedido.numeroPedido}</strong>
                      <p className="fecha-pedido">{formatearFecha(pedido.createdAt)}</p>
                    </div>
                    <div className="badges-container">
                      <span className={`badge ${estadoBadge.clase}`}>{estadoBadge.texto}</span>
                      <span className={`badge ${pagoBadge.clase}`}>{pagoBadge.texto}</span>
                    </div>
                  </div>

                  <div className="pedido-body">
                    <div className="cliente-info">
                      <p><strong>Cliente:</strong> {pedido.cliente.nombre}</p>
                      <p><strong>Teléfono:</strong> {pedido.cliente.telefono}</p>
                      <p><strong>Entrega:</strong> {pedido.cliente.tipoEntrega === 'envio' ? '🚚 Envío' : '🏪 Retiro'}</p>
                    </div>

                    <div className="productos-resumen">
                      {pedido.productos.map((item, index) => (
                        <div key={index} className="producto-item-mini">
                          <span>{item.nombreProducto}</span>
                          <span className="cantidad-badge">x{item.cantidad}</span>
                        </div>
                      ))}
                    </div>

                    <div className="metodo-pago">
                      {getMetodoPagoTexto(pedido.metodoPago)}
                    </div>
                  </div>

                  <div className="pedido-footer">
                    <span className="total-pedido">{formatearPrecio(pedido.total)}</span>
                    <button className="btn-ver-detalle">Ver detalle →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {pedidoDetalle && (
        <div className="modal-overlay" onClick={cerrarDetalle}>
          <div className="modal modal-detalle-pedido" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pedido">
              <div className="header-pedido-info">
                <h2>{pedidoDetalle.numeroPedido}</h2>
                <p className="fecha-modal">{formatearFecha(pedidoDetalle.createdAt)}</p>
                <div className="badges-modal">
                  <span className={`badge ${getEstadoBadge(pedidoDetalle.estadoPedido).clase}`}>
                    {getEstadoBadge(pedidoDetalle.estadoPedido).texto}
                  </span>
                  <span className={`badge ${getPagoBadge(pedidoDetalle.estadoPago).clase}`}>
                    {getPagoBadge(pedidoDetalle.estadoPago).texto}
                  </span>
                </div>
              </div>
              <button onClick={cerrarDetalle} className="btn-cerrar-modal">✕</button>
            </div>

            <div className="modal-body-pedido">
              {/* Estados - Grid de 2 columnas */}
              <div className="estados-grid">
                <div className="estado-card">
                  <label>📊 Estado del Pedido</label>
                  <select
                    value={pedidoDetalle.estadoPedido}
                    onChange={(e) => handleCambiarEstado(pedidoDetalle._id, e.target.value)}
                    className="select-estado"
                  >
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="confirmado">✅ Confirmado (descuenta stock)</option>
                    <option value="preparando">📦 Preparando</option>
                    <option value="enviado">🚚 Enviado</option>
                    <option value="entregado">✔️ Entregado</option>
                    <option value="cancelado">❌ Cancelado</option>
                  </select>
                </div>

                <div className="estado-card">
                  <label>💳 Estado de Pago</label>
                  <select
                    value={pedidoDetalle.estadoPago}
                    onChange={(e) => handleCambiarEstadoPago(pedidoDetalle._id, e.target.value)}
                    className="select-estado"
                  >
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="aprobado">✅ Aprobado</option>
                    <option value="rechazado">❌ Rechazado</option>
                  </select>
                </div>
              </div>

              {/* Cliente y Método de Pago - Grid */}
              <div className="info-grid">
                <div className="info-card">
                  <h3>👤 Cliente</h3>
                  <div className="info-content">
                    <p><strong>Nombre:</strong> {pedidoDetalle.cliente.nombre}</p>
                    <p><strong>Teléfono:</strong> <a href={`https://wa.me/${pedidoDetalle.cliente.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">{pedidoDetalle.cliente.telefono}</a></p>
                    {pedidoDetalle.cliente.email && (
                      <p><strong>Email:</strong> {pedidoDetalle.cliente.email}</p>
                    )}
                  </div>
                </div>

                <div className="info-card">
                  <h3>🚚 Entrega</h3>
                  <div className="info-content">
                    <p className="tipo-entrega">
                      {pedidoDetalle.cliente.tipoEntrega === 'envio' ? '🚚 Envío a domicilio' : '🏪 Retiro en local'}
                    </p>
                    {pedidoDetalle.cliente.tipoEntrega === 'envio' && (
                      <>
                        <p><strong>Dirección:</strong> {pedidoDetalle.cliente.direccion}</p>
                        {pedidoDetalle.cliente.zona && (
                          <p><strong>Zona:</strong> {pedidoDetalle.cliente.zona}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="info-card">
                  <h3>💳 Pago</h3>
                  <div className="info-content">
                    <p className="metodo-pago-grande">{getMetodoPagoTexto(pedidoDetalle.metodoPago)}</p>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="productos-section">
                <h3>🛍️ Productos del Pedido</h3>
                <div className="productos-tabla">
                  {pedidoDetalle.productos.map((item, index) => (
                    <div key={index} className="producto-row">
                      <div className="producto-col-main">
                        <strong>{item.nombreProducto}</strong>
                        {item.talle && <span className="talle-chip">{item.talle}</span>}
                      </div>
                      <div className="producto-col-cantidad">
                        x{item.cantidad}
                      </div>
                      <div className="producto-col-precio">
                        {formatearPrecio(item.precioUnitario)}
                      </div>
                      <div className="producto-col-total">
                        {formatearPrecio(item.precioTotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="totales-section">
                <div className="totales-box">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>{formatearPrecio(pedidoDetalle.subtotal)}</span>
                  </div>
                  {pedidoDetalle.costoEnvio > 0 && (
                    <div className="total-row">
                      <span>Envío:</span>
                      <span>{formatearPrecio(pedidoDetalle.costoEnvio)}</span>
                    </div>
                  )}
                  <div className="total-row total-final-row">
                    <span>Total:</span>
                    <span>{formatearPrecio(pedidoDetalle.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {pedidoDetalle.notas && (
                <div className="notas-section">
                  <h3>📝 Notas del Cliente</h3>
                  <p className="notas-texto">{pedidoDetalle.notas}</p>
                </div>
              )}
            </div>

            <div className="modal-footer-pedido">
              <button onClick={cerrarDetalle} className="btn-modal-cancelar">
                Cerrar
              </button>
              <button
                onClick={() => handleEliminar(pedidoDetalle._id)}
                className="btn-modal-eliminar"
              >
                🗑️ Eliminar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosOnline;