import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import personalService from '../../services/api/personalService';
import cargoService from '../../services/api/cargosService';
import areaService from '../../services/api/areasService';
import usuarioService from '../../services/api/usuarioService';
import rolesService from '../../services/api/rolesService';
import CIcon from '@coreui/icons-react'
import Swal from 'sweetalert2'
import Select from 'react-select';
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
import { cilPencil, cilTrash, cilPlus, cilSearch, cilFilter, cilFilterX, cilUserPlus, cilUserX } from '@coreui/icons'
import { debounce } from 'lodash'

const formatText = (text) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
};

const PersonalRow = ({ personal, index, currentPage, itemsPerPage, onEdit, onDelete, onUserAction }) => {
  const hasAccess = personal.usuario && personal.usuario.usuario !== 'sin acceso';

  return (
    <CTableRow>
      <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
      <CTableDataCell>{personal.dni}</CTableDataCell>
      <CTableDataCell>{personal.nombre}</CTableDataCell>
      <CTableDataCell>{personal.apellido}</CTableDataCell>
      <CTableDataCell>{personal.email}</CTableDataCell>
      <CTableDataCell>{personal.cargo?.nombre || 'N/A'}</CTableDataCell>
      <CTableDataCell>{personal.area?.nombre || 'N/A'}</CTableDataCell>
      <CTableDataCell>
        <CButton
          color={hasAccess ? 'success' : 'danger'}
          size="sm"
          onClick={() => onUserAction(personal)}
        >
          <CIcon icon={hasAccess ? cilUserPlus : cilUserX} />
          {hasAccess ? personal.usuario.usuario : 'sin acceso'}
        </CButton>
      </CTableDataCell>
      <CTableDataCell>
        <CButton
          color="info"
          size="sm"
          className="me-2"
          onClick={() => onEdit(personal)}
        >
          <CIcon icon={cilPencil} />
        </CButton>
        <CButton
          color="danger"
          size="sm"
          onClick={() => onDelete(personal)}
        >
          <CIcon icon={cilTrash} />
        </CButton>
      </CTableDataCell>
    </CTableRow>
  );
};

