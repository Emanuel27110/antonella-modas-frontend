import axios from 'axios';

// URL base del backend
const API_URL = 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
  (config) => {
    // 🔧 ARREGLO: Buscar en sessionStorage en lugar de localStorage
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== AUTH ==========
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (nombre, email, password) => api.post('/auth/register', { nombre, email, password });
export const getPerfil = () => api.get('/auth/perfil');

// ========== CATEGORÍAS ==========
export const getCategorias = () => api.get('/categorias');
export const getCategoria = (id) => api.get(`/categorias/${id}`);
export const crearCategoria = (data) => api.post('/categorias', data);
export const actualizarCategoria = (id, data) => api.put(`/categorias/${id}`, data);
export const eliminarCategoria = (id) => api.delete(`/categorias/${id}`);

// ========== PRODUCTOS ==========
// Públicos (sin stock)
export const getProductos = () => api.get('/productos');
export const getProductosPorCategoria = (id) => api.get(`/productos/categoria/${id}`);
export const getProducto = (id) => api.get(`/productos/${id}`);

// Admin (con stock)
export const getProductosAdmin = () => api.get('/productos/admin/todos');
export const getProductosStockBajo = () => api.get('/productos/admin/stock-bajo');
export const crearProducto = (data) => api.post('/productos', data);
export const actualizarProducto = (id, data) => api.put(`/productos/${id}`, data);
export const actualizarStock = (id, stock) => api.patch(`/productos/${id}/stock`, { stock });
export const eliminarProducto = (id) => api.delete(`/productos/${id}`);
export const cambiarVisibilidad = (id) => api.patch(`/productos/${id}/visibilidad`);

// ========== VENTAS ==========
export const getVentas = () => api.get('/ventas');
export const getVenta = (id) => api.get(`/ventas/${id}`);
export const crearVenta = (data) => api.post('/ventas', data);
export const eliminarVenta = (id) => api.delete(`/ventas/${id}`);
export const getEstadisticas = () => api.get('/ventas/estadisticas');
export const getVentasPorPeriodo = (inicio, fin) => api.get(`/ventas/estadisticas/periodo?inicio=${inicio}&fin=${fin}`);

// ========== CAJA ==========
export const getResumenCaja = () => api.get('/caja/resumen');
export const getVentasDelDia = () => api.get('/caja/dia');
export const getVentasDeLaSemana = () => api.get('/caja/semana');
export const getVentasDelMes = () => api.get('/caja/mes');
export const getDesglosePorMetodo = (periodo) => api.get(`/caja/metodos-pago?periodo=${periodo}`);
export const getTopProductos = (limite = 10) => api.get(`/caja/top-productos?limite=${limite}`);

// ========== UPLOAD ==========
export const subirImagen = (formData) => {
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default api;