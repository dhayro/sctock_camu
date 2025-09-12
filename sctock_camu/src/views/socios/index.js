import React, { useState, useEffect, useRef } from 'react'
import sociosService from '../../services/api/socioService';
import parcelasService from '../../services/api/parcelaService';
import CIcon from '@coreui/icons-react'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx';
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
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel
} from '@coreui/react'
import { cilPencil, cilTrash, cilPlus, cilSearch, cilFilter, cilFilterX, cilCloudUpload, cilFolderOpen, cilMap, cilCopy } from '@coreui/icons'
import { debounce } from 'lodash'

// Define el componente SocioRow
const SocioRow = ({ socio, index, currentPage, itemsPerPage, onEdit, onDelete, onManageParcelas }) => {
  return (
    <CTableRow>
      <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
      <CTableDataCell>{socio.codigo}</CTableDataCell>
      <CTableDataCell>{socio.dni}</CTableDataCell>
      <CTableDataCell>{socio.nombres}</CTableDataCell>
      <CTableDataCell>{socio.apellidos}</CTableDataCell>
      <CTableDataCell>{socio.caserio || '-'}</CTableDataCell>
      <CTableDataCell>{socio.certificado ? 'Sí' : 'No'}</CTableDataCell>
      <CTableDataCell>
        <CButton color="success" size="sm" className="me-2" onClick={() => onManageParcelas(socio)}>
          <CIcon icon={cilMap} />
        </CButton>
        <CButton color="info" size="sm" className="me-2" onClick={() => onEdit(socio)}>
          <CIcon icon={cilPencil} />
        </CButton>
        <CButton color="danger" size="sm" onClick={() => onDelete(socio)}>
          <CIcon icon={cilTrash} />
        </CButton>
      </CTableDataCell>
    </CTableRow>
  );
};

// Componente para mostrar las parcelas de un socio
const ParcelaRow = ({ parcela, index, onEdit, onDelete, onClone }) => {
  return (
    <CTableRow>
      <CTableDataCell>{index + 1}</CTableDataCell>
      <CTableDataCell>{parcela.codigo}</CTableDataCell>
      <CTableDataCell>{parcela.hectarias}</CTableDataCell>
      <CTableDataCell>{parcela.volumen}</CTableDataCell>
      <CTableDataCell>{parcela.periodo}</CTableDataCell>
      <CTableDataCell>{parcela.tipo_lote}</CTableDataCell>
      <CTableDataCell>{parcela.fecha_inicio ? new Date(parcela.fecha_inicio).toLocaleDateString() : '-'}</CTableDataCell>
      <CTableDataCell>{parcela.fecha_fin ? new Date(parcela.fecha_fin).toLocaleDateString() : '-'}</CTableDataCell>
      <CTableDataCell>{parcela.estado ? 'Activa' : 'Inactiva'}</CTableDataCell>
      <CTableDataCell>
        <CButton color="warning" size="sm" className="me-2" onClick={() => onClone(parcela)}>
          <CIcon icon={cilCopy} />
        </CButton>
        <CButton color="info" size="sm" className="me-2" onClick={() => onEdit(parcela)}>
          <CIcon icon={cilPencil} />
        </CButton>
        <CButton color="danger" size="sm" onClick={() => onDelete(parcela)}>
          <CIcon icon={cilTrash} />
        </CButton>
      </CTableDataCell>
    </CTableRow>
  );
};

