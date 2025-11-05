import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { crearPedido } from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const producto = location.state?.producto;

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    tipoEntrega: 'retiro',
    direccion: '',
    zona: '',
    metodoPago: 'efectivo',
    cantidad: 1,
    talle: '',
    notas: ''
  });

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  if (!producto) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="mensaje-error">
            <h2>❌ No hay producto seleccionado</h2>
            <Link to="/" className="btn-primary">Volver al inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const calcularTotal = () => {
    const subtotal = producto.precio * formData.cantidad;
    const envio = formData.tipoEntrega === 'envio' ? 0 : 0; // Por ahora sin costo de envío
    return subtotal + envio;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      setMensaje({ tipo: 'error', texto: 'Nombre y teléfono son obligatorios' });
      return;
    }

    if (formData.tipoEntrega === 'envio' && !formData.direccion.trim()) {
      setMensaje({ tipo: 'error', texto: 'La dirección es obligatoria para envíos' });
      return;
    }

    if (producto.talles && producto.talles.length > 0 && !formData.talle) {
      setMensaje({ tipo: 'error', texto: 'Por favor selecciona un talle' });
      return;
    }

    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const pedidoData = {
        productos: [{
          producto: producto._id,
          cantidad: parseInt(formData.cantidad),
          talle: formData.talle
        }],
        cliente: {
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          zona: formData.zona,
          tipoEntrega: formData.tipoEntrega
        },
        metodoPago: formData.metodoPago,
        costoEnvio: 0,
        notas: formData.notas
      };

      const response = await crearPedido(pedidoData);
      
      setMensaje({ 
        tipo: 'success', 
        texto: `¡Pedido creado exitosamente! Número: ${response.data.pedido.numeroPedido}` 
      });

      // Limpiar formulario
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Error al crear pedido:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: error.response?.data?.mensaje || 'Error al crear el pedido' 
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div className="header-content">
          <Link to="/" className="btn-volver">← Volver</Link>
          <h1>🛒 Finalizar Compra</h1>
        </div>
      </header>

      <div className="checkout-container">
        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo === 'error' ? 'mensaje-error' : 'mensaje-exito'}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="checkout-grid">
          {/* Resumen del producto */}
          <div className="producto-resumen">
            <h2>📦 Tu Pedido</h2>
            <div className="resumen-card">
              {producto.imagen && (
                <img src={producto.imagen} alt={producto.nombre} className="resumen-imagen" />
              )}
              <div className="resumen-info">
                <h3>{producto.nombre}</h3>
                {producto.descripcion && <p>{producto.descripcion}</p>}
                <div className="resumen-precio">
                  <span>Precio unitario:</span>
                  <strong>{formatearPrecio(producto.precio)}</strong>
                </div>
              </div>
            </div>

            <div className="resumen-total">
              <div className="total-item">
                <span>Subtotal ({formData.cantidad} {formData.cantidad > 1 ? 'productos' : 'producto'}):</span>
                <strong>{formatearPrecio(producto.precio * formData.cantidad)}</strong>
              </div>
              {formData.tipoEntrega === 'envio' && (
                <div className="total-item">
                  <span>Envío:</span>
                  <strong>A coordinar</strong>
                </div>
              )}
              <div className="total-final">
                <span>Total:</span>
                <strong>{formatearPrecio(calcularTotal())}</strong>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="formulario-checkout">
            <h2>📝 Datos de Entrega</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 381 123 4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (opcional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cantidad">Cantidad</label>
                <input
                  type="number"
                  id="cantidad"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              {producto.talles && producto.talles.length > 0 && (
                <div className="form-group">
                  <label htmlFor="talle">Talle *</label>
                  <select
                    id="talle"
                    name="talle"
                    value={formData.talle}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un talle</option>
                    {producto.talles.map((talle, index) => (
                      <option key={index} value={talle}>{talle}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Tipo de entrega *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="retiro"
                      checked={formData.tipoEntrega === 'retiro'}
                      onChange={handleChange}
                    />
                    <span>🏪 Retiro en local</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="envio"
                      checked={formData.tipoEntrega === 'envio'}
                      onChange={handleChange}
                    />
                    <span>🚚 Envío a domicilio</span>
                  </label>
                </div>
              </div>

              {formData.tipoEntrega === 'envio' && (
                <>
                  <div className="form-group">
                    <label htmlFor="direccion">Dirección *</label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                      placeholder="Calle, número, piso/dpto"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="zona">Zona / Barrio</label>
                    <input
                      type="text"
                      id="zona"
                      name="zona"
                      value={formData.zona}
                      onChange={handleChange}
                      placeholder="Ej: Centro, Yerba Buena, etc."
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="metodoPago">Método de pago *</label>
                <select
                  id="metodoPago"
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleChange}
                  required
                >
                  <option value="efectivo">💵 Efectivo (pago al recibir)</option>
                  <option value="transferencia">🏦 Transferencia bancaria</option>
                  <option value="visa">💳 Visa</option>
                  <option value="mastercard">💳 Mastercard</option>
                  <option value="naranja">🧡 Tarjeta Naranja</option>
                </select>
              </div>

              {formData.metodoPago === 'transferencia' && (
                <div className="info-transferencia">
                  <h4>📱 Datos para transferencia:</h4>
                  <p><strong>CBU:</strong> (Pendiente - Antonella debe proporcionar)</p>
                  <p><strong>Alias:</strong> (Pendiente)</p>
                  <p className="nota">Después de realizar la transferencia, nos contactaremos contigo para confirmar el pago.</p>
                </div>
              )}

              {(formData.metodoPago === 'visa' || formData.metodoPago === 'mastercard' || formData.metodoPago === 'naranja') && (
                <div className="info-tarjeta">
                  <h4>💳 Pago con Tarjeta</h4>
                  <p className="nota">Después de confirmar tu pedido, nos pondremos en contacto contigo para procesar el pago con tarjeta de forma segura.</p>
                  <p className="nota"><strong>Nota:</strong> El link de pago se enviará por WhatsApp.</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="notas">Notas adicionales (opcional)</label>
                <textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Ej: Horario preferido para entrega..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn-confirmar"
                disabled={cargando}
              >
                {cargando ? '⏳ Procesando...' : '✅ Confirmar Pedido'}
              </button>

              <p className="aviso-legal">
                Al confirmar tu pedido, nos pondremos en contacto contigo por WhatsApp para coordinar la entrega.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;