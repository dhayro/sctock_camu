import React, { useState, useEffect, useRef, lazy, Suspense, useContext } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CButton,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CFormInput,
    CFormSelect,
    CFormTextarea,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
    CInputGroup,
    CInputGroupText,
    CSpinner,
    CAlert,
    CPagination,
    CPaginationItem,
    CBadge,
    CContainer,
    CButtonGroup
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
    cilPlus,
    cilPencil,
    cilTrash,
    cilSearch,
    cilFilter,
    cilFilterX,
    cilInfo,
    cilX,
    cilSave,
    cilCheckCircle,
    cilXCircle
} from '@coreui/icons';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';
import Select from 'react-select';

// Servicios
import ordenCompraService from '../../services/api/ordenCompraService';
import clienteService from '../../services/api/clienteService';
import productoService from '../../services/api/productoService';
import tipoFrutaService from '../../services/api/tipoFrutaService';
import detalleOrdenCompraService from '../../services/api/detalleOrdenCompraService';

// Contexto
import { UserContext } from '../../context/UserContext';

// Estilos personalizados corregidos
const customStyles = {
    modalBody: {
        maxHeight: 'calc(90vh - 140px)',
        overflowY: 'auto',
        padding: '1.5rem'
    },
    tableContainer: {
        overflowX: 'auto',
        marginBottom: '1rem'
    },
    compactTable: {
        fontSize: '0.875rem',
        minWidth: '100%'
    },
    tabContent: {
        minHeight: '400px'
    },
    formRow: {
        marginBottom: '1rem'
    },
    // Estilos para controlar el ancho de inputs
    inputContainer: {
        maxWidth: '300px'
    },
    selectContainer: {
        maxWidth: '350px'
    },
    textareaContainer: {
        maxWidth: '400px'
    },
    // Nuevos estilos para la tabla de detalles
    tableInput: {
        minWidth: '80px',
        maxWidth: '120px',
        fontSize: '0.875rem'
    },
    tableTextarea: {
        minWidth: '120px',
        maxWidth: '150px',
        fontSize: '0.875rem'
    }
};

// Estilos para react-select más compactos
const selectStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '38px',
        maxWidth: '300px',
        fontSize: '14px',
        borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
        boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#86b7fe' : '#dee2e6'
        }
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '2px 8px'
    }),
    input: (provided) => ({
        ...provided,
        margin: '0px',
        fontSize: '14px'
    }),
    indicatorSeparator: () => ({
        display: 'none'
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '36px'
    }),
    menu: (provided) => ({
        ...provided,
        fontSize: '14px',
        maxWidth: '350px',
        zIndex: 9999
    }),
    option: (provided) => ({
        ...provided,
        fontSize: '14px',
        padding: '8px 12px'
    })
};

// Estilos específicos para selects en la tabla
const tableSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '32px',
        minWidth: '160px',
        maxWidth: '180px',
        fontSize: '13px',
        borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
        boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#86b7fe' : '#dee2e6'
        }
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '2px 6px'
    }),
    input: (provided) => ({
        ...provided,
        margin: '0px',
        fontSize: '13px'
    }),
    indicatorSeparator: () => ({
        display: 'none'
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '30px'
    }),
    menu: (provided) => ({
        ...provided,
        fontSize: '13px',
        maxWidth: '200px',
        zIndex: 9999
    }),
    option: (provided) => ({
        ...provided,
        fontSize: '13px',
        padding: '6px 10px'
    })
};

// Función auxiliar para formatear fechas correctamente
const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    // Si la fecha ya está en formato YYYY-MM-DD, devolverla tal como está
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }

    // Crear fecha local sin conversión UTC
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// Función auxiliar para formatear fechas para mostrar
const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';

    // Crear fecha local sin conversión UTC
    const date = new Date(dateString + 'T00:00:00'); // Agregar tiempo para evitar conversión UTC

    return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Función auxiliar para formatear detalles
const formatDetalleForDisplay = (detalle) => {
    return {
        id: detalle.id || null,
        producto_id: detalle.producto_id || '',
        tipo_fruta_id: detalle.tipo_fruta_id || '',
        cantidad: parseFloat(detalle.cantidad) || 0,
        precio: parseFloat(detalle.precio) || 0,
        subtotal: parseFloat(detalle.subtotal) || 0,
        cantidad_ingresada: parseFloat(detalle.cantidad_ingresada) || 0,
        estado: detalle.estado || 'pendiente',
        observacion: detalle.observacion || '',
        // Información adicional para mostrar en la tabla
        producto_nombre: detalle.producto?.nombre || '',
        tipo_fruta_nombre: detalle.tipo_fruta?.nombre || ''
    };
};

