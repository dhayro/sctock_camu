import React, { useState, useEffect, useRef } from 'react';
import clientesService from '../../services/api/clienteService'; // Asegúrate de que este servicio exista
import CIcon from '@coreui/icons-react';
import Swal from 'sweetalert2';
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
  CPaginationItem
} from '@coreui/react';
import { cilPencil, cilTrash, cilPlus, cilSearch, cilFilter, cilFilterX, cilCloudUpload, cilFolderOpen } from '@coreui/icons';
import { debounce } from 'lodash';

const ClienteRow = ({ cliente, index, currentPage, itemsPerPage, onEdit, onDelete }) => {
  return (
    <CTableRow>
      <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
      <CTableDataCell>{cliente.razon_social}</CTableDataCell>
      <CTableDataCell>{cliente.ruc}</CTableDataCell>
      <CTableDataCell>{cliente.direccion || '-'}</CTableDataCell>
      <CTableDataCell>{cliente.telefono || '-'}</CTableDataCell>
      <CTableDataCell>{cliente.email || '-'}</CTableDataCell>
      <CTableDataCell>
        <CButton color="info" size="sm" className="me-2" onClick={() => onEdit(cliente)}>
          <CIcon icon={cilPencil} />
        </CButton>
        <CButton color="danger" size="sm" onClick={() => onDelete(cliente)}>
          <CIcon icon={cilTrash} />
        </CButton>
      </CTableDataCell>
    </CTableRow>
  );
};

