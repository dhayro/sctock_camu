import React, { useState, useEffect, useRef, useContext } from 'react'
import { debounce } from 'lodash';
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
  CButton, CContainer, CFormCheck,
  CButtonGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CSpinner,
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
  CProgress,
  CTabContent,
  CTabPane,
  CPagination,
  CPaginationItem,
  CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx';
import {
  cilPlus,
  cilPencil,
  cilTrash,
  cilSearch,
  cilInfo,
  cilSpeedometer,
  cilUser,
  cilReload,
  cilXCircle,
  cilCalculator,
  cilCalendar,
  cilCheckCircle,
  cilMediaPlay,
  cilArrowBottom,
  cilSync, cilSave, cilCloudDownload, cilMediaStop, cilArrowCircleBottom, cilLocationPin, cilSpreadsheet, cilFilter, cilFilterX,
  cilSettings,
  cilBrushAlt,
  cilHistory,
  cilList, cilClock,
  cilX
} from '@coreui/icons'
import Swal from 'sweetalert2'
import Select from 'react-select'
import { UserContext } from '../../context/UserContext';
import ingresoService from '../../services/api/ingresoService';
import socioService from '../../services/api/socioService';
import productoService from '../../services/api/productoService';
import detalleOrdenCompraService from '../../services/api/detalleOrdenCompraService';
import detallePesajeService from '../../services/api/detallePesajeService';
import ordenCompraService from '../../services/api/ordenCompraService';
import unidadMedidaService from '../../services/api/unidadMedidaService';
import tipoFrutaService from '../../services/api/tipoFrutaService';
import balanzaService from '../../services/api/balanzaService';

const modalStyles = {
  modalDialog90vw: {
    maxWidth: '90vw',
    width: '90vw'
  },
  modalBody: {
    maxHeight: 'calc(90vh - 140px)',
    overflowY: 'auto'
  }
};