// Modal para gestionar parcelas
const ParcelasModal = ({ visible, onClose, socio, parcelas, loading, onCreateParcela, onEditParcela, onDeleteParcela, onCloneParcela }) => {
  return (
    <CModal visible={visible} onClose={onClose} size="xl">
      <CModalHeader>
        <CModalTitle>Parcelas de {socio?.nombres} {socio?.apellidos}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6>Código del Socio: {socio?.codigo}</h6>
          <CButton color="primary" onClick={onCreateParcela}>
            <CIcon icon={cilPlus} className="me-2" />
            Nueva Parcela
          </CButton>
        </div>

        {loading ? (
          <div className="text-center my-3">
            <CSpinner />
          </div>
        ) : parcelas.length > 0 ? (
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Código</CTableHeaderCell>
                <CTableHeaderCell>Hectáreas</CTableHeaderCell>
                <CTableHeaderCell>Volumen</CTableHeaderCell>
                <CTableHeaderCell>Período</CTableHeaderCell>
                <CTableHeaderCell>Tipo Lote</CTableHeaderCell>
                <CTableHeaderCell>Fecha Inicio</CTableHeaderCell>
                <CTableHeaderCell>Fecha Fin</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {parcelas.map((parcela, index) => (
                <ParcelaRow
                  key={parcela.id}
                  parcela={parcela}
                  index={index}
                  onEdit={onEditParcela}
                  onDelete={onDeleteParcela}
                  onClone={onCloneParcela}
                />
              ))}
            </CTableBody>
          </CTable>
        ) : (
          <CAlert color="info">
            Este socio no tiene parcelas registradas. Haga clic en "Nueva Parcela" para agregar una.
          </CAlert>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

// Modal para crear/editar parcela
const ParcelaFormModal = ({ visible, onClose, title, parcela, errors, submitting, onChange, onSave }) => {
  const hectariasInputRef = useRef(null);

  useEffect(() => {
    if (visible && hectariasInputRef.current) {
      hectariasInputRef.current.focus();
    }
  }, [visible]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      onSave();
    }
  };

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm onKeyDown={handleKeyDown}>
          <div className="mb-3">
            <CFormLabel htmlFor="hectarias">Hectáreas *</CFormLabel>
            <CFormInput
              type="number"
              step="0.01"
              className={errors.hectarias ? 'is-invalid' : ''}
              id="hectarias"
              name="hectarias"
              value={parcela.hectarias || ''}
              onChange={onChange}
              ref={hectariasInputRef}
            />
            {errors.hectarias && <div className="invalid-feedback">{errors.hectarias}</div>}
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="volumen">Volumen *</CFormLabel>
            <CFormInput
              type="number"
              step="0.01"
              className={errors.volumen ? 'is-invalid' : ''}
              id="volumen"
              name="volumen"
              value={parcela.volumen || ''}
              onChange={onChange}
            />
            {errors.volumen && <div className="invalid-feedback">{errors.volumen}</div>}
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="periodo">Período *</CFormLabel>
            <CFormInput
              type="text"
              className={errors.periodo ? 'is-invalid' : ''}
              id="periodo"
              name="periodo"
              value={parcela.periodo || ''}
              onChange={onChange}
              placeholder="Ej: 2024"
            />
            {errors.periodo && <div className="invalid-feedback">{errors.periodo}</div>}
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="tipo_lote">Tipo de Lote</CFormLabel>
            <CFormSelect
              id="tipo_lote"
              name="tipo_lote"
              value={parcela.tipo_lote || ''}
              onChange={onChange}
            >
              <option value="">Seleccionar tipo</option>
              <option value="Convencional">Convencional</option>
              <option value="Orgánico">Orgánico</option>
              <option value="En transición">En transición</option>
            </CFormSelect>
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="fecha_inicio">Fecha de Inicio</CFormLabel>
            <CFormInput
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={parcela.fecha_inicio || ''}
              onChange={onChange}
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="fecha_fin">Fecha de Fin</CFormLabel>
            <CFormInput
              type="date"
              id="fecha_fin"
              name="fecha_fin"
              value={parcela.fecha_fin || ''}
              onChange={onChange}
            />
          </div>

          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="estado"
                name="estado"
                checked={parcela.estado || false}
                onChange={(e) => onChange({ target: { name: 'estado', value: e.target.checked } })}
              />
              <CFormLabel className="form-check-label" htmlFor="estado">
                Parcela Activa
              </CFormLabel>
            </div>
          </div>

          {errors.api && <CAlert color="danger">{errors.api}</CAlert>}
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancelar
        </CButton>
        <CButton
          color="primary"
          onClick={onSave}
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};


// Update the SocioModal component
const SocioModal = ({ visible, onClose, title, socio, errors, submitting, onChange, onSave }) => {
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
                <label htmlFor="codigo" className="form-label">Código</label>
                <input
                  type="text"
                  className={`form-control ${errors.codigo ? 'is-invalid' : ''}`}
                  id="codigo"
                  name="codigo"
                  value={socio.codigo}
                  onChange={onChange}
                  ref={nombreInputRef}
                />
                {errors.codigo && <div className="invalid-feedback">{errors.codigo}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="dni" className="form-label">DNI</label>
                <input
                  type="text"
                  className={`form-control ${errors.dni ? 'is-invalid' : ''}`}
                  id="dni"
                  name="dni"
                  value={socio.dni || ''}
                  onChange={onChange}
                  maxLength={8} // Restrict to 8 characters
                />
                {errors.dni && <div className="invalid-feedback">{errors.dni}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="nombres" className="form-label">Nombres</label>
                <input
                  type="text"
                  className={`form-control ${errors.nombres ? 'is-invalid' : ''}`}
                  id="nombres"
                  name="nombres"
                  value={socio.nombres}
                  onChange={onChange}
                />
                {errors.nombres && <div className="invalid-feedback">{errors.nombres}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="apellidos" className="form-label">Apellidos</label>
                <input
                  type="text"
                  className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`}
                  id="apellidos"
                  name="apellidos"
                  value={socio.apellidos}
                  onChange={onChange}
                />
                {errors.apellidos && <div className="invalid-feedback">{errors.apellidos}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="caserio" className="form-label">Caserío</label>
                <input
                  type="text"
                  className="form-control"
                  id="caserio"
                  name="caserio"
                  value={socio.caserio || ''}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="certificado" className="form-label">Certificado</label>
                <input
                  type="checkbox"
                  id="certificado"
                  name="certificado"
                  checked={socio.certificado || false}
                  onChange={(e) => onChange({ target: { name: 'certificado', value: e.target.checked } })}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="direccion" className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  id="direccion"
                  name="direccion"
                  value={socio.direccion || ''}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="telefono" className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  id="telefono"
                  name="telefono"
                  value={socio.telefono || ''}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={socio.email || ''}
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

const ListaSocios = () => {
  const [socios, setSocios] = useState([]);
  const [filteredSocios, setFilteredSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentSocio, setCurrentSocio] = useState({ codigo: '', dni: '', nombres: '', apellidos: '', caserio: '', certificado: false, direccion: '', telefono: '', email: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginatedSocios, setPaginatedSocios] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [codigoFilter, setCodigoFilter] = useState('');
  const [dniFilter, setDniFilter] = useState('');
  const [nombresFilter, setNombresFilter] = useState('');
  const [apellidosFilter, setApellidosFilter] = useState('');
  const [caserioFilter, setCaserioFilter] = useState('');
  const [certificadoFilter, setCertificadoFilter] = useState('');

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const filterInputRef = useRef(null);

  const [showCertificadoFilter, setShowCertificadoFilter] = useState(false); // State to toggle dropdown visibility

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
    fetchSocios();
  }, []);

  useEffect(() => {
    const filtered = socios.filter(socio =>
      (socio.codigo || '').toLowerCase().includes(codigoFilter.toLowerCase()) &&
      (socio.dni || '').toLowerCase().includes(dniFilter.toLowerCase()) &&
      (socio.nombres || '').toLowerCase().includes(nombresFilter.toLowerCase()) &&
      (socio.apellidos || '').toLowerCase().includes(apellidosFilter.toLowerCase()) &&
      (socio.caserio || '').toLowerCase().includes(caserioFilter.toLowerCase()) &&
      (certificadoFilter === '' || (certificadoFilter === 'sí' && socio.certificado) || (certificadoFilter === 'no' && !socio.certificado))
    );
    setFilteredSocios(filtered);
  }, [socios, codigoFilter, dniFilter, nombresFilter, apellidosFilter, caserioFilter, certificadoFilter]);

  const fetchSocios = async (page = 1, itemsPerPage = 10, searchTerm = '', codigo = '', dni = '', nombres = '', apellidos = '', caserio = '', certificado = '') => {
    setLoading(true);
    setError(null);
    try {
      // Convert certificado to a boolean if it's not an empty string
      const certificadoFilter = certificado !== '' ? (certificado === 'sí') : undefined;

      const response = await sociosService.getAllSocios({ page, itemsPerPage, search: searchTerm, codigo, dni, nombres, apellidos, caserio, certificado: certificadoFilter });
      if (response && Array.isArray(response.socios)) {
        setSocios(response.socios);
        setPaginatedSocios(response.socios);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
        setCurrentPage(response.currentPage || 1);
      } else {
        console.error('Unexpected response format:', response);
        setError('Unexpected response format. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error fetching socios:', err);
      setError('Error loading socios. Please try again.');

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load socios. Please try again.',
        confirmButtonColor: '#321fdb'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchSocios(page, itemsPerPage, searchTerm, codigoFilter, dniFilter, nombresFilter, apellidosFilter, caserioFilter, certificadoFilter);
  };

  const debouncedFetchSocios = useRef(debounce((search, codigo, dni, nombres, apellidos, caserio, certificado) => {
    fetchSocios(1, itemsPerPage, search, codigo, dni, nombres, apellidos, caserio, certificado);
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
    debouncedFetchSocios(searchTerm, codigoFilter, dniFilter, nombresFilter, apellidosFilter, caserioFilter, certificadoFilter);
  }, [searchTerm, codigoFilter, dniFilter, nombresFilter, apellidosFilter, caserioFilter, certificadoFilter]);

  const handleSearch = () => {
    fetchSocios(1, itemsPerPage, searchTerm, codigoFilter, dniFilter, nombresFilter, apellidosFilter, caserioFilter, certificadoFilter);
  };

  const clearFilters = () => {
    setCodigoFilter('');
    setDniFilter('');
    setNombresFilter('');
    setApellidosFilter('');
    setCaserioFilter('');
    setCertificadoFilter('');
    setSearchTerm('');
    fetchSocios(1, itemsPerPage, '', '', '', '', '', '', '');
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchSocios(1, itemsPerPage, '', codigoFilter, dniFilter, nombresFilter, apellidosFilter, caserioFilter, certificadoFilter);
  };

  const handleOpenCreateModal = () => {
    console.log('Abriendo modal de creación');
    setCurrentSocio({ codigo: '', dni: '', nombres: '', apellidos: '', caserio: '', certificado: false, direccion: '', telefono: '', email: '' });
    setFormErrors({});
    setModalTitle('Crear Nuevo Socio');
    setShowModal(true);
  };

  const handleOpenEditModal = (socio) => {
    console.log('Abriendo modal de edición para:', socio);
    setCurrentSocio({ ...socio });
    setFormErrors({});
    setModalTitle('Editar Socio');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Restrict DNI input to numbers only and limit to 8 characters
    if (name === 'dni' && (!/^\d*$/.test(value) || value.length > 8)) {
      return;
    }

    setCurrentSocio({ ...currentSocio, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  // Update the validateForm function
  const validateForm = () => {
    const errors = {};
    if (!currentSocio.codigo || currentSocio.codigo.trim() === '') {
      errors.codigo = 'El código del socio es requerido';
    }
    if (currentSocio.dni && (!/^\d{8}$/.test(currentSocio.dni))) {
      errors.dni = 'El DNI debe tener exactamente 8 dígitos numéricos';
    }
    if (!currentSocio.nombres || currentSocio.nombres.trim() === '') {
      errors.nombres = 'Los nombres del socio son requeridos';
    }
    if (!currentSocio.apellidos || currentSocio.apellidos.trim() === '') {
      errors.apellidos = 'Los apellidos del socio son requeridos';
    }
    return errors;
  };

  const handleSaveSocio = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      if (currentSocio.id) {
        await sociosService.updateSocio(currentSocio.id, currentSocio);

        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `El socio "${currentSocio.nombres} ${currentSocio.apellidos}" ha sido actualizado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        await sociosService.createSocio(currentSocio);

        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: `El socio "${currentSocio.nombres} ${currentSocio.apellidos}" ha sido creado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      }

      await fetchSocios(currentPage, itemsPerPage, searchTerm, codigoFilter, dniFilter, nombresFilter, apellidosFilter, caserioFilter, certificadoFilter);
      setShowModal(false);
    } catch (err) {
      console.error('Error al guardar socio:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al guardar el socio. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });

      setFormErrors({
        api: err.response?.data?.error || 'Error al guardar el socio. Por favor, intente nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (socio) => {
    console.log('Solicitando confirmación para eliminar:', socio);

    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el socio "${socio.nombres} ${socio.apellidos}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSocio(socio);
      }
    });
  };

  const deleteSocio = async (socio) => {
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

      await sociosService.deleteSocio(socio.id);

      const remainingItems = filteredSocios.length - 1;
      const newPage = remainingItems === 0 && currentPage > 1 ? currentPage - 1 : currentPage;

      await fetchSocios(newPage, itemsPerPage, searchTerm, codigoFilter, dniFilter, nombresFilter, apellidosFilter, caserioFilter, certificadoFilter);

      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: `El socio "${socio.nombres} ${socio.apellidos}" ha sido eliminado correctamente.`,
        confirmButtonColor: '#321fdb',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error al eliminar socio:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al eliminar el socio. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const handleCertificadoFilterChange = (e) => {
    setCertificadoFilter(e.target.value);
  };

  const toggleCertificadoFilter = () => {
    setActiveFilter(activeFilter === 'certificado' ? null : 'certificado');
  };

  const applyFilters = () => {
    fetchSocios(1, itemsPerPage, searchTerm, codigoFilter, dniFilter, nombresFilter, apellidosFilter, caserioFilter, certificadoFilter);
  };

  useEffect(() => {
    setIsFilterActive(
      searchTerm.trim() !== '' ||
      codigoFilter.trim() !== '' ||
      dniFilter.trim() !== '' ||
      nombresFilter.trim() !== '' ||
      apellidosFilter.trim() !== '' ||
      caserioFilter.trim() !== '' ||
      certificadoFilter.trim() !== ''
    );
  }, [searchTerm, codigoFilter, dniFilter, nombresFilter, apellidosFilter, caserioFilter, certificadoFilter]);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('Archivo seleccionado:', file.name);
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay archivo seleccionado',
        text: 'Por favor, seleccione un archivo antes de cargar.',
        confirmButtonColor: '#321fdb'
      });
      return;
    }

    setLoadingUpload(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const expectedColumns = ['codigo', 'dni', 'nombres', 'apellidos', 'caserio', 'certificado', 'direccion', 'telefono', 'email'];
      const fileColumns = jsonData[0];
      const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col));

      if (missingColumns.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error en la plantilla',
          text: `Las siguientes columnas faltan en la plantilla: ${missingColumns.join(', ')}`,
          confirmButtonColor: '#321fdb'
        });
        setLoadingUpload(false);
        return;
      }

      const sociosData = XLSX.utils.sheet_to_json(worksheet);
      for (const socio of sociosData) {
        try {
          await sociosService.createSocio(socio);
          console.log(`Socio creado: ${socio.nombres} ${socio.apellidos}`);
        } catch (error) {
          console.error('Error al crear socio:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Error al crear el socio ${socio.nombres} ${socio.apellidos}.`,
            confirmButtonColor: '#321fdb'
          });
        }
      }

      await fetchSocios(currentPage, itemsPerPage, searchTerm, codigoFilter, dniFilter, nombresFilter, apellidosFilter, caserioFilter, certificadoFilter);
      setSelectedFile(null);
      fileInputRef.current.value = null; // Restablece el valor del input de archivo
      setLoadingUpload(false);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  console.log('Renderizando componente Socios', { socios, loading, error })

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Gestión de Socios</strong>
          <div className="d-flex justify-content-end align-items-center">
            <a
              href="/templates/plantilla_socios.xlsx"
              download
              className="btn btn-outline-secondary me-2"
            >
              Descargar Plantilla
            </a>
            <CButton
              color="secondary"
              className="me-2"
              onClick={() => fileInputRef.current.click()}
            >
              <CIcon icon={cilFolderOpen} className="me-2" />
              Seleccionar Archivo
            </CButton>
            {selectedFile && (
              <CButton
                color="success"
                onClick={handleFileUpload}
                disabled={loadingUpload}
              >
                {loadingUpload ? (
                  <CSpinner size="sm" />
                ) : (
                  <CIcon icon={cilCloudUpload} className="me-2" />
                )}
                {loadingUpload ? 'Cargando...' : 'Cargar Datos'}
              </CButton>
            )}
            <CButton
              color="primary"
              className="me-2"
              onClick={handleOpenCreateModal}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Nuevo Socio
            </CButton>
          </div>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileSelect}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CInputGroup>
                <CFormInput
                  placeholder="Buscar socios..."
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
            <CCol md={4}>
              <CInputGroup>
                {activeFilter === 'certificado' && (
                  <CFormSelect
                    value={certificadoFilter}
                    onChange={handleCertificadoFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="sí">Sí</option>
                    <option value="no">No</option>
                  </CFormSelect>
                )}
                {activeFilter && activeFilter !== 'certificado' && (
                  <CFormInput
                    ref={filterInputRef}
                    placeholder={`Filtrar por ${activeFilter}...`}
                    value={
                      activeFilter === 'codigo' ? codigoFilter :
                        activeFilter === 'dni' ? dniFilter :
                          activeFilter === 'nombres' ? nombresFilter :
                            activeFilter === 'apellidos' ? apellidosFilter :
                              activeFilter === 'caserio' ? caserioFilter :
                                certificadoFilter
                    }
                    onChange={handleFilterInputChange(
                      activeFilter === 'codigo' ? setCodigoFilter :
                        activeFilter === 'dni' ? setDniFilter :
                          activeFilter === 'nombres' ? setNombresFilter :
                            activeFilter === 'apellidos' ? setApellidosFilter :
                              activeFilter === 'caserio' ? setCaserioFilter :
                                setCertificadoFilter
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
          ) : filteredSocios.length > 0 ? (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Código
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'codigo' ? null : 'codigo')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
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
                      Nombres
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'nombres' ? null : 'nombres')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Apellidos
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'apellidos' ? null : 'apellidos')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Caserío
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'caserio' ? null : 'caserio')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Certificado
                      <CButton
                        color="link"
                        onClick={toggleCertificadoFilter}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredSocios.map((socio, index) => (
                    <SocioRow
                      key={socio.id}
                      socio={socio}
                      index={index}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteModal}
                      // onManageParcelas={handleManageParcelas}
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
                  Mostrando {filteredSocios.length} de {totalItems} socios
                </small>
              </div>
            </>
          ) : (
            <CAlert color="info">No hay socios disponibles. Cree uno nuevo haciendo clic en el botón "Nuevo Socio".</CAlert>
          )}

          {showModal && (
            <SocioModal
              visible={showModal}
              onClose={() => setShowModal(false)}
              title={modalTitle}
              socio={currentSocio}
              errors={formErrors}
              submitting={submitting}
              onChange={handleInputChange}
              onSave={handleSaveSocio}
            />
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default ListaSocios