// Función fetchDetalles mejorada
const fetchDetalles = async () => {
    try {
        console.log('Fetching detalles for orden ID kong:', orden.id);
        const response = await detalleOrdenCompraService.getById(orden.id);
        console.log('Response completa:', response);

        let detallesData = [];

        // Manejar diferentes estructuras de respuesta
        if (response.data) {
            if (Array.isArray(response.data.detalles)) {
                detallesData = response.data.detalles;
            } else if (Array.isArray(response.data)) {
                detallesData = response.data;
            } else if (response.data.id) {
                // Es un objeto único, convertir a array
                detallesData = [response.data];
            } else if (response.detalles) {
                detallesData = Array.isArray(response.detalles) ? response.detalles : [response.detalles];
            } else if (response.id) {
                // La respuesta es directamente el detalle
                detallesData = [response];
            }
        }

        // Formatear los detalles
        const detallesFormateados = detallesData.map(formatDetalleForDisplay);
        console.log('Detalles formateados:', detallesFormateados);

        setDetalles(detallesFormateados);
    } catch (error) {
        console.error('Error al cargar detalles:', error);
        setDetalles([]);

        // Solo mostrar error si no es un 404
        if (error.response?.status !== 404) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar los detalles de la orden',
                confirmButtonColor: '#321fdb'
            });
        }
    }

    const handleOpenCreateModal = () => {
        console.log('Abriendo modal de creación');
        setCurrentOrden({
            numero_orden: '',
            cliente_id: '',
            tipo_lote: '',
            tipo_pago: '',
            fecha_emision: '',
            fecha_entrega: '',
            lugar_entrega: '',
            observacion: '',
            forma_pago: ''
        });
        setDetalles([]); // Inicializar detalles vacíos
        setActiveTab('general'); // Comenzar en la pestaña general
        setFormErrors({});
        setModalTitle('Crear Nueva Orden');
        setShowModal(true);
    };


    const handleOpenEditModal = async (orden) => {
        console.log('Abriendo modal de edición para:', orden);
        setCurrentOrden({ ...orden });
        setActiveTab('general'); // Comenzar en la pestaña general
        setFormErrors({});
        setModalTitle('Editar Orden');

        // Cargar detalles si la orden ya existe
        if (orden.id) {
            setLoadingDetalles(true);
            try {
                // Usar el servicio correcto para obtener detalles por orden ID
                const response = await detalleOrdenCompraService.getByOrdenId(orden.id);
                console.log('Detalles cargados:', response);

                // Manejar diferentes estructuras de respuesta
                let detallesData = [];
                if (response.data) {
                    if (Array.isArray(response.data.detalles)) {
                        detallesData = response.data.detalles;
                    } else if (Array.isArray(response.data)) {
                        detallesData = response.data;
                    }
                } else if (Array.isArray(response.detalles)) {
                    detallesData = response.detalles;
                } else if (Array.isArray(response)) {
                    detallesData = response;
                }

                console.log('Detalles procesados:', detallesData);
                setDetalles(detallesData);
            } catch (err) {
                console.error('Error al cargar detalles:', err);
                setDetalles([]);
                // Solo mostrar error si no es un 404 (orden sin detalles)
                if (err.response?.status !== 404) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Advertencia',
                        text: 'No se pudieron cargar los detalles de la orden',
                        confirmButtonColor: '#321fdb'
                    });
                }
            } finally {
                setLoadingDetalles(false);
            }
        } else {
            setDetalles([]);
        }

        setShowModal(true);
    };

    const handleSaveOrden = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setActiveTab('general'); // Cambiar a la pestaña general si hay errores
            return;
        }

        if (!user) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.',
                confirmButtonColor: '#321fdb'
            });
            return;
        }

        setSubmitting(true);
        setFormErrors({});

        try {
            const ordenData = {
                ...currentOrden,
                usuario_creacion_id: user.id
            };

            let savedOrden;
            if (currentOrden.id) {
                // Actualizar orden existente
                savedOrden = await ordenCompraService.update(currentOrden.id, ordenData);
            } else {
                // Crear nueva orden
                savedOrden = await ordenCompraService.create(ordenData);
            }

            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: currentOrden.id ? '¡Actualizado!' : '¡Creado!',
                text: `La orden "${currentOrden.numero_orden}" ha sido ${currentOrden.id ? 'actualizada' : 'creada'} correctamente.`,
                confirmButtonColor: '#321fdb',
                timer: 2000,
                timerProgressBar: true
            });

            await fetchOrdenes(currentPage, itemsPerPage, searchTerm, numeroFilter, clienteFilter);
            setShowModal(false);
        } catch (err) {
            console.error('Error al guardar orden:', err);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.error || 'Error al guardar la orden. Por favor, intente nuevamente.',
                confirmButtonColor: '#321fdb'
            });

            setFormErrors({
                api: err.response?.data?.error || 'Error al guardar la orden. Por favor, intente nuevamente.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveWithDetalles = async () => {
        // Primero validar la orden
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setActiveTab('general');
            return;
        }

        if (!user) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.',
                confirmButtonColor: '#321fdb'
            });
            return;
        }

        setSubmitting(true);
        setFormErrors({});

        try {
            const ordenData = {
                ...currentOrden,
                usuario_creacion_id: user.id,
                usuario_modificacion_id: user.id
            };

            let savedOrden;
            if (currentOrden.id) {
                // Actualizar orden existente
                savedOrden = await ordenCompraService.update(currentOrden.id, ordenData);
            } else {
                // Crear nueva orden
                const response = await ordenCompraService.create(ordenData);
                savedOrden = response.data || response;
                // Actualizar el currentOrden con el ID de la orden creada
                setCurrentOrden(prev => ({ ...prev, id: savedOrden.id }));
            }

            // Procesar detalles
            if (detalles.length > 0) {
                for (const detalle of detalles) {
                    // Validar que el detalle tenga los campos requeridos
                    if (!detalle.producto_id || !detalle.cantidad || !detalle.precio) {
                        continue; // Saltar detalles incompletos
                    }

                    const detalleData = {
                        orden_compra_id: savedOrden.id,
                        producto_id: detalle.producto_id,
                        tipo_fruta_id: detalle.tipo_fruta_id || null,
                        cantidad: parseFloat(detalle.cantidad),
                        precio: parseFloat(detalle.precio),
                        subtotal: parseFloat(detalle.subtotal),
                        observacion: detalle.observacion || '',
                        cantidad_ingresada: parseFloat(detalle.cantidad_ingresada) || 0
                    };

                    try {
                        if (detalle.isNew) {
                            // Crear nuevo detalle
                            await detalleOrdenCompraService.create(detalleData);
                        } else if (detalle.isModified && detalle.id) {
                            // Actualizar detalle existente
                            await detalleOrdenCompraService.update(detalle.id, detalleData);
                        }
                    } catch (detalleError) {
                        console.error('Error al procesar detalle:', detalleError);
                        // Continuar con los demás detalles aunque uno falle
                    }
                }
            }

            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: currentOrden.id ? '¡Actualizado!' : '¡Creado!',
                text: `La orden "${currentOrden.numero_orden}" y sus detalles han sido ${currentOrden.id ? 'actualizados' : 'creados'} correctamente.`,
                confirmButtonColor: '#321fdb',
                timer: 2000,
                timerProgressBar: true
            });

            await fetchOrdenes(currentPage, itemsPerPage, searchTerm, numeroFilter, clienteFilter);
            setShowModal(false);
        } catch (err) {
            console.error('Error al guardar orden con detalles:', err);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.error || 'Error al guardar la orden y sus detalles. Por favor, intente nuevamente.',
                confirmButtonColor: '#321fdb'
            });

            setFormErrors({
                api: err.response?.data?.error || 'Error al guardar la orden y sus detalles. Por favor, intente nuevamente.',
            });
        } finally {
            setSubmitting(false);
        }
    };
};