const PersonalModal = ({ visible, onClose, title, personal, errors, submitting, onChange, onSave, cargos, areas }) => {
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

  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    onChange({ target: { name, value: selectedOption ? selectedOption.value : '' } });
  };

  const getSelectedOption = (options, id) => {
    return options.find(option => option.value === id) || null;
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
                <label htmlFor="dni" className="form-label">DNI</label>
                <input
                  type="text"
                  className={`form-control ${errors.dni ? 'is-invalid' : ''}`}
                  id="dni"
                  name="dni"
                  value={personal.dni || ''}
                  onChange={onChange}
                />
                {errors.dni && <div className="invalid-feedback">{errors.dni}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input
                  type="text"
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  id="nombre"
                  name="nombre"
                  value={personal.nombre || ''}
                  onChange={onChange}
                  ref={nombreInputRef}
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="apellido" className="form-label">Apellido</label>
                <input
                  type="text"
                  className={`form-control ${errors.apellido ? 'is-invalid' : ''}`}
                  id="apellido"
                  name="apellido"
                  value={personal.apellido || ''}
                  onChange={onChange}
                />
                {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={personal.email || ''}
                  onChange={onChange}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="cargo_id" className="form-label">Cargo</label>
                <Select
                  className={`basic-single ${errors.cargo_id ? 'is-invalid' : ''}`}
                  classNamePrefix="select"
                  isClearable
                  isSearchable
                  name="cargo_id"
                  options={cargos.map(cargo => ({ value: cargo.id, label: cargo.nombre }))}
                  value={getSelectedOption(cargos.map(cargo => ({ value: cargo.id, label: cargo.nombre })), personal.cargo_id)}
                  onChange={handleSelectChange}
                  placeholder="Seleccionar"
                />
                {errors.cargo_id && <div className="invalid-feedback">{errors.cargo_id}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="area_id" className="form-label">Área</label>
                <Select
                  className={`basic-single ${errors.area_id ? 'is-invalid' : ''}`}
                  classNamePrefix="select"
                  isClearable
                  isSearchable
                  name="area_id"
                  options={areas.map(area => ({ value: area.id, label: area.nombre }))}
                  value={getSelectedOption(areas.map(area => ({ value: area.id, label: area.nombre })), personal.area_id)}
                  onChange={handleSelectChange}
                  placeholder="Seleccionar"
                />
                {errors.area_id && <div className="invalid-feedback">{errors.area_id}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="telefono" className="form-label">Teléfono</label>
                <input
                  type="text"
                  className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                  id="telefono"
                  name="telefono"
                  value={personal.telefono || ''}
                  onChange={onChange}
                />
                {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="direccion" className="form-label">Dirección</label>
                <input
                  type="text"
                  className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                  id="direccion"
                  name="direccion"
                  value={personal.direccion || ''}
                  onChange={onChange}
                />
                {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
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

const Personal = () => {
  const [personalList, setPersonalList] = useState([]);
  const [filteredPersonal, setFilteredPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentPersonal, setCurrentPersonal] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    cargo_id: '',
    area_id: '',
    telefono: '',
    direccion: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginatedPersonal, setPaginatedPersonal] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [areas, setAreas] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [nombreFilter, setNombreFilter] = useState('');
  const [apellidoFilter, setApellidoFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [dniFilter, setDniFilter] = useState('');
  const [cargoFilter, setCargoFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [usuarioFilter, setUsuarioFilter] = useState('');

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const filterInputRef = useRef(null);

  const [showUserModal, setShowUserModal] = useState(false);

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
    fetchPersonal();
    fetchCargos();
    fetchAreas();
  }, []);

  useEffect(() => {
    const filtered = personalList.filter(personal => 
      personal.nombre.toLowerCase().includes(nombreFilter.toLowerCase()) &&
      personal.apellido.toLowerCase().includes(apellidoFilter.toLowerCase()) &&
      personal.email.toLowerCase().includes(emailFilter.toLowerCase()) &&
      personal.dni.toLowerCase().includes(dniFilter.toLowerCase()) &&
      personal.cargo?.nombre.toLowerCase().includes(cargoFilter.toLowerCase()) &&
      personal.area?.nombre.toLowerCase().includes(areaFilter.toLowerCase()) &&
      personal.usuario?.usuario.toLowerCase().includes(usuarioFilter.toLowerCase())
    );
    setFilteredPersonal(filtered);
  }, [personalList, nombreFilter, apellidoFilter, emailFilter, dniFilter, cargoFilter, areaFilter, usuarioFilter]);

  const fetchPersonal = async (page = 1, itemsPerPage = 10, searchTerm = '', nombre = '', apellido = '', email = '', dni = '', cargo = '', area = '', usuario = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await personalService.getAll({ page, itemsPerPage, search: searchTerm, nombre, apellido, email, dni, cargo, area, usuario });
      if (response.data && Array.isArray(response.data.personal)) {
        setPersonalList(response.data.personal);
        setPaginatedPersonal(response.data.personal);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Unexpected response format. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error fetching personal:', err);
      setError('Error loading personal. Please try again.');
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load personal. Please try again.',
        confirmButtonColor: '#321fdb'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCargos = async () => {
    try {
      const response = await cargoService.getAll();
      setCargos(response.data.cargos || []);
    } catch (err) {
      console.error('Error fetching cargos:', err);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await areaService.getAll();
      setAreas(response.data.areas || []);
    } catch (err) {
      console.error('Error fetching areas:', err);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchPersonal(page, itemsPerPage, searchTerm, nombreFilter, apellidoFilter, emailFilter, dniFilter, cargoFilter, areaFilter, usuarioFilter);
  };

  const debouncedFetchPersonal = useRef(debounce((search, nombre, apellido, email, dni, cargo, area, usuario) => {
    fetchPersonal(1, itemsPerPage, search, nombre, apellido, email, dni, cargo, area, usuario);
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
    debouncedFetchPersonal(searchTerm, nombreFilter, apellidoFilter, emailFilter, dniFilter, cargoFilter, areaFilter, usuarioFilter);
  }, [searchTerm, nombreFilter, apellidoFilter, emailFilter, dniFilter, cargoFilter, areaFilter, usuarioFilter]);

  const handleSearch = () => {
    fetchPersonal(1, itemsPerPage, searchTerm, nombreFilter, apellidoFilter, emailFilter, dniFilter, cargoFilter, areaFilter, usuarioFilter);
  };

  const clearFilters = () => {
    setNombreFilter('');
    setApellidoFilter('');
    setEmailFilter('');
    setDniFilter('');
    setCargoFilter('');
    setAreaFilter('');
    setUsuarioFilter('');
    setSearchTerm('');
    fetchPersonal(1, itemsPerPage, '', '', '', '', '', '', '', '');
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchPersonal(1, itemsPerPage, '', nombreFilter, apellidoFilter, emailFilter, dniFilter, cargoFilter, areaFilter, usuarioFilter);
  };

  const handleOpenCreateModal = () => {
    console.log('Abriendo modal de creación');
    setCurrentPersonal({ dni: '', nombre: '', apellido: '', email: '', cargo_id: '', area_id: '', telefono: '', direccion: '' });
    setFormErrors({});
    setModalTitle('Crear Nuevo Personal');
    setShowModal(true);
  };

  const handleOpenEditModal = (personal) => {
    console.log('Abriendo modal de edición para:', personal);
    setCurrentPersonal({ ...personal });
    setFormErrors({});
    setModalTitle('Editar Personal');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'dni') {
      if (!/^\d*$/.test(value) || value.length > 8) {
        return;
      }
    }

    setCurrentPersonal({ ...currentPersonal, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!currentPersonal.dni || currentPersonal.dni.trim() === '') {
      errors.dni = 'El DNI es requerido';
    } else if (currentPersonal.dni.length !== 8) {
      errors.dni = 'El DNI debe tener 8 dígitos';
    }
    if (!currentPersonal.nombre || currentPersonal.nombre.trim() === '') {
      errors.nombre = 'El nombre es requerido';
    }
    if (!currentPersonal.apellido || currentPersonal.apellido.trim() === '') {
      errors.apellido = 'El apellido es requerido';
    }
    if (!currentPersonal.email || currentPersonal.email.trim() === '') {
      errors.email = 'El email es requerido';
    }
    if (!currentPersonal.cargo_id) {
      errors.cargo_id = 'El cargo ID es requerido';
    }
    return errors;
  };

  const handleSavePersonal = async () => {
    const formattedPersonal = {
      ...currentPersonal,
      nombre: formatText(currentPersonal.nombre),
      apellido: formatText(currentPersonal.apellido),
      direccion: currentPersonal.direccion.trim(),
    };

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      if (formattedPersonal.id) {
        await personalService.update(formattedPersonal.id, formattedPersonal);

        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `El personal "${formattedPersonal.nombre}" ha sido actualizado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        await personalService.create(formattedPersonal);

        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: `El personal "${formattedPersonal.nombre}" ha sido creado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      }

      await fetchPersonal(currentPage, itemsPerPage, searchTerm, nombreFilter, apellidoFilter, emailFilter, dniFilter, cargoFilter, areaFilter, usuarioFilter);
      setShowModal(false);
    } catch (err) {
      console.error('Error al guardar personal:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al guardar el personal. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });

      setFormErrors({
        api: err.response?.data?.error || 'Error al guardar el personal. Por favor, intente nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (personal) => {
    console.log('Solicitando confirmación para eliminar:', personal);

    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar a "${personal.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deletePersonal(personal);
      }
    });
  };

  const deletePersonal = async (personal) => {
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

      await personalService.delete(personal.id);

      const remainingItems = filteredPersonal.length - 1;
      const newPage = remainingItems === 0 && currentPage > 1 ? currentPage - 1 : currentPage;

      await fetchPersonal(newPage, itemsPerPage, searchTerm, nombreFilter, apellidoFilter, emailFilter, dniFilter, cargoFilter, areaFilter, usuarioFilter);

      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: `El personal "${personal.nombre}" ha sido eliminado correctamente.`,
        confirmButtonColor: '#321fdb',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error al eliminar personal:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al eliminar el personal. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const applyFilters = () => {
    fetchPersonal(1, itemsPerPage, searchTerm, nombreFilter, apellidoFilter, emailFilter, dniFilter, cargoFilter, areaFilter, usuarioFilter);
  };

  useEffect(() => {
    setIsFilterActive(
      searchTerm.trim() !== '' || nombreFilter.trim() !== '' || apellidoFilter.trim() !== '' || emailFilter.trim() !== '' ||
      dniFilter.trim() !== '' || cargoFilter.trim() !== '' || areaFilter.trim() !== '' || usuarioFilter.trim() !== ''
    );
  }, [searchTerm, nombreFilter, apellidoFilter, emailFilter, dniFilter, cargoFilter, areaFilter, usuarioFilter]);

  const handleUserAction = (personal) => {
    setCurrentPersonal({
      ...personal,
      usuarioId: personal.usuario?.id || null, // Set usuarioId if it exists
    });
    setModalTitle(personal.usuario ? 'Modificar Usuario' : 'Crear Usuario');
    setShowUserModal(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (!currentPersonal.usuario) {
        const newUser = {
          personal_id: currentPersonal.id,
          usuario: userData.usuario,
          password: 'Coopay123',
          email: userData.email,
          rol_id: userData.rol_id,
        };
        await usuarioService.createUser(newUser);
      } else {
        const updatedUser = {
          rol_id: userData.rol_id,
          estado: userData.estado,
        };
        // Use usuarioId for updating the user
        await usuarioService.updateUser(currentPersonal.usuarioId, updatedUser);
      }

      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Los cambios han sido guardados correctamente.',
        confirmButtonColor: '#321fdb',
        timer: 2000,
        timerProgressBar: true
      });

      setShowUserModal(false);

      // Refresh the personal list to reflect the changes
      await fetchPersonal(currentPage, itemsPerPage, searchTerm, nombreFilter, apellidoFilter, emailFilter, dniFilter, cargoFilter, areaFilter, usuarioFilter);
    } catch (err) {
      console.error('Error al guardar usuario:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al guardar el usuario. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  console.log('Renderizando componente Personal', { personalList, loading, error })

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Gestión de Personal</strong>
          <CButton 
            color="primary" 
            className="float-end me-2"
            onClick={handleOpenCreateModal}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Nuevo Personal
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CInputGroup>
                <CFormInput
                  placeholder="Buscar personal..."
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
                    value={
                      activeFilter === 'nombre' ? nombreFilter :
                      activeFilter === 'apellido' ? apellidoFilter :
                      activeFilter === 'email' ? emailFilter :
                      activeFilter === 'dni' ? dniFilter :
                      activeFilter === 'cargo' ? cargoFilter :
                      activeFilter === 'area' ? areaFilter :
                      usuarioFilter
                    }
                    onChange={handleFilterInputChange(
                      activeFilter === 'nombre' ? setNombreFilter :
                      activeFilter === 'apellido' ? setApellidoFilter :
                      activeFilter === 'email' ? setEmailFilter :
                      activeFilter === 'dni' ? setDniFilter :
                      activeFilter === 'cargo' ? setCargoFilter :
                      activeFilter === 'area' ? setAreaFilter :
                      setUsuarioFilter
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
          ) : filteredPersonal.length > 0 ? (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      DNI
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'dni' ? null : 'dni')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
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
                      Apellido 
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'apellido' ? null : 'apellido')}
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
                      Cargo
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'cargo' ? null : 'cargo')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Área
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'area' ? null : 'area')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Usuario
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'usuario' ? null : 'usuario')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredPersonal.map((personal, index) => (
                    <PersonalRow
                      key={personal.id}
                      personal={personal}
                      index={index}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteModal}
                      onUserAction={handleUserAction}
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
                  Mostrando {filteredPersonal.length} de {totalItems} personal
                </small>
              </div>
            </>
          ) : (
            <CAlert color="info">No hay personal disponible. Cree uno nuevo haciendo clic en el botón "Nuevo Personal".</CAlert>
          )}

          {showModal && (
            <Suspense fallback={<div className="text-center my-3"><CSpinner /></div>}>
              <PersonalModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                title={modalTitle}
                personal={currentPersonal}
                errors={formErrors}
                submitting={submitting}
                onChange={handleInputChange}
                onSave={handleSavePersonal}
                cargos={cargos}
                areas={areas}
              />
            </Suspense>
          )}

          {showUserModal && (
            <UserModal
              visible={showUserModal}
              onClose={() => setShowUserModal(false)}
              title={modalTitle}
              personal={currentPersonal}
              onSave={handleSaveUser}
            />
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

const UserModal = ({ visible, onClose, title, personal, onSave }) => {
  const [userData, setUserData] = useState({
    usuario: personal.usuario?.usuario || '',
    password: 'Coopay123',
    email: personal.email || '',
    rol_id: personal.usuario?.rol?.id || '',
    estado: personal.usuario ? personal.usuario.estado : true,
  });

  const [roles, setRoles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const usuarioInputRef = useRef(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await rolesService.getAll();
        setRoles(response.data.roles || []);
      } catch (err) {
        console.error('Error al obtener roles:', err);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (visible && usuarioInputRef.current && !personal.usuario) {
      usuarioInputRef.current.focus();
    }
  }, [visible, personal.usuario]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleSelectChange = (selectedOption) => {
    setUserData({ ...userData, rol_id: selectedOption ? selectedOption.value : '' });

    if (formErrors.rol_id) {
      setFormErrors({ ...formErrors, rol_id: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!userData.usuario || userData.usuario.trim() === '') {
      errors.usuario = 'El usuario es requerido';
    }
    if (!userData.rol_id) {
      errors.rol_id = 'El rol es requerido';
    }
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    onSave(userData);
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
            <form>
              <div className="mb-3">
                <label htmlFor="usuario" className="form-label">Usuario</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.usuario ? 'is-invalid' : ''}`}
                  id="usuario"
                  name="usuario"
                  value={userData.usuario}
                  onChange={handleInputChange}
                  ref={usuarioInputRef}
                  disabled={!!personal.usuario}
                />
                {formErrors.usuario && <div className="invalid-feedback">{formErrors.usuario}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={userData.email}
                  readOnly
                />
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
                  value={roles.find(rol => rol.id === userData.rol_id) ? { value: userData.rol_id, label: roles.find(rol => rol.id === userData.rol_id).nombre } : null}
                  onChange={handleSelectChange}
                  placeholder="Seleccionar rol"
                />
                {formErrors.rol_id && <div className="invalid-feedback">{formErrors.rol_id}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="estado" className="form-label">Estado</label>
                <select
                  className="form-control"
                  id="estado"
                  name="estado"
                  value={userData.estado}
                  onChange={handleInputChange}
                >
                  <option value={true}>Activo</option>
                  <option value={false}>Inactivo</option>
                </select>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Personal