const Ingresos = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const { user } = useContext(UserContext); // Obtener el usuario del contexto
  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Estados principales
  const [ingresos, setIngresos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentIngreso, setCurrentIngreso] = useState({
    numero_ingreso: '',
    fecha: '',
    socio_id: '',
    producto_id: '',
    detalle_orden_id: '',
    unidad_medida_id: '',
    tipo_fruta_id: '',
    num_jabas: 0,
    descuento_merma: 0,
    dscto_jaba: 0,
    peso_bruto: 0,
    peso_neto: 0,
    impuesto: 40,
    precio_venta_kg: 0,
    total: 0,
    pago_transporte: 0,
    ingreso_cooperativa: 0,
    pago_socio: 0,
    pago_con_descuento: 0,
    observacion: '',
    aplicarPrecioJaba: false
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [editingId, setEditingId] = useState(null);

  // Estados para datos relacionados
  const [socios, setSocios] = useState([])
  const [productos, setProductos] = useState([])
  const [pedidosLote, setPedidosLote] = useState([])
  const [unidadesMedida, setUnidadesMedida] = useState([])
  const [tiposFruta, setTiposFruta] = useState([])

  // Estados para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [numeroFilter, setNumeroFilter] = useState('')
  const [socioFilter, setSocioFilter] = useState('')
  const [fechaFilter, setFechaFilter] = useState('')
  const [historialPesajes, setHistorialPesajes] = useState([]);

  const [clienteFilter, setClienteFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [error, setError] = useState(null);

  const filterInputRef = useRef(null);



  const handleSearchChange = (e) => {
    setSearchTermIngresos(e.target.value);
  };

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

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchIngresos(newPage, itemsPerPage, searchTerm, numeroFilter, socioFilter);
  };

  useEffect(() => {
    // Llama a fetchIngresos cuando cambien los filtros o la página
    fetchIngresos(currentPage, itemsPerPage, searchTerm, numeroFilter, socioFilter);
  }, [currentPage, itemsPerPage, searchTerm, numeroFilter, socioFilter]);

  // const handleSearchChange = (e) => {
  //   setSearchTerm(e.target.value);
  // };

  const handleSearch = () => {
    fetchIngresos(1, itemsPerPage, searchTerm, numeroFilter, socioFilter);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setNumeroFilter('');
    setSocioFilter('');
    fetchIngresos(1, itemsPerPage, '', '', '');
  };

  // const handleFilterInputChange = (setter) => (e) => {
  //   const value = e.target.value;
  //   setter(value);
  // };




  // Estados para pestañas y balanza
  const [activeTab, setActiveTab] = useState('general')
  const [pesoActual, setPesoActual] = useState(0)
  const [balanzaConectada, setBalanzaConectada] = useState(false)

  // Agregar estos estados adicionales después de los estados existentes

  // Estados para el monitor en tiempo real
  const [eventSource, setEventSource] = useState(null);

  // Asegúrate de que el estado inicial esté correctamente definido


  // Función para iniciar el monitoreo en tiempo real






  // Función para aplicar peso en tiempo real al formulario


  // Limpiar EventSource cuando el componente se desmonte

  // Limpiar conexiones al desmontar el componente
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  // Modificar la función obtenerPesoBalanza existente
  // const obtenerPesoBalanza = async () => {
  //   try {
  //     setLeyendoPeso(true);
  //     const response = await balanzaService.getWeight();

  //     if (response.weight !== undefined) {
  //       setPesoActual(response.weight);
  //       setCurrentIngreso(prev => ({
  //         ...prev,
  //         peso_neto: response.weight.toFixed(3)
  //       }));

  //       // Recalcular totales
  //       const event = {
  //         target: {
  //           name: 'peso_neto',
  //           value: response.weight.toFixed(3)
  //         }
  //       };
  //       handleInputChange(event);

  //       toast.success(`Peso obtenido: ${response.weight} ${response.unit || 'kg'}`);
  //     }
  //   } catch (error) {
  //     console.error('Error al obtener peso:', error);
  //     toast.error('No se pudo obtener el peso de la balanza');
  //   } finally {
  //     setLeyendoPeso(false);
  //   }
  // };
  const [conectandoBalanza, setConectandoBalanza] = useState(false) // Agregar esta línea

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [ingresoToDelete, setIngresoToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [modalBalanzaVisible, setModalBalanzaVisible] = useState(false);

  const [productosOrden, setProductosOrden] = useState([]);
  const [productoSeleccionadoPesaje, setProductoSeleccionadoPesaje] = useState('');
  const [cantidadPendientePorProducto, setCantidadPendientePorProducto] = useState({});
  const [cargandoProductosOrden, setCargandoProductosOrden] = useState(false);

  const [pesajesTemporales, setPesajesTemporales] = useState([]); // Lista de pesajes temporales del producto activo





  const agregarPesajeTemporal = () => {
    if (!productoSeleccionadoPesaje) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto no seleccionado',
        text: 'Por favor seleccione un producto antes de agregar el pesaje',
        confirmButtonColor: '#321fdb'
      });
      return;
    }

    if (!pesajeRealTime.stable || pesajeRealTime.weight <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Peso no estable',
        text: 'Espere a que el peso se estabilice antes de agregarlo',
        confirmButtonColor: '#321fdb'
      });
      return;
    }

    const nuevoPesaje = {
      id: `temp_${Date.now()}`,
      producto_id: productoSeleccionadoPesaje, // Agregar el ID del producto
      peso_bruto: pesajeRealTime.weight,
      num_jabas: parseInt(numJabas) || 0,
      peso_total_jabas: (parseInt(numJabas) || 0) * pesoJaba,
      observacion: observacionPesaje || '',
      fecha_pesaje: new Date().toISOString(),
      estable: true,
      timestamp: new Date().toISOString()
    };

    setPesajesTemporales(prev => [...prev, nuevoPesaje]);

    // Limpiar campos
    setNumJabas('');
    setObservacionPesaje('');

    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: '¡Pesaje agregado!',
      text: `Peso: ${pesajeRealTime.weight.toFixed(3)} kg`,
      timer: 1500,
      showConfirmButton: false
    });
  };




  // Agregar esta función cerca de las otras funciones
  const cargarProductosDeOrden = async (ordenId) => {
    if (!ordenId) {
      setProductosOrden([]);
      setCantidadPendientePorProducto({});
      return;
    }

    setCargandoProductosOrden(true);
    try {
      // Cargar los detalles de la orden
      const response = await detalleOrdenCompraService.getByOrdenId(ordenId);

      if (response && response.data && Array.isArray(response.data)) {
        // Formatear los productos con los nombres correctos de campos
        const productosFormateados = response.data.map(detalle => ({
          id: detalle.id,
          producto_id: detalle.producto_id,
          tipo_fruta_id: detalle.tipo_fruta_id,
          cantidad: parseFloat(detalle.cantidad) || 0, // Convertir string a número
          precio: parseFloat(detalle.precio) || 0,     // Convertir string a número
          subtotal: parseFloat(detalle.subtotal) || 0, // Convertir string a número
          cantidad_ingresada: parseFloat(detalle.cantidad_ingresada) || 0, // Convertir string a número
          estado: detalle.estado,
          observacion: detalle.observacion,
          // Nombres de las relaciones (si vienen incluidas)
          producto_nombre: detalle.producto?.nombre || 'Producto no especificado',
          tipo_fruta_nombre: detalle.tipo_fruta?.nombre || 'Tipo no especificado'
        }));

        setProductosOrden(productosFormateados);

        // Inicializar cantidades pendientes (toda la cantidad está pendiente inicialmente)
        const cantidadesPendientes = {};
        productosFormateados.forEach(producto => {
          cantidadesPendientes[producto.id] = producto.cantidad;
        });
        setCantidadPendientePorProducto(cantidadesPendientes);

        toast.success(`Se cargaron ${productosFormateados.length} productos de la orden`);
      } else {
        setProductosOrden([]);
        setCantidadPendientePorProducto({});
        toast.info('No se encontraron productos en esta orden');
      }
    } catch (error) {
      console.error('Error al cargar productos de la orden:', error);
      setProductosOrden([]);
      setCantidadPendientePorProducto({});
      toast.error('Error al cargar los productos de la orden');
    } finally {
      setCargandoProductosOrden(false);
    }
  };



  // Estados adicionales para balanza
  const [puertosBalanza, setPuertosBalanza] = useState([])

  // Agregar estos estados al inicio del componente (después de los estados existentes)
  const [puertosDisponibles, setPuertosDisponibles] = useState([]);
  const [puertoSeleccionado, setPuertoSeleccionado] = useState('');
  const [baudRate, setBaudRate] = useState(9600);
  const [cargandoPuertos, setCargandoPuertos] = useState(false);
  const [cargandoSocios, setCargandoSocios] = useState(false);




  // Efecto para cargar la configuración guardada al montar el componente
  useEffect(() => {
    const cargarConfiguracionGuardada = () => {
      try {
        const configuracionGuardada = localStorage.getItem('configuracionBalanza');
        if (configuracionGuardada) {
          const config = JSON.parse(configuracionGuardada);
          if (config.puerto) {
            setPuertoSeleccionado(config.puerto);
          }
          if (config.baudRate) {
            setBaudRate(config.baudRate);
          }
          // Cargar otras configuraciones si las tienes
        }
      } catch (error) {
        console.error('Error al cargar configuración guardada:', error);
      }
    };

    cargarConfiguracionGuardada();
  }, []);


  // Agrega este useEffect para cargar puertos cuando se abra el modal
  useEffect(() => {
    if (modalBalanzaVisible) {
      cargarPuertos();
      verificarEstadoBalanza();
    }
  }, [modalBalanzaVisible]);

  // También agrega este useEffect para cargar la configuración guardada al montar el componente
  useEffect(() => {
    const cargarConfiguracionGuardada = () => {
      try {
        const configuracionGuardada = localStorage.getItem('configuracionBalanza');
        if (configuracionGuardada) {
          const config = JSON.parse(configuracionGuardada);
          if (config.puerto) {
            setPuertoSeleccionado(config.puerto);
          }
          if (config.baudRate) {
            setBaudRate(config.baudRate);
          }
        }
      } catch (error) {
        console.error('Error al cargar configuración guardada:', error);
      }
    };

    cargarConfiguracionGuardada();
  }, []);

  // Modifica las funciones para persistir la configuración
  const handlePuertoChange = (puerto) => {
    setPuertoSeleccionado(puerto);

    // Guardar en localStorage
    try {
      const configuracionActual = JSON.parse(localStorage.getItem('configuracionBalanza') || '{}');
      const nuevaConfiguracion = {
        ...configuracionActual,
        puerto: puerto
      };
      localStorage.setItem('configuracionBalanza', JSON.stringify(nuevaConfiguracion));
    } catch (error) {
      console.error('Error al guardar puerto seleccionado:', error);
    }
  };

  const handleBaudRateChange = (baudRate) => {
    setBaudRate(baudRate);

    // Guardar en localStorage
    try {
      const configuracionActual = JSON.parse(localStorage.getItem('configuracionBalanza') || '{}');
      const nuevaConfiguracion = {
        ...configuracionActual,
        baudRate: baudRate
      };
      localStorage.setItem('configuracionBalanza', JSON.stringify(nuevaConfiguracion));
    } catch (error) {
      console.error('Error al guardar baudRate:', error);
    }
  };

  // Asegúrate de que la función cargarPuertos esté definida correctamente

  const cargarPuertos = async () => {
    try {
      setCargandoPuertos(true);
      const response = await balanzaService.getPuertosDisponibles();

      // Verificar que la respuesta sea válida y sea un array
      let puertos = [];
      if (response && Array.isArray(response)) {
        puertos = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        puertos = response.data;
      } else {
        console.warn('Respuesta de puertos no válida:', response);
        puertos = [];
      }

      setPuertosDisponibles(puertos);

      // Si hay un puerto guardado en localStorage, verificar que aún esté disponible
      const configuracionGuardada = localStorage.getItem('configuracionBalanza');
      if (configuracionGuardada && puertos.length > 0) {
        const config = JSON.parse(configuracionGuardada);
        if (config.puerto) {
          const puertoExiste = puertos.some(puerto => puerto.path === config.puerto);
          if (!puertoExiste) {
            // Si el puerto guardado ya no está disponible, limpiar la selección
            setPuertoSeleccionado('');
            const nuevaConfig = { ...config };
            delete nuevaConfig.puerto;
            localStorage.setItem('configuracionBalanza', JSON.stringify(nuevaConfig));
          }
        }
      }

      if (puertos.length === 0) {
        mostrarMensaje('No se encontraron puertos disponibles', 'warning');
      }

    } catch (error) {
      console.error('Error al cargar puertos:', error);
      setPuertosDisponibles([]);
      mostrarMensaje('Error al cargar puertos: ' + (error.response?.data?.error || error.message), 'danger');
    } finally {
      setCargandoPuertos(false);
    }
  };


  const cargarSocios = async (searchTerm = '') => {
    try {
      setCargandoSocios(true);
      // Enviar el searchTerm al backend
      const response = await socioService.getAllSocios({
        search: searchTerm,
        page: 1,
        itemsPerPage: 100 // Aumentar el límite para obtener más resultados
      });

      if (response && Array.isArray(response.socios)) {
        setSocios(response.socios);
      } else if (Array.isArray(response)) {
        setSocios(response);
      } else {
        console.error('Formato de respuesta inesperado para socios:', response);
        setSocios([]);
      }
    } catch (error) {
      console.error('Error al cargar socios:', error);
      setSocios([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los socios',
        confirmButtonColor: '#321fdb'
      });
    } finally {
      setCargandoSocios(false);
    }
  };

  // Add these state variables near the top of your component where other useState declarations are:
  const [socioSeleccionado, setSocioSeleccionado] = useState('');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState('');
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);
  const [searchTermOrdenes, setSearchTermOrdenes] = useState('');
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);
  const [searchTermSocios, setSearchTermSocios] = useState('');
  const [searchTermIngresos, setSearchTermIngresos] = useState('');




  // Luego, modifica la función limpiarModal para incluir la limpieza de socios:
  const limpiarModal = () => {
    // Limpiar datos del ingreso
    setCurrentIngreso({
      numero_ingreso: '',
      fecha: new Date().toISOString().split('T')[0],
      socio_id: '',
      producto_id: '',
      detalle_orden_id: '',
      unidad_medida_id: '',
      tipo_fruta_id: '',
      num_jabas: 0,
      descuento_merma: 0,
      dscto_jaba: 0,
      peso_bruto: 0,
      impuesto: 40,
      peso_neto: 0,
      precio_venta_kg: 0,
      total: 0,
      pago_transporte: 0,
      ingreso_cooperativa: 0,
      pago_socio: 0,
      pago_con_descuento: 0,
      observacion: '',
      aplicarPrecioJaba: false
    });

    detenerMonitoreoRealTime();

    // Limpiar orden y productos
    setOrdenSeleccionada('');
    setProductosOrden([]);
    setCantidadPendientePorProducto({});
    setProductoSeleccionadoPesaje('');

    // // Limpiar pesajes temporales
    // if (typeof setPesajesTemporales !== 'undefined') {
    //   setPesajesTemporales([]);
    // }

    // Limpiar errores
    setFormErrors({});

    setPesoJaba(2); // Peso configurable por jaba
    setPrecioVentaKg(2.7); // Precio por defecto
    setPorcentajeImpuesto(4); // Impuesto por defecto

    // Limpiar búsquedas
    setSearchTermOrdenes('');
    setSearchTermSocios('');

    // Limpiar selecciones de socios y órdenes
    setSocioSeleccionado('');
    setOrdenSeleccionada('');
    setContadorPesajes(1);

    // Resetear listas de datos
    // setSocios([]);
    // setOrdenesPendientes([]);

    // Detener monitoreo si está activo
    if (typeof setMonitorActivo !== 'undefined' && typeof monitorActivo !== 'undefined' && monitorActivo) {
      setMonitorActivo(false);
    }

    // Resetear peso en tiempo real
    if (typeof setPesajeRealTime !== 'undefined') {
      setPesajeRealTime({
        weight: 0,
        stable: false,
        unit: 'kg'
      });
    }

    // Limpiar historial de pesajes
    setHistorialPesajes([]);

    // Resetear pestañas
    setActiveTab('general');

    console.log('Modal limpiado completamente');
  };



  // Modificar la función para cerrar el modal
  const cerrarModal = () => {
    limpiarModal();
    setShowModal(false);
  };


  // También agregar una función para abrir el modal que cargue los datos iniciales
  const abrirModal = async (titulo, ingreso = null) => {
    setModalTitle(titulo);

    if (ingreso) {
      // Modo edición
      setCurrentIngreso(ingreso);
      setEditingId(ingreso.id); // Establecer el ID del ingreso que se está editando

      // Cargar pesajes temporales para el ingreso en edición
      try {
        const pesajes = await obtenerPesajesTemporales(ingreso.id);
        setPesajesTemporales(pesajes);

        if (ingreso.detalle_orden.producto_id) {
          setProductoSeleccionadoPesaje(ingreso.detalle_orden.producto_id);
        }


        setPesajesTemporales(prev => {
          const nuevosTemporales = [...prev];

          // Calcular los totales de los pesajes temporales
          const totalPesoBruto = nuevosTemporales.reduce((sum, p) => sum + (parseFloat(p.peso_bruto) || 0), 0);
          const totalJabas = nuevosTemporales.reduce((sum, p) => sum + (parseInt(p.num_jabas_pesaje) || 0), 0);
          const totalPesoJabas = nuevosTemporales.reduce((sum, p) => sum + (parseFloat(p.peso_jaba) || 0), 0);
          const totalDescuentoMerma = nuevosTemporales.reduce((sum, p) => sum + (parseFloat(p.descuento_merma) || 0), 0);
          const totalPesoNeto = nuevosTemporales.reduce((sum, p) => sum + (parseFloat(p.peso_neto) || 0), 0);

          // Actualizar el estado del ingreso actual con los nuevos totales
          setCurrentIngreso(prev => ({
            ...prev,
            peso_bruto: totalPesoBruto.toFixed(3),
            num_jabas: totalJabas,
            peso_total_jabas: totalPesoJabas.toFixed(3),
            descuento_merma: totalDescuentoMerma.toFixed(3),
            peso_neto: totalPesoNeto.toFixed(3),
            // Recalcular el total basado en el nuevo peso neto
            total: (totalPesoNeto * parseFloat((prev.precio_venta_kg || precioVentaKg) || 0)).toFixed(2)
          }));

          return nuevosTemporales;
        });
      } catch (error) {
        console.error('Error al cargar pesajes temporales:', error);
        setPesajesTemporales([]);
      }
    } else {
      // Modo creación - limpiar todo primero
      limpiarModal();
      setEditingId(null); // No hay ingreso en edición
      setPesajesTemporales([]); // Limpiar pesajes temporales

      // Luego cargar datos iniciales
      cargarSocios('');
      cargarOrdenesPendientes('');
    }

    setShowModal(true);
  };



  const obtenerPesajesTemporales = async (ingresoId) => {
    // Implementa la lógica para obtener los pesajes temporales desde el backend o el estado
    // Aquí se asume que hay un servicio que devuelve los pesajes temporales para un ingreso dado
    const response = await detallePesajeService.getByIngresoId(ingresoId);
    return response || [];
  };




  // Busca el useEffect que maneja el cambio de orden seleccionada y agrega el reset del producto seleccionado
  useEffect(() => {
    if (ordenSeleccionada) {
      // Reset del producto seleccionado para pesaje cuando cambia la orden
      // setProductoSeleccionadoPesaje('');

      // Cargar productos de la orden
      cargarProductosDeOrden(ordenSeleccionada); // Pasar el ID de la orden

      // Limpiar datos del ingreso actual con valores por defecto solo si no estás editando
      if (!editingId) {
        setCurrentIngreso({
          numero_ingreso: '',
          fecha: new Date().toISOString().split('T')[0],
          socio_id: '',
          producto_id: '',
          detalle_orden_id: '',
          unidad_medida_id: '',
          tipo_fruta_id: '',
          num_jabas: 0,
          descuento_merma: 0,
          dscto_jaba: 0,
          peso_bruto: 0,
          peso_neto: 0,
          impuesto: 40,
          precio_venta_kg: 0,
          total: 0,
          pago_transporte: 0,
          ingreso_cooperativa: 0,
          pago_socio: 0,
          pago_con_descuento: 0,
          observacion: '',
          aplicarPrecioJaba: false
        });
      }
    }
  }, [ordenSeleccionada, editingId]);

  // También agregar el reset cuando se cambia de orden en el selector
  // const handleOrdenChange = (e) => {
  //   const ordenId = e.target.value;
  //   setOrdenSeleccionada(ordenId);

  //   // Reset adicional del producto seleccionado
  // //   setProductoSeleccionadoPesaje('');

  //   // Limpiar otros estados relacionados si es necesario
  //   setPesajes([]);
  //   setHistorialPesajes([]);

  //   if (ordenId) {
  //     const orden = ordenes.find(o => o.id === parseInt(ordenId));
  //     if (orden) {
  //       // Lógica adicional si es necesaria
  //     }
  //   }
  // };




  


  const cargarOrdenesPendientes = async (searchTerm = '') => {
    try {
      setCargandoOrdenes(true);

      // Obtener órdenes pendientes con término de búsqueda
      const response = await ordenCompraService.getPendientes({
        search: searchTerm,
        page: 1,
        itemsPerPage: 50 // Límite razonable para el dropdown
      });

      // Manejar diferentes formatos de respuesta
      let ordenes = [];
      if (response && Array.isArray(response.ordenesPendientes)) {
        ordenes = response.ordenesPendientes;
      } else if (response.data && Array.isArray(response.data.ordenesPendientes)) {
        ordenes = response.data.ordenesPendientes;
      } else if (response.data && Array.isArray(response.data.ordenesCompra)) {
        ordenes = response.data.ordenesCompra;
      } else if (response.data && Array.isArray(response.data)) {
        ordenes = response.data;
      } else if (Array.isArray(response)) {
        ordenes = response;
      } else {
        console.error('Formato de respuesta inesperado para órdenes:', response);
        ordenes = [];
      }

      setOrdenesPendientes(ordenes);
    } catch (error) {
      console.error('Error al cargar órdenes pendientes:', error);
      setOrdenesPendientes([]);
      if (searchTerm === '') { // Solo mostrar error si es la carga inicial
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las órdenes pendientes',
          confirmButtonColor: '#321fdb'
        });
      }
    } finally {
      setCargandoOrdenes(false);
    }
  };

  // Debounce para la búsqueda de órdenes
  const debouncedCargarSocios = useRef(
    debounce((searchTerm) => {
      cargarSocios(searchTerm);
    }, 300)
  ).current;

  // useEffect para cargar órdenes al inicio
  useEffect(() => {
    cargarSocios(); // Cargar órdenes pendientes al inicio
  }, []);

  // useEffect para búsqueda dinámica de órdenes
  useEffect(() => {
    if (searchTermSocios !== undefined) {
      debouncedCargarSocios(searchTermSocios);
    }
  }, [searchTermSocios, debouncedCargarSocios]);

  // Debounce para la búsqueda de órdenes
  const debouncedCargarIngresos = useRef(
    debounce((searchTerm) => {
      fetchIngresos(currentPage, itemsPerPage, searchTerm, numeroFilter, socioFilter);
    }, 300)
  ).current;

  // useEffect para cargar órdenes al inicio
  useEffect(() => {
    fetchIngresos(); // Cargar órdenes pendientes al inicio
  }, []);

  // useEffect para búsqueda dinámica de órdenes
  useEffect(() => {
    if (searchTermIngresos !== undefined) {
      debouncedCargarIngresos(searchTermIngresos);
    }
  }, [searchTermIngresos, debouncedCargarIngresos]);

  // Debounce para la búsqueda de órdenes
  const debouncedCargarOrdenes = useRef(
    debounce((searchTerm) => {
      cargarOrdenesPendientes(searchTerm);
    }, 300)
  ).current;

  // useEffect para cargar órdenes al inicio
  useEffect(() => {
    cargarOrdenesPendientes(); // Cargar órdenes pendientes al inicio
  }, []);

  // useEffect para búsqueda dinámica de órdenes
  useEffect(() => {
    if (searchTermOrdenes !== undefined) {
      debouncedCargarOrdenes(searchTermOrdenes);
    }
  }, [searchTermOrdenes, debouncedCargarOrdenes]);
  // Agregar un useEffect que recargue los datos cuando cambie el searchTerm
  useEffect(() => {
    // Debounce para evitar demasiadas llamadas al API
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        // Recargar socios con el nuevo término de búsqueda
        cargarSocios(searchTerm);
        // Recargar órdenes con el término de búsqueda
        cargarOrdenesPendientes();
      } else {
        // Si no hay término de búsqueda, cargar todos los datos
        cargarSocios('');
        cargarOrdenesPendientes('');
      }
    }, 300); // Esperar 300ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Remover socioSeleccionado de las dependencias
  const exportarDatosPesaje = async () => {
    try {
      if (!currentIngreso.id) {
        toast.warning('Debe seleccionar un ingreso para exportar los datos de pesaje');
        return;
      }

      setSubmitting(true);

      // Obtener los datos de pesaje del ingreso actual
      const pesajesData = await balanzaService.getPesajes(currentIngreso.id);

      if (!pesajesData || pesajesData.length === 0) {
        toast.warning('No hay datos de pesaje para exportar');
        return;
      }

      // Preparar los datos para exportar
      const datosExportar = {
        ingreso: {
          numero_ingreso: currentIngreso.numero_ingreso,
          fecha: currentIngreso.fecha,
          socio: socios.find(s => s.id === parseInt(currentIngreso.socio_id))?.nombres + ' ' +
            socios.find(s => s.id === parseInt(currentIngreso.socio_id))?.apellidos,
          peso_neto_total: currentIngreso.peso_neto,
          total_pesajes: pesajesData.length
        },
        pesajes: pesajesData.map((pesaje, index) => ({
          numero: index + 1,
          peso: pesaje.peso,
          fecha_hora: pesaje.created_at || pesaje.timestamp,
          observacion: pesaje.observacion || ''
        }))
      };

      // Crear contenido CSV
      let csvContent = "data:text/csv;charset=utf-8,";

      // Encabezados del ingreso
      csvContent += "DATOS DEL INGRESO\n";
      csvContent += `Número de Ingreso,${datosExportar.ingreso.numero_ingreso}\n`;
      csvContent += `Fecha,${datosExportar.ingreso.fecha}\n`;
      csvContent += `Socio,${datosExportar.ingreso.socio}\n`;
      csvContent += `Peso Neto Total,${datosExportar.ingreso.peso_neto_total} kg\n`;
      csvContent += `Total de Pesajes,${datosExportar.ingreso.total_pesajes}\n\n`;

      // Encabezados de pesajes
      csvContent += "DETALLE DE PESAJES\n";
      csvContent += "Número,Peso (kg),Fecha y Hora,Observación\n";

      // Datos de pesajes
      datosExportar.pesajes.forEach(pesaje => {
        csvContent += `${pesaje.numero},${pesaje.peso},${pesaje.fecha_hora},${pesaje.observacion}\n`;
      });

      // Crear y descargar el archivo
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `pesajes_${currentIngreso.numero_ingreso}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Datos de pesaje exportados correctamente');

    } catch (error) {
      console.error('Error al exportar datos de pesaje:', error);
      toast.error('Error al exportar los datos: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };



  const conectarBalanza = async () => {
    if (!puertoSeleccionado) {
      toast.warning('Por favor, seleccione un puerto');
      return;
    }

    try {
      setConectandoBalanza(true);
      const response = await balanzaService.connect({
        port: puertoSeleccionado,
        baudRate: parseInt(baudRate)
      });

      // Corregir el acceso a la respuesta - quitar .data
      toast.success(response.message || 'Balanza conectada exitosamente');
      setBalanzaConectada(true);
      setConectandoBalanza(false);
    } catch (error) {
      console.error('Error al conectar balanza:', error);
      toast.error('Error al conectar: ' + (error.response?.data?.error || error.message));
      setConectandoBalanza(false);
    }
  };

  // Cargar puertos cuando se abre la pestaña de pesaje
  useEffect(() => {
    if (activeTab === 'pesaje' && puertosDisponibles.length === 0) {
      cargarPuertos();
    }
  }, [activeTab]);

  // Función para filtrar socios basada en el término de búsqueda
  const filtrarSocios = (socios, searchTerm) => {
    if (!searchTerm) return socios;

    const term = searchTerm.toLowerCase();
    return socios.filter(socio =>
      socio.codigo?.toLowerCase().includes(term) ||
      socio.nombres?.toLowerCase().includes(term) ||
      socio.apellidos?.toLowerCase().includes(term) ||
      `${socio.nombres} ${socio.apellidos}`.toLowerCase().includes(term)
    );
  };

  // Función para filtrar órdenes basada en el término de búsqueda
  const filtrarOrdenes = (ordenes, searchTerm) => {
    if (!searchTerm) return ordenes;

    const term = searchTerm.toLowerCase();
    return ordenes.filter(orden =>
      orden.codigo_lote?.toLowerCase().includes(term) ||
      orden.cliente?.razon_social?.toLowerCase().includes(term)
    );
  };


  // Referencias
  const numeroInputRef = useRef(null)

  const confirmDelete = async () => {
    if (!ingresoToDelete) return

    setDeleting(true)
    try {
      await ingresoService.delete(ingresoToDelete.id)

      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'El ingreso ha sido eliminado correctamente.',
        confirmButtonColor: '#321fdb',
        timer: 2000,
        timerProgressBar: true
      })

      await fetchIngresos()
      setShowDeleteModal(false)
      setIngresoToDelete(null)
    } catch (error) {
      console.error('Error al eliminar ingreso:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Error al eliminar el ingreso',
        confirmButtonColor: '#321fdb'
      })
    } finally {
      setDeleting(false)
    }
  }


  // Funciones de carga de datos

  const fetchIngresos = async (page = 1, itemsPerPage = 10, searchTerm = '', numero = '', socio = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await ingresoService.getAll({
        page,
        itemsPerPage,
        search: searchTerm,
        numero_ingreso: numero,
        socio_nombre: socio,
      });
      console.log('API Response:', response);

      if (response && Array.isArray(response.ingresos)) {
        setIngresos(response.ingresos);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
        setCurrentPage(response.currentPage || 1);
      } else {
        console.error('Unexpected response format:', response);
        setError('Unexpected response format. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error fetching ingresos:', err);
      setError('Error loading ingresos. Please try again.');

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load ingresos. Please try again.',
        confirmButtonColor: '#321fdb',
      });
    } finally {
      setLoading(false);
    }
  };


  const fetchDatosRelacionados = async () => {
    try {
      const [sociosRes, productosRes, pedidosRes, unidadesRes, tiposRes] = await Promise.all([
        socioService.getAllSocios(),
        productoService.getAll(),
        detalleOrdenCompraService.getAll(),
        unidadMedidaService.getAll(),
        tipoFrutaService.getAll()
      ])

      setSocios(sociosRes?.socios || sociosRes || [])
      setProductos(productosRes.data?.productos || productosRes || [])
      setPedidosLote(pedidosRes.data?.detallesOrdenCompra || pedidosRes || [])
      setUnidadesMedida(unidadesRes.data?.unidadesMedida || unidadesRes || [])
      setTiposFruta(tiposRes.data?.tiposFruta || tiposRes || [])
    } catch (error) {
      console.error('Error al cargar datos relacionados:', error)
    }
  }

  const checkBalanzaStatus = async () => {
    try {
      const response = await balanzaService.getStatus()
      setBalanzaConectada(response.connected || false)
    } catch (error) {
      console.error('Error al verificar estado de balanza:', error)
      setBalanzaConectada(false)
    }
  }

  // Funciones de validación
  const validateForm = () => {
    const errors = {}

    if (!currentIngreso.numero_ingreso?.trim()) {
      errors.numero_ingreso = 'El número de ingreso es requerido'
    }

    if (!currentIngreso.fecha) {
      errors.fecha = 'La fecha es requerida'
    }

    if (!currentIngreso.socio_id) {
      errors.socio_id = 'El socio es requerido'
    }

    if (!currentIngreso.producto_id) {
      errors.producto_id = 'El producto es requerido'
    }

    if (!currentIngreso.tipo_fruta_id) {
      errors.tipo_fruta_id = 'El tipo de fruta es requerido'
    }

    if (!currentIngreso.num_jabas || currentIngreso.num_jabas <= 0) {
      errors.num_jabas = 'El número de jabas debe ser mayor a 0'
    }

    if (!currentIngreso.peso_neto || currentIngreso.peso_neto <= 0) {
      errors.peso_neto = 'El peso neto debe ser mayor a 0'
    }

    if (!currentIngreso.precio_venta_kg || currentIngreso.precio_venta_kg <= 0) {
      errors.precio_venta_kg = 'El precio por kg debe ser mayor a 0'
    }

    return errors
  }

  // Funciones de manejo de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentIngreso(prev => {
      const updated = { ...prev, [name]: value }

      // Calcular automáticamente valores dependientes
      if (['peso_neto', 'precio_venta_kg', 'descuento_merma', 'dscto_jaba', 'pago_transporte'].includes(name)) {
        const pesoNeto = parseFloat(updated.peso_neto) || 0
        const precioKg = parseFloat(updated.precio_venta_kg) || 0
        const descuentoMerma = parseFloat(updated.descuento_merma) || 0
        const descuentoJaba = parseFloat(updated.dscto_jaba) || 0
        const pagoTransporte = parseFloat(updated.pago_transporte) || 0

        const subtotal = pesoNeto * precioKg
        const totalDescuentos = descuentoMerma + descuentoJaba
        const total = subtotal - totalDescuentos
        const ingresoCooperativa = total * 0.1 // 10% para cooperativa
        const pagoSocio = total - ingresoCooperativa - pagoTransporte

        updated.total = total.toFixed(2)
        updated.ingreso_cooperativa = ingresoCooperativa.toFixed(2)
        updated.pago_socio = pagoSocio.toFixed(2)
        updated.pago_con_descuento = pagoSocio.toFixed(2)
      }

      return updated
    })

    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (selectedOption, fieldName) => {
    const event = {
      target: {
        name: fieldName,
        value: selectedOption ? selectedOption.value : ''
      }
    }
    handleInputChange(event)
  }
  // Funciones de balanza
  const obtenerPesoBalanza = async () => {
    try {
      const response = await balanzaService.getWeight()
      if (response.weight !== undefined) {
        setPesoActual(response.weight)
        setCurrentIngreso(prev => ({
          ...prev,
          peso_neto: response.weight.toFixed(3)
        }))

        Swal.fire({
          icon: 'success',
          title: 'Peso obtenido',
          text: `Peso actual: ${response.weight} ${response.unit || 'kg'}`,
          timer: 2000,
          timerProgressBar: true,
          confirmButtonColor: '#321fdb'
        })
      }
    } catch (error) {
      console.error('Error al obtener peso:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el peso de la balanza',
        confirmButtonColor: '#321fdb'
      })
    }
  }



  // Agregar después de la línea 693, en la sección del monitor en tiempo real:


  // Funciones para el Monitor en Tiempo Real

  // Función para iniciar el monitoreo en tiempo real

  // Función para iniciar el monitoreo en tiempo real

  // Función para iniciar el monitoreo en tiempo real
  const iniciarMonitoreoRealTime = async () => {
    if (!balanzaConectada) {
      toast.warning('Debe conectar la balanza primero');
      return;
    }

    try {
      setMonitorActivo(true);

      // Cerrar cualquier conexión EventSource existente
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }


      // Usar el servicio createRealtimeConnection en lugar de crear EventSource manualmente
      const eventSource = balanzaService.createRealtimeConnection(
        // Función onData - se ejecuta cuando llegan datos
        (data) => {
          console.log('Datos recibidos del monitor:', data);

          // Solo procesar si el tipo es 'messageProcessed'
          if (data.type !== 'messageProcessed') {
            return;
          }

          // Actualizar el estado del pesaje en tiempo real
          setPesajeRealTime(prev => ({
            ...prev,
            weight: data.weight || 0,
            stable: data.stable || false,
            status: data.stable ? 'ESTABLE' : 'LEYENDO...',
            statusColor: data.stable ? '#28a745' : '#ffc107',
            timestamp: data.timestamp || new Date().toISOString(),
            rawData: data.rawData || '',
            hexData: data.hexData || ''
          }));

          // Si el peso es estable, agregarlo al historial
          if (data.stable && data.weight > 0) {
            setPesajes(prev => {
              const nuevoPesaje = {
                id: `pesaje_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ID único
                peso: data.weight,
                stable: data.stable,
                timestamp: data.timestamp || new Date().toISOString(),
                rawData: data.rawData
              };

              // Mantener solo los últimos 10 pesajes
              const nuevoHistorial = [nuevoPesaje, ...prev].slice(0, 10);
              return nuevoHistorial;
            });
          }
        },
        // Función onError - se ejecuta cuando hay errores
        (error) => {
          console.error('Error en conexión de tiempo real:', error);
          setMonitorActivo(false);
          toast.error('Error en la conexión del monitor');

          // Resetear el estado del pesaje
          setPesajeRealTime({
            weight: 0,
            stable: false,
            status: 'ERROR',
            statusColor: '#dc3545',
            timestamp: null,
            rawData: '',
            hexData: ''
          });
        }
      );

      eventSourceRef.current = eventSource;
      toast.success('Monitor de peso iniciado');

    } catch (error) {
      console.error('Error al iniciar monitoreo:', error);
      setMonitorActivo(false);
      toast.error('Error al iniciar el monitor de peso');
    }
  };

  // Función para detener el monitoreo
  const detenerMonitoreoRealTime = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setMonitorActivo(false);

    // Resetear el estado del pesaje
    setPesajeRealTime({
      weight: 0,
      stable: false,
      status: 'DESCONECTADO',
      statusColor: '#6c757d',
      timestamp: null,
      rawData: '',
      hexData: ''
    });

    toast.info('Monitor de peso detenido');
  };

  // Función para aplicar peso estable
  const aplicarPesoEstable = () => {
    if (!monitorActivo) {
      toast.warning('Debe iniciar el monitor primero');
      return;
    }

    const peso = pesajeRealTime?.weight ?? 0;

    if (!pesajeRealTime.stable || peso <= 0) {
      toast.warning('Debe esperar a que el peso se estabilice');
      return;
    }

    setCurrentIngreso(prev => ({
      ...prev,
      peso_neto: peso.toFixed(3)
    }));

    // Recalcular totales automáticamente
    const event = {
      target: {
        name: 'peso_neto',
        value: peso.toFixed(3)
      }
    };
    handleInputChange(event);

    toast.success(`Peso aplicado: ${peso.toFixed(3)} kg`);
  };

  const [aplicarPrecioJaba, setAplicarPrecioJaba] = useState(false);

  // Función para manejar el cambio del checkbox
  const handleCheckboxChange = (event) => {
    const { checked } = event.target;
    setCurrentIngreso((prev) => ({
      ...prev,
      aplicarPrecioJaba: checked
    }));
  };


  // Función para aplicar peso en tiempo real al formulario (corregida)

  // Agregar estos estados al inicio del componente (cerca de los otros useState)

  const [contadorPesajes, setContadorPesajes] = useState(1); // Contador para numerar los pesajes

  const [pesoJaba, setPesoJaba] = useState(2); // Peso configurable por jaba
  const [precioVentaKg, setPrecioVentaKg] = useState(2.7); // Precio por defecto
  const [porcentajeImpuesto, setPorcentajeImpuesto] = useState(4); // Impuesto por defecto

  const camposBloqueados = pesajesTemporales.length > 0;


  // Función para sincronizar totales del ingreso con pesajes temporales
  const sincronizarTotalesIngreso = (pesajesActualizados) => {
    const totalPesoBruto = pesajesActualizados.reduce((sum, p) => sum + (parseFloat(p.peso_bruto) || 0), 0);
    const totalJabas = pesajesActualizados.reduce((sum, p) => sum + (parseInt(p.num_jabas) || 0), 0);
    const totalPesoJabas = pesajesActualizados.reduce((sum, p) => sum + (parseFloat(p.peso_jabas) || 0), 0); //kong

    setCurrentIngreso(prev => ({
      ...prev,
      peso_bruto: totalPesoBruto.toFixed(3),
      num_jabas: totalJabas,
      peso_total_jabas: totalPesoJabas.toFixed(3)
    }));

    return { totalPesoBruto, totalJabas, totalPesoJabas };
  };


  const detectarJabas = (peso) => {
    if (!peso || peso <= 0 || !pesoJaba || pesoJaba <= 0) return 0;

    // Calcular número aproximado de jabas
    const jabasCalculadas = Math.round(peso / pesoJaba);

    // Validar que el cálculo sea razonable (no más de 50 jabas por pesaje)
    return jabasCalculadas > 50 ? 0 : jabasCalculadas;
  };



  // Agregar un useEffect para forzar re-render cuando cambien los pesajesTemporales
  useEffect(() => {
    // Forzar re-render cuando cambien los pesajes temporales
    if (pesajesTemporales.length > 0) {
      // Esto forzará que se recalculen los valores en el render
      setProductosOrden(prev => [...prev]);
    }
  }, [pesajesTemporales]);

  // Asegúrate de que estas funciones estén definidas ANTES del return del componente
  const calcularPesoNetoIngresadoPorProducto = (productoId) => {
    return pesajesTemporales
      .filter(pesaje => pesaje.producto_id === productoId)
      .reduce((sum, pesaje) => {
        const pesoNeto = parseFloat(pesaje.peso_bruto || 0) - parseFloat(pesaje.peso_jabas || 0);
        return sum + pesoNeto;
      }, 0);
  };


  const calcularCantidadPendienteActualizada = (producto) => {
    const cantidadTotal = producto.cantidad || 0;
    const cantidadIngresadaOriginal = producto.cantidad_ingresada || 0;
    const pesoNetoIngresado = calcularPesoNetoIngresadoPorProducto(producto.id);
    const cantidadIngresadaTotal = cantidadIngresadaOriginal + pesoNetoIngresado;

    // Calcular la cantidad pendiente restando la cantidad ingresada total de la cantidad total
    return Math.max(0, cantidadTotal - cantidadIngresadaTotal);
  };

  const calcularProgresoActualizado = (producto) => {
    const cantidadTotal = producto.cantidad || 0;
    const cantidadIngresadaOriginal = producto.cantidad_ingresada || 0;
    const pesoNetoIngresado = calcularPesoNetoIngresadoPorProducto(producto.id);
    const cantidadIngresadaTotal = cantidadIngresadaOriginal + pesoNetoIngresado;

    return cantidadTotal > 0 ? (cantidadIngresadaTotal / cantidadTotal) * 100 : 0;
  };

  const aplicarPesoRealTime = async () => {
    if (!pesajeRealTime.stable || !pesajeRealTime.weight) {
      toast.error('El peso debe estar estabilizado para aplicarlo');
      return;
    }

    const pesoBruto = pesajeRealTime.weight;

    // Verificar que hay un producto seleccionado
    if (!productoSeleccionadoPesaje) {
      toast.warning('Debe seleccionar un producto antes de aplicar el peso');
      return;
    }

    // Preguntar cuántas jabas y descuento por merma
    const { value: formValues } = await Swal.fire({
      title: 'Datos del Pesaje',
      html: `
      <div class="container-fluid">
        <div class="row mb-3">
          <div class="col-12">
            <div class="alert alert-primary mb-3">
              <i class="fas fa-weight-hanging me-2"></i>
              <strong>Peso bruto detectado:</strong> ${pesoBruto.toFixed(3)} kg
            </div>
          </div>
        </div>
        
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label for="swal-jabas" class="form-label fw-semibold">
              <i class="fas fa-box me-1"></i>
              Número de jabas:
            </label>
            <input type="number" id="swal-jabas" class="form-control" 
                   min="1" max="50" step="1" 
                   value="${Math.round(pesoBruto / (pesoJaba || 2))}" 
                   placeholder="Número de jabas">
          </div>
          
          <div class="col-12 col-md-6">
            <label for="swal-merma" class="form-label fw-semibold">
              <i class="fas fa-minus-circle me-1"></i>
              Descuento por merma (kg):
            </label>
            <input type="number" id="swal-merma" class="form-control" 
                   min="0" step="0.001" 
                   value="0" placeholder="0.000">
          </div>
        </div>
        
        <div class="row mt-4">
          <div class="col-12">
            <div class="card border-info">
              <div class="card-header bg-info text-white">
                <h6 class="mb-0">
                  <i class="fas fa-calculator me-2"></i>
                  Resumen de Cálculos
                </h6>
              </div>
              <div class="card-body">
                <div class="row g-2">
                  <div class="col-6 col-sm-3">
                    <small class="text-muted d-block">Peso por jaba:</small>
                    <strong class="text-primary">${pesoJaba} kg</strong>
                  </div>
                  <div class="col-6 col-sm-3">
                    <small class="text-muted d-block">Peso total jabas:</small>
                    <strong class="text-info"><span id="swal-peso-jabas">0.00</span> kg</strong>
                  </div>
                  <div class="col-6 col-sm-3">
                    <small class="text-muted d-block">Descuento merma:</small>
                    <strong class="text-warning"><span id="swal-descuento-merma">0.000</span> kg</strong>
                  </div>
                  <div class="col-6 col-sm-3">
                    <small class="text-muted d-block">Peso neto final:</small>
                    <strong class="text-success fs-6"><span id="swal-peso-neto">0.000</span> kg</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Aplicar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#321fdb',
      cancelButtonColor: '#6c757d',
      width: '600px',
      didOpen: () => {
        const jabasInput = document.getElementById('swal-jabas');
        const mermaInput = document.getElementById('swal-merma');
        const pesoJabasSpan = document.getElementById('swal-peso-jabas');
        const descuentoMermaSpan = document.getElementById('swal-descuento-merma');
        const pesoNetoSpan = document.getElementById('swal-peso-neto');

        const calcularPesos = () => {
          const jabas = parseInt(jabasInput.value) || 0;
          const merma = parseFloat(mermaInput.value) || 0;
          const pesoTotalJabas = jabas * pesoJaba;
          const pesoNeto = Math.max(0, pesoBruto - pesoTotalJabas - merma);

          pesoJabasSpan.textContent = pesoTotalJabas.toFixed(2);
          descuentoMermaSpan.textContent = merma.toFixed(3);
          pesoNetoSpan.textContent = pesoNeto.toFixed(3);
        };

        jabasInput.addEventListener('input', calcularPesos);
        mermaInput.addEventListener('input', calcularPesos);
        calcularPesos(); // Calcular inicial
      },
      preConfirm: () => {
        const jabas = parseInt(document.getElementById('swal-jabas').value);
        const merma = parseFloat(document.getElementById('swal-merma').value) || 0;

        if (!jabas || jabas <= 0) {
          Swal.showValidationMessage('Debe ingresar un número válido de jabas');
          return false;
        }
        if (jabas > 50) {
          Swal.showValidationMessage('El número de jabas no puede ser mayor a 50');
          return false;
        }
        if (merma < 0) {
          Swal.showValidationMessage('El descuento por merma no puede ser negativo');
          return false;
        }

        return { jabas, merma };
      }
    });

    // Si el usuario canceló o no ingresó valores válidos
    if (!formValues) {
      return;
    }

    const jabasIngresadas = formValues.jabas;
    const descuentoMerma = formValues.merma;
    const pesoTotalJabas = jabasIngresadas * pesoJaba;
    const pesoNeto = pesoBruto - pesoTotalJabas - descuentoMerma;

    // Buscar el producto seleccionado en la lista de productos de la orden
    const productoOrden = productosOrden.find(p => p.id === parseInt(productoSeleccionadoPesaje));
    if (!productoOrden) {
      toast.error('No se encontró el producto seleccionado en la orden');
      return;
    }



    // Crear el pesaje temporal con TODA la información necesaria
    const nuevoPesaje = {
      id: Date.now(),
      numero_pesaje: contadorPesajes,
      // Información del producto
      producto_id: parseInt(productoSeleccionadoPesaje),
      detalle_orden_id: productoOrden.id,
      producto_nombre: productoOrden.producto_nombre,
      tipo_fruta_id: productoOrden.tipo_fruta_id,
      tipo_fruta_nombre: productoOrden.tipo_fruta_nombre,
      // Información del pesaje
      peso_bruto: pesoBruto,
      num_jabas: jabasIngresadas,
      peso_total_jabas: pesoTotalJabas,
      descuento_merma: descuentoMerma, // ← NUEVO CAMPO
      peso_neto: pesoNeto, // Ya incluye el descuento por merma
      precio_kg: productoOrden.precio || 0,
      subtotal: pesoNeto * (productoOrden.precio || 0),
      // Metadatos
      timestamp: new Date().toISOString(),
      stable: pesajeRealTime.stable,
      rawData: pesajeRealTime.rawData,
      observacion: `Pesaje automático - ${new Date().toLocaleTimeString()}${descuentoMerma > 0 ? ` - Merma: ${descuentoMerma.toFixed(3)}kg` : ''}`
    };

    console.log('Aplicando peso con merma:', nuevoPesaje);



    setPesajesTemporales(prev => {
      const nuevosTemporales = [...prev, nuevoPesaje];

      const totalPesoBruto = nuevosTemporales.reduce((sum, p) => sum + (parseFloat(p.peso_bruto) || 0), 0);
      const totalJabas = nuevosTemporales.reduce((sum, p) => sum + (parseInt(p.num_jabas_pesaje) || parseInt(p.num_jabas) || 0), 0);
      const totalPesoJabas = nuevosTemporales.reduce((sum, p) => sum + (parseFloat(p.peso_jaba) || parseFloat(p.peso_total_jabas) || 0), 0);
      const totalDescuentoMerma = nuevosTemporales.reduce((sum, p) => sum + (parseFloat(p.descuento_merma) || 0), 0);
      const totalPesoNeto = nuevosTemporales.reduce((sum, p) => sum + (parseFloat(p.peso_neto) || 0), 0);

      // Actualizar el currentIngreso con los nuevos totales
      setCurrentIngreso(prev => ({
        ...prev,
        peso_bruto: totalPesoBruto.toFixed(3),
        num_jabas: totalJabas,
        peso_total_jabas: totalPesoJabas.toFixed(3),
        descuento_merma: totalDescuentoMerma.toFixed(3),
        peso_neto: totalPesoNeto.toFixed(3),
        // Recalcular el total basado en el nuevo peso neto
        total: (totalPesoNeto * parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0)).toFixed(2)
      }));


      return nuevosTemporales;
    });

    // Incrementar el contador para el próximo pesaje
    setContadorPesajes(prev => prev + 1);

    // Agregar al historial de pesajes
    setHistorialPesajes(prev => [...prev, {
      ...nuevoPesaje,
      fecha_hora: new Date().toLocaleString()
    }]);

    // Forzar re-render de la tabla de productos para actualizar progreso
    setProductosOrden(prev => [...prev]);

    toast.success(`Pesaje agregado: ${pesoBruto.toFixed(3)} kg bruto, ${jabasIngresadas} jabas${descuentoMerma > 0 ? `, merma ${descuentoMerma.toFixed(3)} kg` : ''} = ${pesoNeto.toFixed(3)} kg neto`);
  };



  // const aplicarPesoRealTime = async () => {
  //   if (!pesajeRealTime.stable || !pesajeRealTime.weight) {
  //     toast.error('El peso debe estar estabilizado para aplicarlo');
  //     return;
  //   }

  //   const pesoBruto = pesajeRealTime.weight;

  //   // Verificar que hay un producto seleccionado
  //   if (!productoSeleccionadoPesaje) {
  //     toast.warning('Debe seleccionar un producto antes de aplicar el peso');
  //     return;
  //   }

  //   // Preguntar cuántas jabas corresponden a este peso
  //   const { value: numJabas } = await Swal.fire({
  //     title: 'Número de Jabas',
  //     html: `
  //     <div style="text-align: left; margin-bottom: 15px;">
  //       <p><strong>Peso bruto detectado:</strong> ${pesoBruto.toFixed(3)} kg</p>
  //       <p><strong>¿Cuántas jabas corresponden a este peso?</strong></p>
  //     </div>
  //   `,
  //     input: 'number',
  //     inputAttributes: {
  //       min: 1,
  //       max: 50,
  //       step: 1,
  //       placeholder: 'Número de jabas'
  //     },
  //     inputValue: Math.round(pesoBruto / (pesoJaba || 25)), // Sugerencia basada en peso promedio
  //     showCancelButton: true,
  //     confirmButtonText: 'Aplicar',
  //     cancelButtonText: 'Cancelar',
  //     confirmButtonColor: '#321fdb',
  //     cancelButtonColor: '#6c757d',
  //     inputValidator: (value) => {
  //       if (!value || value <= 0) {
  //         return 'Debe ingresar un número válido de jabas';
  //       }
  //       if (value > 50) {
  //         return 'El número de jabas no puede ser mayor a 50';
  //       }
  //     }
  //   });

  //   // Si el usuario canceló o no ingresó un valor válido
  //   if (!numJabas) {
  //     return;
  //   }

  //   const jabasIngresadas = parseInt(numJabas);
  //   const pesoTotalJabas = jabasIngresadas * pesoJaba;

  //   // Buscar el producto seleccionado en la lista de productos de la orden
  //   const productoOrden = productosOrden.find(p => p.id === parseInt(productoSeleccionadoPesaje));
  //   if (!productoOrden) {
  //     toast.error('No se encontró el producto seleccionado en la orden');
  //     return;
  //   }

  //   // Crear el pesaje temporal (solo con peso bruto, el neto se calculará después)
  //   const nuevoPesajeTemporal = {
  //     id: Date.now(), // ID temporal único
  //     numero: contadorPesajes,
  //     producto_id: productoOrden.producto_id,
  //     producto_nombre: productoOrden.producto_nombre,
  //     tipo_fruta_id: productoOrden.tipo_fruta_id,
  //     tipo_fruta_nombre: productoOrden.tipo_fruta_nombre,
  //     peso_bruto: pesoBruto,
  //     num_jabas: jabasIngresadas,
  //     peso_total_jabas: pesoTotalJabas,
  //     // El peso neto se calculará después en el procesamiento final
  //     peso_neto: 0, // Por ahora en 0, se calculará después
  //     precio_kg: productoOrden.precio || 0,
  //     subtotal: 0, // Se calculará después cuando se determine el peso neto
  //     timestamp: new Date().toISOString(),
  //     observacion: `Pesaje automático - ${new Date().toLocaleTimeString()}`
  //   };

  //   // Agregar el pesaje a la lista temporal
  //   setPesajesTemporales(prev => [...prev, nuevoPesajeTemporal]);

  //   setProductosOrden(prev => [...prev]);


  //   // Incrementar el contador para el próximo pesaje
  //   setContadorPesajes(prev => prev + 1);

  //   // Actualizar el formulario principal con los totales acumulados (solo peso bruto por ahora)
  //   const nuevosPesajes = [...pesajesTemporales, nuevoPesajeTemporal];
  //   const pesoBrutoTotal = nuevosPesajes.reduce((total, pesaje) => total + pesaje.peso_bruto, 0);
  //   const jabasTotales = nuevosPesajes.reduce((total, pesaje) => total + pesaje.num_jabas, 0);
  //   const pesoTotalJabasAcumulado = nuevosPesajes.reduce((total, pesaje) => total + pesaje.peso_total_jabas, 0);

  //   // Actualizar el formulario principal (solo peso bruto y jabas)
  //   setCurrentIngreso(prev => ({
  //     ...prev,
  //     peso_bruto: pesoBrutoTotal.toFixed(3),
  //     num_jabas: jabasTotales,
  //     peso_total_jabas: pesoTotalJabasAcumulado.toFixed(3),
  //     // El peso neto y totales se calcularán en el procesamiento final
  //     peso_neto: 0, // Se calculará después
  //     total: 0 // Se calculará después
  //   }));

  //   // Agregar al historial de pesajes
  //   setHistorialPesajes(prev => [...prev, {
  //     ...nuevoPesajeTemporal,
  //     fecha_hora: new Date().toLocaleString()
  //   }]);

  //   toast.success(`Pesaje agregado: ${pesoBruto.toFixed(3)} kg bruto con ${jabasIngresadas} jabas`);
  // }; 

  // Modificar la función aplicarPesoRealTime para incluir logs de debug
  // const aplicarPesoRealTime = () => {
  //   if (!pesajeRealTime.stable || !pesajeRealTime.weight) {
  //     toast.error('El peso no está estabilizado');
  //     return;
  //   }

  //   if (!productoSeleccionadoPesaje) {
  //     toast.error('Debe seleccionar un producto para el pesaje');
  //     return;
  //   }

  //   const nuevoPesaje = {
  //     id: Date.now(),
  //     producto_id: productoSeleccionadoPesaje,
  //     peso_bruto: pesajeRealTime.weight,
  //     peso_total_jabas: pesoJaba * Math.ceil(pesajeRealTime.weight / pesoJaba),
  //     num_jabas: Math.ceil(pesajeRealTime.weight / pesoJaba),
  //     timestamp: new Date().toISOString(),
  //     stable: pesajeRealTime.stable,
  //     rawData: pesajeRealTime.rawData
  //   };

  //   console.log('Aplicando peso:', nuevoPesaje);
  //   console.log('Pesajes temporales antes:', pesajesTemporales);

  //   setPesajesTemporales(prev => {
  //     const nuevosTemporales = [...prev, nuevoPesaje];
  //     console.log('Pesajes temporales después:', nuevosTemporales);
  //     return nuevosTemporales;
  //   });

  //   toast.success(`Peso aplicado: ${pesajeRealTime.weight.toFixed(3)} kg`);
  // };


  const limpiarPesajesTemporales = async () => {
    if (pesajesTemporales.length === 0) {
      toast.info('No hay pesajes temporales para limpiar');
      return;
    }

    const result = await Swal.fire({
      title: '¿Limpiar todos los pesajes temporales?',
      text: `Se eliminarán ${pesajesTemporales.length} pesajes temporales. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, limpiar todo',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      // Limpiar los pesajes temporales
      setPesajesTemporales([]);

      // Resetear el contador de pesajes
      setContadorPesajes(1);

      // Resetear los valores del formulario principal
      setCurrentIngreso(prev => ({
        ...prev,
        peso_bruto: '0.000',
        num_jabas: 0,
        peso_total_jabas: '0.000',
        descuento_merma: '0.000',
        peso_neto: '0.000',
        total: '0.00',
        ingreso_cooperativa: '0.00',
        pago_socio: '0.00',
        pago_con_descuento: '0.00'
      }));

      // Limpiar el historial de pesajes
      setHistorialPesajes([]);

      toast.success('Todos los pesajes temporales han sido eliminados');

    } catch (error) {
      console.error('Error al limpiar pesajes temporales:', error);
      toast.error('Error al limpiar los pesajes temporales');
    }
  };

  // Función para actualizar el progreso del producto
  const actualizarProgresoProducto = (productoId, pesoNeto) => {
    setCantidadPendientePorProducto(prev => {
      const cantidadActual = prev[productoId] || 0;
      const nuevaCantidad = Math.max(0, cantidadActual - pesoNeto);
      return {
        ...prev,
        [productoId]: nuevaCantidad
      };
    });
  };


  const eliminarPesajeTemporal = (pesajeId) => {
    setPesajesTemporales(prev => {
      const updatedPesajes = prev.filter(p => p.id !== pesajeId);

      // Recalcular todos los totales después de eliminar
      const totalPesoBruto = updatedPesajes.reduce((sum, p) => sum + (parseFloat(p.peso_bruto) || 0), 0);
      const totalJabas = updatedPesajes.reduce((sum, p) => sum + (parseInt(p.num_jabas_pesaje) || 0), 0);
      const totalPesoJabas = updatedPesajes.reduce((sum, p) => sum + (parseFloat(p.peso_jaba) || 0), 0);
      const totalDescuentoMerma = updatedPesajes.reduce((sum, p) => sum + (parseFloat(p.descuento_merma) || 0), 0);
      const totalPesoNeto = updatedPesajes.reduce((sum, p) => sum + (parseFloat(p.peso_neto) || 0), 0);

      // Actualizar el currentIngreso con los nuevos totales
      setCurrentIngreso(prev => ({
        ...prev,
        peso_bruto: totalPesoBruto.toFixed(3),
        num_jabas: totalJabas,
        peso_total_jabas: totalPesoJabas.toFixed(3),
        descuento_merma: totalDescuentoMerma.toFixed(3),
        peso_neto: totalPesoNeto.toFixed(3),
        // Recalcular el total basado en el nuevo peso neto
        total: (totalPesoNeto * parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0)).toFixed(2),
        // Recalcular el ingreso a la cooperativa y el pago al socio
        ingreso_cooperativa: (totalPesoNeto * parseFloat(currentIngreso.impuesto || 0) / 100).toFixed(2),
        pago_socio: (totalPesoNeto * parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0) - totalDescuentoMerma - (totalPesoNeto * parseFloat(currentIngreso.impuesto || 0) / 100)).toFixed(2)
      }));

      return updatedPesajes;
    });

    toast.success('Pesaje eliminado y totales actualizados');
  };

  // Modificar la función guardarPesajeAutomatico para incluir el producto seleccionado
  const guardarPesajeAutomatico = () => {
    if (!monitorActivo || !pesajeRealTime.stable) {
      toast.error('El peso debe estar estabilizado para guardarlo');
      return;
    }

    if (!productoSeleccionadoPesaje) {
      toast.error('Debe seleccionar un producto para el pesaje');
      return;
    }

    if (!currentIngreso.num_jabas || currentIngreso.num_jabas <= 0) {
      toast.error('Debe especificar el número de jabas');
      return;
    }

    const pesoTotalJabas = currentIngreso.num_jabas * pesoJaba;
    const pesoNeto = pesajeRealTime.weight - pesoTotalJabas;

    if (pesoNeto <= 0) {
      toast.error('El peso neto debe ser mayor a 0');
      return;
    }

    // Verificar que no exceda la cantidad pendiente
    const cantidadPendiente = cantidadPendientePorProducto[productoSeleccionadoPesaje] || 0;
    if (pesoNeto > cantidadPendiente) {
      toast.error(`El peso neto (${pesoNeto.toFixed(3)} kg) excede la cantidad pendiente (${cantidadPendiente.toFixed(3)} kg)`);
      return;
    }

    const nuevoPesaje = {
      id: Date.now(),
      producto_id: productoSeleccionadoPesaje,
      producto_nombre: productosOrden.find(p => p.id === productoSeleccionadoPesaje)?.producto_nombre || '',
      peso_bruto: pesajeRealTime.weight,
      num_jabas: currentIngreso.num_jabas,
      impuesto: currentIngreso.impuesto,
      peso_total_jabas: pesoTotalJabas,
      peso_neto: pesoNeto,
      fecha_pesaje: new Date().toISOString(),
      observacion: currentIngreso.observacion || '',
      estable: pesajeRealTime.stable
    };

    // Agregar a pesajes temporales
    setPesajesTemporales(prev => [...prev, nuevoPesaje]);

    // Actualizar progreso del producto
    actualizarProgresoProducto(productoSeleccionadoPesaje, pesoNeto);

    // Limpiar formulario
    setCurrentIngreso(prev => ({
      ...prev,
      num_jabas: '',
      observacion: ''
    }));

    toast.success(`Pesaje guardado: ${pesoNeto.toFixed(3)} kg neto`);
  };






  // Función para calcular el progreso de un producto
  const calcularProgresoProducto = (productoId) => {
    const producto = productosOrden.find(p => p.id === productoId);
    if (!producto || !producto.cantidad) return { porcentaje: 0, pesado: 0, pendiente: producto?.cantidad || 0 };

    const pesado = pesajesTemporales
      .filter(p => p.producto_id === productoId)
      .reduce((total, pesaje) => total + pesaje.peso_neto, 0);

    const pendiente = Math.max(0, producto.cantidad - pesado);
    const porcentaje = Math.min(100, (pesado / producto.cantidad) * 100);

    return { porcentaje, pesado, pendiente };
  };

  // Función auxiliar para aplicar el peso al formulario
  const aplicarPesoAlFormulario = (peso) => {
    console.log('Aplicando peso al formulario:', peso);

    // Aplicar el peso al formulario
    // setCurrentIngreso(prev => {
    //   const updated = { ...prev, peso_neto: peso.toFixed(3) };

    //   // Recalcular totales automáticamente
    //   const pesoNeto = parseFloat(updated.peso_neto) || 0;
    //   const precioKg = parseFloat(updated.precio_venta_kg) || 0;
    //   const descuentoMerma = parseFloat(updated.descuento_merma) || 0;
    //   const descuentoJaba = parseFloat(updated.dscto_jaba) || 0;
    //   const pagoTransporte = parseFloat(updated.pago_transporte) || 0;

    //   const subtotal = pesoNeto * precioKg;
    //   const totalDescuentos = descuentoMerma + descuentoJaba;
    //   const total = subtotal - totalDescuentos;
    //   const ingresoCooperativa = total * 0.1; // 10% para cooperativa
    //   const pagoSocio = total - ingresoCooperativa - pagoTransporte;

    //   updated.total = total.toFixed(2);
    //   updated.ingreso_cooperativa = ingresoCooperativa.toFixed(2);
    //   updated.pago_socio = pagoSocio.toFixed(2);
    //   updated.pago_con_descuento = pagoSocio.toFixed(2);
    //   return updated;
    // });

    // Limpiar error del campo peso_neto si existe
    if (formErrors.peso_neto) {
      setFormErrors(prev => ({ ...prev, peso_neto: '' }));
    }

    toast.success(`Peso aplicado: ${peso.toFixed(3)} kg`);
  };


  // También asegúrate de que el botón esté correctamente conectado en el JSX:
  // En la sección del monitor en tiempo real, el botón debe verse así:



  // También agregar la función para actualizar historial de pesajes si no existe:
  const actualizarHistorialPesajes = async () => {
    if (!currentIngreso.id) return;

    try {
      const response = await balanzaService.getPesajes(currentIngreso.id);
      setPesajes(response || []);
    } catch (error) {
      console.error('Error al actualizar historial de pesajes:', error);
    }
  };

  // Función para limpiar datos del monitor
  const limpiarDatosMonitor = () => {
    setPesajeRealTime({
      weight: 0,
      stable: false,
      status: 'DESCONECTADO',
      statusColor: '#6c757d',
      timestamp: null,
      rawData: '',
      hexData: ''
    });

    setPesajes([]);
    toast.info('Datos del monitor limpiados');
  };

  // Función para exportar datos del monitor
  const exportarDatosMonitor = () => {
    if (pesajes.length === 0) {
      toast.warning('No hay datos para exportar');
      return;
    }

    try {
      // Crear CSV con los datos
      const headers = ['Timestamp', 'Peso (kg)', 'Estado', 'Datos Originales'];
      const csvContent = [
        headers.join(','),
        ...pesajes.map(pesaje => [
          new Date(pesaje.timestamp).toLocaleString(),
          pesaje.peso.toFixed(3),
          pesaje.stable ? 'Estable' : 'Inestable',
          `"${pesaje.rawData || ''}"`
        ].join(','))
      ].join('\n');

      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pesajes_monitor_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Datos exportados correctamente');
    } catch (error) {
      console.error('Error al exportar datos:', error);
      toast.error('Error al exportar los datos');
    }
  };


  // Asegúrate de que estas variables estén definidas en el estado
  // Agregar al inicio del componente si no existen:
  const [monitorActivo, setMonitorActivo] = useState(false);
  const [pesajeRealTime, setPesajeRealTime] = useState({
    weight: 0,
    stable: false,
    status: 'DESCONECTADO',
    statusColor: '#6c757d',
    timestamp: null,
    rawData: '',
    hexData: ''
  });
  const [pesajes, setPesajes] = useState([]);
  const eventSourceRef = useRef(null);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Función para obtener peso interpretado de la balanza (nueva)
  const obtenerPesoInterpretado = async () => {
    try {
      setSubmitting(true);
      const response = await balanzaService.getWeight();

      if (response && response.weight !== undefined) {
        const pesoInterpretado = response.weight;
        const unidad = response.unit || 'kg';
        const esEstable = response.stable || false;

        setPesoActual(pesoInterpretado);
        setCurrentIngreso(prev => ({
          ...prev,
          peso_neto: pesoInterpretado.toFixed(3)
        }));

        // Recalcular totales
        const event = {
          target: {
            name: 'peso_neto',
            value: pesoInterpretado.toFixed(3)
          }
        };
        handleInputChange(event);

        // Mostrar resultado con información del peso interpretado
        Swal.fire({
          icon: 'success',
          title: 'Peso Interpretado Obtenido',
          html: `
          <div style="text-align: left;">
            <p><strong>Peso interpretado:</strong> ${pesoInterpretado.toFixed(3)} ${unidad}</p>
            <p><strong>Estado:</strong> ${esEstable ? 'Estable' : 'Inestable'}</p>
            <p><strong>Datos originales:</strong> ${response.rawData || 'N/A'}</p>
          </div>
        `,
          timer: 3000,
          timerProgressBar: true,
          confirmButtonColor: '#321fdb'
        });
      } else {
        throw new Error('No se pudo interpretar el peso de la balanza');
      }
    } catch (error) {
      console.error('Error al obtener peso interpretado:', error);
      toast.error('Error al obtener el peso interpretado: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Función para guardar pesaje con peso interpretado (modificada)
  const guardarPesaje = async () => {
    if (!currentIngreso.id) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Debe guardar el ingreso antes de registrar pesajes',
        confirmButtonColor: '#321fdb'
      });
      return;
    }

    try {
      setSubmitting(true);

      // Usar el peso interpretado actual
      const pesoInterpretado = pesajeRealTime.weight > 0 ? pesajeRealTime.weight : pesoActual;

      if (pesoInterpretado <= 0) {
        toast.warning('No hay un peso válido para guardar');
        return;
      }

      const pesajeData = {
        ingreso_id: currentIngreso.id,
        numero_pesaje: pesajes.length + 1,
        peso: pesoInterpretado,
        peso_interpretado: pesoInterpretado, // Campo específico para peso interpretado
        datos_originales: pesajeRealTime.rawData || null,
        es_estable: pesajeRealTime.stable || false,
        timestamp: new Date().toISOString(),
        observacion: `Pesaje ${pesajes.length + 1} - Peso interpretado: ${pesoInterpretado.toFixed(3)} kg`
      };

      await balanzaService.saveWeight(pesajeData);

      // Actualizar lista de pesajes
      await fetchPesajes(currentIngreso.id);

      Swal.fire({
        icon: 'success',
        title: 'Pesaje Guardado',
        html: `
        <div style="text-align: left;">
          <p><strong>Peso interpretado:</strong> ${pesoInterpretado.toFixed(3)} kg</p>
          <p><strong>Estado:</strong> ${pesajeRealTime.stable ? 'Estable' : 'Inestable'}</p>
          <p><strong>Número de pesaje:</strong> ${pesajes.length + 1}</p>
        </div>
      `,
        timer: 2000,
        timerProgressBar: true,
        confirmButtonColor: '#321fdb'
      });
    } catch (error) {
      console.error('Error al guardar pesaje:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el pesaje: ' + (error.response?.data?.error || error.message),
        confirmButtonColor: '#321fdb'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Función para mostrar información detallada del peso interpretado
  const mostrarDetallesPesoInterpretado = () => {
    if (!pesajeRealTime.weight && !pesoActual) {
      toast.info('No hay datos de peso disponibles');
      return;
    }

    const peso = pesajeRealTime.weight || pesoActual;
    const datosOriginales = pesajeRealTime.rawData || 'No disponible';
    const esEstable = pesajeRealTime.stable || false;
    const timestamp = pesajeRealTime.timestamp || new Date().toISOString();

    Swal.fire({
      icon: 'info',
      title: 'Detalles del Peso Interpretado',
      html: `
      <div style="text-align: left; font-family: monospace;">
        <h4>Información del Peso</h4>
        <p><strong>Peso interpretado:</strong> ${peso.toFixed(3)} kg</p>
        <p><strong>Estado:</strong> <span style="color: ${esEstable ? 'green' : 'orange'}">${esEstable ? 'Estable' : 'Inestable'}</span></p>
        <p><strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}</p>
        
        <h4>Datos Originales</h4>
        <p><strong>Datos crudos:</strong></p>
        <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 5px 0;">
          ${datosOriginales}
        </div>
        
        <h4>Proceso de Interpretación</h4>
        <p>• Los datos crudos son procesados por el algoritmo de interpretación</p>
        <p>• Se extraen los valores numéricos relevantes</p>
        <p>• Se aplican las conversiones de unidades necesarias</p>
        <p>• Se determina la estabilidad basada en lecturas consecutivas</p>
      </div>
    `,
      width: '600px',
      confirmButtonColor: '#321fdb'
    });
  };

  // Función para confirmar pesajes temporales
  // const confirmarPesajesTemporales = async () => {
  //   if (pesajesTemporales.length === 0) {
  //     toast.warning('No hay pesajes temporales para confirmar');
  //     return;
  //   }

  //   try {
  //     const result = await Swal.fire({
  //       title: 'Confirmar Pesajes',
  //       html: `
  //       <div style="text-align: left;">
  //         <p>¿Está seguro de confirmar los siguientes pesajes?</p>
  //         <ul>
  //           ${pesajesTemporales.map(pesaje =>
  //         `<li>Pesaje #${pesaje.numero}: ${pesaje.peso_neto.toFixed(3)} kg - ${pesaje.producto_nombre}</li>`
  //       ).join('')}
  //         </ul>
  //         <p><strong>Total de pesajes:</strong> ${pesajesTemporales.length}</p>
  //         <p><strong>Peso total:</strong> ${pesajesTemporales.reduce((total, p) => total + p.peso_neto, 0).toFixed(3)} kg</p>
  //       </div>
  //     `,
  //       icon: 'question',
  //       showCancelButton: true,
  //       confirmButtonColor: '#28a745',
  //       cancelButtonColor: '#dc3545',
  //       confirmButtonText: 'Sí, confirmar',
  //       cancelButtonText: 'Cancelar'
  //     });

  //     if (!result.isConfirmed) return;

  //     setSubmitting(true);

  //     // Guardar cada pesaje temporal como pesaje confirmado
  //     for (const pesajeTemporal of pesajesTemporales) {
  //       const pesajeData = {
  //         ingreso_id: currentIngreso.id,
  //         producto_id: pesajeTemporal.producto_id,
  //         numero_pesaje: pesajeTemporal.numero,
  //         peso_bruto: pesajeTemporal.peso_bruto,
  //         peso_neto: pesajeTemporal.peso_neto,
  //         peso_jaba: pesoJaba,
  //         num_jabas: currentIngreso.num_jabas || 0,
  //         datos_originales: pesajeTemporal.rawData,
  //         es_estable: pesajeTemporal.stable,
  //         timestamp: pesajeTemporal.timestamp,
  //         observacion: `Pesaje confirmado desde monitor - ${pesajeTemporal.producto_nombre}`
  //       };

  //       await balanzaService.saveWeight(pesajeData);
  //     }

  //     // Actualizar historial de pesajes
  //     await fetchPesajes(currentIngreso.id);

  //     // Limpiar pesajes temporales
  //     limpiarPesajesTemporales();

  //     toast.success(`${pesajesTemporales.length} pesajes confirmados correctamente`);

  //   } catch (error) {
  //     console.error('Error al confirmar pesajes:', error);
  //     toast.error('Error al confirmar los pesajes: ' + (error.response?.data?.error || error.message));
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };


  const confirmarPesajesTemporales = async () => {
    if (pesajesTemporales.length === 0) {
      toast.warning('No hay pesajes temporales para confirmar');
      return;
    }

    try {
      setSubmitting(true);

      // Confirmar con el usuario
      const result = await Swal.fire({
        title: 'Confirmar Pesajes',
        html: `
        <div style="text-align: left;">
          <p>¿Está seguro de que desea confirmar ${pesajesTemporales.length} pesajes temporales?</p>
          <p><strong>Total peso neto:</strong> ${pesajesTemporales.reduce((total, p) => total + p.peso_neto, 0).toFixed(3)} kg</p>
        </div>
      `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#321fdb'
      });

      if (!result.isConfirmed) {
        return;
      }

      // Guardar cada pesaje temporal
      for (const pesajeTemporal of pesajesTemporales) {
        const pesajeData = {
          ingreso_id: currentIngreso.id,
          numero_pesaje: pesajeTemporal.numero,
          peso: pesajeTemporal.peso_neto,
          peso_bruto: pesajeTemporal.peso_bruto,
          num_jabas: pesajeTemporal.num_jabas,
          peso_jaba: pesajeTemporal.peso_jaba,
          observacion: `Pesaje confirmado - Producto: ${pesajeTemporal.producto_nombre}`,
          datos_originales: pesajeTemporal.rawData,
          producto_id: pesajeTemporal.producto_id
        };

        await balanzaService.savePesaje(pesajeData);
      }

      // Limpiar pesajes temporales
      limpiarPesajesTemporales();

      // Actualizar historial
      await actualizarHistorialPesajes();

      toast.success(`${pesajesTemporales.length} pesajes confirmados correctamente`);

    } catch (error) {
      console.error('Error al confirmar pesajes:', error);
      toast.error('Error al confirmar los pesajes: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };
  // Función para mostrar detalles de un pesaje
  const mostrarDetallesPesaje = (pesaje) => {
    Swal.fire({
      title: `Detalles del Pesaje #${pesaje.numero_pesaje}`,
      html: `
      <div style="text-align: left; font-family: monospace;">
        <h5>Información del Pesaje</h5>
        <p><strong>Peso:</strong> ${pesaje.peso?.toFixed(3) || '0.000'} kg</p>
        <p><strong>Estado:</strong> <span style="color: ${pesaje.es_estable ? 'green' : 'orange'}">${pesaje.es_estable ? 'Estable' : 'Inestable'}</span></p>
        <p><strong>Fecha/Hora:</strong> ${pesaje.timestamp ? new Date(pesaje.timestamp).toLocaleString() : 'N/A'}</p>
        
        ${pesaje.peso_bruto ? `<p><strong>Peso Bruto:</strong> ${pesaje.peso_bruto.toFixed(3)} kg</p>` : ''}
        ${pesaje.peso_neto ? `<p><strong>Peso Neto:</strong> ${pesaje.peso_neto.toFixed(3)} kg</p>` : ''}
        ${pesaje.peso_jaba ? `<p><strong>Peso Jaba:</strong> ${pesaje.peso_jaba.toFixed(3)} kg</p>` : ''}
        
        
        ${pesaje.observacion ? `
          <h5>Observaciones</h5>
          <p>${pesaje.observacion}</p>
        ` : ''}
        
        ${pesaje.datos_originales ? `
          <h5>Datos Originales</h5>
          <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0;">
            <code>${pesaje.datos_originales}</code>
          </div>
        ` : ''}
        
        ${pesaje.datos_hex ? `
          <h5>Datos Hexadecimales</h5>
          <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0;">
            <code>${pesaje.datos_hex}</code>
          </div>
        ` : ''}
      </div>
    `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#321fdb',
      width: '600px'
    });
  };

  // Función para obtener pesajes del ingreso actual
  const fetchPesajes = async (ingresoId) => {
    if (!ingresoId) return;

    try {
      const response = await balanzaService.getPesajes(ingresoId);
      setPesajes(response || []);
    } catch (error) {
      console.error('Error al obtener pesajes:', error);
      setPesajes([]);
    }
  };

  // Función para resetear el estado cuando se cambia de ingreso
  const resetearEstadoPesajes = () => {
    // setPesajesTemporales([]);
    // setContadorPesajes(1);
    setCantidadPendientePorProducto({});
    setPesajes([]);
    // setProductoSeleccionadoPesaje('');
  };

  // Llamar esta función cuando se selecciona un nuevo ingreso
  useEffect(() => {
    if (currentIngreso.id) {
      fetchPesajes(currentIngreso.id);
      resetearEstadoPesajes();
    }
  }, [currentIngreso.id]);

  // Función para validar si todos los productos están completos
  const validarProductosCompletos = () => {
    const productosIncompletos = productosOrden.filter(producto => {
      const progreso = calcularProgresoProducto(producto.id);
      return progreso.porcentaje < 100;
    });

    return {
      completo: productosIncompletos.length === 0,
      productosIncompletos: productosIncompletos
    };
  };

  // Función para mostrar resumen antes de confirmar
  const mostrarResumenPesajes = () => {
    const validacion = validarProductosCompletos();
    const totalPesajes = pesajesTemporales.length;
    const pesoTotal = pesajesTemporales.reduce((total, p) => total + p.peso_neto, 0);

    let mensaje = `
    <div style="text-align: left;">
      <h5>Resumen de Pesajes</h5>
      <p><strong>Total de pesajes:</strong> ${totalPesajes}</p>
      <p><strong>Peso total:</strong> ${pesoTotal.toFixed(3)} kg</p>
      
      <h6>Productos:</h6>
      <ul>
  `;

    productosOrden.forEach(producto => {
      const progreso = calcularProgresoProducto(producto.id);
      const estado = progreso.porcentaje >= 100 ? '✅' : '⚠️';
      mensaje += `
      <li>
        ${estado} ${producto.producto?.nombre}: 
        ${progreso.pesado.toFixed(3)}/${producto.cantidad} kg 
        (${progreso.porcentaje.toFixed(1)}%)
      </li>
    `;
    });

    mensaje += '</ul>';

    if (!validacion.completo) {
      mensaje += `
      <div style="background: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #ffc107;">
        <strong>⚠️ Advertencia:</strong> Algunos productos no están completos.
      </div>
    `;
    }

    mensaje += '</div>';

    return mensaje;
  };

  // Modificar la función confirmarPesajesTemporales para incluir el resumen
  const confirmarPesajesTemporalesConResumen = async () => {
    if (pesajesTemporales.length === 0) {
      toast.warning('No hay pesajes temporales para confirmar');
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Confirmar Pesajes',
        html: mostrarResumenPesajes(),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545',
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar',
        width: '600px'
      });

      if (!result.isConfirmed) return;

      await confirmarPesajesTemporales();

    } catch (error) {
      console.error('Error al confirmar pesajes:', error);
      toast.error('Error al confirmar los pesajes');
    }
  };

  // Función para exportar pesajes temporales a CSV
  const exportarPesajesTemporales = () => {
    if (pesajesTemporales.length === 0) {
      toast.warning('No hay pesajes temporales para exportar');
      return;
    }

    try {
      const headers = [
        'Número',
        'Producto',
        'Peso Bruto (kg)',
        'Peso Neto (kg)',
        'Fecha/Hora',
        'Estado',
        'Datos Originales'
      ];

      const csvContent = [
        headers.join(','),
        ...pesajesTemporales.map(pesaje => [
          pesaje.numero,
          `"${pesaje.producto_nombre}"`,
          pesaje.peso_bruto.toFixed(3),
          pesaje.peso_neto.toFixed(3),
          `"${new Date(pesaje.timestamp).toLocaleString()}"`,
          pesaje.stable ? 'Estable' : 'Inestable',
          `"${pesaje.rawData || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pesajes_temporales_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Pesajes temporales exportados correctamente');
    } catch (error) {
      console.error('Error al exportar pesajes temporales:', error);
      toast.error('Error al exportar los datos');
    }
  };


  // // Funciones CRUD
  // const handleCreate = () => {
  //   setCurrentIngreso({
  //     numero_ingreso: '',
  //     fecha: new Date().toISOString().split('T')[0],
  //     socio_id: '',
  //     producto_id: '',
  //     detalle_orden_id: '',
  //     unidad_medida_id: '',
  //     tipo_fruta_id: '',
  //     num_jabas: 0,
  //     descuento_merma: 0,
  //     dscto_jaba: 0,
  //     peso_neto: 0,
  //     impuesto: 40,
  //     precio_venta_kg: 0,
  //     total: 0,
  //     pago_transporte: 0,
  //     ingreso_cooperativa: 0,
  //     pago_socio: 0,
  //     pago_con_descuento: 0,
  //     observacion: ''
  //   })
  //   setFormErrors({})
  //   setActiveTab('general')
  //   setPesajes([])
  //   setModalTitle('Crear Nuevo Ingreso')
  //   setShowModal(true)
  // }




  const handleEdit = async (ingreso) => {
    try {
      // Cargar los detalles del ingreso desde el servicio
      const ingresoDetalles = await ingresoService.getById(ingreso.id);

      // Asegúrate de que los datos de socios y órdenes estén cargados
      if (socios.length === 0) {
        await cargarSocios();
      }
      if (ordenesPendientes.length === 0) {
        await cargarOrdenesPendientes();
      }

      const socioExistente = socios.find(socio => socio.id === ingresoDetalles.socio_id);
    if (!socioExistente) {
      const nuevoSocio = {
        id: ingresoDetalles.socio_id,
        codigo: ingresoDetalles.socio.codigo,
        nombres: ingresoDetalles.socio.nombres,
        apellidos: ingresoDetalles.socio.apellidos
      };
      setSocios(prevSocios => [...prevSocios, nuevoSocio]);
    }



      // Establecer el estado con los detalles del ingreso
      setCurrentIngreso({
        ...ingresoDetalles,
        fecha: ingresoDetalles.fecha ? ingresoDetalles.fecha.split('T')[0] : '',
        socio_id: ingresoDetalles.socio_id || '',
        detalle_orden_id: ingresoDetalles.detalle_orden_id || '',
        orden_compra_id: ingresoDetalles.detalle_orden.orden_compra_id || '',
        aplicarPrecioJaba: ingresoDetalles.aplicarPrecioJaba || false,
        precio_venta_kg: ingresoDetalles.precio_venta_kg || precioVentaKg,
        num_jabas: ingresoDetalles.num_jabas || 0,
        peso_total_jabas: ingresoDetalles.peso_total_jabas || 0,
        total: ingresoDetalles.peso_neto * ingresoDetalles.precio_venta_kg || 0, //kong
      });

      setContadorPesajes(ingresoDetalles.num_pesajes + 1);



      // Establecer los valores seleccionados para los selectores
      setSocioSeleccionado(ingresoDetalles.socio_id);
      setOrdenSeleccionada(ingresoDetalles.detalle_orden.orden_compra_id);

      // Limpiar errores del formulario
      setFormErrors({});
      setActiveTab('general');

      // Establecer el título del modal y mostrarlo
      setModalTitle('Editar Ingreso');
      abrirModal('Editar Ingreso', ingresoDetalles);
    } catch (error) {
      console.error('Error al cargar detalles del ingreso:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los detalles del ingreso',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const handleDelete = async (ingreso) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el ingreso "${ingreso.numero_ingreso}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await ingresoService.delete(ingreso.id)

        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El ingreso ha sido eliminado correctamente.',
          confirmButtonColor: '#321fdb',
          timer: 2000,
          timerProgressBar: true
        })

        await fetchIngresos()
      } catch (error) {
        console.error('Error al eliminar ingreso:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.error || 'Error al eliminar el ingreso',
          confirmButtonColor: '#321fdb'
        })
      }
    }
  }

  // const handleSave = async () => {
  //   const errors = validateForm()

  //   if (Object.keys(errors).length > 0) {
  //     setFormErrors(errors)
  //     return
  //   }

  //   setSubmitting(true)
  //   setFormErrors({})

  //   try {
  //     const ingresoData = {
  //       socio_id: parseInt(socioSeleccionado),
  //       detalle_orden_id: parseInt(productoSeleccionadoPesaje),
  //       peso_bruto: parseFloat(currentIngreso.peso_bruto) || 0,
  //       peso_total_jabas: parseFloat(currentIngreso.peso_total_jabas) || 0,
  //       num_jabas: parseInt(currentIngreso.num_jabas) || 0,
  //       peso_neto: parseFloat(currentIngreso.peso_neto) || 0,
  //       dscto_merma: parseFloat(currentIngreso.descuento_merma) || 0,
  //       aplicarPrecioJaba: currentIngreso.aplicarPrecioJaba || false,
  //       precio_venta_kg: parseFloat(currentIngreso.precio_venta_kg) || 0,
  //       precio_jaba: parseFloat(currentIngreso.dscto_jaba) || 0,
  //       impuesto: parseFloat(currentIngreso.impuesto) || 0,
  //       pago_transporte: parseFloat(currentIngreso.pago_transporte) || 0,
  //       monto_transporte: parseFloat(currentIngreso.pago_transporte) || 0,
  //       ingreso_cooperativa: parseFloat(currentIngreso.ingreso_cooperativa) || 0,
  //       pago_socio: parseFloat(currentIngreso.pago_socio) || 0,
  //       subtotal: parseFloat(currentIngreso.total) || 0,
  //       num_pesajes: pesajesTemporales.length,
  //       observacion: currentIngreso.observacion || '',
  //       estado: currentIngreso.estado !== undefined ? currentIngreso.estado : true,
  //       usuario_creacion_id: user?.id
  //     }

  //     let savedIngresoaplicarPrecioJaba
  //     if (currentIngreso.id) {
  //       savedIngreso = await ingresoService.update(currentIngreso.id, ingresoData)
  //     } else {
  //       savedIngreso = await ingresoService.create(ingresoData)
  //     }

  //     Swal.fire({
  //       icon: 'success',
  //       title: currentIngreso.id ? '¡Actualizado!' : '¡Creado!',
  //       text: `El ingreso "${currentIngreso.numero_ingreso}" ha sido ${currentIngreso.id ? 'actualizado' : 'creado'} correctamente.`,
  //       confirmButtonColor: '#321fdb',
  //       timer: 2000,
  //       timerProgressBar: true
  //     })

  //     await fetchIngresos()
  //     setShowModal(false)
  //   } catch (error) {
  //     console.error('Error al guardar ingreso:', error)

  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Error',
  //       text: error.response?.data?.error || 'Error al guardar el ingreso. Por favor, intente nuevamente.',
  //       confirmButtonColor: '#321fdb'
  //     })

  //     setFormErrors({
  //       api: error.response?.data?.error || 'Error al guardar el ingreso. Por favor, intente nuevamente.'
  //     })
  //   } finally {
  //     setSubmitting(false)
  //   }
  // }

  // Funciones de utilidad
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-PE')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount || 0)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setNumeroFilter('')
    setSocioFilter('')
    setFechaFilter('')
    setCurrentPage(1)
  }

  // Opciones para selects
  const socioOptions = socios.map(socio => ({
    value: socio.id,
    label: `${socio.codigo} - ${socio.nombre} ${socio.apellido}`
  }))

  const productoOptions = productos.map(producto => ({
    value: producto.id,
    label: producto.nombre
  }))

  const pedidoLoteOptions = pedidosLote.map(pedido => ({
    value: pedido.id,
    label: `${pedido.codigo} - ${pedido.descripcion}`
  }))

  const unidadMedidaOptions = unidadesMedida.map(unidad => ({
    value: unidad.id,
    label: unidad.nombre
  }))

  const tipoFrutaOptions = tiposFruta.map(tipo => ({
    value: tipo.id,
    label: tipo.nombre
  }))

  const limpiarPesos = async () => {
    if (!currentIngreso.id) {
      toast.warning('Debe guardar el ingreso antes de limpiar pesos');
      return;
    }

    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: '¿Desea eliminar todos los pesajes registrados para este ingreso?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setSubmitting(true);

        // Eliminar todos los pesajes del ingreso
        await balanzaService.clearPesajes(currentIngreso.id);

        // Actualizar la lista de pesajes
        setPesajes([]);

        // Limpiar el peso neto del formulario
        setCurrentIngreso(prev => ({
          ...prev,
          peso_neto: 0
        }));

        // Recalcular totales
        const event = {
          target: {
            name: 'peso_neto',
            value: '0'
          }
        };
        handleInputChange(event);

        toast.success('Todos los pesajes han sido eliminados');

      } catch (error) {
        console.error('Error al limpiar pesos:', error);
        toast.error('Error al limpiar los pesajes');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const sincronizarPesos = async () => {
    if (!currentIngreso.id) {
      toast.warning('Debe guardar el ingreso antes de sincronizar pesos');
      return;
    }

    try {
      setSubmitting(true);

      // Obtener todos los pesajes del ingreso
      const pesajesResponse = await balanzaService.getPesajes(currentIngreso.id);
      const pesajesData = pesajesResponse || [];

      if (pesajesData.length === 0) {
        toast.warning('No hay pesajes registrados para sincronizar');
        return;
      }

      // Calcular el peso total de todos los pesajes
      const pesoTotal = pesajesData.reduce((total, pesaje) => {
        return total + (parseFloat(pesaje.peso) || 0);
      }, 0);

      // Actualizar el peso neto en el formulario
      setCurrentIngreso(prev => ({
        ...prev,
        peso_neto: pesoTotal.toFixed(3)
      }));

      // Recalcular totales automáticamente
      const event = {
        target: {
          name: 'peso_neto',
          value: pesoTotal.toFixed(3)
        }
      };
      handleInputChange(event);

      toast.success(`Peso sincronizado: ${pesoTotal.toFixed(3)} kg (${pesajesData.length} pesajes)`);

    } catch (error) {
      console.error('Error al sincronizar pesos:', error);
      toast.error('Error al sincronizar los pesos');
    } finally {
      setSubmitting(false);
    }
  };


  const exportarPesajesExcel = () => {
    const datosNumericos = pesajesTemporales.map(pesaje => {
      const pesoBruto = parseFloat(pesaje.peso_bruto || 0);
      const pesoJaba = parseFloat(pesaje.peso_jaba || pesaje.peso_total_jabas || 0);
      const descuentoMerma = parseFloat(pesaje.descuento_merma || 0);
      const pesoNeto = pesoBruto - pesoJaba - descuentoMerma;
      const precioVentaKg = parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0);
      const subtotal = pesoNeto * precioVentaKg;
      const porcentajeTransporte = parseFloat(currentIngreso.pago_transporte || 0) / 100;
      const pagoTransporte = pesoNeto * porcentajeTransporte;
      const porcentajeImpuesto = parseFloat(currentIngreso.impuesto || 0) / 100;
      const ingresoCooperativa = pesoNeto * porcentajeImpuesto;
      const precioPorJaba = currentIngreso.aplicarPrecioJaba ? (pesaje.num_jabas_pesaje || 0) * 1.00 : 0;
      const pagoSocio = subtotal - pagoTransporte - ingresoCooperativa - precioPorJaba;

      return {
        'Número': { v: pesaje.numero_pesaje, t: 'n' },
        'Peso Bruto (kg)': { v: pesoBruto.toFixed(3), t: 'n' },
        'Jabas': { v: pesaje.num_jabas_pesaje || 0, t: 'n' },
        'Peso Jabas (kg)': { v: pesoJaba.toFixed(3), t: 'n' },
        'Descuento Merma (kg)': { v: descuentoMerma.toFixed(3), t: 'n' },
        'Peso Neto (kg)': { v: pesoNeto.toFixed(3), t: 'n' },
        'Precio/kg': { v: precioVentaKg.toFixed(2), t: 'n' },
        'Subtotal': { v: subtotal.toFixed(2), t: 'n' },
        'Pago Transporte': { v: pagoTransporte.toFixed(2), t: 'n' },
        'Ingreso Cooperativa': { v: ingresoCooperativa.toFixed(2), t: 'n' },
        'Pago al Socio': { v: pagoSocio.toFixed(2), t: 'n' }
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(datosNumericos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pesajes Temporales');

    XLSX.writeFile(workbook, 'Pesajes_Temporales.xlsx');
  };


  // Reemplaza la función cargarPuertosBalanza existente con esta versión corregida:
  const cargarPuertosBalanza = async () => {
    try {
      const response = await balanzaService.getPuertosDisponibles();

      // Verificar que la respuesta sea válida y sea un array
      if (response && Array.isArray(response)) {
        setPuertosBalanza(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setPuertosBalanza(response.data);
      } else {
        console.warn('Respuesta de puertos no válida:', response);
        setPuertosBalanza([]);
        toast.warning('No se encontraron puertos disponibles');
      }
    } catch (error) {
      console.error('Error al cargar puertos:', error);
      setPuertosBalanza([]);

      // Mostrar error más específico
      const errorMessage = error.response?.data?.error || error.message || 'No se pudieron cargar los puertos disponibles';

      toast.error(`Error al cargar puertos: ${errorMessage}`);
    }
  };


  const leerPeso = async () => {
    if (!balanzaConectada) {
      Swal.fire({
        icon: 'warning',
        title: 'Balanza no conectada',
        text: 'Debe conectar la balanza antes de leer el peso',
        confirmButtonColor: '#321fdb'
      })
      return
    }

    try {
      setLeyendoPeso(true)
      const response = await balanzaService.getWeight()

      if (response.weight !== undefined) {
        setPesoActual(response.weight)

        // Si hay un ingreso activo, actualizar el peso neto
        if (currentIngreso) {
          setCurrentIngreso(prev => ({
            ...prev,
            peso_neto: response.weight.toFixed(3)
          }))

          // Recalcular totales si es necesario
          const event = {
            target: {
              name: 'peso_neto',
              value: response.weight.toFixed(3)
            }
          }
          handleInputChange(event)
        }

        Swal.fire({
          icon: 'success',
          title: 'Peso obtenido',
          text: `Peso actual: ${response.weight} ${response.unit || 'kg'}`,
          timer: 2000,
          timerProgressBar: true,
          confirmButtonColor: '#321fdb'
        })
      } else {
        throw new Error('No se pudo obtener el peso')
      }
    } catch (error) {
      console.error('Error al leer peso:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo obtener el peso de la balanza',
        confirmButtonColor: '#321fdb'
      })
    } finally {
      setLeyendoPeso(false)
    }
  }


  const aplicarPesoBruto = () => {
    if (pesoActual > 0) {
      setCurrentIngreso(prev => ({
        ...prev,
        peso_bruto: pesoActual.toFixed(2)
      }))

      Swal.fire({
        icon: 'success',
        title: 'Peso aplicado',
        text: `Peso bruto actualizado a ${pesoActual.toFixed(2)} kg`,
        timer: 2000,
        timerProgressBar: true,
        confirmButtonColor: '#321fdb'
      })
    }
  }

  const verificarEstadoBalanza = async () => {
    try {
      const response = await balanzaService.getStatus();
      setBalanzaConectada(response.connected || false);

      if (response.connected) {
        // Si está conectada, también actualizar la configuración actual
        if (response.config) {
          setPuertoSeleccionado(response.config.port || '');
          setBaudRate(response.config.baudRate || 9600);
        }
      }
    } catch (error) {
      console.error('Error al verificar estado de la balanza:', error);
      setBalanzaConectada(false);
    }
  };

  // También agregar la función mostrarMensaje si no existe
  const mostrarMensaje = (texto, tipo) => {
    // Usar toast en lugar de un sistema de mensajes personalizado
    switch (tipo) {
      case 'success':
        toast.success(texto);
        break;
      case 'danger':
      case 'error':
        toast.error(texto);
        break;
      case 'warning':
        toast.warning(texto);
        break;
      case 'info':
        toast.info(texto);
        break;
      default:
        toast(texto);
    }
  };


  const aplicarPesoNeto = () => {
    if (pesoActual > 0) {
      setCurrentIngreso(prev => ({
        ...prev,
        peso_neto: pesoActual.toFixed(2)
      }))

      Swal.fire({
        icon: 'success',
        title: 'Peso aplicado',
        text: `Peso neto actualizado a ${pesoActual.toFixed(2)} kg`,
        timer: 2000,
        timerProgressBar: true,
        confirmButtonColor: '#321fdb'
      })
    }
  }

  const calcularPesoNeto = () => {
    const pesoBruto = parseFloat(currentIngreso.peso_bruto) || 0;
    const numJabas = parseInt(currentIngreso.num_jabas) || 0;
    const pesoTotalJabas = numJabas * pesoJaba;
    const pesoNeto = pesoBruto - pesoTotalJabas;
    return pesoNeto > 0 ? parseFloat(pesoNeto) : 0;
  }

  const calcularPesoNetoAutomatico = () => {
    const pesoNetoCalculado = calcularPesoNeto()

    setCurrentIngreso(prev => ({
      ...prev,
      peso_neto: pesoNetoCalculado
    }))

    Swal.fire({
      icon: 'success',
      title: 'Peso neto calculado',
      text: `Peso neto actualizado a ${pesoNetoCalculado} kg`,
      timer: 2000,
      timerProgressBar: true,
      confirmButtonColor: '#321fdb'
    })
  }

  const tarar = async () => {
    if (!balanzaConectada) {
      Swal.fire({
        icon: 'warning',
        title: 'Balanza no conectada',
        text: 'Debe conectar la balanza antes de tarar',
        confirmButtonColor: '#321fdb'
      })
      return
    }

    try {
      setTarando(true)

      // Llamar al servicio de balanza para tarar
      const response = await balanzaService.tare()

      if (response.success) {
        setPesoActual(0) // Resetear el peso actual después del tarado

        Swal.fire({
          icon: 'success',
          title: 'Tarado exitoso',
          text: 'La balanza ha sido tarada correctamente',
          timer: 2000,
          timerProgressBar: true,
          confirmButtonColor: '#321fdb'
        })
      } else {
        throw new Error(response.message || 'Error al tarar la balanza')
      }
    } catch (error) {
      console.error('Error al tarar balanza:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error al tarar',
        text: error.response?.data?.error || 'No se pudo tarar la balanza',
        confirmButtonColor: '#321fdb'
      })
    } finally {
      setTarando(false)
    }
  }

  // También agrega el estado para tarando si no existe:
  const [tarando, setTarando] = useState(false)

  // También asegúrate de que tienes el estado para leyendoPeso:
  // Agrega esto en la sección de estados si no existe:
  const [leyendoPeso, setLeyendoPeso] = useState(false)



  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setFormErrors({});

      // Validar campos requeridos
      const errors = {};

      if (!ordenSeleccionada) {
        errors.orden_id = 'Debe seleccionar una orden pendiente';
      }

      if (!socioSeleccionado) {
        errors.socio_id = 'Debe seleccionar un socio';
      }

      if (!productoSeleccionadoPesaje) {
        errors.producto_seleccionado = 'Debe seleccionar un producto de la orden para el pesaje';
      }

      if (pesajesTemporales.length === 0) {
        errors.pesajes = 'Debe registrar al menos un pesaje antes de crear el ingreso';
      }

      if (!pesoJaba || pesoJaba <= 0) {
        errors.peso_jaba = 'El peso por jaba debe ser mayor a 0';
      }

      if (!(currentIngreso.precio_venta_kg || precioVentaKg) || precioVentaKg <= 0) {
        errors.precio_venta = 'El precio de venta debe ser mayor a 0';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);

        // Mostrar alerta con los errores
        Swal.fire({
          icon: 'error',
          title: 'Errores de validación',
          html: Object.values(errors).map(error => `• ${error}`).join('<br>'),
          confirmButtonColor: '#321fdb'
        });

        setSubmitting(false);
        return;
      }

      // Obtener el producto seleccionado para obtener sus datos
      const productoSeleccionado = productosOrden.find(p => p.id === parseInt(productoSeleccionadoPesaje));

      if (!productoSeleccionado) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo encontrar el producto seleccionado',
          confirmButtonColor: '#321fdb'
        });
        setSubmitting(false);
        return;
      }

      // Crear un ingreso consolidado con todos los pesajes
      const pesoNetoTotal = pesajesTemporales.reduce((total, pesaje) => {
        const pesoNeto = parseFloat(pesaje.peso_bruto || 0) - parseFloat(pesaje.peso_jaba || pesaje.peso_total_jabas || 0) - parseFloat(pesaje.descuento_merma || 0);
        return total + pesoNeto;
      }, 0);

      const numJabasTotal = pesajesTemporales.reduce((total, pesaje) => {
        return total + parseInt(pesaje.num_jabas_pesaje || 0);
      }, 0);

      const pesoBrutoTotal = pesajesTemporales.reduce((total, pesaje) => {
        return total + parseFloat(pesaje.peso_bruto || 0);
      }, 0);

      const descuentoMermaTotal = pesajesTemporales.reduce((total, pesaje) => {
        return total + parseFloat(pesaje.descuento_merma || 0);
      }, 0);

      // Calcular montos totales
      const subtotal = pesoNetoTotal * (currentIngreso.precio_venta_kg || precioVentaKg);

      // Calcular pagos basados en porcentajes
      const porcentajeTransporte = parseFloat(currentIngreso.pago_transporte || 0) / 100;
      const pagoTransporte = pesoNetoTotal * porcentajeTransporte;

      const porcentajeImpuesto = parseFloat(currentIngreso.impuesto || 0) / 100;
      const ingresoCooperativa = pesoNetoTotal * porcentajeImpuesto;

      // Calculate price per jaba if applicable
      const precioPorJaba = currentIngreso.aplicarPrecioJaba ? (numJabasTotal * 1.00) : 0;

      // Calculate payment to the partner
      const pagoSocio = subtotal - pagoTransporte - ingresoCooperativa - precioPorJaba;

      const pesoTotalJabas = numJabasTotal * pesoJaba;

      // Preparar datos del ingreso consolidado
      const ingresoData = {
        socio_id: parseInt(socioSeleccionado),
        detalle_orden_id: parseInt(productoSeleccionadoPesaje),
        peso_bruto: pesoBrutoTotal,
        peso_total_jabas: pesoTotalJabas,
        num_jabas: numJabasTotal,
        peso_neto: pesoNetoTotal,
        dscto_merma: descuentoMermaTotal,
        aplicarPrecioJaba: currentIngreso.aplicarPrecioJaba || false,
        precio_venta_kg: parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0),
        precio_jaba: parseFloat(pesoJaba || 0),
        impuesto: parseFloat(porcentajeImpuesto * 100),
        pago_transporte: parseFloat(currentIngreso.pago_transporte || 0),
        monto_transporte: parseFloat(pagoTransporte || 0),
        ingreso_cooperativa: ingresoCooperativa,
        pago_socio: pagoSocio,
        subtotal: subtotal,
        num_pesajes: pesajesTemporales.length,
        observacion: currentIngreso.observacion || '',
        estado: currentIngreso.estado !== undefined ? currentIngreso.estado : true,
        usuario_creacion_id: user?.id
      };

      console.log('Datos del ingreso consolidado a enviar:', ingresoData);

      let ingresoCreado;
      if (currentIngreso.id) {
        // Update existing ingreso
        const response = await ingresoService.update(currentIngreso.id, ingresoData);
        ingresoCreado = response.data || response;
        console.log('Ingreso actualizado:', ingresoCreado);

        await detallePesajeService.deleteByIngresoId(ingresoCreado.id);
      } else {
        // Create new ingreso
        const response = await ingresoService.create(ingresoData);
        ingresoCreado = response.data || response;
        console.log('Ingreso creado:', ingresoCreado);
      }

      // Guardar todos los detalles de pesaje asociados al ingreso
      if (pesajesTemporales.length > 0 && ingresoCreado.id) {
        console.log('Guardando detalles de pesaje para ingreso ID:', ingresoCreado.id);

        let detallesCreados = 0;
        let erroresDetalles = 0;

        for (let i = 0; i < pesajesTemporales.length; i++) {
          const pesaje = pesajesTemporales[i];

          try {
            const detallePesajeData = {
              ingreso_id: ingresoCreado.id,
              numero_pesaje: (i + 1), //pesaje.numero_pesaje || 
              peso_bruto: parseFloat(pesaje.peso_bruto) || 0,
              peso_jaba: parseFloat(pesaje.peso_jaba) || 0,
              descuento_merma: parseFloat(pesaje.descuento_merma) || 0,
              peso_neto_pesaje: (parseFloat(pesaje.peso_bruto) || 0) - (parseFloat(pesaje.peso_jaba) || 0) - (parseFloat(pesaje.descuento_merma) || 0),
              num_jabas_pesaje: parseInt(pesaje.num_jabas_pesaje) ||parseInt(pesaje.num_jabas) || 0,
              // observacion_pesaje: pesaje.observacion || '',
              producto_id: productoSeleccionado.producto_id,
              tipo_fruta_id: productoSeleccionado.tipo_fruta_id,
              detalle_orden_id: parseInt(productoSeleccionadoPesaje),
              rawData: (pesaje.rawData || '').toString(),
              observacion: pesaje.observacion || '',
              fecha_pesaje: (pesaje.fecha_pesaje || pesaje.timestamp),
              producto_nombre: pesaje.producto_nombre,
              tipo_fruta_nombre: pesaje.tipo_fruta_nombre,
              usuario_pesaje_id: user?.id
            };

            console.log(`Creando detalle de pesaje ${i + 1}:`, detallePesajeData);

            await detallePesajeService.create(detallePesajeData);
            detallesCreados++;

          } catch (pesajeError) {
            console.error(`Error al crear detalle de pesaje ${i + 1}:`, pesajeError);
            erroresDetalles++;
          }
        }

        // Mostrar resultado del proceso de detalles
        if (erroresDetalles > 0) {
          console.warn(`Se crearon ${detallesCreados} detalles correctamente, pero hubo ${erroresDetalles} errores`);
        } else {
          console.log(`Todos los ${detallesCreados} detalles de pesaje se crearon correctamente`);
        }
      }

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Ingreso creado exitosamente!',
        html: `
          <div class="text-start">
            <p><strong>Ingreso:</strong> ${ingresoCreado.numero_ingreso}</p>
            <p><strong>Pesajes registrados:</strong> ${pesajesTemporales.length}</p>
            <p><strong>Peso neto total:</strong> ${pesoNetoTotal.toFixed(3)} kg</p>
            <p><strong>Total:</strong> S/ ${subtotal.toFixed(2)}</p>
          </div>
        `,
        confirmButtonColor: '#321fdb',
        timer: 4000,
        timerProgressBar: true
      });

      // Recargar la lista de ingresos
      await fetchIngresos(currentPage, itemsPerPage, searchTerm, numeroFilter, socioFilter, fechaFilter);

      // Cerrar modal y limpiar
      cerrarModal();

    } catch (error) {
      console.error('Error al crear ingreso:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error al crear ingreso',
        text: error.response?.data?.error || error.message || 'Ocurrió un error inesperado',
        confirmButtonColor: '#321fdb'
      });

      setFormErrors({
        api: error.response?.data?.error || 'Error al crear el ingreso'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // También necesitas la función handleCloseModal si no existe
  const handleCloseModal = () => {
    setCurrentIngreso({
      numero_ingreso: '',
      cliente_id: '',
      producto_id: '',
      tipo_fruta_id: '',
      fecha_ingreso: '',
      precio_kg: '',
      peso_bruto: '0.000',
      num_jabas: 0,
      peso_total_jabas: '0.000',
      descuento_merma: '0.000',
      peso_neto: '0.000',
      pago_transporte: '0.00',
      impuesto: '0.00',
      total: '0.00',
      observacion: '',
      estado: 'activo'
    });

    setPesajesTemporales([]);
    setFormErrors({});
    setEditingId(null);
    setShowModal(false);
  };

  // Y la función handleCreate si no existe
  const handleCreate = () => {
    setEditingId(null);
    setCurrentIngreso({
      numero_ingreso: '',
      cliente_id: '',
      producto_id: '',
      tipo_fruta_id: '',
      fecha_ingreso: new Date().toISOString().split('T')[0], // Fecha actual
      precio_kg: '',
      peso_bruto: '0.000',
      num_jabas: 0,
      peso_total_jabas: '0.000',
      descuento_merma: '0.000',
      peso_neto: '0.000',
      pago_transporte: '0.00',
      impuesto: '0.00',
      total: '0.00',
      observacion: '',
      estado: 'activo'
    });

    setPesajesTemporales([]);
    setFormErrors({});
    setShowModal(true);
  };

  const guardarConfiguracionPesaje = async () => {
    try {
      setSubmitting(true);

      // Validar que la configuración tenga valores válidos
      if (!puertoSeleccionado || !baudRate) {
        toast.warning('Por favor, complete todos los campos de configuración');
        return;
      }

      // Crear objeto de configuración completo
      const configuracionCompleta = {
        puerto: puertoSeleccionado,
        baudRate: baudRate,
        dataBits: configuracionPesaje.dataBits || 8,
        stopBits: configuracionPesaje.stopBits || 1,
        parity: configuracionPesaje.parity || 'none',
        parser: configuracionPesaje.parser || 'readline',
        delimiter: configuracionPesaje.delimiter || '\r\n'
      };

      // Guardar la configuración en localStorage para persistencia
      localStorage.setItem('configuracionBalanza', JSON.stringify(configuracionCompleta));

      // Si hay una balanza conectada, aplicar la nueva configuración
      if (balanzaConectada) {
        await balanzaService.configurar(configuracionCompleta);
      }

      toast.success('Configuración guardada exitosamente');

    } catch (error) {
      console.error('Error al guardar configuración:', error);
      toast.error('Error al guardar la configuración: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };


  const desconectarBalanza = async () => {
    try {
      setConectandoBalanza(true);
      const response = await balanzaService.disconnect();

      // Corregir el acceso a la respuesta - quitar .data
      toast.success(response.message || 'Balanza desconectada exitosamente');
      setBalanzaConectada(false);
      setPesoActual(0);
      setConectandoBalanza(false);
    } catch (error) {
      console.error('Error al desconectar balanza:', error);
      toast.error('Error al desconectar: ' + (error.response?.data?.error || error.message));
      setConectandoBalanza(false);
    }
  };

  useEffect(() => {
    setIsFilterActive(
      searchTerm.trim() !== '' || numeroFilter.trim() !== '' || socioFilter.trim() !== ''
    );
  }, [searchTerm, numeroFilter, socioFilter]);

  const handleFilterInputChange = (setter) => (e) => {
    setter(e.target.value);
  };



  return (
    <>
      <CContainer fluid>
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">
                    <CIcon icon={cilSpeedometer} className="me-2" />
                    Gestión de Ingresos
                  </h4>
                  <CButton
                    color={balanzaConectada ? "success" : "warning"}
                    variant="outline"
                    onClick={() => setModalBalanzaVisible(true)}
                    className="d-flex align-items-right"
                  >
                    <CIcon
                      icon={balanzaConectada ? cilCheckCircle : cilXCircle}
                      className="me-2"
                    />
                    {balanzaConectada ? (
                      <>
                        Balanza Conectada
                        <CBadge color="success" className="ms-2">Activa</CBadge>
                      </>
                    ) : (
                      <>
                        Configurar Balanza
                        <CBadge color="warning" className="ms-2">Desconectada</CBadge>
                      </>
                    )}
                  </CButton>
                  <CButton
                    color="primary"
                    onClick={handleCreate}
                    className="d-flex align-items-center"
                  >
                    <CIcon icon={cilPlus} className="me-2" />
                    Nuevo Ingreso
                  </CButton>
                </div>
              </CCardHeader>

              <CCardBody>
                {/* Filtros */}
                <CRow className="mb-3">
                  <CCol md={4}>
                    <CInputGroup>
                      <CFormInput
                        placeholder="Buscar ingresos..."
                        value={searchTermIngresos}
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
                            activeFilter === 'numero' ? numeroFilter :
                              activeFilter === 'cliente' ? clienteFilter :
                                socioFilter
                          }
                          onChange={handleFilterInputChange(
                            activeFilter === 'numero' ? setNumeroFilter :
                              activeFilter === 'cliente' ? setClienteFilter :
                                setSocioFilter
                          )}
                        />
                      )}
                    </CInputGroup>
                  </CCol>
                </CRow>

                {/* Información de paginación */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <small className="text-muted">
                      Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
                    </small>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="me-2">Mostrar:</span>
                    <CFormSelect
                      size="sm"
                      style={{ width: 'auto' }}
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value))
                        setCurrentPage(1)
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </CFormSelect>
                  </div>
                </div>

                {/* Tabla de ingresos */}
                {loading ? (
                  <div className="text-center py-4">
                    <CSpinner color="primary" />
                    <div className="mt-2">Cargando ingresos...</div>
                  </div>
                ) : (
                  <>
                    <CTable hover responsive striped>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>#</CTableHeaderCell>
                          <CTableHeaderCell>
                            Número
                            <CButton
                              color="link"
                              onClick={() => setActiveFilter(activeFilter === 'numero' ? null : 'numero')}
                            >
                              <CIcon icon={cilFilter} />
                            </CButton>
                          </CTableHeaderCell>
                          <CTableHeaderCell>
                            Fecha
                            <CButton
                              color="link"
                              onClick={() => setActiveFilter(activeFilter === 'fecha' ? null : 'fecha')}
                            >
                              <CIcon icon={cilFilter} />
                            </CButton>
                          </CTableHeaderCell>
                          <CTableHeaderCell>
                            Socio
                            <CButton
                              color="link"
                              onClick={() => setActiveFilter(activeFilter === 'socio' ? null : 'socio')}
                            >
                              <CIcon icon={cilFilter} />
                            </CButton>
                          </CTableHeaderCell>
                          <CTableHeaderCell>Peso Neto</CTableHeaderCell>
                          <CTableHeaderCell>Número de Jabas</CTableHeaderCell>
                          <CTableHeaderCell>Pago Transporte</CTableHeaderCell>
                          <CTableHeaderCell>Ingreso Cooperativa</CTableHeaderCell>
                          <CTableHeaderCell>Pago al Socio</CTableHeaderCell>
                          <CTableHeaderCell>Subtotal</CTableHeaderCell>
                          <CTableHeaderCell>Acciones</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {ingresos.length === 0 ? (
                          <CTableRow>
                            <CTableDataCell colSpan={9} className="text-center py-4">
                              <div className="text-muted">
                                <CIcon icon={cilInfo} size="xl" className="mb-2" />
                                <div>No se encontraron ingresos</div>
                              </div>
                            </CTableDataCell>
                          </CTableRow>
                        ) : (
                          ingresos.map((ingreso, index) => (
                            <React.Fragment key={ingreso.id}>
                              <CTableRow onClick={() => toggleRow(ingreso.id)}>
                                <CTableDataCell>{index + 1}</CTableDataCell>
                                <CTableDataCell>{ingreso.numero_ingreso}</CTableDataCell>
                                <CTableDataCell>{new Date(ingreso.fecha).toLocaleDateString()}</CTableDataCell>
                                <CTableDataCell>{ingreso.socio.nombres} {ingreso.socio.apellidos}</CTableDataCell>
                                <CTableDataCell>{(parseFloat(ingreso.peso_neto) || 0).toFixed(3)} kg</CTableDataCell>
                                <CTableDataCell>{ingreso.num_jabas}</CTableDataCell>
                                <CTableDataCell>S/ {(parseFloat(ingreso.pago_transporte) || 0).toFixed(2)}</CTableDataCell>
                                <CTableDataCell>S/ {(parseFloat(ingreso.ingreso_cooperativa) || 0).toFixed(2)}</CTableDataCell>
                                <CTableDataCell>S/ {(parseFloat(ingreso.pago_socio) || 0).toFixed(2)}</CTableDataCell>
                                <CTableDataCell>S/ {(parseFloat(ingreso.subtotal) || 0).toFixed(2)}</CTableDataCell>
                                <CTableDataCell>
                                  <CButtonGroup size="sm">
                                    <CButton
                                      color="info"
                                      variant="outline"
                                      onClick={() => handleEdit(ingreso)}
                                      title="Editar"
                                    >
                                      <CIcon icon={cilPencil} />
                                    </CButton>
                                    <CButton
                                      color="danger"
                                      variant="outline"
                                      onClick={() => handleDelete(ingreso)}
                                      title="Eliminar"
                                    >
                                      <CIcon icon={cilTrash} />
                                    </CButton>
                                  </CButtonGroup>
                                </CTableDataCell>
                              </CTableRow>
                              {expandedRow === ingreso.id && (
                                <CTableRow>
                                  <CTableDataCell colSpan={10}>
                                    <div className="p-3 bg-light border rounded">
                                      <div className="row">
                                        <div className="col-md-6">
                                          <div className="mb-2">
                                            <strong>Orden:</strong> {ingreso.detalle_orden.orden_compra.numero_orden}
                                          </div>
                                          <div className="mb-2">
                                            <strong>Producto:</strong> {ingreso.detalle_orden.producto.nombre} - {ingreso.detalle_orden.tipo_fruta.nombre}
                                          </div>
                                          <div className="mb-2">
                                            <strong>Pesajes Registrados:</strong> {ingreso.num_pesajes}
                                          </div>
                                          <div className="mb-2">
                                            <strong>Peso Bruto:</strong> {(parseFloat(ingreso.peso_bruto) || 0).toFixed(3)} kg
                                          </div>
                                          <div className="mb-2">
                                            <strong>Peso Jabas:</strong> {(parseFloat(ingreso.peso_total_jabas) || 0).toFixed(3)} kg
                                          </div>
                                          <div className="mb-2">
                                            <strong>Descuento Merma:</strong> {(parseFloat(ingreso.dscto_merma) || 0).toFixed(3)} kg
                                          </div>
                                        </div>
                                        <div className="col-md-6">
                                          <div className="mb-2">
                                            <strong>Precio Venta por kg:</strong> S/ {(parseFloat(ingreso.precio_venta_kg) || 0).toFixed(2)}
                                          </div>
                                          <div className="mb-2">
                                            <strong>Precio por Jaba:</strong> S/ {(parseFloat(ingreso.precio_jaba) || 0).toFixed(2)}
                                          </div>
                                          <div className="mb-2">
                                            <strong>Ingreso Cooperativa:</strong> {ingreso.impuesto}%
                                          </div>
                                          <div className="mb-2">
                                            <strong>Pago Transporte:</strong> {ingreso.pago_transporte}%
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </CTableDataCell>
                                </CTableRow>
                              )}
                            </React.Fragment>
                          ))
                        )}
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

                    {/* Paginación */}

                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-3">
                        <CPagination>
                          <CPaginationItem
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(1)}
                          >
                            Primero
                          </CPaginationItem>
                          <CPaginationItem
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                          >
                            Anterior
                          </CPaginationItem>

                          {[...Array(totalPages)].map((_, index) => {
                            const page = index + 1
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 2 && page <= currentPage + 2)
                            ) {
                              return (
                                <CPaginationItem
                                  key={page}
                                  active={page === currentPage}
                                  onClick={() => setCurrentPage(page)}
                                >
                                  {page}
                                </CPaginationItem>
                              )
                            } else if (
                              page === currentPage - 3 ||
                              page === currentPage + 3
                            ) {
                              return <CPaginationItem key={page}>...</CPaginationItem>
                            }
                            return null
                          })}

                          <CPaginationItem
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                          >
                            Siguiente
                          </CPaginationItem>
                          <CPaginationItem
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            Último
                          </CPaginationItem>
                        </CPagination>
                      </div>
                    )}
                  </>
                )}
              </CCardBody>
            </CCard>
          </CCol>

          {/* Modal de Configuración de Balanza */}
          <CModal
            visible={modalBalanzaVisible}
            onClose={() => setModalBalanzaVisible(false)}
            size="lg"
            backdrop="static"
          >
            <CModalHeader>
              <CModalTitle>
                <CIcon icon={cilSettings} className="me-2" />
                Configuración de la Balanza
              </CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CRow>
                {/* Configuración de Conexión */}
                <CCol md={6}>
                  <CCard className="h-100">
                    <CCardHeader>
                      <strong>Configuración de Conexión</strong>
                    </CCardHeader>
                    <CCardBody>
                      {/* Selección de puerto */}
                      <div className="mb-3">
                        <CFormLabel htmlFor="puerto_balanza">Puerto COM:</CFormLabel>
                        <div className="d-flex">
                          <CFormSelect
                            id="puerto_balanza"
                            value={puertoSeleccionado}
                            onChange={(e) => handlePuertoChange(e.target.value)}
                            disabled={balanzaConectada || conectandoBalanza}
                            className="me-2"
                          >
                            <option value="">Seleccionar puerto...</option>
                            {puertosDisponibles.map((puerto, index) => (
                              <option key={index} value={puerto.path}>
                                {puerto.path} - {puerto.manufacturer || 'Desconocido'}
                                {puerto.friendlyName ? ` (${puerto.friendlyName})` : ''}
                              </option>
                            ))}
                          </CFormSelect>
                          <CButton
                            color="secondary"
                            variant="outline"
                            onClick={cargarPuertos}
                            disabled={cargandoPuertos || balanzaConectada}
                            title="Actualizar lista de puertos"
                          >
                            {cargandoPuertos ? (
                              <CSpinner size="sm" />
                            ) : (
                              <CIcon icon={cilReload} />
                            )}
                          </CButton>
                        </div>
                        {puertosDisponibles.length === 0 && !cargandoPuertos && (
                          <small className="text-muted">
                            No se encontraron puertos disponibles. Verifique que la balanza esté conectada.
                          </small>
                        )}
                      </div>

                      {/* Velocidad de transmisión */}
                      <div className="mb-3">
                        <CFormLabel htmlFor="baud_rate">Velocidad (baudios):</CFormLabel>
                        <CFormSelect
                          id="baud_rate"
                          value={baudRate}
                          onChange={(e) => handleBaudRateChange(e.target.value)}
                          disabled={balanzaConectada || conectandoBalanza}
                        >
                          <option value="9600">9600</option>
                          <option value="19200">19200</option>
                          <option value="38400">38400</option>
                          <option value="57600">57600</option>
                          <option value="115200">115200</option>
                        </CFormSelect>
                      </div>

                      {/* Configuraciones adicionales */}
                      <div className="mb-3">
                        <CFormLabel htmlFor="timeout_conexion">Timeout de Conexión (ms):</CFormLabel>
                        <CFormInput
                          type="number"
                          id="timeout_conexion"
                          value={5000}
                          disabled={balanzaConectada || conectandoBalanza}
                          min="1000"
                          max="30000"
                          step="1000"
                        />
                      </div>

                    </CCardBody>
                  </CCard>
                </CCol>

                {/* Estado y Control */}
                <CCol md={6}>
                  <CCard className="h-100">
                    <CCardHeader>
                      <strong>Estado de la Balanza</strong>
                    </CCardHeader>
                    <CCardBody className="text-center">
                      {/* Estado visual */}
                      <div className="mb-4">
                        {balanzaConectada ? (
                          <div>
                            <CIcon icon={cilCheckCircle} size="4xl" className="text-success mb-3" />
                            <h4 className="text-success">Balanza Conectada</h4>
                            <CBadge color="success" className="mb-2">
                              Puerto: {puertoSeleccionado}
                            </CBadge>
                            <br />
                            <CBadge color="info">
                              Velocidad: {baudRate} baudios
                            </CBadge>
                          </div>
                        ) : (
                          <div>
                            <CIcon icon={cilXCircle} size="4xl" className="text-danger mb-3" />
                            <h4 className="text-danger">Balanza Desconectada</h4>
                            <CBadge color="danger">Sin conexión</CBadge>
                          </div>
                        )}
                      </div>

                      {/* Información adicional */}
                      {balanzaConectada && (
                        <div className="mb-3">
                          <small className="text-muted">
                            <strong>Última lectura:</strong> {new Date().toLocaleTimeString()}
                          </small>
                        </div>
                      )}

                      {/* Controles de conexión */}
                      <div className="d-grid gap-2">
                        <CButton
                          color={balanzaConectada ? "danger" : "success"}
                          onClick={balanzaConectada ? desconectarBalanza : conectarBalanza}
                          disabled={conectandoBalanza || (!balanzaConectada && !puertoSeleccionado)}
                          size="lg"
                        >
                          {conectandoBalanza ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Conectando...
                            </>
                          ) : (
                            balanzaConectada ? (
                              <>
                                <CIcon icon={cilXCircle} className="me-2" />
                                Desconectar Balanza
                              </>
                            ) : (
                              <>
                                <CIcon icon={cilCheckCircle} className="me-2" />
                                Conectar Balanza
                              </>
                            )
                          )}
                        </CButton>


                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              {/* Información de ayuda */}
              <CRow className="mt-3">
                <CCol md={12}>
                  <CAlert color="info" className="mb-0">
                    <CIcon icon={cilInfo} className="me-2" />
                    <strong>Información:</strong>
                    <ul className="mb-0 mt-2">
                      <li>Asegúrese de que la balanza esté encendida y conectada al puerto USB/Serial</li>
                      <li>Verifique que no haya otras aplicaciones usando el mismo puerto</li>
                      <li>La velocidad más común para balanzas es 9600 baudios</li>
                    </ul>
                  </CAlert>
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => setModalBalanzaVisible(false)}
              >
                Cerrar
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Modal para crear/editar ingreso */}
          <CModal
            visible={showModal}
            onClose={cerrarModal}
            size="xl"
            backdrop="static"
            className="modal-95vw"
          >
            <CModalHeader>
              <CModalTitle>{modalTitle} {balanzaConectada && (
                <CBadge color="success" className="ms-2">
                  Balanza Conectada
                </CBadge>
              )}</CModalTitle>
            </CModalHeader>
            <CModalBody >
              {formErrors.api && (
                <CAlert color="danger" className="mb-3">
                  {formErrors.api}
                </CAlert>
              )}


              <CRow className="mb-4">
                <CCol md={6}>
                  <CCard className="h-100">
                    <CFormLabel htmlFor="orden_pesaje">
                      Orden Pendiente:
                      {camposBloqueados && (
                        <CBadge color="warning" className="ms-2" size="sm">
                          Bloqueado - Hay pesajes registrados
                        </CBadge>
                      )}
                    </CFormLabel>
                    <CCardBody>
                      <div className="mb-3">
                        <CFormLabel htmlFor="orden_pesaje">Orden Pendiente:</CFormLabel>
                        <div className="d-flex">
                          <Select
                            id="orden_pesaje"
                            value={ordenesPendientes.find(orden => orden.id === ordenSeleccionada) ? {
                              value: ordenSeleccionada,
                              label: `${ordenesPendientes.find(orden => orden.id === ordenSeleccionada).codigo_lote} - ${ordenesPendientes.find(orden => orden.id === ordenSeleccionada).cliente?.razon_social}${ordenesPendientes.find(orden => orden.id === ordenSeleccionada).fecha_entrega ? ` (${(ordenesPendientes.find(orden => orden.id === ordenSeleccionada).numero_orden)})` : ''}`
                            } : null}
                            onChange={(selectedOption) => {
                              const ordenId = selectedOption ? selectedOption.value : '';
                              setOrdenSeleccionada(ordenId);

                              // Si no estás editando, o si cambias de orden, carga los productos de la nueva orden
                              if (!editingId || ordenId !== currentIngreso.detalle_orden_id) {
                                if (ordenId) {
                                  cargarProductosDeOrden(ordenId);
                                } else {
                                  setProductosOrden([]);
                                  setCantidadPendientePorProducto({});
                                  setProductoSeleccionadoPesaje('');
                                }
                              }
                            }}
                            options={ordenesPendientes.map(orden => ({
                              value: orden.id,
                              label: `${orden.codigo_lote} - ${orden.cliente?.razon_social}${orden.fecha_entrega ? ` ( ${(orden.numero_orden)} )` : ''}`
                            }))}
                            placeholder={
                              cargandoOrdenes
                                ? 'Cargando órdenes...'
                                : camposBloqueados
                                  ? 'No se puede modificar - Hay pesajes registrados'
                                  : 'Buscar y seleccionar orden pendiente...'
                            }
                            isClearable={!camposBloqueados}
                            isSearchable={!camposBloqueados}
                            isDisabled={camposBloqueados}
                            isLoading={cargandoOrdenes}
                            filterOption={() => true} // Desactivar el filtrado local ya que se hace en el backend
                            onInputChange={(inputValue, { action }) => {
                              // Solo actualizar el searchTermOrdenes si el usuario está escribiendo
                              if (action === 'input-change') {
                                setSearchTermOrdenes(inputValue);
                              }
                            }}
                            className={`basic-single me-2 ${formErrors.orden_id ? 'is-invalid' : ''}`}
                            classNamePrefix="select"
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                borderColor: formErrors.orden_id ? '#dc3545' : (state.isFocused ? '#321fdb' : provided.borderColor),
                                boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(50, 31, 219, 0.25)' : provided.boxShadow,
                                backgroundColor: camposBloqueados ? '#f8f9fa' : provided.backgroundColor,
                                cursor: camposBloqueados ? 'not-allowed' : 'default',
                                '&:hover': {
                                  borderColor: camposBloqueados ? provided.borderColor : '#321fdb'
                                }
                              }),
                              container: (provided) => ({
                                ...provided,
                                flex: 1
                              }),
                              placeholder: (provided) => ({
                                ...provided,
                                color: camposBloqueados ? '#6c757d' : provided.color
                              }),
                              singleValue: (provided) => ({
                                ...provided,
                                color: camposBloqueados ? '#6c757d' : provided.color
                              })
                            }}
                            noOptionsMessage={({ inputValue }) =>
                              cargandoOrdenes ? "Buscando órdenes..." :
                                inputValue ? `No se encontraron órdenes que coincidan con "${inputValue}"` : "No se encontraron órdenes pendientes"
                            }
                            loadingMessage={() => "Cargando órdenes..."}
                          />

                        </div>
                        {formErrors.orden_id && (
                          <div className="invalid-feedback d-block">
                            {formErrors.orden_id}
                          </div>
                        )}
                        {ordenesPendientes.length === 0 && !cargandoOrdenes && (
                          <small className="text-warning">
                            No hay órdenes pendientes disponibles
                          </small>
                        )}
                        {ordenSeleccionada && (
                          <small className="text-success">
                            ✓ Orden seleccionada para el pesaje
                          </small>
                        )}
                        <small className="text-muted d-block">
                          {camposBloqueados
                            ? 'No se puede modificar mientras hay pesajes registrados'
                            : 'Busque por código de lote, número de orden o razón social del cliente'
                          }
                        </small>

                      </div>

                      <div className="mb-3">
                        <CFormLabel htmlFor="socio_pesaje">Socio:</CFormLabel>
                        <Select
                          id="socio_pesaje"
                          value={socios.find(socio => socio.id === socioSeleccionado) ? {
                            value: socioSeleccionado,
                            label: `${socios.find(socio => socio.id === socioSeleccionado).codigo} - ${socios.find(socio => socio.id === socioSeleccionado).nombres} ${socios.find(socio => socio.id === socioSeleccionado).apellidos}`
                          } : null}
                          onChange={(selectedOption) => {
                            const socioId = selectedOption ? selectedOption.value : '';
                            setSocioSeleccionado(socioId);
                          }}
                          options={socios.map(socio => ({
                            value: socio.id,
                            label: `${socio.codigo} - ${socio.nombres} ${socio.apellidos}`
                          }))}
                          placeholder="Buscar y seleccionar socio..."
                          isClearable
                          isSearchable
                          isLoading={cargandoSocios}
                          filterOption={() => true} // Desactivar el filtrado local ya que se hace en el backend
                          onInputChange={(inputValue, { action }) => {
                            // Solo actualizar el searchTerm si el usuario está escribiendo
                            if (action === 'input-change') {
                              setSearchTermSocios(inputValue);
                            }
                          }}
                          className={`basic-single ${formErrors.socio_id ? 'is-invalid' : ''}`}
                          classNamePrefix="select"
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              borderColor: formErrors.socio_id ? '#dc3545' : (state.isFocused ? '#321fdb' : provided.borderColor),
                              boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(50, 31, 219, 0.25)' : provided.boxShadow,
                              '&:hover': {
                                borderColor: '#321fdb'
                              }
                            })
                          }}
                          noOptionsMessage={({ inputValue }) =>
                            cargandoSocios ? "Buscando socios..." :
                              inputValue ? `No se encontraron socios que coincidan con "${inputValue}"` : "No se encontraron socios"
                          }
                          loadingMessage={() => "Cargando socios..."}
                        />
                        {formErrors.socio_id && (
                          <div className="invalid-feedback d-block">
                            {formErrors.socio_id}
                          </div>
                        )}
                        <small className="text-muted">
                          Busque por código, nombre o apellido del socio. El socio se vinculará al crear el ingreso.
                        </small>
                      </div>
                      {/* Campos de Peso por Jaba y Número de Jabas */}

                      <CRow>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel htmlFor="peso_jaba">
                              Peso por Jaba (kg)
                              {camposBloqueados && (
                                <CBadge color="warning" className="ms-2" size="sm">
                                  Bloqueado - Hay pesajes registrados
                                </CBadge>
                              )}
                            </CFormLabel>
                            <CFormInput
                              type="number"
                              id="peso_jaba"
                              value={pesoJaba}
                              onChange={(e) => setPesoJaba(parseFloat(e.target.value) || 0)}
                              step="0.1"
                              min="0"
                              placeholder="2.0"
                              disabled={camposBloqueados}
                              className={camposBloqueados ? 'bg-light' : ''}
                              style={camposBloqueados ? { cursor: 'not-allowed' } : {}}
                            />
                            <small className="text-muted">
                              {camposBloqueados
                                ? 'No se puede modificar mientras hay pesajes registrados'
                                : 'Peso estándar de cada jaba vacía'
                              }
                            </small>
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel htmlFor="num_jabas">
                              Número de Jabas
                              <CBadge color="info" className="ms-2" size="sm">
                                Auto-calculado
                              </CBadge>
                            </CFormLabel>
                            <div className="input-group">
                              <CFormInput
                                type="number"
                                id="num_jabas"
                                name="num_jabas"
                                value={currentIngreso.num_jabas || 0}
                                readOnly
                                min="0"
                                step="1"
                                placeholder="0"
                                className={`${formErrors.num_jabas ? 'is-invalid' : ''} bg-light`}
                                style={{
                                  cursor: 'not-allowed',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />

                              {formErrors.num_jabas && (
                                <div className="invalid-feedback">{formErrors.num_jabas}</div>
                              )}
                            </div>
                            <small className="text-muted">
                              Se actualiza automáticamente al aplicar pesajes
                            </small>
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel htmlFor="precio_venta">
                              Precio de Venta (S/. por kg)
                              {camposBloqueados && (
                                <CBadge color="warning" className="ms-2" size="sm">
                                  Bloqueado - Hay pesajes registrados
                                </CBadge>
                              )}
                            </CFormLabel>
                            <CFormInput
                              type="number"
                              id="precio_venta_kg"
                              name="precio_venta_kg"
                              value={currentIngreso.precio_venta_kg || precioVentaKg}
                              onChange={(e) => setPrecioVentaKg(parseFloat(e.target.value) || 0)}
                              step="0.01"
                              min="0"
                              placeholder="2.70"
                              disabled={camposBloqueados}
                              className={camposBloqueados ? 'bg-light' : ''}
                              style={camposBloqueados ? { cursor: 'not-allowed' } : {}}
                            />
                            <small className="text-muted">
                              {camposBloqueados
                                ? 'No se puede modificar mientras hay pesajes registrados'
                                : 'Precio por kilogramo de producto'
                              }
                            </small>
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel htmlFor="impuesto">
                              Ingreso Cooperativa (%)
                              {camposBloqueados && (
                                <CBadge color="warning" className="ms-2" size="sm">
                                  Bloqueado - Hay pesajes registrados
                                </CBadge>
                              )}
                            </CFormLabel>
                            <CFormInput
                              type="number"
                              id="impuesto"
                              name="impuesto"
                              value={currentIngreso.impuesto || 0}
                              onChange={handleInputChange}
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="10.0"
                              disabled={camposBloqueados}
                              className={camposBloqueados ? 'bg-light' : ''}
                              style={camposBloqueados ? { cursor: 'not-allowed' } : {}}
                            />
                            <small className="text-muted">
                              {camposBloqueados
                                ? 'No se puede modificar mientras hay pesajes registrados'
                                : 'Porcentaje de impuesto aplicable'
                              }
                            </small>
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel htmlFor="descuento_merma">
                              Dscto Merma (Kg)
                              <CBadge color="info" className="ms-2" size="sm">
                                Auto-calculado
                              </CBadge>
                            </CFormLabel>
                            <div className="input-group">
                              <CFormInput
                                type="number"
                                id="descuento_merma"
                                name="descuento_merma"
                                value={currentIngreso.descuento_merma || 0}
                                readOnly
                                min="0"
                                step="0.001"
                                placeholder="0.000"
                                className={`${formErrors.descuento_merma ? 'is-invalid' : ''} bg-light`}
                                style={{
                                  cursor: 'not-allowed',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />

                              {formErrors.descuento_merma && (
                                <div className="invalid-feedback">{formErrors.descuento_merma}</div>
                              )}
                            </div>
                            <small className="text-muted">
                              Se actualiza automáticamente al aplicar pesajes con descuento de merma
                            </small>
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel htmlFor="pago_transporte">
                              Pago de Transporte (%)
                              {camposBloqueados && (
                                <CBadge color="warning" className="ms-2" size="sm">
                                  Bloqueado - Hay pesajes registrados
                                </CBadge>
                              )}
                            </CFormLabel>
                            <CFormInput
                              type="number"
                              id="pago_transporte"
                              name="pago_transporte"
                              value={currentIngreso.pago_transporte || 0}
                              onChange={handleInputChange}
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="5.0"
                              disabled={camposBloqueados}
                              className={`${formErrors.pago_transporte ? 'is-invalid' : ''} ${camposBloqueados ? 'bg-light' : ''}`}
                              style={camposBloqueados ? { cursor: 'not-allowed' } : {}}
                            />
                            {formErrors.pago_transporte && (
                              <div className="invalid-feedback">{formErrors.pago_transporte}</div>
                            )}
                            <small className="text-muted">
                              {camposBloqueados
                                ? 'No se puede modificar mientras hay pesajes registrados'
                                : 'Porcentaje del peso neto que se destinará al pago de transporte'
                              }
                            </small>
                          </div>
                        </CCol>




                        <CCol md={6}>
                          <div className="mb-3">
                            <CFormLabel htmlFor="aplicar_precio_jaba" className="fw-bold text-success">
                              Aplicar Precio por Jaba
                            </CFormLabel>
                            <CFormCheck
                              id="aplicar_precio_jaba"
                              checked={currentIngreso.aplicarPrecioJaba}
                              onChange={handleCheckboxChange}
                              label="Aplicar S/ 1.00 por jaba"
                              disabled={camposBloqueados}
                            />
                          </div>
                        </CCol>
                      </CRow>
                      {camposBloqueados && (
                        <CAlert color="info" className="mt-3">
                          <CIcon icon={cilInfo} className="me-2" />
                          <strong>Configuración bloqueada:</strong> Para modificar el peso por jaba, precio de venta o impuesto,
                          primero debe eliminar todos los pesajes registrados usando el botón "Limpiar Todo".
                        </CAlert>
                      )}

                    </CCardBody>
                  </CCard>
                </CCol>

                {/* Monitor en Tiempo Real */}
                <CCol md={6}>
                  {/* Resumen del Ingreso Actual */}
                  <CCard className="mb-4">
                    <CCardHeader className="bg-info text-white">
                      <h6 className="mb-0">
                        <CIcon icon={cilInfo} className="me-2" />
                        Resumen del Ingreso Actual
                      </h6>
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="g-3">
                        <CCol md={4}>
                          <div className="text-center p-3 border rounded bg-light">
                            <div className="text-muted small">Peso Bruto</div>
                            <div className="h5 mb-0 text-primary">
                              {parseFloat(currentIngreso.peso_bruto || 0).toFixed(3)} kg
                            </div>
                          </div>
                        </CCol>
                        <CCol md={4}>
                          <div className="text-center p-3 border rounded bg-light">
                            <div className="text-muted small">Jabas</div>
                            <div className="h5 mb-0">
                              {currentIngreso.num_jabas || 0}
                            </div>
                          </div>
                        </CCol>
                        <CCol md={4}>
                          <div className="text-center p-3 border rounded bg-light">
                            <div className="text-muted small">Peso Jabas</div>
                            <div className="h5 mb-0">
                              {parseFloat(currentIngreso.peso_total_jabas || 0).toFixed(3)} kg
                            </div>
                          </div>
                        </CCol>
                        <CCol md={4}>
                          <div className="text-center p-3 border rounded bg-light">
                            <div className="text-muted small">Descuento Merma</div>
                            <div className="h5 mb-0 text-danger">
                              -{parseFloat(currentIngreso.descuento_merma || 0).toFixed(3)} kg
                            </div>
                          </div>
                        </CCol>
                        <CCol md={4}>
                          <div className="text-center p-3 border rounded bg-light">
                            <div className="text-muted small">Peso Neto</div>
                            <div className="h5 mb-0 text-success">
                              {parseFloat(currentIngreso.peso_neto || 0).toFixed(3)} kg
                            </div>
                          </div>
                        </CCol>
                        <CCol md={4}>
                          <div className="text-center p-3 border rounded bg-light">
                            <div className="text-muted small">Subtotal</div>
                            <div className="h5 mb-0 text-info">
                              S/ {parseFloat(currentIngreso.total || 0).toFixed(2)}
                            </div>
                          </div>
                        </CCol>
                        <CCol md={4}>
                          <div className="text-center p-3 border rounded bg-light">
                            <div className="text-muted small">Pago Transporte</div>
                            <div className="h5 mb-0 text-danger">
                              S/ {(() => {
                                const pesoNeto = parseFloat(currentIngreso.peso_neto || 0);
                                const porcentajeTransporte = parseFloat(currentIngreso.pago_transporte || 0) / 100;
                                return (pesoNeto * porcentajeTransporte).toFixed(2);
                              })()}
                            </div>
                          </div>
                        </CCol>
                        <CCol md={4}>
                          <div className="text-center p-3 border rounded bg-light">
                            <div className="text-muted small">Ingreso Cooperativa</div>
                            <div className="h5 mb-0 text-primary">
                              S/ {(() => {
                                const pesoNeto = parseFloat(currentIngreso.peso_neto || 0);
                                const porcentajeImpuesto = parseFloat(currentIngreso.impuesto || 0) / 100;
                                return (pesoNeto * porcentajeImpuesto).toFixed(2);
                              })()}
                            </div>
                          </div>
                        </CCol>
                        <CCol md={4}>
                          <div className="text-center p-3 border rounded bg-light">
                            <div className="text-muted small">Pago al Socio</div>
                            <div className="h5 mb-0 text-success">
                              S/ {(() => {
                                const pesoNeto = parseFloat(currentIngreso.peso_neto || 0);
                                const precioKg = parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0);
                                const subtotal = pesoNeto * precioKg;
                                const porcentajeTransporte = parseFloat(currentIngreso.pago_transporte || 0) / 100;
                                const pagoTransporte = pesoNeto * porcentajeTransporte;
                                const porcentajeImpuesto = parseFloat(currentIngreso.impuesto || 0) / 100;
                                const ingresoCooperativa = pesoNeto * porcentajeImpuesto;
                                const precioPorJaba = currentIngreso.aplicarPrecioJaba ? (currentIngreso.num_jabas || 0) * 1.00 : 0;
                                const pagoSocio = subtotal - pagoTransporte - ingresoCooperativa - precioPorJaba;
                                return pagoSocio.toFixed(2);
                              })()}
                            </div>
                          </div>
                        </CCol>
                      </CRow>

                      {/* Información adicional */}
                      <CRow className="mt-3">
                        <CCol md={3}>
                          <small className="text-muted">
                            <strong>Precio por kg:</strong> S/ {parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0).toFixed(2)}
                          </small>
                        </CCol>
                        <CCol md={3}>
                          <small className="text-muted">
                            <strong>Peso por jaba:</strong> {pesoJaba.toFixed(3)} kg
                          </small>
                        </CCol>
                        <CCol md={3}>
                          <small className="text-muted">
                            <strong>Pesajes registrados:</strong> {pesajesTemporales.length}
                          </small>
                        </CCol>
                        <CCol md={3}>
                          <small className="text-muted">
                            <strong>Pago transporte:</strong> {parseFloat(currentIngreso.pago_transporte || 0).toFixed(1)}%
                          </small>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <h5 className="mb-0">
                        <CIcon icon={cilSpeedometer} className="me-2" />
                        Monitor de Peso en Tiempo Real
                      </h5>
                    </CCardHeader>
                    <CCardBody>
                      <CRow>
                        {/* Panel de Control */}
                        <CCol md={4}>
                          <div className="d-grid gap-2">
                            {!monitorActivo ? (
                              <CButton
                                color="success"
                                onClick={iniciarMonitoreoRealTime}
                                disabled={!balanzaConectada}
                              >
                                <CIcon icon={cilMediaPlay} className="me-2" />
                                Iniciar Monitor
                              </CButton>
                            ) : (
                              <CButton
                                color="danger"
                                onClick={detenerMonitoreoRealTime}
                              >
                                <CIcon icon={cilMediaStop} className="me-2" />
                                Detener Monitor
                              </CButton>
                            )}

                            <CButton
                              color="primary"
                              onClick={aplicarPesoRealTime}
                              disabled={!monitorActivo || !pesajeRealTime.stable}
                            >
                              <CIcon icon={cilArrowCircleBottom} className="me-2" />
                              Aplicar Peso
                            </CButton>

                            <CButton
                              color="info"
                              onClick={guardarPesajeAutomatico}
                              disabled={!monitorActivo || !pesajeRealTime.stable || !currentIngreso.id}
                            >
                              <CIcon icon={cilSave} className="me-2" />
                              Guardar Pesaje
                            </CButton>
                          </div>
                        </CCol>

                        {/* Display del Peso */}
                        <CCol md={8}>
                          <div
                            className="text-center p-4 rounded"
                            style={{
                              backgroundColor: '#f8f9fa',
                              border: `3px solid ${pesajeRealTime.statusColor || '#6c757d'}`,
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {/* Peso Principal */}
                            <div
                              className="display-3 fw-bold mb-2"
                              style={{
                                color: pesajeRealTime.statusColor || '#6c757d',
                                fontFamily: 'monospace',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                              }}
                            >
                              {monitorActivo ? (pesajeRealTime.weight || 0).toFixed(3) : '0.000'}
                              <small className="fs-4 ms-2">kg</small>
                            </div>

                            {/* Estado */}
                            <div className="mb-3">
                              <CBadge
                                color={pesajeRealTime.stable ? 'success' : (monitorActivo ? 'warning' : 'secondary')}
                                className="fs-6 px-3 py-2"
                              >
                                {monitorActivo ? (pesajeRealTime.status || 'LEYENDO...') : 'DESCONECTADO'}
                              </CBadge>
                            </div>

                            {/* Información Adicional */}
                            <CRow className="text-start">
                              <CCol sm={6}>
                                <small className="text-muted">
                                  <strong>Última lectura:</strong><br />
                                  {pesajeRealTime.timestamp ?
                                    new Date(pesajeRealTime.timestamp).toLocaleTimeString() :
                                    'N/A'
                                  }
                                </small>
                              </CCol>
                              <CCol sm={6}>
                                <small className="text-muted">
                                  <strong>Datos originales:</strong><br />
                                  {pesajeRealTime.rawData ?
                                    pesajeRealTime.rawData.substring(0, 20) + '...' :
                                    'N/A'
                                  }
                                </small>
                              </CCol>
                            </CRow>

                            {/* Indicador Visual de Estabilidad */}
                            <div className="mt-3">
                              <div className="d-flex justify-content-center align-items-center">
                                <div
                                  className="rounded-circle me-2"
                                  style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: pesajeRealTime.stable ? '#28a745' : '#ffc107',
                                    animation: pesajeRealTime.stable ? 'none' : 'pulse 1s infinite'
                                  }}
                                ></div>
                                <small className="text-muted">
                                  {pesajeRealTime.stable ? 'Peso estabilizado' : 'Estabilizando...'}
                                </small>
                              </div>
                            </div>
                          </div>
                        </CCol>
                      </CRow>

                      {/* Historial de Pesajes en Tiempo Real */}
                      {camposBloqueados && (
                        <div className="mt-4">
                          <h6>Últimos Pesajes Registrados</h6>
                          <div className="table-responsive">
                            <table className="table table-sm">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Peso</th>
                                  <th>Fecha/Hora</th>
                                  <th>Estado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pesajes.slice(-2).reverse().map((pesaje, index) => (
                                  <tr key={pesaje.id || index}>
                                    <td>{index + 1}</td>
                                    <td>
                                      <span className="fw-bold text-primary">
                                        {(pesaje.peso || 0).toFixed(3)} kg
                                      </span>
                                    </td>
                                    <td>
                                      <small className="text-muted">
                                        {pesaje.timestamp ?
                                          new Date(pesaje.timestamp).toLocaleTimeString() :
                                          new Date().toLocaleTimeString()
                                        }
                                      </small>
                                    </td>
                                    <td>
                                      <CBadge
                                        color={pesaje.stable ? 'success' : 'warning'}
                                        className="px-2"
                                      >
                                        {pesaje.stable ? 'ESTABLE' : 'INESTABLE'}
                                      </CBadge>
                                    </td>
                                  </tr>
                                ))}
                                {pesajes.length === 0 && (
                                  <tr>
                                    <td colSpan="4" className="text-center text-muted py-3">
                                      <small>No hay pesajes registrados aún</small>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </CCardBody>
                  </CCard>

                </CCol>
              </CRow>

              {/* Configuración de Pesaje */}
              <CRow className="mb-4">
                <CCol md={12}>
                  <CCard>
                    <CCardHeader>
                      <strong>Productos de la Orden:</strong>
                    </CCardHeader>
                    <CCardBody>
                      {/* Productos de la Orden Seleccionada */}
                      {ordenSeleccionada && (
                        <div className="mb-12">
                          {cargandoProductosOrden ? (
                            <div className="text-center py-3">
                              <div className="spinner-border spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Cargando...</span>
                              </div>
                              Cargando productos...
                            </div>
                          ) : productosOrden.length > 0 ? (
                            <div className="border rounded p-3 bg-light">
                              <div className="table-responsive">
                                <table className="table table-sm table-hover mb-0">
                                  <thead>
                                    <tr>
                                      <th>Producto</th>
                                      <th>Tipo Fruta</th>
                                      <th>Cant. Total</th>
                                      <th>Cant. Pendiente</th>
                                      <th>Progreso</th>
                                      <th>Acción</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {productosOrden.map((producto) => {
                                      // Usar las nuevas funciones para calcular valores actualizados
                                      const cantidadPendienteActualizada = calcularCantidadPendienteActualizada(producto);
                                      const progresoActualizado = calcularProgresoActualizado(producto);
                                      const isCompleto = cantidadPendienteActualizada <= 0;

                                      return (
                                        <tr
                                          key={producto.id}
                                          className={`${isCompleto ? 'table-success' : ''} ${productoSeleccionadoPesaje === producto.id ? 'table-primary' : ''}`}
                                        >
                                          <td>
                                            <strong>{producto.producto_nombre}</strong>
                                          </td>
                                          <td>
                                            <span className="badge bg-info">{producto.tipo_fruta_nombre}</span>
                                          </td>
                                          <td>
                                            <span className="fw-bold">{(producto.cantidad || 0).toFixed(2)} kg</span>
                                          </td>
                                          <td>
                                            <span className={`fw-bold ${isCompleto ? 'text-success' : 'text-warning'}`}>
                                              {calcularCantidadPendienteActualizada(producto).toFixed(2)} kg
                                            </span>
                                            {isCompleto && (
                                              <CBadge color="success" className="ms-2" size="sm">
                                                COMPLETO
                                              </CBadge>
                                            )}
                                          </td>
                                          <td>
                                            <div className="d-flex align-items-center">
                                              <div className="flex-grow-1 me-2">
                                                <CProgress
                                                  value={calcularProgresoActualizado(producto)}
                                                  color={isCompleto ? 'success' : 'primary'}
                                                  className="mb-1"
                                                />
                                              </div>
                                              <small className="text-muted">
                                                {calcularProgresoActualizado(producto).toFixed(1)}%
                                              </small>
                                            </div>
                                          </td>
                                          <td>
                                            <CButton
                                              size="sm"
                                              color={productoSeleccionadoPesaje === producto.id ? 'success' : 'primary'}
                                              variant={productoSeleccionadoPesaje === producto.id ? 'solid' : 'outline'}
                                              onClick={() => {
                                                if (productoSeleccionadoPesaje === producto.id) {
                                                  setProductoSeleccionadoPesaje('');
                                                } else {
                                                  setProductoSeleccionadoPesaje(producto.id);
                                                }
                                              }}
                                              disabled={isCompleto}
                                            >
                                              {productoSeleccionadoPesaje === producto.id ? (
                                                <>
                                                  <CIcon icon={cilCheckCircle} className="me-1" />
                                                  Seleccionado
                                                </>
                                              ) : isCompleto ? (
                                                <>
                                                  <CIcon icon={cilCheckCircle} className="me-1" />
                                                  Completo
                                                </>
                                              ) : (
                                                <>
                                                  <CIcon icon={cilLocationPin} className="me-1" />
                                                  Seleccionar
                                                </>
                                              )}
                                            </CButton>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Información del producto seleccionado */}
                              {productoSeleccionadoPesaje && (
                                <div className="mt-3 p-3 bg-primary bg-opacity-10 border border-primary rounded">
                                  {(() => {
                                    const productoActual = productosOrden.find(p => p.id === productoSeleccionadoPesaje);
                                    const cantidadPendienteActualizada = calcularCantidadPendienteActualizada(productoActual);
                                    const pesoNetoIngresado = calcularPesoNetoIngresadoPorProducto(productoSeleccionadoPesaje);

                                    return (
                                      <div>
                                        <h6 className="text-primary mb-2">
                                          <CIcon icon={cilLocationPin} className="me-2" />
                                          Producto Activo para Pesaje
                                        </h6>
                                        <div className="row">
                                          <div className="col-md-6">
                                            <strong>Producto:</strong> {productoActual?.producto_nombre}<br />
                                            <strong>Tipo Fruta:</strong> {productoActual?.tipo_fruta_nombre}
                                          </div>
                                          <div className="col-md-6">
                                            <strong>Cantidad Pendiente:</strong>
                                            <span className="text-warning fw-bold ms-1">
                                              {cantidadPendienteActualizada.toFixed(2)} kg
                                            </span>
                                            {pesoNetoIngresado > 0 && (
                                              <div>
                                                <small className="text-info">
                                                  <strong>Peso neto ingresado:</strong> {pesoNetoIngresado.toFixed(2)} kg
                                                </small>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="alert alert-info mb-0">
                              <CIcon icon={cilInfo} className="me-2" />
                              No se encontraron productos para esta orden
                            </div>
                          )}
                        </div>
                      )}
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

              {/* Tabla de Pesajes Temporales */}
              {pesajesTemporales.length > 0 && (
                <CCard className="mt-3">
                  <CCardHeader>
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <CIcon icon={cilList} className="me-2" />
                        Pesajes Registrados ({pesajesTemporales.length})
                      </h6>
                      <div>
                        <CButton
                          color="success"
                          variant="outline"
                          size="sm"
                          onClick={exportarPesajesExcel}
                          disabled={submitting}
                        >
                          <CIcon icon={cilSpreadsheet} className="me-1" />
                          Exportar a Excel
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          onClick={limpiarPesajesTemporales}
                          disabled={submitting}
                        >
                          <CIcon icon={cilTrash} className="me-1" />
                          Limpiar Todo
                        </CButton>
                      </div>
                    </div>
                  </CCardHeader>
                  <CCardBody>
                    <div className="table-responsive">

                      <CTable hover size="sm">
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>#</CTableHeaderCell>
                            <CTableHeaderCell>Producto</CTableHeaderCell>
                            <CTableHeaderCell>Peso Bruto</CTableHeaderCell>
                            <CTableHeaderCell>Jabas</CTableHeaderCell>
                            <CTableHeaderCell>Peso Jabas</CTableHeaderCell>
                            <CTableHeaderCell>Descuento Merma</CTableHeaderCell>
                            <CTableHeaderCell>Peso Neto</CTableHeaderCell>
                            <CTableHeaderCell>Precio/kg</CTableHeaderCell>
                            <CTableHeaderCell>Subtotal</CTableHeaderCell>
                            <CTableHeaderCell>Pago Transporte</CTableHeaderCell>
                            <CTableHeaderCell>Ingreso Cooperativa</CTableHeaderCell>
                            <CTableHeaderCell>Pago al Socio</CTableHeaderCell>
                            <CTableHeaderCell>Fecha/Hora</CTableHeaderCell>
                            <CTableHeaderCell>Observación</CTableHeaderCell>
                            <CTableHeaderCell>Acciones</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {pesajesTemporales.map((pesaje, index) => {

                            const pesoNeto = parseFloat(pesaje.peso_bruto || 0) - parseFloat(pesaje.peso_jaba || pesaje.peso_total_jabas || 0) - parseFloat(pesaje.descuento_merma || 0);
                            const precioKg = parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0);
                            const subtotal = pesoNeto * precioKg;

                            // Calcular pagos basados en porcentajes
                            const porcentajeTransporte = parseFloat(currentIngreso.pago_transporte || 0) / 100;
                            const pagoTransporte = (pesoNeto * porcentajeTransporte);

                            // El ingreso a la cooperativa es el peso neto * el porcentaje de impuesto
                            const porcentajeImpuesto = parseFloat(currentIngreso.impuesto || 0) / 100;
                            const ingresoCooperativa = pesoNeto * porcentajeImpuesto;

                            const precioPorJaba = currentIngreso.aplicarPrecioJaba ? (pesaje.num_jabas_pesaje || pesaje.num_jabas || 0) * 1.00 : 0;

                            // Ajustar el pago al socio
                            const pagoSocio = subtotal - pagoTransporte - ingresoCooperativa - precioPorJaba;


                            return (
                              <CTableRow key={pesaje.id}>
                                <CTableDataCell>
                                  <CBadge color="primary">{pesaje.numero_pesaje}</CBadge>
                                </CTableDataCell>
                                <CTableDataCell>
                                  <div>
                                    <strong>{pesaje.producto_nombre}</strong>
                                    <br />
                                    <small className="text-muted">{pesaje.tipo_fruta_nombre}</small>
                                  </div>
                                </CTableDataCell>
                                <CTableDataCell>
                                  <strong className="text-primary">
                                    {parseFloat(pesaje.peso_bruto || 0).toFixed(3)} kg
                                  </strong>
                                </CTableDataCell>
                                <CTableDataCell>
                                  <CBadge color="info">
                                    {pesaje.num_jabas_pesaje || pesaje.num_jabas || 0} jabas
                                  </CBadge>
                                </CTableDataCell>
                                <CTableDataCell>
                                  {parseFloat(pesaje.peso_jaba || pesaje.peso_total_jabas || 0).toFixed(3)} kg
                                  <br />
                                  <small className="text-muted">
                                    ({pesoJaba} kg/jaba)
                                  </small>
                                </CTableDataCell>
                                <CTableDataCell>
                                  {pesaje.descuento_merma ? (
                                    <>
                                      <span className="text-danger">
                                        -{parseFloat(pesaje.descuento_merma).toFixed(3)} kg
                                      </span>
                                      <br />
                                      <small className="text-muted">
                                        ({((parseFloat(pesaje.descuento_merma) / parseFloat(pesaje.peso_bruto)) * 100).toFixed(1)}%)
                                      </small>
                                    </>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </CTableDataCell>
                                <CTableDataCell>
                                  <strong className="text-success">
                                    {pesoNeto.toFixed(3)} kg
                                  </strong>
                                </CTableDataCell>
                                <CTableDataCell>
                                  <span className="text-warning">
                                    S/ {precioKg.toFixed(2)}
                                  </span>
                                </CTableDataCell>
                                <CTableDataCell>
                                  <strong className="text-info">
                                    S/ {subtotal.toFixed(2)}
                                  </strong>
                                </CTableDataCell>
                                <CTableDataCell>
                                  <div className="text-center">
                                    <span className="text-danger">
                                      S/ {pagoTransporte.toFixed(2)}
                                    </span>
                                    <br />
                                    <small className="text-muted">
                                      ({porcentajeTransporte}% del peso neto)
                                    </small>
                                  </div>
                                </CTableDataCell>
                                <CTableDataCell>
                                  <strong className="text-primary">
                                    S/ {ingresoCooperativa.toFixed(2)}
                                  </strong>
                                  <br />
                                  <small className="text-muted">
                                    ({porcentajeImpuesto}% del peso neto)
                                  </small>
                                </CTableDataCell>
                                <CTableDataCell>
                                  <strong
                                    className={`text-success ${currentIngreso.aplicarPrecioJaba ? 'bg-warning' : ''}`}
                                    style={{
                                      backgroundColor: currentIngreso.aplicarPrecioJaba ? '#fff3cd' : 'transparent',
                                      transition: 'background-color 0.3s ease'
                                    }}
                                  >
                                    S/ {pagoSocio.toFixed(2)}
                                  </strong>
                                  {currentIngreso.aplicarPrecioJaba && (
                                    <small className="text-muted">
                                      (Descuento aplicado por jabas: S/ {precioPorJaba.toFixed(2)})
                                    </small>
                                  )}
                                </CTableDataCell>
                                <CTableDataCell>
                                  <small>
                                    {new Date(pesaje.timestamp).toLocaleDateString()}<br />
                                    {new Date(pesaje.timestamp).toLocaleTimeString()}
                                  </small>
                                </CTableDataCell>
                                <CTableDataCell>
                                  {pesaje.observacion ? (
                                    <small className="text-muted">{pesaje.observacion}</small>
                                  ) : (
                                    <small className="text-muted">-</small>
                                  )}
                                </CTableDataCell>
                                <CTableDataCell>
                                  <CButtonGroup size="sm">
                                    <CButton
                                      color="warning"
                                      variant="outline"
                                      onClick={() => {
                                        // Función para editar pesaje temporal
                                        Swal.fire({
                                          title: 'Editar Pesaje',
                                          html: `
                                            <div class="container-fluid">
                                              <div class="row g-3">
                                                <div class="col-12 col-md-6">
                                                  <label class="form-label fw-semibold">
                                                    <i class="fas fa-weight me-1"></i>
                                                    Peso Bruto (kg):
                                                  </label>
                                                  <input type="number" id="edit-peso" class="form-control" 
                                                         value="${pesaje.peso_bruto}" step="0.001" min="0"
                                                         placeholder="0.000">
                                                </div>
                                                <div class="col-12 col-md-6">
                                                  <label class="form-label fw-semibold">
                                                    <i class="fas fa-box me-1"></i>
                                                    Número de Jabas:
                                                  </label>
                                                  <input type="number" id="edit-jabas" class="form-control" 
                                                         value="${pesaje.num_jabas_pesaje || pesaje.num_jabas}" min="1" max="50"
                                                         placeholder="1">
                                                </div>
                                                <div class="col-12">
                                                  <label class="form-label fw-semibold">
                                                    <i class="fas fa-minus-circle me-1"></i>
                                                    Descuento por Merma (kg):
                                                  </label>
                                                  <input type="number" id="edit-merma" class="form-control" 
                                                         value="${pesaje.descuento_merma || 0}" step="0.001" min="0"
                                                         placeholder="0.000">
                                                  <small class="form-text text-muted">
                                                    Peso a descontar por productos en mal estado o pérdidas
                                                  </small>
                                                </div>
                                                <div class="col-12">
                                                  <label class="form-label fw-semibold">
                                                    <i class="fas fa-comment me-1"></i>
                                                    Observación:
                                                  </label>
                                                  <textarea id="edit-observacion" class="form-control" rows="2"
                                                            placeholder="Observaciones adicionales (opcional)">${pesaje.observacion || ''}</textarea>
                                                </div>
                                              </div>
                                              
                                              <div class="row mt-3">
                                                <div class="col-12">
                                                  <div class="card border-info">
                                                    <div class="card-header bg-info text-white py-2">
                                                      <h6 class="mb-0">
                                                        <i class="fas fa-calculator me-2"></i>
                                                        Vista Previa de Cálculos
                                                      </h6>
                                                    </div>
                                                    <div class="card-body py-2">
                                                      <div class="row g-2 text-center">
                                                        <div class="col-6 col-sm-3">
                                                          <small class="text-muted d-block">Peso Jabas:</small>
                                                          <strong class="text-info" id="preview-peso-jabas">${(pesaje.num_jabas_pesaje * pesoJaba).toFixed(3)} kg</strong>
                                                        </div>
                                                        <div class="col-6 col-sm-3">
                                                          <small class="text-muted d-block">Merma:</small>
                                                          <strong class="text-danger" id="preview-merma">${(parseFloat(pesaje.descuento_merma) || 0).toFixed(3)} kg</strong>
                                                        </div>
                                                        <div class="col-6 col-sm-3">
                                                          <small class="text-muted d-block">Peso Neto:</small>
                                                          <strong class="text-success" id="preview-peso-neto">${(parseFloat(pesaje.peso_bruto) - (pesaje.num_jabas_pesaje * pesoJaba) - (pesaje.descuento_merma || 0)).toFixed(3)} kg</strong>
                                                        </div>
                                                        <div class="col-6 col-sm-3">
                                                          <small class="text-muted d-block">Subtotal:</small>
                                                          <strong class="text-primary" id="preview-subtotal">S/ ${((parseFloat(pesaje.peso_bruto) - (pesaje.num_jabas_pesaje * pesoJaba) - (pesaje.descuento_merma || 0)) * parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0)).toFixed(2)}</strong>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          `,
                                          showCancelButton: true,
                                          confirmButtonText: 'Guardar',
                                          cancelButtonText: 'Cancelar',
                                          confirmButtonColor: '#321fdb',
                                          didOpen: () => {
                                            // OBTENER REFERENCIAS A LOS ELEMENTOS
                                            const pesoInput = document.getElementById('edit-peso');
                                            const jabasInput = document.getElementById('edit-jabas');
                                            const mermaInput = document.getElementById('edit-merma');
                                            const previewPesoJabas = document.getElementById('preview-peso-jabas');
                                            const previewMerma = document.getElementById('preview-merma');
                                            const previewPesoNeto = document.getElementById('preview-peso-neto');
                                            const previewSubtotal = document.getElementById('preview-subtotal');

                                            // FUNCIÓN PARA ACTUALIZAR LA VISTA PREVIA
                                            const updatePreview = () => {
                                              const peso = parseFloat(pesoInput.value) || 0;
                                              const jabas = parseInt(jabasInput.value) || 0;
                                              const merma = parseFloat(mermaInput.value) || 0;
                                              const pesoJabas = jabas * pesoJaba; // Sin ${} aquí
                                              const pesoNeto = Math.max(0, peso - pesoJabas - merma);
                                              const subtotal = pesoNeto * parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0); // Sin ${} aquí

                                              // ACTUALIZAR LOS ELEMENTOS DE VISTA PREVIA
                                              previewPesoJabas.textContent = pesoJabas.toFixed(3) + ' kg';
                                              previewMerma.textContent = merma.toFixed(3) + ' kg';
                                              previewPesoNeto.textContent = pesoNeto.toFixed(3) + ' kg';
                                              previewSubtotal.textContent = 'S/ ' + subtotal.toFixed(2);
                                            };

                                            // AGREGAR EVENT LISTENERS PARA ACTUALIZACIÓN EN TIEMPO REAL
                                            pesoInput.addEventListener('input', updatePreview);
                                            jabasInput.addEventListener('input', updatePreview);
                                            mermaInput.addEventListener('input', updatePreview);

                                            // CALCULAR VALORES INICIALES
                                            updatePreview();
                                          },
                                          preConfirm: () => {
                                            const peso = parseFloat(document.getElementById('edit-peso').value);
                                            const jabas = parseInt(document.getElementById('edit-jabas').value);
                                            const merma = parseFloat(document.getElementById('edit-merma').value) || 0;
                                            const observacion = document.getElementById('edit-observacion').value;

                                            if (!peso || peso <= 0) {
                                              Swal.showValidationMessage('El peso debe ser mayor a 0');
                                              return false;
                                            }
                                            if (!jabas || jabas <= 0) {
                                              Swal.showValidationMessage('El número de jabas debe ser mayor a 0');
                                              return false;
                                            }

                                            return { peso, jabas, merma, observacion };
                                          }
                                        }).then((result) => {
                                          if (result.isConfirmed) {
                                            const { peso, jabas, merma, observacion } = result.value;

                                            // Actualizar el pesaje temporal
                                            setPesajesTemporales(prev => {
                                              const updatedPesajes = prev.map(p =>
                                                p.id === pesaje.id
                                                  ? {
                                                    ...p,
                                                    peso_bruto: peso,
                                                    num_jabas: jabas,
                                                    num_jabas_pesaje: jabas,
                                                    peso_jaba: jabas * pesoJaba,
                                                    descuento_merma: merma,
                                                    peso_neto: Math.max(0, peso - (jabas * pesoJaba) - merma), // Calcular peso neto
                                                    observacion: observacion
                                                  }
                                                  : p
                                              );

                                              // SINCRONIZAR TOTALES DEL INGRESO DESPUÉS DE LA EDICIÓN
                                              const totalPesoBruto = updatedPesajes.reduce((sum, p) => sum + (parseFloat(p.peso_bruto) || 0), 0);
                                              const totalJabas = updatedPesajes.reduce((sum, p) => sum + (parseInt(p.num_jabas_pesaje) || 0), 0);
                                              const totalPesoJabas = updatedPesajes.reduce((sum, p) => sum + (parseFloat(p.peso_jaba) || 0), 0);
                                              const totalDescuentoMerma = updatedPesajes.reduce((sum, p) => sum + (parseFloat(p.descuento_merma) || 0), 0);
                                              const totalPesoNeto = updatedPesajes.reduce((sum, p) => sum + (parseFloat(p.peso_neto) || 0), 0);

                                              // Calcular el precio por jaba y el pago al socio
                                              const precioPorJaba = currentIngreso.aplicarPrecioJaba ? (totalJabas || 0) * 1.00 : 0;
                                              const subtotal = totalPesoNeto * parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0);
                                              const porcentajeTransporte = parseFloat(currentIngreso.pago_transporte || 0) / 100;
                                              const pagoTransporte = totalPesoNeto * porcentajeTransporte;
                                              const porcentajeImpuesto = parseFloat(currentIngreso.impuesto || 0) / 100;
                                              const ingresoCooperativa = totalPesoNeto * porcentajeImpuesto;
                                              const pagoSocio = subtotal - pagoTransporte - ingresoCooperativa - precioPorJaba;

                                              // Actualizar el currentIngreso con los nuevos totales
                                              setCurrentIngreso(prev => ({
                                                ...prev,
                                                peso_bruto: totalPesoBruto.toFixed(3),
                                                num_jabas_pesaje: totalJabas,
                                                num_jabas: totalJabas,
                                                peso_jaba: totalPesoJabas.toFixed(3),
                                                peso_total_jabas: totalPesoJabas.toFixed(3),
                                                descuento_merma: totalDescuentoMerma.toFixed(3),
                                                peso_neto: totalPesoNeto.toFixed(3),
                                                total: subtotal.toFixed(2),
                                                pago_socio: pagoSocio.toFixed(2) // Actualizar el pago al socio
                                              }));

                                              return updatedPesajes;
                                            });

                                            Swal.fire({
                                              icon: 'success',
                                              title: '¡Actualizado!',
                                              text: 'El pesaje ha sido actualizado correctamente.',
                                              confirmButtonColor: '#321fdb',
                                              timer: 1500,
                                              timerProgressBar: true
                                            });
                                          }
                                        });
                                      }}
                                      disabled={submitting}
                                      title="Editar pesaje"
                                    >
                                      <CIcon icon={cilPencil} />
                                    </CButton>
                                    <CButton
                                      color="danger"
                                      variant="outline"
                                      onClick={() => eliminarPesajeTemporal(pesaje.id)}
                                      disabled={submitting}
                                      title="Eliminar pesaje"
                                    >
                                      <CIcon icon={cilTrash} />
                                    </CButton>
                                  </CButtonGroup>
                                </CTableDataCell>
                              </CTableRow>
                            );
                          })}
                        </CTableBody>
                        <CTableHead>
                          <CTableRow className="table-info">
                            <CTableHeaderCell colSpan={2}>
                              <strong>TOTALES:</strong>
                            </CTableHeaderCell>
                            <CTableHeaderCell>
                              <strong className="text-primary">
                                {pesajesTemporales.reduce((sum, p) => sum + (parseFloat(p.peso_bruto) || 0), 0).toFixed(3)} kg
                              </strong>
                            </CTableHeaderCell>
                            <CTableHeaderCell>
                              <strong>
                                {pesajesTemporales.reduce((sum, p) => sum + (parseInt(p.num_jabas_pesaje) || parseInt(p.num_jabas) || 0), 0)} jabas
                              </strong>
                            </CTableHeaderCell>
                            <CTableHeaderCell>
                              <strong>
                                {pesajesTemporales.reduce((sum, p) => sum + (parseFloat(p.peso_jaba) || parseFloat(p.peso_total_jabas) || 0), 0).toFixed(3)} kg
                              </strong>
                            </CTableHeaderCell>
                            <CTableHeaderCell>
                              <strong className="text-danger">
                                -{pesajesTemporales.reduce((sum, p) => sum + (parseFloat(p.descuento_merma) || 0), 0).toFixed(3)} kg
                              </strong>
                            </CTableHeaderCell>
                            <CTableHeaderCell>
                              <strong className="text-success">
                                {pesajesTemporales.reduce((sum, p) => {
                                  const pesoNeto = parseFloat(p.peso_bruto || 0) - parseFloat(p.peso_jaba || p.peso_total_jabas || 0) - parseFloat(p.descuento_merma || 0);
                                  return sum + pesoNeto;
                                }, 0).toFixed(3)} kg
                              </strong>
                            </CTableHeaderCell>
                            <CTableHeaderCell>-</CTableHeaderCell>
                            <CTableHeaderCell>
                              <strong className="text-info">
                                S/ {pesajesTemporales.reduce((sum, p) => {
                                  const pesoNeto = parseFloat(p.peso_bruto || 0) - parseFloat(p.peso_jaba || p.peso_total_jabas || 0) - parseFloat(p.descuento_merma || 0);
                                  const precioKg = parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0);
                                  return sum + (pesoNeto * precioKg);
                                }, 0).toFixed(2)}
                              </strong>
                            </CTableHeaderCell>
                            <CTableHeaderCell>
                              <strong className="text-danger">
                                S/ {pesajesTemporales.reduce((sum, p) => {
                                  const pesoNeto = parseFloat(p.peso_bruto || 0) - parseFloat(p.peso_jaba || p.peso_total_jabas || 0) - parseFloat(p.descuento_merma || 0);
                                  const porcentajeTransporte = parseFloat(currentIngreso.pago_transporte || 0) / 100;
                                  return sum + (pesoNeto * porcentajeTransporte);
                                }, 0).toFixed(2)}
                              </strong>
                            </CTableHeaderCell>
                            <CTableHeaderCell>
                              <strong className="text-primary">
                                S/ {pesajesTemporales.reduce((sum, p) => {
                                  const pesoNeto = parseFloat(p.peso_bruto || 0) - parseFloat(p.peso_jaba || p.peso_total_jabas || 0) - parseFloat(p.descuento_merma || 0);
                                  const porcentajeImpuesto = parseFloat(currentIngreso.impuesto || 0) / 100;
                                  return sum + (pesoNeto * porcentajeImpuesto);
                                }, 0).toFixed(2)}
                              </strong>
                            </CTableHeaderCell>

                            <CTableHeaderCell>
                              <strong className="text-success">
                                S/ {pesajesTemporales.reduce((sum, p) => {
                                  const pesoNeto = parseFloat(p.peso_bruto || 0) - parseFloat(p.peso_jaba || p.peso_total_jabas || 0) - parseFloat(p.descuento_merma || 0);
                                  const precioKg = parseFloat((currentIngreso.precio_venta_kg || precioVentaKg) || 0);
                                  const subtotal = pesoNeto * precioKg;
                                  const porcentajeTransporte = parseFloat(currentIngreso.pago_transporte || 0) / 100;
                                  const pagoTransporte = pesoNeto * porcentajeTransporte;
                                  const porcentajeImpuesto = parseFloat(currentIngreso.impuesto || 0) / 100;
                                  const ingresoCooperativa = pesoNeto * porcentajeImpuesto;

                                  // Calcular el precio por jaba
                                  const precioPorJaba = currentIngreso.aplicarPrecioJaba ? (p.num_jabas_pesaje || p.num_jabas || 0) * 1.00 : 0;

                                  // Ajustar el pago al socio
                                  const pagoSocio = subtotal - pagoTransporte - ingresoCooperativa - precioPorJaba;

                                  return sum + pagoSocio;
                                }, 0).toFixed(2)}
                              </strong>
                            </CTableHeaderCell>
                            <CTableHeaderCell colSpan={3}>-</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                      </CTable>
                    </div>
                    {/* Botones de acción para pesajes temporales */}
                    {/* <div className="mt-3 d-flex gap-2">
                      
                      <CButton
                        color="success"
                        size="sm"
                        onClick={confirmarPesajesTemporales}
                        disabled={pesajesTemporales.length === 0}
                      >
                        <CIcon icon={cilCheckCircle} className="me-1" />
                        Confirmar Pesajes ({pesajesTemporales.length})
                      </CButton>
                    </div> */}
                  </CCardBody>
                </CCard>
              )}

            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </CButton>

              <CButton
                color="primary"
                onClick={handleSubmit}
                disabled={loading || submitting}
                className="me-2"
              >
                {loading || submitting ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    {editingId ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <CIcon icon={cilSave} className="me-2" />
                    {editingId ? 'Actualizar' : 'Crear'} Ingreso
                  </>
                )}
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Modal de confirmación para eliminar */}
          <CModal
            visible={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
          >
            <CModalHeader>
              <CModalTitle>Confirmar Eliminación</CModalTitle>
            </CModalHeader>
            <CModalBody>
              ¿Está seguro que desea eliminar el ingreso <strong>{ingresoToDelete?.numero_ingreso}</strong>?
              <br />
              <small className="text-muted">Esta acción no se puede deshacer.</small>
            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </CButton>
              <CButton
                color="danger"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </CButton>
            </CModalFooter>
          </CModal>
        </CRow>
      </CContainer>
    </>
  )
}

export default Ingresos