// Componente OrdenRow mejorado para responsividad
const OrdenRow = ({ orden, index, currentPage, itemsPerPage, onEdit, onDelete, onChangeEstado }) => {
    const getEstadoBadge = (estado) => {
        const badges = {
            'pendiente': 'warning',
            'en_proceso': 'info',
            'completado': 'success',
            'terminado': 'primary',
            'cancelado': 'danger'
        };
        return badges[estado] || 'secondary';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-PE');
    };

    // Verificar si tiene ingresos (cantidad_ingresada > 0)
    const tieneIngresos = orden.detalles?.some(detalle => 
        parseFloat(detalle.cantidad_ingresada || 0) > 0
    ) || false;

    return (
        <CTableRow>
            <CTableDataCell className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
            <CTableDataCell>
                <div className="fw-bold">{orden.codigo_lote || '-'}</div>
                <small className="text-muted d-md-none">{orden.numero_orden || '-'}</small>
            </CTableDataCell>
            <CTableDataCell className="d-none d-md-table-cell">{orden.numero_orden || '-'}</CTableDataCell>
            <CTableDataCell>
                <div className="text-truncate" style={{ maxWidth: '200px' }} title={orden.cliente?.razon_social}>
                    {orden.cliente?.razon_social || '-'}
                </div>
            </CTableDataCell>
            <CTableDataCell className="d-none d-lg-table-cell">{formatDateForDisplay(orden.fecha_emision)}</CTableDataCell>
            <CTableDataCell className="d-none d-lg-table-cell">{formatDateForDisplay(orden.fecha_entrega)}</CTableDataCell>
            <CTableDataCell>
                <CBadge color={getEstadoBadge(orden.estado)} className="text-uppercase">
                    {orden.estado?.replace('_', ' ') || 'PENDIENTE'}
                </CBadge>
            </CTableDataCell>
            <CTableDataCell>
                {orden.estado === 'cancelado' ? (
                    <span className="text-muted text-center">Sin acciones</span>
                ) : (
                    <CButtonGroup size="sm">
                        <CButton
                            color="info"
                            variant="outline"
                            onClick={() => onEdit(orden)}
                            title="Ver/Editar"
                            disabled={orden.estado !== 'pendiente'}
                        >
                            <CIcon icon={cilInfo} />
                        </CButton>
                        <CButton
                            color="danger"
                            variant="outline"
                            onClick={() => onDelete(orden)}
                            title="Eliminar"
                            disabled={orden.estado !== 'pendiente'}
                        >
                            <CIcon icon={cilTrash} />
                        </CButton>
                        {/* Botón Cancelar - Solo activo si NO hay ingresos y estado ≠ cancelado */}
                        {!tieneIngresos && orden.estado !== 'cancelado' && (
                            <CButton
                                color="warning"
                                variant="outline"
                                onClick={() => onChangeEstado(orden.id, 'cancelado')}
                                title="Cancelar orden"
                            >
                                <CIcon icon={cilXCircle} />
                            </CButton>
                        )}
                        {/* Botón Terminar - Siempre activo a menos que ya esté terminado */}
                        {orden.estado !== 'terminado' && (
                            <CButton
                                color="success"
                                variant="outline"
                                onClick={() => onChangeEstado(orden.id, 'terminado')}
                                title="Terminar/Cerrar orden"
                            >
                                <CIcon icon={cilCheckCircle} />
                            </CButton>
                        )}
                    </CButtonGroup>
                )}
            </CTableDataCell>
        </CTableRow>
    );
};

// Componente OrdenModal corregido

