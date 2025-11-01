import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getResumenCaja,
  getVentasDelDia,
  getVentasDeLaSemana,
  getVentasDelMes,
  getDesglosePorMetodo,
  getTopProductos
} from '../../services/api';
import './Caja.css';

const Caja = () => {
  const [resumen, setResumen] = useState(null);
  const [ventasPeriodo, setVentasPeriodo] = useState([]);
  const [desglosePago, setDesglosePago] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState('dia');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarVentasPorPeriodo(periodoActivo);
  }, [periodoActivo]);

  const cargarDatos = async () => {
    try {
      const [resumenRes, desgloseRes, topProdRes] = await Promise.all([
        getResumenCaja(),
        getDesglosePorMetodo('mes'),
        getTopProductos(5)
      ]);

      setResumen(resumenRes.data);
      setDesglosePago(desgloseRes.data);
      setTopProductos(topProdRes.data);

      // Cargar ventas del día por defecto
      const ventasDiaRes = await getVentasDelDia();
      setVentasPeriodo(ventasDiaRes.data.ventas || []);

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarVentasPorPeriodo = async (periodo) => {
    try {
      let response;
      switch (periodo) {
        case 'dia':
          response = await getVentasDelDia();
          break;
        case 'semana':
          response = await getVentasDeLaSemana();
          break;
        case 'mes':
          response = await getVentasDelMes();
          break;
        default:
          return;
      }
      setVentasPeriodo(response.data.ventas || []);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
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
      month: 'short',
      day: 'numeric',
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

  const calcularPorcentaje = (valor, total) => {
    if (total === 0) return 0;
    return ((valor / total) * 100).toFixed(1);
  };

  if (cargando) {
    return <div className="loading">Cargando reportes...</div>;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-content">
          <div className="header-actions">
            <Link to="/admin/dashboard" className="btn-volver">
              ← Dashboard
            </Link>
                      <h1>💰 Caja y Reportes</h1>
            <Link to="/admin/venta" className="btn-primary">
              + Nueva Venta
            </Link>
          </div>
        </div>
      </header>

      <div className="admin-container">
        {/* Tarjetas de resumen */}
        <div className="caja-resumen-grid">
          <div className="caja-card card-general">
            <div className="caja-card-icon">💎</div>
            <div className="caja-card-content">
              <h3>Total General</h3>
              <p className="caja-card-valor">{formatearPrecio(resumen?.totalGeneral || 0)}</p>
              <span className="caja-card-detalle">Todas las ventas</span>
            </div>
          </div>

          <div className="caja-card card-dia">
            <div className="caja-card-icon">📅</div>
            <div className="caja-card-content">
              <h3>Hoy</h3>
              <p className="caja-card-valor">{formatearPrecio(resumen?.hoy?.total || 0)}</p>
              <span className="caja-card-detalle">{resumen?.hoy?.cantidad || 0} ventas</span>
            </div>
          </div>

          <div className="caja-card card-semana">
            <div className="caja-card-icon">📊</div>
            <div className="caja-card-content">
              <h3>Esta Semana</h3>
              <p className="caja-card-valor">{formatearPrecio(resumen?.semana?.total || 0)}</p>
              <span className="caja-card-detalle">{resumen?.semana?.cantidad || 0} ventas</span>
            </div>
          </div>

          <div className="caja-card card-mes">
            <div className="caja-card-icon">📈</div>
            <div className="caja-card-content">
              <h3>Este Mes</h3>
              <p className="caja-card-valor">{formatearPrecio(resumen?.mes?.total || 0)}</p>
              <span className="caja-card-detalle">{resumen?.mes?.cantidad || 0} ventas</span>
            </div>
          </div>
        </div>

        {/* Desglose por método de pago */}
        <div className="caja-seccion">
          <h2>💳 Desglose por Método de Pago (Este Mes)</h2>
          <div className="metodos-pago-grid">
            {desglosePago.length === 0 ? (
              <p className="texto-vacio">No hay ventas registradas</p>
            ) : (
              desglosePago.map((metodo) => (
                <div key={metodo._id} className="metodo-card">
                  <div className="metodo-header">
                    <span className="metodo-nombre">{getMetodoPagoTexto(metodo._id)}</span>
                    <span className="metodo-cantidad">{metodo.cantidad} ventas</span>
                  </div>
                  <div className="metodo-monto">{formatearPrecio(metodo.total)}</div>
                  <div className="metodo-barra">
                    <div
                      className="metodo-barra-progreso"
                      style={{ width: `${calcularPorcentaje(metodo.total, resumen?.mes?.total || 1)}%` }}
                    ></div>
                  </div>
                  <span className="metodo-porcentaje">
                    {calcularPorcentaje(metodo.total, resumen?.mes?.total || 1)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top productos más vendidos */}
        <div className="caja-seccion">
          <h2>🏆 Top 5 Productos Más Vendidos</h2>
          <div className="top-productos-lista">
            {topProductos.length === 0 ? (
              <p className="texto-vacio">No hay productos vendidos</p>
            ) : (
              topProductos.map((item, index) => (
                <div key={item._id?._id || index} className="top-producto-item">
                  <div className="top-producto-ranking">#{index + 1}</div>
                  <div className="top-producto-info">
                    <h4>{item.nombreProducto}</h4>
                    <p>Cantidad vendida: <strong>{item.cantidadVendida}</strong></p>
                  </div>
                  <div className="top-producto-ingreso">
                    {formatearPrecio(item.ingresoTotal)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ventas recientes por período */}
        <div className="caja-seccion">
          <div className="seccion-header">
            <h2>📋 Ventas Recientes</h2>
            <div className="periodo-tabs">
              <button
                className={`tab ${periodoActivo === 'dia' ? 'active' : ''}`}
                onClick={() => setPeriodoActivo('dia')}
              >
                Hoy
              </button>
              <button
                className={`tab ${periodoActivo === 'semana' ? 'active' : ''}`}
                onClick={() => setPeriodoActivo('semana')}
              >
                Semana
              </button>
              <button
                className={`tab ${periodoActivo === 'mes' ? 'active' : ''}`}
                onClick={() => setPeriodoActivo('mes')}
              >
                Mes
              </button>
            </div>
          </div>

          {ventasPeriodo.length === 0 ? (
            <div className="empty-state-small">
              <p>No hay ventas en este período</p>
            </div>
          ) : (
            <div className="ventas-recientes-lista">
              {ventasPeriodo.map((venta) => (
                <div key={venta._id} className="venta-reciente-item">
                  <div className="venta-reciente-fecha">
                    {formatearFecha(venta.createdAt)}
                  </div>
                  <div className="venta-reciente-productos">
                    {venta.productos.map((p, i) => (
                      <span key={i} className="producto-tag">
                        {p.nombreProducto} x{p.cantidad}
                      </span>
                    ))}
                  </div>
                  <div className="venta-reciente-metodo">
                    {getMetodoPagoTexto(venta.metodoPago)}
                  </div>
                  <div className="venta-reciente-total">
                    {formatearPrecio(venta.total)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {ventasPeriodo.length > 0 && (
            <div className="ver-todas-link">
              <Link to="/admin/historial-ventas">
                Ver historial completo →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Caja;