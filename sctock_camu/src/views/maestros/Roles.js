import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import rolesService from '../../services/api/rolesService'; // Ensure correct import path
import CIcon from '@coreui/icons-react'
import Swal from 'sweetalert2'
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
} from '@coreui/react'
import { cilPencil, cilTrash, cilPlus, cilSearch, cilFilter, cilFilterX } from '@coreui/icons' // Import the filter icon
import { debounce } from 'lodash'; // Import debounce from lodash

// Definir el componente RoleRow si no existe
const RoleRow = ({ role, index, currentPage, itemsPerPage, onEdit, onDelete }) => {
  return (
    <CTableRow>
      <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
      <CTableDataCell>{role.nombre}</CTableDataCell>
      <CTableDataCell>{role.descripcion || '-'}</CTableDataCell>
      <CTableDataCell>
        <CButton
          color="info"
          size="sm"
          className="me-2"
          onClick={() => onEdit(role)}
        >
          <CIcon icon={cilPencil} />
        </CButton>
        <CButton
          color="danger"
          size="sm"
          onClick={() => onDelete(role)}
        >
          <CIcon icon={cilTrash} />
        </CButton>
      </CTableDataCell>
    </CTableRow>
  );
};

// Definir el componente RoleModal si no existe
const RoleModal = ({ visible, onClose, title, role, errors, submitting, onChange, onSave }) => {
  const nombreInputRef = useRef(null);

  // Focus the "Nombre" input when the modal is opened
  useEffect(() => {
    if (visible && nombreInputRef.current) {
      nombreInputRef.current.focus();
    }
  }, [visible]);

  // Handle Enter key for form submission, except in textarea
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
                  value={role.nombre}
                  onChange={onChange}
                  ref={nombreInputRef} // Attach the ref to the input
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  id="descripcion"
                  name="descripcion"
                  value={role.descripcion || ''}
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

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]); // Define the filteredRoles state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentRole, setCurrentRole] = useState({ nombre: '', descripcion: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginatedRoles, setPaginatedRoles] = useState([]);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Nuevos estados para filtros
  const [nombreFilter, setNombreFilter] = useState('');
  const [descripcionFilter, setDescripcionFilter] = useState('');

  // State to track if any filter is active
  const [isFilterActive, setIsFilterActive] = useState(false);

  // State to track which filter input is active
  const [activeFilter, setActiveFilter] = useState(null);

  // Ref for filter inputs
  const filterInputRef = useRef(null);

  // Focus the filter input when it becomes active
  useEffect(() => {
    if (activeFilter && filterInputRef.current) {
      filterInputRef.current.focus();
    }
  }, [activeFilter]);

  // Close filter input on outside click
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

  // Obtener todos los roles al cargar el componente
  useEffect(() => {
    fetchRoles();
  }, []);

  // Apply filters to the roles
  useEffect(() => {
    const filtered = roles.filter(role => 
      role.nombre.toLowerCase().includes(nombreFilter.toLowerCase()) &&
      role.descripcion.toLowerCase().includes(descripcionFilter.toLowerCase())
    );
    setFilteredRoles(filtered); // Use setFilteredRoles to update the filtered roles
  }, [roles, nombreFilter, descripcionFilter]);

  // Function to fetch roles with pagination and filters
  const fetchRoles = async (page = 1, itemsPerPage = 10, searchTerm = '', nombre = '', descripcion = '') => {
    setLoading(true);
    setError(null);
    try {
      // Map the frontend state to the expected backend query parameters
      const response = await rolesService.getAll({ page, itemsPerPage, search: searchTerm, nombre, descripcion });
      if (response.data && Array.isArray(response.data.roles)) {
        setRoles(response.data.roles);
        setPaginatedRoles(response.data.roles);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Unexpected response format. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Error loading roles. Please try again.');
      
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load roles. Please try again.',
        confirmButtonColor: '#321fdb'
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchRoles(page, itemsPerPage, searchTerm, nombreFilter, descripcionFilter);
  };

  // Debounced fetchRoles function for search and filters
  const debouncedFetchRoles = useRef(debounce((search, nombre, descripcion) => {
    fetchRoles(1, itemsPerPage, search, nombre, descripcion);
  }, 300)).current;

  // Function to handle changes in the search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    console.log('Search term changed:', value);
  };

  // Function to handle filter input changes
  const handleFilterInputChange = (setter) => (e) => {
    const value = e.target.value;
    setter(value);
  };

  // Use useEffect to trigger the debounced function when filters change
  useEffect(() => {
    debouncedFetchRoles(searchTerm, nombreFilter, descripcionFilter);
  }, [searchTerm, nombreFilter, descripcionFilter]);

  // Define the handleSearch function
  const handleSearch = () => {
    // Call fetchRoles with the current search term and filters
    fetchRoles(1, itemsPerPage, searchTerm, nombreFilter, descripcionFilter);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setNombreFilter('');
    setDescripcionFilter('');
    setSearchTerm('');
    fetchRoles(1, itemsPerPage, '', '', '');
  };

  // Function to clear search input
  const clearSearch = () => {
    setSearchTerm('');
    fetchRoles(1, itemsPerPage, '', nombreFilter, descripcionFilter);
  };

  // Función para abrir el modal de creación
  const handleOpenCreateModal = () => {
    console.log('Abriendo modal de creación');
    setCurrentRole({ nombre: '', descripcion: '' });
    setFormErrors({});
    setModalTitle('Crear Nuevo Rol');
    setShowModal(true);
  };

  // Función para abrir el modal de edición
  const handleOpenEditModal = (role) => {
    console.log('Abriendo modal de edición para:', role);
    setCurrentRole({ ...role });
    setFormErrors({});
    setModalTitle('Editar Rol');
    setShowModal(true);
  };

  // Función para manejar cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRole({ ...currentRole, [name]: value });

    // Limpiar errores al editar
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    if (!currentRole.nombre || currentRole.nombre.trim() === '') {
      errors.nombre = 'El nombre del rol es requerido';
    }
    return errors;
  };

  // Function to save a role (create or update)
  const handleSaveRole = async () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      if (currentRole.id) {
        // Update existing role using the service
        await rolesService.update(currentRole.id, currentRole);

        // Show success message with SweetAlert2
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `El rol "${currentRole.nombre}" ha sido actualizado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        // Create new role using the service
        await rolesService.create(currentRole);

        // Show success message with SweetAlert2
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: `El rol "${currentRole.nombre}" ha sido creado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      }

      // Reload the roles for the current page
      await fetchRoles(currentPage, itemsPerPage, searchTerm, nombreFilter, descripcionFilter);

      // Close the modal
      setShowModal(false);
    } catch (err) {
      console.error('Error al guardar rol:', err);

      // Show error message with SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al guardar el rol. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });

      setFormErrors({
        api: err.response?.data?.error || 'Error al guardar el rol. Por favor, intente nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Function to open the delete confirmation modal
  const handleOpenDeleteModal = (role) => {
    console.log('Solicitando confirmación para eliminar:', role);

    // Use SweetAlert2 for confirmation
    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el rol "${role.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // If the user confirms, proceed to delete
        deleteRole(role);
      }
    });
  };

  // Function to delete a role and handle pagination
  const deleteRole = async (role) => {
    try {
      // Show loading indicator
      Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Use the service to delete
      await rolesService.delete(role.id);

      // Check if the current page is empty after deletion
      const remainingItems = filteredRoles.length - 1;
      const newPage = remainingItems === 0 && currentPage > 1 ? currentPage - 1 : currentPage;

      // Reload the roles for the current or previous page
      await fetchRoles(newPage, itemsPerPage, searchTerm, nombreFilter, descripcionFilter);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: `El rol "${role.nombre}" ha sido eliminado correctamente.`,
        confirmButtonColor: '#321fdb',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error al eliminar rol:', err);

      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al eliminar el rol. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  // Function to apply filters
  const applyFilters = () => {
    fetchRoles(1, itemsPerPage, searchTerm, nombreFilter, descripcionFilter);
  };

  // Update isFilterActive whenever filters change
  useEffect(() => {
    setIsFilterActive(
      searchTerm.trim() !== '' || nombreFilter.trim() !== '' || descripcionFilter.trim() !== ''
    );
  }, [searchTerm, nombreFilter, descripcionFilter]);

  console.log('Renderizando componente Roles', { roles, loading, error })

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Gestión de Roles</strong>
          <CButton 
            color="primary" 
            className="float-end me-2"
            onClick={handleOpenCreateModal}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Nuevo Rol
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CInputGroup>
                <CFormInput
                  placeholder="Buscar roles..."
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
          ) : filteredRoles.length > 0 ? (
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
                  {filteredRoles.map((role, index) => (
                    <RoleRow
                      key={role.id}
                      role={role}
                      index={index}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteModal}
                    />
                  ))}
                </CTableBody>
              </CTable>

              {/* Paginación */}
              <div className="d-flex justify-content-center mt-3">
                <CPagination aria-label="Navegación de páginas">
                  <CPaginationItem
                    aria-label="Anterior"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    &laquo;
                  </CPaginationItem>

                  {/* Mostrar números de página */}
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
                  Mostrando {filteredRoles.length} de {totalItems} roles
                </small>
              </div>
            </>
          ) : (
            <CAlert color="info">No hay roles disponibles. Cree uno nuevo haciendo clic en el botón "Nuevo Rol".</CAlert>
          )}

          {/* Modal de creación/edición */}
          {showModal && (
            <Suspense fallback={<div className="text-center my-3"><CSpinner /></div>}>
              <RoleModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                title={modalTitle}
                role={currentRole}
                errors={formErrors}
                submitting={submitting}
                onChange={handleInputChange}
                onSave={handleSaveRole}
              />
            </Suspense>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Roles