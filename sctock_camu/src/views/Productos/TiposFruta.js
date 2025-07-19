import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import tipoFrutaService from '../../services/api/tipoFrutaService'; // Ensure correct import path
import CIcon from '@coreui/icons-react';
import Swal from 'sweetalert2';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CInputGroup,
  CFormInput,
  CButton,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import { cilPencil, cilTrash, cilPlus, cilSearch, cilFilter, cilFilterX } from '@coreui/icons';
import { debounce } from 'lodash';

// Define the component for each row
const TipoFrutaRow = ({ tipoFruta, index, currentPage, itemsPerPage, onEdit, onDelete }) => {
  return (
    <CTableRow>
      <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
      <CTableDataCell>{tipoFruta.nombre}</CTableDataCell>
      <CTableDataCell>{tipoFruta.descripcion || '-'}</CTableDataCell>
      <CTableDataCell>
        <CButton
          color="info"
          size="sm"
          className="me-2"
          onClick={() => onEdit(tipoFruta)}
        >
          <CIcon icon={cilPencil} />
        </CButton>
        <CButton
          color="danger"
          size="sm"
          onClick={() => onDelete(tipoFruta)}
        >
          <CIcon icon={cilTrash} />
        </CButton>
      </CTableDataCell>
    </CTableRow>
  );
};

