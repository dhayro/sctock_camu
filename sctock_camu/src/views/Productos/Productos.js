import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import productoService from '../../services/api/productoService';
import unidadMedidaService from '../../services/api/unidadMedidaService'; // Import the service
import Select from 'react-select'; // Import the Select component
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
const ProductoRow = ({ producto, index, currentPage, itemsPerPage, onEdit, onDelete }) => {
  return (
    <CTableRow>
      <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
      <CTableDataCell>{producto.nombre}</CTableDataCell>
      <CTableDataCell>{producto.unidad_medida.nombre}</CTableDataCell>
      <CTableDataCell>{producto.descripcion || '-'}</CTableDataCell>
      <CTableDataCell>
        <CButton
          color="info"
          size="sm"
          className="me-2"
          onClick={() => onEdit(producto)}
        >
          <CIcon icon={cilPencil} />
        </CButton>
        <CButton
          color="danger"
          size="sm"
          onClick={() => onDelete(producto)}
        >
          <CIcon icon={cilTrash} />
        </CButton>
      </CTableDataCell>
    </CTableRow>
  );
};

// Define the modal component
const ProductoModal = ({ visible, onClose, title, producto, errors, submitting, onChange, onSave }) => {
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const nombreInputRef = useRef(null); // Create a ref for the "Nombre" input

  useEffect(() => {
    const fetchUnidadesMedida = async () => {
      try {
        const data = await unidadMedidaService.getAll();
        setUnidadesMedida(data.data.unidadesMedida || []);
      } catch (err) {
        console.error('Error al obtener unidades de medida:', err);
      }
    };

    fetchUnidadesMedida();
  }, []);

  useEffect(() => {
    if (visible && nombreInputRef.current) {
      nombreInputRef.current.focus(); // Focus the "Nombre" input when the modal is opened
    }
  }, [visible]);

  const handleSelectChange = (selectedOption) => {
    onChange({ target: { name: 'unidad_medida_id', value: selectedOption ? selectedOption.value : '' } });
  };

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
                  value={producto.nombre}
                  onChange={onChange}
                  ref={nombreInputRef} // Attach the ref to the input
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="unidad_medida_id" className="form-label">Unidad de Medida</label>
                <Select
                  className={`basic-single ${errors.unidad_medida_id ? 'is-invalid' : ''}`}
                  classNamePrefix="select"
                  isClearable
                  isSearchable
                  name="unidad_medida_id"
                  options={unidadesMedida.map(unidad => ({ value: unidad.id, label: unidad.nombre }))}
                  value={unidadesMedida.find(unidad => unidad.id === producto.unidad_medida_id) ? { value: producto.unidad_medida_id, label: unidadesMedida.find(unidad => unidad.id === producto.unidad_medida_id).nombre } : null}
                  onChange={handleSelectChange}
                  placeholder="Seleccionar unidad de medida"
                />
                {errors.unidad_medida_id && <div className="invalid-feedback">{errors.unidad_medida_id}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <textarea
                  className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                  id="descripcion"
                  name="descripcion"
                  value={producto.descripcion || ''}
                  onChange={onChange}
                />
                {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
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

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentProducto, setCurrentProducto] = useState({ nombre: '', unidad_medida_id: '', descripcion: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginatedProductos, setPaginatedProductos] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [nombreFilter, setNombreFilter] = useState('');
  const [unidadMedidaFilter, setUnidadMedidaFilter] = useState('');

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
    fetchProductos();
  }, []);

  useEffect(() => {
    const filtered = productos.filter(producto => 
      producto.nombre.toLowerCase().includes(nombreFilter.toLowerCase()) &&
      producto.unidad_medida.nombre.toLowerCase().includes(unidadMedidaFilter.toLowerCase())
    );
    setFilteredProductos(filtered);
  }, [productos, nombreFilter, unidadMedidaFilter]);

  const fetchProductos = async (page = 1, itemsPerPage = 10, searchTerm = '', nombre = '', unidadMedida = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await productoService.getAll({ page, itemsPerPage, search: searchTerm, nombre, unidad_medida_nombre: unidadMedida });
      console.log('API Response:', response); // Log the full response for debugging

      if (response.data && Array.isArray(response.data.productos)) {
        setProductos(response.data.productos);
        setPaginatedProductos(response.data.productos);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Unexpected response format. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error fetching productos:', err);
      setError('Error loading productos. Please try again.');
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load productos. Please try again.',
        confirmButtonColor: '#321fdb'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchProductos(page, itemsPerPage, searchTerm, nombreFilter, unidadMedidaFilter);
  };

  const debouncedFetchProductos = useRef(debounce((search, nombre, unidadMedida) => {
    fetchProductos(1, itemsPerPage, search, nombre, unidadMedida);
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
    debouncedFetchProductos(searchTerm, nombreFilter, unidadMedidaFilter);
  }, [searchTerm, nombreFilter, unidadMedidaFilter]);

  const handleSearch = () => {
    fetchProductos(1, itemsPerPage, searchTerm, nombreFilter, unidadMedidaFilter);
  };

  const clearFilters = () => {
    setNombreFilter('');
    setUnidadMedidaFilter('');
    setSearchTerm('');
    fetchProductos(1, itemsPerPage, '', '', '');
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchProductos(1, itemsPerPage, '', nombreFilter, unidadMedidaFilter);
  };

  const handleOpenCreateModal = () => {
    console.log('Abriendo modal de creación');
    setCurrentProducto({ nombre: '', unidad_medida_id: '', descripcion: '' });
    setFormErrors({});
    setModalTitle('Crear Nuevo Producto');
    setShowModal(true);
  };

  const handleOpenEditModal = (producto) => {
    console.log('Abriendo modal de edición para:', producto);
    setCurrentProducto({ ...producto });
    setFormErrors({});
    setModalTitle('Editar Producto');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProducto({ ...currentProducto, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!currentProducto.nombre || currentProducto.nombre.trim() === '') {
      errors.nombre = 'El nombre del producto es requerido';
    }
    if (!currentProducto.unidad_medida_id) {
      errors.unidad_medida_id = 'La unidad de medida es requerida';
    }
    return errors;
  };

  const handleSaveProducto = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      if (currentProducto.id) {
        await productoService.update(currentProducto.id, currentProducto);

        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `El producto "${currentProducto.nombre}" ha sido actualizado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        await productoService.create(currentProducto);

        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: `El producto "${currentProducto.nombre}" ha sido creado correctamente.`,
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        });
      }

      await fetchProductos(currentPage, itemsPerPage, searchTerm, nombreFilter, unidadMedidaFilter);
      setShowModal(false);
    } catch (err) {
      console.error('Error al guardar producto:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al guardar el producto. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });

      setFormErrors({
        api: err.response?.data?.error || 'Error al guardar el producto. Por favor, intente nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (producto) => {
    console.log('Solicitando confirmación para eliminar:', producto);

    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el producto "${producto.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProducto(producto);
      }
    });
  };

  const deleteProducto = async (producto) => {
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

      await productoService.delete(producto.id);

      const remainingItems = filteredProductos.length - 1;
      const newPage = remainingItems === 0 && currentPage > 1 ? currentPage - 1 : currentPage;

      await fetchProductos(newPage, itemsPerPage, searchTerm, nombreFilter, unidadMedidaFilter);

      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: `El producto "${producto.nombre}" ha sido eliminado correctamente.`,
        confirmButtonColor: '#321fdb',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error al eliminar producto:', err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Error al eliminar el producto. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const applyFilters = () => {
    fetchProductos(1, itemsPerPage, searchTerm, nombreFilter, unidadMedidaFilter);
  };

  useEffect(() => {
    setIsFilterActive(
      searchTerm.trim() !== '' || nombreFilter.trim() !== '' || unidadMedidaFilter.trim() !== ''
    );
  }, [searchTerm, nombreFilter, unidadMedidaFilter]);

  console.log('Renderizando componente Productos', { productos, loading, error });

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Gestión de Productos</strong>
          <CButton 
            color="primary" 
            className="float-end me-2"
            onClick={handleOpenCreateModal}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Nuevo Producto
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CInputGroup>
                <CFormInput
                  placeholder="Buscar productos..."
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
                    value={activeFilter === 'nombre' ? nombreFilter : unidadMedidaFilter}
                    onChange={handleFilterInputChange(
                      activeFilter === 'nombre' ? setNombreFilter : setUnidadMedidaFilter
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
          ) : filteredProductos.length > 0 ? (
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
                      Unidad de Medida 
                      <CButton
                        color="link"
                        onClick={() => setActiveFilter(activeFilter === 'unidad_medida' ? null : 'unidad_medida')}
                      >
                        <CIcon icon={cilFilter} />
                      </CButton>
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Descripción</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredProductos.map((producto, index) => (
                    <ProductoRow
                      key={producto.id}
                      producto={producto}
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
                  Mostrando {filteredProductos.length} de {totalItems} productos
                </small>
              </div>
            </>
          ) : (
            <CAlert color="info">No hay productos disponibles. Cree uno nuevo haciendo clic en el botón "Nuevo Producto".</CAlert>
          )}

          {showModal && (
            <Suspense fallback={<div className="text-center my-3"><CSpinner /></div>}>
              <ProductoModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                title={modalTitle}
                producto={currentProducto}
                errors={formErrors}
                submitting={submitting}
                onChange={handleInputChange}
                onSave={handleSaveProducto}
              />
            </Suspense>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default Productos;