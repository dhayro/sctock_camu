import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import unidadMedidaService from '../../services/api/unidadMedidaService'; // Ensure correct import path
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
const UnidadMedidaRow = ({ unidadMedida, index, currentPage, itemsPerPage, onEdit, onDelete }) => {
  return (
    <CTableRow>
      <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
      <CTableDataCell>{unidadMedida.nombre}</CTableDataCell>
      <CTableDataCell>{unidadMedida.abreviatura || '-'}</CTableDataCell>
      <CTableDataCell>
        <CButton
          color="info"
          size="sm"
          className="me-2"
          onClick={() => onEdit(unidadMedida)}
        >
          <CIcon icon={cilPencil} />
        </CButton>
        <CButton
          color="danger"
          size="sm"
          onClick={() => onDelete(unidadMedida)}
        >
          <CIcon icon={cilTrash} />
        </CButton>
      </CTableDataCell>
    </CTableRow>
  );
};

// Define the modal component
const UnidadMedidaModal = ({ visible, onClose, title, unidadMedida, errors, submitting, onChange, onSave }) => {
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
                  value={unidadMedida.nombre}
                  onChange={onChange}
                  ref={nombreInputRef}
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="abreviatura" className="form-label">Abreviatura</label>
                <input
                  type="text"
                  className={`form-control ${errors.abreviatura ? 'is-invalid' : ''}`}
                  id="abreviatura"
                  name="abreviatura"
                  value={unidadMedida.abreviatura || ''}
                  onChange={onChange}
                />
                {errors.abreviatura && <div className="invalid-feedback">{errors.abreviatura}</div>}
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

const UnidadesMedida = () => {
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [filteredUnidadesMedida, setFilteredUnidadesMedida] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentUnidadMedida, setCurrentUnidadMedida] = useState({ nombre: '', abreviatura: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginatedUnidadesMedida, setPaginatedUnidadesMedida] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [nombreFilter, setNombreFilter] = useState('');
  const [abreviaturaFilter, setAbreviaturaFilter] = useState('');

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
    fetchUnidadesMedida();
  }, []);

  useEffect(() => {
    const filtered = unidadesMedida.filter(unidadMedida => 
      unidadMedida.nombre.toLowerCase().includes(nombreFilter.toLowerCase()) &&
      unidadMedida.abreviatura.toLowerCase().includes(abreviaturaFilter.toLowerCase())
    );
    setFilteredUnidadesMedida(filtered);
  }, [unidadesMedida, nombreFilter, abreviaturaFilter]);

  const fetchUnidadesMedida = async (page = 1, itemsPerPage = 10, searchTerm = '', nombre = '', abreviatura = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await unidadMedidaService.getAll({ page, itemsPerPage, search: searchTerm, nombre, abreviatura });
      console.log('API Response:', response); // Log the full response for debugging

      if (response.data && Array.isArray(response.data.unidadesMedida)) {
        setUnidadesMedida(response.data.unidadesMedida);
        setPaginatedUnidadesMedida(response.data.unidadesMedida);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Unexpected response format. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error fetching unidades de medida:', err);
      setError('Error loading unidades de medida. Please try again.');
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load unidades de medida. Please try again.',
        confirmButtonColor: '#321fdb'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchUnidadesMedida(page, itemsPerPage, searchTerm, nombreFilter, abreviaturaFilter);
  };

  const debouncedFetchUnidadesMedida = useRef(debounce((search, nombre, abreviatura) => {
    fetchUnidadesMedida(1, itemsPerPage, search, nombre, abreviatura);
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
    debouncedFetchUnidadesMedida(searchTerm, nombreFilter, abreviaturaFilter);
  }, [searchTerm, nombreFilter, abreviaturaFilter]);

  const handleSearch = () => {
    fetchUnidadesMedida(1, itemsPerPage, searchTerm, nombreFilter, abreviaturaFilter);
  };

  const clearFilters = () => {
    setNombreFilter('');
    setAbreviaturaFilter('');
    setSearchTerm('');
    fetchUnidadesMedida(1, itemsPerPage, '', '', '');
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchUnidadesMedida(1, itemsPerPage, '', nombreFilter, abreviaturaFilter);
  };

  const handleOpenCreateModal = () => {
    console.log('Abriendo modal de creación');
    setCurrentUnidadMedida({ nombre: '', abreviatura: '' });
    setFormErrors({});
    setModalTitle('Crear Nueva Unidad de Medida');
    setShowModal(true);
  };

  const handleOpenEditModal = (unidadMedida) => {
    console.log('Abriendo modal de edición para:', unidadMedida);
    setCurrentUnidadMedida({ ...unidadMedida });
    setFormErrors({});
    setModalTitle('Editar Unidad de Medida');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUnidadMedida({ ...currentUnidadMedida, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!currentUnidadMedida.nombre || currentUnidadMedida.nombre.trim() === '') {
      errors.nombre = 'El nombre de la unidad de medida es requerido';
    }
    if (!currentUnidadMedida.abreviatura || currentUnidadMedida.abreviatura.trim() === '') {
      errors.abreviatura = 'La abreviatura de la unidad de medida es requerida';
    }
    return errors;
  };

  const handleSaveUnidadMedida = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      if (currentUnidadMedida.id) {
        await unidadMedidaService.update(currentUnidadMedida.id, currentUnidadMedida);

        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `La unidad de medida "${currentUnidadMedida.nombre}" ha sido actualizada correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        await unidadMedidaService.create(currentUnidadMedida);

        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: `La unidad de medida "${currentUnidadMedida.nombre}" ha sido creada correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      }

      await fetchUnidadesMedida(currentPage, itemsPerPage, searchTerm, nombreFilter, abreviaturaFilter);
      setShowModal(false);
    } catch (err) {
      console.error('Error al guardar unidad de medida:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al guardar la unidad de medida. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });

      setFormErrors({
        api: err.response?.data?.error || 'Error al guardar la unidad de medida. Por favor, intente nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (unidadMedida) => {
    console.log('Solicitando confirmación para eliminar:', unidadMedida);

    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar la unidad de medida "${unidadMedida.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUnidadMedida(unidadMedida);
      }
    });
  };

  const deleteUnidadMedida = async (unidadMedida) => {
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

      await unidadMedidaService.delete(unidadMedida.id);

      const remainingItems = filteredUnidadesMedida.length - 1;
      const newPage = remainingItems === 0 && currentPage > 1 ? currentPage - 1 : currentPage;

      await fetchUnidadesMedida(newPage, itemsPerPage, searchTerm, nombreFilter, abreviaturaFilter);

      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: `La unidad de medida "${unidadMedida.nombre}" ha sido eliminada correctamente.`,
        confirmButtonColor: '#321fdb',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error al eliminar unidad de medida:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al eliminar la unidad de medida. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const applyFilters = () => {
    fetchUnidadesMedida(1, itemsPerPage, searchTerm, nombreFilter, abreviaturaFilter);
  };

  useEffect(() => {
    setIsFilterActive(
      searchTerm.trim() !== '' || nombreFilter.trim() !== '' || abreviaturaFilter.trim() !== ''
    );
  }, [searchTerm, nombreFilter, abreviaturaFilter]);

  console.log('Renderizando componente UnidadesMedida', { unidadesMedida, loading, error });

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Gestión de Unidades de Medida</strong>
          <CButton 
            color="primary" 
            className="float-end me-2"
            onClick={handleOpenCreateModal}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Nueva Unidad de Medida
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CInputGroup>
                <CFormInput
                  placeholder="Buscar unidades de medida..."
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
                    value={activeFilter === 'nombre' ? nombreFilter : abreviaturaFilter}
                    onChange={handleFilterInputChange(
                      activeFilter === 'nombre' ? setNombreFilter : setAbreviaturaFilter
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
          ) : filteredUnidadesMedida.length > 0 ? (
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
                      Abreviatura 
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'abreviatura' ? null : 'abreviatura')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredUnidadesMedida.map((unidadMedida, index) => (
                    <UnidadMedidaRow
                      key={unidadMedida.id}
                      unidadMedida={unidadMedida}
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
                  Mostrando {filteredUnidadesMedida.length} de {totalItems} unidades de medida
                </small>
              </div>
            </>
          ) : (
            <CAlert color="info">No hay unidades de medida disponibles. Cree una nueva haciendo clic en el botón "Nueva Unidad de Medida".</CAlert>
          )}

          {showModal && (
            <Suspense fallback={<div className="text-center my-3"><CSpinner /></div>}>
              <UnidadMedidaModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                title={modalTitle}
                unidadMedida={currentUnidadMedida}
                errors={formErrors}
                submitting={submitting}
                onChange={handleInputChange}
                onSave={handleSaveUnidadMedida}
              />
            </Suspense>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default UnidadesMedida;