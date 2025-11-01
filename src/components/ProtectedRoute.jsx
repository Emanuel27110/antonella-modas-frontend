import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { usuario, cargando } = useContext(AuthContext);

  if (cargando) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '24px'
      }}>
        Cargando...
      </div>
    );
  }

  return usuario ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;