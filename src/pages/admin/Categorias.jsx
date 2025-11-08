import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from '../../services/api';
import './Categorias.css';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const categoriasPorPagina = 12;
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    orden: 0
  });
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    filtrarCategorias();
    setPaginaActual(1);
  }, [categorias, busqueda]);

  const cargarCategorias = async () => {
    try {
      const response = await getCategorias();
      setCategorias(response.data);
      setCategoriasFiltradas(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      mostrarMensaje('error', 'Error al cargar categorías');
    } finally {
      setCargando(false);
    }
  };

  const filtrarCategorias = () => {
    let filtradas = [...categorias];

    if (busqueda.trim() !== '') {
      filtradas = filtradas.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    setCategoriasFiltradas(filtradas);
  };

  // Calcular categorías de la página actual
  const indiceUltimo = paginaActual * categoriasPorPagina;
  const indicePrimero = indiceUltimo - categoriasPorPagina;
  const categoriasActuales = categoriasFiltradas.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(categoriasFiltradas.length / categoriasPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  const abrirModal = (categoria = null) => {
    if (categoria) {
      setModoEdicion(true);
      setCategoriaEditando(categoria);
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || '',
        orden: categoria.orden || 0
      });
    } else {
      setModoEdicion(false);
      setCategoriaEditando(null);
      setFormData({ nombre: '', descripcion: '', orden: 0 });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
    setCategoriaEditando(null);
    setFormData({ nombre: '', descripcion: '', orden: 0 });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modoEdicion) {
        await actualizarCategoria(categoriaEditando._id, formData);
        mostrarMensaje('success', 'Categoría actualizada correctamente');
      } else {
        await crearCategoria(formData);
        mostrarMensaje('success', 'Categoría creada correctamente');
      }
      cargarCategorias();
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      mostrarMensaje('error', 'Error al guardar categoría');
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás segura de eliminar la categoría "${nombre}"?`)) {
      try {
        await eliminarCategoria(id);
        mostrarMensaje('success', 'Categoría eliminada correctamente');
        cargarCategorias();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        mostrarMensaje('error', 'Error al eliminar categoría');
      }
    }
  };

  if (cargando) {
    return <div className="loading">Cargando categorías...</div>;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-content">
          <div className="header-actions">
            <Link to="/admin/dashboard" className="btn-volver">
              ← Dashboard
            </Link>
            <h1>📁 Gestión de Categorías</h1>
            <button onClick={() => abrirModal()} className="btn-primary">
              + Nueva Categoría
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

        {/* Búsqueda */}
        <div className="filtros-container">
          <div className="filtro-busqueda">
            <input
              type="text"
              placeholder="🔍 Buscar categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="resumen-categorias">
          <div className="resumen-card">
            <span className="resumen-label">Total categorías:</span>
            <span className="resumen-valor">{categoriasFiltradas.length}</span>
          </div>
          {totalPaginas > 1 && (
            <div className="resumen-card">
              <span className="resumen-label">Página:</span>
              <span className="resumen-valor">{paginaActual} / {totalPaginas}</span>
            </div>
          )}
        </div>

        {categoriasFiltradas.length === 0 ? (
          <div className="empty-state">
            <p>📦 No hay categorías que coincidan con la búsqueda</p>
            <button onClick={() => abrirModal()} className="btn-primary">
              Crear nueva categoría
            </button>
          </div>
        ) : (
          <>
            <div className="tabla-container">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasActuales.map((categoria) => (
                    <tr key={categoria._id}>
                      <td>{categoria.orden}</td>
                      <td><strong>{categoria.nombre}</strong></td>
                      <td>{categoria.descripcion || '-'}</td>
                      <td>
                        <div className="acciones">
                          <button
                            onClick={() => abrirModal(categoria)}
                            className="btn-editar"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(categoria._id, categoria.nombre)}
                            className="btn-eliminar"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={cerrarModal} className="btn-cerrar">×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Collares"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Descripción opcional..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="orden">Orden</label>
                <input
                  type="number"
                  id="orden"
                  name="orden"
                  value={formData.orden}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={cerrarModal} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {modoEdicion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categorias;