const ClienteModal = ({ visible, onClose, title, cliente, errors, submitting, onChange, onSave }) => {
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
                <label htmlFor="razon_social" className="form-label">Razón Social</label>
                <input
                  type="text"
                  className={`form-control ${errors.razon_social ? 'is-invalid' : ''}`}
                  id="razon_social"
                  name="razon_social"
                  value={cliente.razon_social}
                  onChange={onChange}
                  ref={nombreInputRef}
                />
                {errors.razon_social && <div className="invalid-feedback">{errors.razon_social}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="ruc" className="form-label">RUC</label>
                <input
                  type="text"
                  className={`form-control ${errors.ruc ? 'is-invalid' : ''}`}
                  id="ruc"
                  name="ruc"
                  value={cliente.ruc || ''}
                  onChange={onChange}
                  maxLength={11} // Restrict to 11 characters
                />
                {errors.ruc && <div className="invalid-feedback">{errors.ruc}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="direccion" className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  id="direccion"
                  name="direccion"
                  value={cliente.direccion || ''}
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
                  value={cliente.telefono || ''}
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
                  value={cliente.email || ''}
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

const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentCliente, setCurrentCliente] = useState({ razon_social: '', ruc: '', direccion: '', telefono: '', email: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginatedClientes, setPaginatedClientes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [razonSocialFilter, setRazonSocialFilter] = useState('');
  const [rucFilter, setRucFilter] = useState('');
  const [direccionFilter, setDireccionFilter] = useState('');

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const filterInputRef = useRef(null);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);

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
    fetchClientes();
  }, []);

  useEffect(() => {
    const filtered = clientes.filter(cliente => 
      (cliente.razon_social || '').toLowerCase().includes(razonSocialFilter.toLowerCase()) &&
      (cliente.ruc || '').toLowerCase().includes(rucFilter.toLowerCase()) &&
      (cliente.direccion || '').toLowerCase().includes(direccionFilter.toLowerCase())
    );
    setFilteredClientes(filtered);
  }, [clientes, razonSocialFilter, rucFilter, direccionFilter]);

  const fetchClientes = async (page = 1, itemsPerPage = 10, searchTerm = '', razon_social = '', ruc = '', direccion = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientesService.getAllClientes({ page, itemsPerPage, search: searchTerm, razon_social, ruc, direccion });
      if (response && Array.isArray(response.clientes)) {
        setClientes(response.clientes);
        setPaginatedClientes(response.clientes);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
        setCurrentPage(response.currentPage || 1);
      } else {
        console.error('Unexpected response format:', response);
        setError('Unexpected response format. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error fetching clientes:', err);
      setError('Error loading clientes. Please try again.');
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load clientes. Please try again.',
        confirmButtonColor: '#321fdb'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchClientes(page, itemsPerPage, searchTerm, razonSocialFilter, rucFilter, direccionFilter);
  };

  const debouncedFetchClientes = useRef(debounce((search, razon_social, ruc, direccion) => {
    fetchClientes(1, itemsPerPage, search, razon_social, ruc, direccion);
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
    debouncedFetchClientes(searchTerm, razonSocialFilter, rucFilter, direccionFilter);
  }, [searchTerm, razonSocialFilter, rucFilter, direccionFilter]);

  const handleSearch = () => {
    fetchClientes(1, itemsPerPage, searchTerm, razonSocialFilter, rucFilter, direccionFilter);
  };

  const clearFilters = () => {
    setRazonSocialFilter('');
    setRucFilter('');
    setDireccionFilter('');
    setSearchTerm('');
    fetchClientes(1, itemsPerPage, '', '', '', '');
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchClientes(1, itemsPerPage, '', razonSocialFilter, rucFilter, direccionFilter);
  };

  const handleOpenCreateModal = () => {
    console.log('Abriendo modal de creación');
    setCurrentCliente({ razon_social: '', ruc: '', direccion: '', telefono: '', email: '' });
    setFormErrors({});
    setModalTitle('Crear Nuevo Cliente');
    setShowModal(true);
  };

  const handleOpenEditModal = (cliente) => {
    console.log('Abriendo modal de edición para:', cliente);
    setCurrentCliente({ ...cliente });
    setFormErrors({});
    setModalTitle('Editar Cliente');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Restrict RUC input to numbers only and limit to 11 characters
    if (name === 'ruc' && (!/^\d*$/.test(value) || value.length > 11)) {
      return;
    }

    setCurrentCliente({ ...currentCliente, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!currentCliente.razon_social || currentCliente.razon_social.trim() === '') {
      errors.razon_social = 'La razón social del cliente es requerida';
    }
    if (!currentCliente.ruc || currentCliente.ruc.trim() === '') {
      errors.ruc = 'El RUC del cliente es requerido';
    } else if (!/^\d{11}$/.test(currentCliente.ruc)) {
      errors.ruc = 'El RUC debe tener exactamente 11 dígitos numéricos';
    }
    return errors;
  };

  const handleSaveCliente = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      if (currentCliente.id) {
        await clientesService.updateCliente(currentCliente.id, currentCliente);

        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `El cliente "${currentCliente.razon_social}" ha sido actualizado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        await clientesService.createCliente(currentCliente);

        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: `El cliente "${currentCliente.razon_social}" ha sido creado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      }

      await fetchClientes(currentPage, itemsPerPage, searchTerm, razonSocialFilter, rucFilter, direccionFilter);
      setShowModal(false);
    } catch (err) {
      console.error('Error al guardar cliente:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al guardar el cliente. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });

      setFormErrors({
        api: err.response?.data?.error || 'Error al guardar el cliente. Por favor, intente nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (cliente) => {
    console.log('Solicitando confirmación para eliminar:', cliente);

    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el cliente "${cliente.razon_social}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCliente(cliente);
      }
    });
  };

  const deleteCliente = async (cliente) => {
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

      await clientesService.deleteCliente(cliente.id);

      const remainingItems = filteredClientes.length - 1;
      const newPage = remainingItems === 0 && currentPage > 1 ? currentPage - 1 : currentPage;

      await fetchClientes(newPage, itemsPerPage, searchTerm, razonSocialFilter, rucFilter, direccionFilter);

      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: `El cliente "${cliente.razon_social}" ha sido eliminado correctamente.`,
        confirmButtonColor: '#321fdb',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error al eliminar cliente:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al eliminar el cliente. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const applyFilters = () => {
    fetchClientes(1, itemsPerPage, searchTerm, razonSocialFilter, rucFilter, direccionFilter);
  };

  useEffect(() => {
    setIsFilterActive(
      searchTerm.trim() !== '' || 
      razonSocialFilter.trim() !== '' || 
      rucFilter.trim() !== '' || 
      direccionFilter.trim() !== ''
    );
  }, [searchTerm, razonSocialFilter, rucFilter, direccionFilter]);

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

      const expectedColumns = ['razon_social', 'ruc', 'direccion', 'telefono', 'email'];
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

      const clientesData = XLSX.utils.sheet_to_json(worksheet);
      for (const cliente of clientesData) {
        try {
          await clientesService.createCliente(cliente);
          console.log(`Cliente creado: ${cliente.razon_social}`);
        } catch (error) {
          console.error('Error al crear cliente:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Error al crear el cliente ${cliente.razon_social}.`,
            confirmButtonColor: '#321fdb'
          });
        }
      }

      await fetchClientes(currentPage, itemsPerPage, searchTerm, razonSocialFilter, rucFilter, direccionFilter);
      setSelectedFile(null);
      fileInputRef.current.value = null; // Restablece el valor del input de archivo
      setLoadingUpload(false);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  console.log('Renderizando componente Clientes', { clientes, loading, error });

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Gestión de Clientes</strong>
          <div className="d-flex justify-content-end align-items-center">
            <a 
              href="/templates/plantilla_clientes.xlsx" 
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
              Nuevo Cliente
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
                  placeholder="Buscar clientes..."
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
                      activeFilter === 'razon_social' ? razonSocialFilter :
                      activeFilter === 'ruc' ? rucFilter :
                      direccionFilter
                    }
                    onChange={handleFilterInputChange(
                      activeFilter === 'razon_social' ? setRazonSocialFilter :
                      activeFilter === 'ruc' ? setRucFilter :
                      setDireccionFilter
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
          ) : filteredClientes.length > 0 ? (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Razón Social 
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'razon_social' ? null : 'razon_social')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      RUC 
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'ruc' ? null : 'ruc')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">
                      Dirección
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'direccion' ? null : 'direccion')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Teléfono</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredClientes.map((cliente, index) => (
                    <ClienteRow
                      key={cliente.id}
                      cliente={cliente}
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
                  Mostrando {filteredClientes.length} de {totalItems} clientes
                </small>
              </div>
            </>
          ) : (
            <CAlert color="info">No hay clientes disponibles. Cree uno nuevo haciendo clic en el botón "Nuevo Cliente".</CAlert>
          )}

          {showModal && (
            <ClienteModal
              visible={showModal}
              onClose={() => setShowModal(false)}
              title={modalTitle}
              cliente={currentCliente}
              errors={formErrors}
              submitting={submitting}
              onChange={handleInputChange}
              onSave={handleSaveCliente}
            />
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default ListaClientes