// Define the modal component
const TipoFrutaModal = ({ visible, onClose, title, tipoFruta, errors, submitting, onChange, onSave }) => {
  const nombreInputRef = useRef(null);

  useEffect(() => {
    if (visible && nombreInputRef.current) {
      nombreInputRef.current.focus();
    }
  }, [visible]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      onSave();
    }
  };

  return (
    <div className="modal" style={{ display: visible ? 'block' : 'none' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onKeyDown={handleKeyDown}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input
                  type="text"
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  id="nombre"
                  name="nombre"
                  value={tipoFruta.nombre}
                  onChange={onChange}
                  ref={nombreInputRef}
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  id="descripcion"
                  name="descripcion"
                  value={tipoFruta.descripcion || ''}
                  onChange={onChange}
                />
              </div>
              {errors.api && <div className="alert alert-danger">{errors.api}</div>}
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSave}
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TipoFruta = () => {
  const [tiposFruta, setTiposFruta] = useState([]);
  const [filteredTiposFruta, setFilteredTiposFruta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentTipoFruta, setCurrentTipoFruta] = useState({ nombre: '', descripcion: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginatedTiposFruta, setPaginatedTiposFruta] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [nombreFilter, setNombreFilter] = useState('');
  const [descripcionFilter, setDescripcionFilter] = useState('');

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const filterInputRef = useRef(null);

  useEffect(() => {
    if (activeFilter && filterInputRef.current) {
      filterInputRef.current.focus();
    }
  }, [activeFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterInputRef.current && !filterInputRef.current.contains(event.target)) {
        setActiveFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchTiposFruta();
  }, []);

  useEffect(() => {
    const filtered = tiposFruta.filter(tipoFruta => 
      tipoFruta.nombre.toLowerCase().includes(nombreFilter.toLowerCase()) &&
      tipoFruta.descripcion.toLowerCase().includes(descripcionFilter.toLowerCase())
    );
    setFilteredTiposFruta(filtered);
  }, [tiposFruta, nombreFilter, descripcionFilter]);

  const fetchTiposFruta = async (page = 1, itemsPerPage = 10, searchTerm = '', nombre = '', descripcion = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await tipoFrutaService.getAll({ page, itemsPerPage, search: searchTerm, nombre, descripcion });
      console.log('API Response:', response); // Log the full response for debugging

      if (response.data && Array.isArray(response.data.tiposFruta)) {
        setTiposFruta(response.data.tiposFruta);
        setPaginatedTiposFruta(response.data.tiposFruta);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Unexpected response format. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error fetching tipos de fruta:', err);
      setError('Error loading tipos de fruta. Please try again.');
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load tipos de fruta. Please try again.',
        confirmButtonColor: '#321fdb'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchTiposFruta(page, itemsPerPage, searchTerm, nombreFilter, descripcionFilter);
  };

  const debouncedFetchTiposFruta = useRef(debounce((search, nombre, descripcion) => {
    fetchTiposFruta(1, itemsPerPage, search, nombre, descripcion);
  }, 300)).current;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    console.log('Search term changed:', value);
  };

  const handleFilterInputChange = (setter) => (e) => {
    const value = e.target.value;
    setter(value);
  };

  useEffect(() => {
    debouncedFetchTiposFruta(searchTerm, nombreFilter, descripcionFilter);
  }, [searchTerm, nombreFilter, descripcionFilter]);

  const handleSearch = () => {
    fetchTiposFruta(1, itemsPerPage, searchTerm, nombreFilter, descripcionFilter);
  };

  const clearFilters = () => {
    setNombreFilter('');
    setDescripcionFilter('');
    setSearchTerm('');
    fetchTiposFruta(1, itemsPerPage, '', '', '');
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchTiposFruta(1, itemsPerPage, '', nombreFilter, descripcionFilter);
  };

  const handleOpenCreateModal = () => {
    console.log('Abriendo modal de creación');
    setCurrentTipoFruta({ nombre: '', descripcion: '' });
    setFormErrors({});
    setModalTitle('Crear Nuevo Tipo de Fruta');
    setShowModal(true);
  };

  const handleOpenEditModal = (tipoFruta) => {
    console.log('Abriendo modal de edición para:', tipoFruta);
    setCurrentTipoFruta({ ...tipoFruta });
    setFormErrors({});
    setModalTitle('Editar Tipo de Fruta');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTipoFruta({ ...currentTipoFruta, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!currentTipoFruta.nombre || currentTipoFruta.nombre.trim() === '') {
      errors.nombre = 'El nombre del tipo de fruta es requerido';
    }
    return errors;
  };

  const handleSaveTipoFruta = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      if (currentTipoFruta.id) {
        await tipoFrutaService.update(currentTipoFruta.id, currentTipoFruta);

        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `El tipo de fruta "${currentTipoFruta.nombre}" ha sido actualizado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        await tipoFrutaService.create(currentTipoFruta);

        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: `El tipo de fruta "${currentTipoFruta.nombre}" ha sido creado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      }

      await fetchTiposFruta(currentPage, itemsPerPage, searchTerm, nombreFilter, descripcionFilter);
      setShowModal(false);
    } catch (err) {
      console.error('Error al guardar tipo de fruta:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al guardar el tipo de fruta. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });

      setFormErrors({
        api: err.response?.data?.error || 'Error al guardar el tipo de fruta. Por favor, intente nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (tipoFruta) => {
    console.log('Solicitando confirmación para eliminar:', tipoFruta);

    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el tipo de fruta "${tipoFruta.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTipoFruta(tipoFruta);
      }
    });
  };

  const deleteTipoFruta = async (tipoFruta) => {
    try {
      Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await tipoFrutaService.delete(tipoFruta.id);

      const remainingItems = filteredTiposFruta.length - 1;
      const newPage = remainingItems === 0 && currentPage > 1 ? currentPage - 1 : currentPage;

      await fetchTiposFruta(newPage, itemsPerPage, searchTerm, nombreFilter, descripcionFilter);

      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: `El tipo de fruta "${tipoFruta.nombre}" ha sido eliminado correctamente.`,
        confirmButtonColor: '#321fdb',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error al eliminar tipo de fruta:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al eliminar el tipo de fruta. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const applyFilters = () => {
    fetchTiposFruta(1, itemsPerPage, searchTerm, nombreFilter, descripcionFilter);
  };

  useEffect(() => {
    setIsFilterActive(
      searchTerm.trim() !== '' || nombreFilter.trim() !== '' || descripcionFilter.trim() !== ''
    );
  }, [searchTerm, nombreFilter, descripcionFilter]);

  console.log('Renderizando componente TipoFruta', { tiposFruta, loading, error });

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Gestión de Tipos de Fruta</strong>
          <CButton 
            color="primary" 
            className="float-end me-2"
            onClick={handleOpenCreateModal}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Nuevo Tipo de Fruta
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CInputGroup>
                <CFormInput
                  placeholder="Buscar tipos de fruta..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <CButton color="primary" variant="outline" onClick={handleSearch}>
                  <CIcon icon={cilSearch} />
                </CButton>
                {isFilterActive && (
                  <CButton color="danger" variant="outline" onClick={clearFilters}>
                    <CIcon icon={cilFilterX} />
                  </CButton>
                )}
              </CInputGroup>
            </CCol>
            <CCol md={8}>
              <CInputGroup>
                {activeFilter && (
                  <CFormInput
                    ref={filterInputRef}
                    placeholder={`Filtrar por ${activeFilter}...`}
                    value={activeFilter === 'nombre' ? nombreFilter : descripcionFilter}
                    onChange={handleFilterInputChange(
                      activeFilter === 'nombre' ? setNombreFilter : setDescripcionFilter
                    )}
                  />
                )}
              </CInputGroup>
            </CCol>
          </CRow>

          {error && <CAlert color="danger">{error}</CAlert>}

          {loading ? (
            <div className="text-center my-3">
              <CSpinner />
            </div>
          ) : filteredTiposFruta.length > 0 ? (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Nombre 
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'nombre' ? null : 'nombre')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Descripción 
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'descripcion' ? null : 'descripcion')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredTiposFruta.map((tipoFruta, index) => (
                    <TipoFrutaRow
                      key={tipoFruta.id}
                      tipoFruta={tipoFruta}
                      index={index}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteModal}
                    />
                  ))}
                </CTableBody>
              </CTable>

              <div className="d-flex justify-content-center mt-3">
                <CPagination aria-label="Navegación de páginas">
                  <CPaginationItem
                    aria-label="Anterior"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    &laquo;
                  </CPaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <CPaginationItem
                      key={page}
                      active={page === currentPage}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </CPaginationItem>
                  ))}

                  <CPaginationItem
                    aria-label="Siguiente"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    &raquo;
                  </CPaginationItem>
                </CPagination>
              </div>

              <div className="text-center mt-2">
                <small>
                  Mostrando {filteredTiposFruta.length} de {totalItems} tipos de fruta
                </small>
              </div>
            </>
          ) : (
            <CAlert color="info">No hay tipos de fruta disponibles. Cree uno nuevo haciendo clic en el botón "Nuevo Tipo de Fruta".</CAlert>
          )}

          {showModal && (
            <Suspense fallback={<div className="text-center my-3"><CSpinner /></div>}>
              <TipoFrutaModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                title={modalTitle}
                tipoFruta={currentTipoFruta}
                errors={formErrors}
                submitting={submitting}
                onChange={handleInputChange}
                onSave={handleSaveTipoFruta}
              />
            </Suspense>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default TipoFruta;