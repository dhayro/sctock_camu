import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select'; // Import react-select
import usuarioService from '../../services/api/usuarioService';
import rolesService from '../../services/api/rolesService';
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
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect,
} from '@coreui/react';
import { cilPencil, cilTrash, cilPlus, cilSearch, cilFilter, cilFilterX } from '@coreui/icons';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({ usuario: '', email: '', rol_id: '', password: 'Coopay123' });
  const [roles, setRoles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [nombreFilter, setNombreFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [personalFilter, setPersonalFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const filterInputRef = useRef(null);

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

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

  // Update isFilterActive whenever filters or searchTerm change
  useEffect(() => {
    setIsFilterActive(
      searchTerm.trim() !== '' || 
      nombreFilter.trim() !== '' || 
      emailFilter.trim() !== '' || 
      rolFilter.trim() !== '' || 
      personalFilter.trim() !== '' || 
      estadoFilter.trim() !== ''
    );
  }, [searchTerm, nombreFilter, emailFilter, rolFilter, personalFilter, estadoFilter]);

  // Call fetchUsuarios whenever any filter changes
  useEffect(() => {
    fetchUsuarios(1, itemsPerPage, searchTerm, nombreFilter, emailFilter, rolFilter, personalFilter, estadoFilter);
  }, [searchTerm, nombreFilter, emailFilter, rolFilter, personalFilter, estadoFilter]);

  const fetchUsuarios = async (page = 1, itemsPerPage = 10, searchTerm = '', nombreFilter = '', emailFilter = '', rolFilter = '', personalFilter = '', estadoFilter = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await usuarioService.getAllUsuarios({ page, itemsPerPage, search: searchTerm, usuario: nombreFilter, email: emailFilter, rol: rolFilter, personal: personalFilter, estado: estadoFilter });
      if (response && Array.isArray(response.usuarios)) {
        setUsuarios(response.usuarios);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
        setCurrentPage(response.currentPage || 1);
      } else {
        console.error('Unexpected response format:', response);
        setError('Unexpected response format. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error fetching usuarios:', err);
      setError('Error loading usuarios. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load usuarios. Please try again.',
        confirmButtonColor: '#321fdb'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await rolesService.getAll();
      if (Array.isArray(response.data.roles)) {
        setRoles(response.data.roles);
      } else {
        console.error('Unexpected roles response format:', response.data.roles);
        setRoles([]);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setRoles([]);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchUsuarios(page, itemsPerPage, searchTerm, nombreFilter, emailFilter, rolFilter, personalFilter, estadoFilter);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchUsuarios(1, itemsPerPage, value, nombreFilter, emailFilter, rolFilter, personalFilter, estadoFilter);
  };

  const handleEditUser = (usuario) => {
    setCurrentUser({
      ...usuario,
      rol_id: usuario.rol ? usuario.rol.id : '', // Ensure rol_id is set correctly
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = async (usuario) => {
    const confirmDelete = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el usuario "${usuario.usuario}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmDelete.isConfirmed) {
      try {
        await usuarioService.deleteUsuario(usuario.id);
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: `El usuario "${usuario.usuario}" ha sido eliminado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
        fetchUsuarios(currentPage, itemsPerPage, searchTerm, nombreFilter, emailFilter, rolFilter, personalFilter, estadoFilter);
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el usuario. Por favor, intente nuevamente.',
          confirmButtonColor: '#321fdb'
        });
      }
    }
  };

  const handleSaveUser = async () => {
    try {
      await usuarioService.updateUsuario(currentUser.id, currentUser);
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: `El usuario "${currentUser.usuario}" ha sido actualizado correctamente.`,
        confirmButtonColor: '#321fdb',
        timer: 2000,
        timerProgressBar: true
      });
      setShowEditModal(false);
      fetchUsuarios(currentPage, itemsPerPage, searchTerm, nombreFilter, emailFilter, rolFilter, personalFilter, estadoFilter);
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el usuario. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const handleCreateUser = async () => {
    const errors = validateForm(newUser);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await usuarioService.createUsuario(newUser);
      Swal.fire({
        icon: 'success',
        title: '¡Creado!',
        text: `El usuario "${newUser.usuario}" ha sido creado correctamente.`,
        confirmButtonColor: '#321fdb',
        timer: 2000,
        timerProgressBar: true
      });
      setShowCreateModal(false);
      fetchUsuarios(currentPage, itemsPerPage, searchTerm, nombreFilter, emailFilter, rolFilter, personalFilter, estadoFilter);
    } catch (err) {
      console.error('Error al crear usuario:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el usuario. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const handleResetPassword = async () => {
    const confirmReset = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea resetear la contraseña del usuario "${currentUser.usuario}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, resetear',
      cancelButtonText: 'Cancelar'
    });

    if (confirmReset.isConfirmed) {
      try {
        await usuarioService.resetPassword(currentUser.id);
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña Reseteada!',
          text: `La contraseña del usuario "${currentUser.usuario}" ha sido reseteada a "Coopay123".`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      } catch (err) {
        console.error('Error al resetear contraseña:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo resetear la contraseña. Por favor, intente nuevamente.',
          confirmButtonColor: '#321fdb'
        });
      }
    }
  };

  const handleSelectChange = (selectedOption, isNewUser = false) => {
    if (isNewUser) {
      setNewUser({ ...newUser, rol_id: selectedOption ? selectedOption.value : '' });
    } else {
      setCurrentUser({ ...currentUser, rol_id: selectedOption ? selectedOption.value : '' });
    }

    if (formErrors.rol_id) {
      setFormErrors({ ...formErrors, rol_id: null });
    }
  };

  const validateForm = (user) => {
    const errors = {};
    if (!user.usuario || user.usuario.trim() === '') {
      errors.usuario = 'El usuario es requerido';
    }
    if (!user.email || user.email.trim() === '') {
      errors.email = 'El email es requerido';
    }
    if (!user.rol_id) {
      errors.rol_id = 'El rol es requerido';
    }
    return errors;
  };

  const handleFilterInputChange = (setter) => (e) => {
    const value = e.target.value;
    setter(value);
  };

  const applyFilters = () => {
    fetchUsuarios(1, itemsPerPage, searchTerm, nombreFilter, emailFilter, rolFilter, personalFilter, estadoFilter);
  };

  const clearFilters = () => {
    setNombreFilter('');
    setEmailFilter('');
    setRolFilter('');
    setPersonalFilter('');
    setEstadoFilter('');
    setSearchTerm('');
    fetchUsuarios(1, itemsPerPage, '', '', '', '', '', '');
  };

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Gestión de Usuarios</strong>
          <CButton 
            color="primary" 
            className="float-end me-2"
            onClick={() => setShowCreateModal(true)}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Nuevo Usuario
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CInputGroup>
                <CFormInput
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <CButton color="primary" variant="outline" onClick={applyFilters}>
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
                    value={
                      activeFilter === 'nombre' ? nombreFilter :
                      activeFilter === 'email' ? emailFilter :
                      activeFilter === 'rol' ? rolFilter :
                      activeFilter === 'personal' ? personalFilter :
                      estadoFilter
                    }
                    onChange={handleFilterInputChange(
                      activeFilter === 'nombre' ? setNombreFilter :
                      activeFilter === 'email' ? setEmailFilter :
                      activeFilter === 'rol' ? setRolFilter :
                      activeFilter === 'personal' ? setPersonalFilter :
                      setEstadoFilter
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
          ) : usuarios.length > 0 ? (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Usuario
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'nombre' ? null : 'nombre')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Email
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'email' ? null : 'email')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Rol
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'rol' ? null : 'rol')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Personal
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'personal' ? null : 'personal')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Estado
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'estado' ? null : 'estado')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {usuarios.map((usuario, index) => (
                    <CTableRow key={usuario.id}>
                      <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
                      <CTableDataCell>{usuario.usuario}</CTableDataCell>
                      <CTableDataCell>{usuario.email}</CTableDataCell>
                      <CTableDataCell>{usuario.rol ? usuario.rol.nombre : '-'}</CTableDataCell>
                      <CTableDataCell>{usuario.personal ? `${usuario.personal.nombre} ${usuario.personal.apellido}` : '-'}</CTableDataCell>
                      <CTableDataCell>{usuario.estado ? 'Activo' : 'Inactivo'}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditUser(usuario)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(usuario)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
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
                  Mostrando {usuarios.length} de {totalItems} usuarios
                </small>
              </div>
            </>
          ) : (
            <CAlert color="info">No hay usuarios disponibles. Cree uno nuevo haciendo clic en el botón "Nuevo Usuario".</CAlert>
          )}
        </CCardBody>
      </CCard>

      {/* Modal de Creación de Usuario */}
      <CModal visible={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Crear Nuevo Usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label htmlFor="usuario" className="form-label">Usuario</label>
            <CFormInput
              id="usuario"
              value={newUser.usuario}
              onChange={(e) => setNewUser({ ...newUser, usuario: e.target.value })}
              invalid={!!formErrors.usuario}
            />
            {formErrors.usuario && <div className="invalid-feedback">{formErrors.usuario}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <CFormInput
              id="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              invalid={!!formErrors.email}
            />
            {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="rol_id" className="form-label">Rol</label>
            <Select
              className={`basic-single ${formErrors.rol_id ? 'is-invalid' : ''}`}
              classNamePrefix="select"
              isClearable
              isSearchable
              name="rol_id"
              options={roles.map(rol => ({ value: rol.id, label: rol.nombre }))}
              value={roles.find(rol => rol.id === newUser.rol_id) ? { value: newUser.rol_id, label: roles.find(rol => rol.id === newUser.rol_id).nombre } : null}
              onChange={(option) => handleSelectChange(option, true)}
              placeholder="Seleccionar rol"
            />
            {formErrors.rol_id && <div className="invalid-feedback">{formErrors.rol_id}</div>}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCreateModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleCreateUser}>
            Crear Usuario
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal de Edición de Usuario */}
      {currentUser && (
        <CModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
          <CModalHeader closeButton>
            <CModalTitle>Editar Usuario</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <label htmlFor="estado" className="form-label">Estado</label>
              <CFormSelect
                id="estado"
                value={currentUser.estado}
                onChange={(e) => setCurrentUser({ ...currentUser, estado: e.target.value })}
              >
                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </CFormSelect>
            </div>
            <div className="mb-3">
              <label htmlFor="rol_id" className="form-label">Rol</label>
              <Select
                className={`basic-single ${formErrors.rol_id ? 'is-invalid' : ''}`}
                classNamePrefix="select"
                isClearable
                isSearchable
                name="rol_id"
                options={roles.map(rol => ({ value: rol.id, label: rol.nombre }))}
                value={roles.find(rol => rol.id === currentUser.rol_id) ? { value: currentUser.rol_id, label: roles.find(rol => rol.id === currentUser.rol_id).nombre } : null}
                onChange={(option) => handleSelectChange(option)}
                placeholder="Seleccionar rol"
              />
              {formErrors.rol_id && <div className="invalid-feedback">{formErrors.rol_id}</div>}
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowEditModal(false)}>
              Cancelar
            </CButton>
            <CButton color="warning" onClick={handleResetPassword}>
              Resetear Contraseña
            </CButton>
            <CButton color="primary" onClick={handleSaveUser}>
              Guardar Cambios
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </>
  );
};

export default Usuarios;