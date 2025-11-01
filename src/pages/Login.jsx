import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { login as loginAPI } from '../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, usuario } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Si ya está logueado, redirigir
  useEffect(() => {
    if (usuario) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [usuario, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await loginAPI(formData.email, formData.password);
      
      // El backend devuelve todo junto: { _id, nombre, email, rol, token }
      const { token, ...userData } = response.data;

      // Guardar en contexto
      login(token, userData);
      
    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error);
      setError(error.response?.data?.mensaje || 'Error al iniciar sesión');
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🔐 Acceso Admin</h1>
          <p>Panel de administración de Antonella</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          {error && (
            <div className="mensaje-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={cargando}
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/" className="link-volver">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;