const OrdenModal = ({ visible, onClose, title, orden, errors, submitting, onChange, onSave }) => {
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [tiposFruta, setTiposFruta] = useState([]);
    const [activeTab, setActiveTab] = useState('general');
    const [detalles, setDetalles] = useState([]);
    const numeroInputRef = useRef(null);

    // Estados para el manejo de detalles
    const [newDetalle, setNewDetalle] = useState({
        producto_id: '',
        tipo_fruta_id: '',
        cantidad: 0,
        precio: 0,
        subtotal: 0,
        observacion: ''
    });

    useEffect(() => {
        if (visible) {
            fetchClientes();
            fetchProductos();
            fetchTiposFruta();

            // Si es edición y tiene ID, cargar detalles
            if (orden.id) {
                fetchDetalles(orden.id);
            } else {
                // Si es creación, limpiar detalles
                setDetalles([]);
            }

            // Focus en el input de número
            setTimeout(() => {
                if (numeroInputRef.current) {
                    numeroInputRef.current.focus();
                }
            }, 100);
        }
    }, [visible, orden.id]);

    const fetchClientes = async () => {
        try {
            const response = await clienteService.getAllClientes();
            setClientes(response.clientes || []);
        } catch (err) {
            console.error('Error al obtener clientes:', err);
        }
    };

    const fetchProductos = async () => {
        try {
            const response = await productoService.getAll();
            setProductos(response.data.productos || []);
        } catch (err) {
            console.error('Error al obtener productos:', err);
        }
    };

    const fetchTiposFruta = async () => {
        try {
            const response = await tipoFrutaService.getAll();
            setTiposFruta(response.data.tiposFruta || []);
        } catch (err) {
            console.error('Error al obtener tipos de fruta:', err);
        }
    };

    const fetchDetalles = async (ordenId) => {
        try {
            const response = await detalleOrdenCompraService.getByOrdenId(ordenId);

            // Convertir los valores string a números y formatear correctamente
            const detallesFormateados = (response.data || []).map(detalle => ({
                ...detalle,
                cantidad: parseFloat(detalle.cantidad) || 0,
                precio: parseFloat(detalle.precio) || 0,
                subtotal: parseFloat(detalle.subtotal) || 0,
                cantidad_ingresada: parseFloat(detalle.cantidad_ingresada) || 0
            }));

            setDetalles(detallesFormateados);
        } catch (err) {
            console.error('Error al obtener detalles:', err);
            setDetalles([]);
        }
    };

    const handleSelectChange = (selectedOption) => {
        const event = {
            target: {
                name: 'cliente_id',
                value: selectedOption ? selectedOption.value : ''
            }
        };
        onChange(event);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (activeTab === 'general') {
                onSave();
            } else {
                handleSaveWithDetalles();
            }
        }
    };

    // Funciones para manejo de detalles
    const addDetalle = () => {
        if (!newDetalle.producto_id || !newDetalle.cantidad || !newDetalle.precio) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor complete producto, cantidad y precio',
                confirmButtonColor: '#321fdb'
            });
            return;
        }

        const detalle = {
            ...newDetalle,
            id: `temp_${Date.now()}`, // ID temporal para nuevos detalles
            subtotal: parseFloat(newDetalle.cantidad) * parseFloat(newDetalle.precio),
            isNew: true, // Marcar como nuevo para el backend
            cantidad_ingresada: 0
        };

        setDetalles([...detalles, detalle]);
        setNewDetalle({
            producto_id: '',
            tipo_fruta_id: '',
            cantidad: 0,
            precio: 0,
            subtotal: 0,
            observacion: ''
        });
    };

    const updateDetalle = (index, field, value) => {
        const updatedDetalles = [...detalles];

        // Convertir a número si es un campo numérico
        if (['cantidad', 'precio', 'subtotal', 'cantidad_ingresada'].includes(field)) {
            updatedDetalles[index][field] = parseFloat(value) || 0;
        } else {
            updatedDetalles[index][field] = value;
        }

        // Recalcular subtotal si se cambia cantidad o precio
        if (field === 'cantidad' || field === 'precio') {
            const cantidad = parseFloat(updatedDetalles[index].cantidad) || 0;
            const precio = parseFloat(updatedDetalles[index].precio) || 0;
            updatedDetalles[index].subtotal = cantidad * precio;
        }

        // Marcar el detalle como modificado si no es nuevo
        if (!updatedDetalles[index].isNew) {
            updatedDetalles[index].isModified = true;
        }

        setDetalles(updatedDetalles);
    };

    const removeDetalle = (index) => {
        const detalleToRemove = detalles[index];

        // Si el detalle tiene ID (existe en BD), marcarlo para eliminación
        if (detalleToRemove.id && !detalleToRemove.isNew) {
            Swal.fire({
                title: '¿Está seguro?',
                text: 'Este producto será eliminado de la orden',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        // Eliminar del backend si existe
                        await detalleOrdenCompraService.delete(detalleToRemove.id);

                        // Eliminar de la lista local
                        const updatedDetalles = detalles.filter((_, i) => i !== index);
                        setDetalles(updatedDetalles);

                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'El producto ha sido eliminado de la orden',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } catch (error) {
                        console.error('Error al eliminar detalle:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo eliminar el producto',
                            confirmButtonColor: '#321fdb'
                        });
                    }
                }
            });
        } else {
            // Si es nuevo, simplemente eliminarlo de la lista
            const updatedDetalles = detalles.filter((_, i) => i !== index);
            setDetalles(updatedDetalles);
        }
    };

    const updateNewDetalle = (field, value) => {
        const updated = { ...newDetalle, [field]: value };

        if (field === 'cantidad' || field === 'precio') {
            updated.subtotal = updated.cantidad * updated.precio;
        }

        setNewDetalle(updated);
    };

    const handleSaveWithDetalles = async () => {
        try {
            // Primero guardar la orden
            const nuevaOrden = await onSave();

            // Verificar si se obtuvo la orden correctamente
            if (!nuevaOrden || !nuevaOrden.id) {
                console.error('No se pudo obtener el ID de la orden creada');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo obtener el ID de la orden. Los detalles no se guardaron.',
                    confirmButtonColor: '#321fdb'
                });
                return;
            }

            // Si la orden se guardó exitosamente y hay detalles, procesarlos
            if (detalles.length > 0) {
                let detallesCreados = 0;
                let detallesActualizados = 0;
                let erroresDetalles = 0;

                for (const detalle of detalles) {
                    try {
                        if (detalle.isNew) {
                            // Crear nuevo detalle
                            await detalleOrdenCompraService.create({
                                ...detalle,
                                orden_compra_id: nuevaOrden.id
                            });
                            detallesCreados++;
                        } else if (detalle.isModified) {
                            // Actualizar detalle existente
                            const detalleToUpdate = {
                                orden_compra_id: nuevaOrden.id,
                                producto_id: detalle.producto_id,
                                tipo_fruta_id: detalle.tipo_fruta_id,
                                cantidad: detalle.cantidad,
                                precio: detalle.precio,
                                subtotal: detalle.subtotal,
                                observacion: detalle.observacion
                            };

                            await detalleOrdenCompraService.update(detalle.id, detalleToUpdate);
                            detallesActualizados++;
                        }
                    } catch (detalleError) {
                        console.error('Error al procesar detalle:', detalleError);
                        erroresDetalles++;
                    }
                }

                // Recargar los detalles desde el servidor para reflejar los cambios
                await fetchDetalles(nuevaOrden.id);

                // Limpiar las marcas de modificación
                setDetalles(prevDetalles =>
                    prevDetalles.map(detalle => ({
                        ...detalle,
                        isNew: false,
                        isModified: false
                    }))
                );

                // Mostrar mensaje de éxito con detalles del proceso
                let mensaje = 'La orden ha sido guardada correctamente.';
                if (detallesCreados > 0) {
                    mensaje += ` Se crearon ${detallesCreados} detalles.`;
                }
                if (detallesActualizados > 0) {
                    mensaje += ` Se actualizaron ${detallesActualizados} detalles.`;
                }
                if (erroresDetalles > 0) {
                    mensaje += ` Hubo ${erroresDetalles} errores al procesar algunos detalles.`;
                }

                Swal.fire({
                    icon: erroresDetalles > 0 ? 'warning' : 'success',
                    title: '¡Completado!',
                    text: mensaje,
                    confirmButtonColor: '#321fdb',
                    timer: 3000,
                    timerProgressBar: true
                });
            }
        } catch (error) {
            console.error('Error al guardar orden con detalles:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar la orden con detalles. Por favor, intente nuevamente.',
                confirmButtonColor: '#321fdb'
            });
        }
    };

    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#321fdb' : provided.borderColor,
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(50, 31, 219, 0.25)' : provided.boxShadow,
            '&:hover': {
                borderColor: '#321fdb'
            }
        })
    };

    const customStyles = {
        inputContainer: {
            position: 'relative'
        },
        selectContainer: {
            position: 'relative'
        },
        textareaContainer: {
            position: 'relative'
        },
        compactTable: {
            fontSize: '0.875rem'
        },
        tableInput: {
            padding: '0.25rem 0.5rem',
            fontSize: '0.875rem',
            minWidth: '80px'
        },
        tableSelect: {
            fontSize: '0.875rem',
            minWidth: '150px'
        },
        tableTextarea: {
            padding: '0.25rem 0.5rem',
            fontSize: '0.875rem',
            minWidth: '120px',
            resize: 'vertical'
        }
    };

    const totalGeneral = detalles.reduce((sum, detalle) => sum + (detalle.subtotal || 0), 0);

    return (
        <CModal visible={visible} onClose={onClose} size="xl" backdrop="static">
            <CModalHeader>
                <CModalTitle>{title}</CModalTitle>
            </CModalHeader>
            <CModalBody>
                {/* Pestañas */}
                <CNav variant="tabs" className="mb-3">
                    <CNavItem>
                        <CNavLink
                            active={activeTab === 'general'}
                            onClick={() => setActiveTab('general')}
                            style={{ cursor: 'pointer' }}
                        >
                            Información General
                        </CNavLink>
                    </CNavItem>
                    <CNavItem>
                        <CNavLink
                            active={activeTab === 'detalles'}
                            onClick={() => setActiveTab('detalles')}
                            style={{ cursor: 'pointer' }}
                        >
                            Detalles de Productos
                            {detalles.length > 0 && (
                                <CBadge color="primary" className="ms-2">
                                    {detalles.length}
                                </CBadge>
                            )}
                        </CNavLink>
                    </CNavItem>
                </CNav>

                <CTabContent>
                    {/* Pestaña General */}
                    <CTabPane visible={activeTab === 'general'}>
                        <form onKeyDown={handleKeyDown}>
                            <CRow className="g-3">
                                <CCol lg={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Número de Orden
                                        </label>
                                        <div style={customStyles.inputContainer}>
                                            <CFormInput
                                                type="text"
                                                name="numero_orden"
                                                value={orden.numero_orden}
                                                onChange={onChange}
                                                className={`${errors.numero_orden ? 'is-invalid' : ''}`}
                                                placeholder="Ingrese el número de orden"
                                                ref={numeroInputRef}
                                            />
                                            {errors.numero_orden && (
                                                <div className="invalid-feedback">{errors.numero_orden}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Tipo de Lote <span className="text-danger">*</span>
                                        </label>
                                        <div style={customStyles.selectContainer}>
                                            <CFormSelect
                                                name="tipo_lote"
                                                value={orden.tipo_lote}
                                                onChange={onChange}
                                                className={`${errors.tipo_lote ? 'is-invalid' : ''}`}
                                                disabled={title.includes('Editar')} // Solo lectura en modo edición
                                            >
                                                <option value="">Seleccionar tipo de lote</option>
                                                <option value="convencional">Convencional</option>
                                                <option value="organica">Orgánica</option>
                                            </CFormSelect>
                                            {errors.tipo_lote && (
                                                <div className="invalid-feedback">{errors.tipo_lote}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Cliente <span className="text-danger">*</span>
                                        </label>
                                        <div style={customStyles.selectContainer}>
                                            <Select
                                                styles={selectStyles}
                                                className={`basic-single ${errors.cliente_id ? 'is-invalid' : ''}`}
                                                classNamePrefix="select"
                                                isClearable
                                                isSearchable
                                                name="cliente_id"
                                                options={clientes.map(cliente => ({
                                                    value: cliente.id,
                                                    label: `${cliente.razon_social} - ${cliente.ruc || 'Sin RUC'}`
                                                }))}
                                                value={clientes.find(cliente => cliente.id === orden.cliente_id) ? {
                                                    value: orden.cliente_id,
                                                    label: `${clientes.find(cliente => cliente.id === orden.cliente_id).razon_social} - ${clientes.find(cliente => cliente.id === orden.cliente_id).ruc || 'Sin RUC'}`
                                                } : null}
                                                onChange={handleSelectChange}
                                                placeholder="Seleccionar cliente"
                                            />
                                            {errors.cliente_id && (
                                                <div className="invalid-feedback d-block">{errors.cliente_id}</div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Fecha de Emisión <span className="text-danger">*</span>
                                        </label>
                                        <div style={customStyles.inputContainer}>
                                            <CFormInput
                                                type="date"
                                                name="fecha_emision"
                                                value={orden.fecha_emision}
                                                onChange={onChange}
                                                className={`${errors.fecha_emision ? 'is-invalid' : ''}`}
                                            />
                                            {errors.fecha_emision && (
                                                <div className="invalid-feedback">{errors.fecha_emision}</div>
                                            )}
                                        </div>
                                    </div>
                                </CCol>

                                <CCol lg={6}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Código de Lote</label>
                                        <div style={customStyles.inputContainer}>
                                            <CFormInput
                                                type="text"
                                                name="codigo_lote"
                                                value={orden.codigo_lote}
                                                onChange={onChange}
                                                placeholder="Se generará automáticamente"
                                                readOnly
                                                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Tipo de Pago <span className="text-danger">*</span>
                                        </label>
                                        <div style={customStyles.selectContainer}>
                                            <CFormSelect
                                                name="tipo_pago"
                                                value={orden.tipo_pago}
                                                onChange={onChange}
                                                className={`${errors.tipo_pago ? 'is-invalid' : ''}`}
                                            >
                                                <option value="">Seleccionar tipo de pago</option>
                                                <option value="contado">Contado</option>
                                                <option value="credito">Crédito</option>
                                            </CFormSelect>
                                            {errors.tipo_pago && (
                                                <div className="invalid-feedback">{errors.tipo_pago}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Fecha de Entrega</label>
                                        <div style={customStyles.inputContainer}>
                                            <CFormInput
                                                type="date"
                                                name="fecha_entrega"
                                                value={orden.fecha_entrega}
                                                onChange={onChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Estado</label>
                                        <div style={customStyles.selectContainer}>
                                            <CFormSelect
                                                name="estado"
                                                value={orden.estado}
                                                onChange={onChange}
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="en_proceso">En Proceso</option>
                                                <option value="completado">Completado (Lleno)</option>
                                                <option value="terminado">Terminado (Cerrado)</option>
                                                <option value="cancelado">Cancelado</option>
                                            </CFormSelect>
                                        </div>
                                    </div>
                                </CCol>

                                <CCol xs={12}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Observaciones</label>
                                        <div style={customStyles.textareaContainer}>
                                            <CFormTextarea
                                                name="observacion"
                                                value={orden.observacion}
                                                onChange={onChange}
                                                rows={3}
                                                placeholder="Observaciones adicionales (opcional)"
                                            />
                                        </div>
                                    </div>
                                </CCol>
                            </CRow>
                        </form>
                    </CTabPane>

                    {/* Pestaña Detalles */}
                    <CTabPane visible={activeTab === 'detalles'}>
                        <div className="mb-4">
                            <h6 className="fw-semibold mb-3">Agregar Producto</h6>
                            <CRow className="g-3 align-items-end">
                                <CCol md={3}>
                                    <label className="form-label fw-semibold">Producto</label>
                                    <CFormSelect
                                        value={newDetalle.producto_id}
                                        onChange={(e) => updateNewDetalle('producto_id', e.target.value)}
                                    >
                                        <option value="">Seleccionar producto</option>
                                        {productos.map(producto => (
                                            <option key={producto.id} value={producto.id}>
                                                {producto.nombre}
                                            </option>
                                        ))}
                                    </CFormSelect>
                                </CCol>
                                <CCol md={2}>
                                    <label className="form-label fw-semibold">Tipo Fruta</label>
                                    <CFormSelect
                                        value={newDetalle.tipo_fruta_id}
                                        onChange={(e) => updateNewDetalle('tipo_fruta_id', e.target.value)}
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        {tiposFruta.map(tipo => (
                                            <option key={tipo.id} value={tipo.id}>
                                                {tipo.nombre}
                                            </option>
                                        ))}
                                    </CFormSelect>
                                </CCol>
                                <CCol md={2}>
                                    <label className="form-label fw-semibold">Cantidad</label>
                                    <CFormInput
                                        type="number"
                                        step="0.01"
                                        value={newDetalle.cantidad}
                                        onChange={(e) => updateNewDetalle('cantidad', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                </CCol>
                                <CCol md={2}>
                                    <label className="form-label fw-semibold">Precio</label>
                                    <CFormInput
                                        type="number"
                                        step="0.01"
                                        value={newDetalle.precio}
                                        onChange={(e) => updateNewDetalle('precio', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                </CCol>
                                <CCol md={2}>
                                    <label className="form-label fw-semibold">Subtotal</label>
                                    <CFormInput
                                        type="text"
                                        value={newDetalle.subtotal.toFixed(2)}
                                        readOnly
                                        className="bg-light"
                                    />
                                </CCol>
                                <CCol md={1}>
                                    <CButton color="success" onClick={addDetalle}>
                                        <CIcon icon={cilPlus} />
                                    </CButton>
                                </CCol>
                            </CRow>
                            <CRow className="mt-2">
                                <CCol md={12}>
                                    <label className="form-label fw-semibold">Observación</label>
                                    <CFormInput
                                        type="text"
                                        value={newDetalle.observacion}
                                        onChange={(e) => updateNewDetalle('observacion', e.target.value)}
                                        placeholder="Observación del producto (opcional)"
                                    />
                                </CCol>
                            </CRow>
                        </div>

                        {detalles.length > 0 && (
                            <div>
                                <h6 className="fw-semibold mb-3">Productos Agregados</h6>
                                <CTable hover responsive style={customStyles.compactTable}>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Producto</CTableHeaderCell>
                                            <CTableHeaderCell>Tipo Fruta</CTableHeaderCell>
                                            <CTableHeaderCell>Cantidad</CTableHeaderCell>
                                            <CTableHeaderCell>Precio</CTableHeaderCell>
                                            <CTableHeaderCell>Subtotal</CTableHeaderCell>
                                            <CTableHeaderCell>Observación</CTableHeaderCell>
                                            <CTableHeaderCell>Acciones</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {detalles.map((detalle, index) => (
                                            <CTableRow key={detalle.id || index}>
                                                <CTableDataCell>
                                                    <CFormSelect
                                                        style={customStyles.tableSelect}
                                                        value={detalle.producto_id}
                                                        onChange={(e) => updateDetalle(index, 'producto_id', e.target.value)}
                                                    >
                                                        <option value="">Seleccionar</option>
                                                        {productos.map(producto => (
                                                            <option key={producto.id} value={producto.id}>
                                                                {producto.nombre}
                                                            </option>
                                                        ))}
                                                    </CFormSelect>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CFormSelect
                                                        style={customStyles.tableSelect}
                                                        value={detalle.tipo_fruta_id}
                                                        onChange={(e) => updateDetalle(index, 'tipo_fruta_id', e.target.value)}
                                                    >
                                                        <option value="">Seleccionar</option>
                                                        {tiposFruta.map(tipo => (
                                                            <option key={tipo.id} value={tipo.id}>
                                                                {tipo.nombre}
                                                            </option>
                                                        ))}
                                                    </CFormSelect>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CFormInput
                                                        type="number"
                                                        step="0.01"
                                                        style={customStyles.tableInput}
                                                        value={detalle.cantidad}
                                                        onChange={(e) => updateDetalle(index, 'cantidad', parseFloat(e.target.value) || 0)}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CFormInput
                                                        type="number"
                                                        step="0.01"
                                                        style={customStyles.tableInput}
                                                        value={detalle.precio}
                                                        onChange={(e) => updateDetalle(index, 'precio', parseFloat(e.target.value) || 0)}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <strong>S/ {(detalle.subtotal || 0).toFixed(2)}</strong>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CFormTextarea
                                                        style={customStyles.tableTextarea}
                                                        rows={1}
                                                        value={detalle.observacion}
                                                        onChange={(e) => updateDetalle(index, 'observacion', e.target.value)}
                                                        placeholder="Observación"
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CButton
                                                        color="danger"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeDetalle(index)}
                                                    >
                                                        <CIcon icon={cilTrash} />
                                                    </CButton>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>


                                <div className="mt-3 text-end">
                                    <h5 className="fw-bold">
                                        Total General: <span className="text-primary">S/ {totalGeneral.toFixed(2)}</span>
                                    </h5>
                                </div>
                            </div>
                        )}

                        {detalles.length === 0 && (
                            <CAlert color="info" className="mt-4">
                                <CIcon icon={cilInfo} className="me-2" />
                                No hay productos agregados. Use el formulario de arriba para agregar productos a esta orden.
                            </CAlert>
                        )}
                    </CTabPane>
                </CTabContent>

                {errors.api && (
                    <CAlert color="danger" className="mt-3">
                        {errors.api}
                    </CAlert>
                )}
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={onClose} disabled={submitting}>
                    Cancelar
                </CButton>
                <CButton
                    color="primary"
                    onClick={activeTab === 'general' ? onSave : handleSaveWithDetalles}
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <CSpinner size="sm" className="me-2" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <CIcon icon={cilSave} className="me-2" />
                            {orden.id ? 'Actualizar' : 'Crear'} Orden
                        </>
                    )}
                </CButton>
            </CModalFooter>
        </CModal>
    );
};

const Ordenes = () => {
    const { user } = useContext(UserContext); // Obtener el usuario del contexto
    const [ordenes, setOrdenes] = useState([]);
    const [filteredOrdenes, setFilteredOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [currentOrden, setCurrentOrden] = useState({ numero_orden: '', cliente_id: '', fecha_emision: '', fecha_entrega: '', lugar_entrega: '', observacion: '', forma_pago: '' });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [paginatedOrdenes, setPaginatedOrdenes] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [numeroFilter, setNumeroFilter] = useState('');
    const [clienteFilter, setClienteFilter] = useState('');

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
        fetchOrdenes();
    }, []);

    useEffect(() => {
        const filtered = ordenes.filter(orden =>
            (orden.numero_orden?.toLowerCase() || '').includes(numeroFilter.toLowerCase()) &&
            (orden.cliente?.razon_social?.toLowerCase() || '').includes(clienteFilter.toLowerCase())
        );
        setFilteredOrdenes(filtered);
    }, [ordenes, numeroFilter, clienteFilter]);

    const fetchOrdenes = async (page = 1, itemsPerPage = 10, searchTerm = '', numero = '', cliente = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await ordenCompraService.getAll({ page, itemsPerPage, search: searchTerm, numero, cliente_nombre: cliente });
            console.log('API Response:', response);

            if (response.data && Array.isArray(response.data.ordenesCompra)) {
                setOrdenes(response.data.ordenesCompra);
                setPaginatedOrdenes(response.data.ordenesCompra);
                setTotalPages(response.data.totalPages || 1);
                setTotalItems(response.data.total || 0);
                setCurrentPage(response.data.currentPage || 1);
            } else {
                console.error('Unexpected response format:', response.data);
                setError('Unexpected response format. Please contact the administrator.');
            }
        } catch (err) {
            console.error('Error fetching ordenes:', err);
            setError('Error loading ordenes. Please try again.');

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Could not load ordenes. Please try again.',
                confirmButtonColor: '#321fdb'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        fetchOrdenes(page, itemsPerPage, searchTerm, numeroFilter, clienteFilter);
    };

    const debouncedFetchOrdenes = useRef(debounce((search, numero, cliente) => {
        fetchOrdenes(1, itemsPerPage, search, numero, cliente);
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
        debouncedFetchOrdenes(searchTerm, numeroFilter, clienteFilter);
    }, [searchTerm, numeroFilter, clienteFilter]);

    const handleSearch = () => {
        fetchOrdenes(1, itemsPerPage, searchTerm, numeroFilter, clienteFilter);
    };

    const clearFilters = () => {
        setNumeroFilter('');
        setClienteFilter('');
        setSearchTerm('');
        fetchOrdenes(1, itemsPerPage, '', '', '');
    };

    const clearSearch = () => {
        setSearchTerm('');
        fetchOrdenes(1, itemsPerPage, '', numeroFilter, clienteFilter);
    };

    const handleOpenCreateModal = () => {
        console.log('Abriendo modal de creación');
        setCurrentOrden({ numero_orden: '', cliente_id: '', fecha_emision: '', fecha_entrega: '', lugar_entrega: '', observacion: '', forma_pago: '' });
        setFormErrors({});
        setModalTitle('Crear Nueva Orden');
        setShowModal(true);
    };

    const handleOpenEditModal = (orden) => {
        console.log('Abriendo modal de edición para:', orden);
        setCurrentOrden({ ...orden });
        setFormErrors({});
        setModalTitle('Editar Orden');
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentOrden({ ...currentOrden, [name]: value });

        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: null });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!currentOrden.cliente_id) {
            errors.cliente_id = 'El cliente es obligatorio';
        }

        if (!currentOrden.tipo_lote) {
            errors.tipo_lote = 'El tipo de lote es obligatorio';
        }

        if (!currentOrden.tipo_pago) {
            errors.tipo_pago = 'El tipo de pago es obligatorio';
        }

        if (!currentOrden.fecha_emision) {
            errors.fecha_emision = 'La fecha de emisión es obligatoria';
        }

        return errors;
    };

    const handleSaveOrden = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setActiveTab('general'); // Cambiar a la pestaña general si hay errores
            return null; // Retornar null si hay errores
        }

        if (!user) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.',
                confirmButtonColor: '#321fdb'
            });
            return null; // Retornar null si no hay usuario
        }

        setSubmitting(true);
        setFormErrors({});

        try {
            const ordenData = {
                ...currentOrden,
                usuario_creacion_id: user.id
            };

            let savedOrden;
            if (currentOrden.id) {
                // Actualizar orden existente
                savedOrden = await ordenCompraService.update(currentOrden.id, ordenData);
            } else {
                // Crear nueva orden
                savedOrden = await ordenCompraService.create(ordenData);
            }

            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: currentOrden.id ? '¡Actualizado!' : '¡Creado!',
                text: `La orden "${currentOrden.numero_orden}" ha sido ${currentOrden.id ? 'actualizada' : 'creada'} correctamente.`,
                confirmButtonColor: '#321fdb',
                timer: 2000,
                timerProgressBar: true
            });

            await fetchOrdenes(currentPage, itemsPerPage, searchTerm, numeroFilter, clienteFilter);
            setShowModal(false);

            // Retornar la orden guardada
            return savedOrden.data || savedOrden;
        } catch (err) {
            console.error('Error al guardar orden:', err);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.error || 'Error al guardar la orden. Por favor, intente nuevamente.',
                confirmButtonColor: '#321fdb'
            });

            setFormErrors({
                api: err.response?.data?.error || 'Error al guardar la orden. Por favor, intente nuevamente.',
            });

            return null; // Retornar null si hay error
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDeleteModal = (orden) => {
        console.log('Solicitando confirmación para eliminar:', orden);

        Swal.fire({
            title: '¿Está seguro?',
            text: `¿Desea eliminar la orden "${orden.numero_orden}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteOrden(orden);
            }
        });
    };

    const handleChangeEstadoOrden = async (ordenId, nuevoEstado) => {
        try {
            // Mostrar confirmación según el estado
            const mensajes = {
                'cancelado': '¿Está seguro que desea CANCELAR esta orden?',
                'terminado': '¿Está seguro que desea TERMINAR/CERRAR esta orden?'
            };

            const resultado = await Swal.fire({
                title: 'Confirmar cambio de estado',
                text: mensajes[nuevoEstado] || 'Confirmar cambio de estado',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: nuevoEstado === 'cancelado' ? '#d33' : '#28a745',
                cancelButtonColor: '#6c757d',
                confirmButtonText: nuevoEstado === 'cancelado' ? 'Sí, cancelar' : 'Sí, terminar',
                cancelButtonText: 'Cancelar'
            });

            if (!resultado.isConfirmed) return;

            // Cambiar estado mediante API
            await ordenCompraService.cambiarEstado(ordenId, nuevoEstado);

            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: `La orden ha sido ${nuevoEstado === 'cancelado' ? 'cancelada' : 'terminada'} correctamente.`,
                confirmButtonColor: '#321fdb',
                timer: 2000,
                timerProgressBar: true
            });

            // Recargar las órdenes
            await fetchOrdenes(currentPage, itemsPerPage, searchTerm, numeroFilter, clienteFilter);
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.error || 'Error al cambiar el estado de la orden',
                confirmButtonColor: '#321fdb'
            });
        }
    };

    const deleteOrden = async (orden) => {
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

            await ordenCompraService.delete(orden.id);

            const remainingItems = filteredOrdenes.length - 1;
            const newPage = remainingItems === 0 && currentPage > 1 ? currentPage - 1 : currentPage;

            await fetchOrdenes(newPage, itemsPerPage, searchTerm, numeroFilter, clienteFilter);

            Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: `La orden "${orden.numero_orden}" ha sido eliminada correctamente.`,
                confirmButtonColor: '#321fdb',
                timer: 2000,
                timerProgressBar: true
            });
        } catch (err) {
            console.error('Error al eliminar orden:', err);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.error || 'Error al eliminar la orden. Por favor, intente nuevamente.',
                confirmButtonColor: '#321fdb'
            });
        }
    };

    const applyFilters = () => {
        fetchOrdenes(1, itemsPerPage, searchTerm, numeroFilter, clienteFilter);
    };

    useEffect(() => {
        setIsFilterActive(
            searchTerm.trim() !== '' || numeroFilter.trim() !== '' || clienteFilter.trim() !== ''
        );
    }, [searchTerm, numeroFilter, clienteFilter]);

    console.log('Renderizando componente Ordenes', { ordenes, loading, error });

    return (
        <>
            <CCard className="mb-4">
                <CCardHeader>
                    <strong>Gestión de Órdenes</strong>
                    <CButton
                        color="primary"
                        className="float-end me-2"
                        onClick={handleOpenCreateModal}
                    >
                        <CIcon icon={cilPlus} className="me-2" />
                        Nueva Orden
                    </CButton>
                </CCardHeader>
                <CCardBody>
                    <CRow className="mb-3">
                        <CCol md={4}>
                            <CInputGroup>
                                <CFormInput
                                    placeholder="Buscar órdenes..."
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
                                        value={activeFilter === 'numero' ? numeroFilter : clienteFilter}
                                        onChange={handleFilterInputChange(
                                            activeFilter === 'numero' ? setNumeroFilter : setClienteFilter
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
                    ) : filteredOrdenes.length > 0 ? (
                        <>
                            <CTable hover responsive style={customStyles.compactTable}>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">
                                            Código Lote
                                            <CButton
                                                color="link"
                                                onClick={() => setActiveFilter(activeFilter === 'numero' ? null : 'numero')}
                                            >
                                                <CIcon icon={cilFilter} />
                                            </CButton>
                                        </CTableHeaderCell>
                                        <CTableHeaderCell scope="col">
                                            Número de Orden
                                            <CButton
                                                color="link"
                                                onClick={() => setActiveFilter(activeFilter === 'numero' ? null : 'numero')}
                                            >
                                                <CIcon icon={cilFilter} />
                                            </CButton>
                                        </CTableHeaderCell>
                                        <CTableHeaderCell scope="col">
                                            Cliente
                                            <CButton
                                                color="link"
                                                onClick={() => setActiveFilter(activeFilter === 'cliente' ? null : 'cliente')}
                                            >
                                                <CIcon icon={cilFilter} />
                                            </CButton>
                                        </CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Fecha de Emisión</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Fecha de Entrega</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Estado</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {filteredOrdenes.map((orden, index) => (
                                        <OrdenRow
                                            key={orden.id}
                                            orden={orden}
                                            index={index}
                                            currentPage={currentPage}
                                            itemsPerPage={itemsPerPage}
                                            onEdit={handleOpenEditModal}
                                            onDelete={handleOpenDeleteModal}
                                            onChangeEstado={handleChangeEstadoOrden}
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
                                    Mostrando {filteredOrdenes.length} de {totalItems} órdenes
                                </small>
                            </div>
                        </>
                    ) : (
                        <CAlert color="info">No hay órdenes disponibles. Cree una nueva haciendo clic en el botón "Nueva Orden".</CAlert>
                    )}

                    {showModal && (
                        <Suspense fallback={<div className="text-center my-3"><CSpinner /></div>}>
                            <OrdenModal
                                visible={showModal}
                                onClose={() => setShowModal(false)}
                                title={modalTitle}
                                orden={currentOrden}
                                errors={formErrors}
                                submitting={submitting}
                                onChange={handleInputChange}
                                onSave={handleSaveOrden}
                            />
                        </Suspense>
                    )}
                </CCardBody>
            </CCard>
        </>
    );
};

export default Ordenes;