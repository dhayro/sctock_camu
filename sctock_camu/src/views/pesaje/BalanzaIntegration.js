import React, { useState, useEffect, useRef } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormSelect,
  CAlert,
  CSpinner,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell
} from '@coreui/react';
import axios from 'axios';

const BalanzaIntegration = ({ ingresoId, onPesoGuardado }) => {
  // Estados
  const [puertos, setPuertos] = useState([]);
  const [puertoSeleccionado, setPuertoSeleccionado] = useState('');
  const [baudRate, setBaudRate] = useState(9600);
  const [conectado, setConectado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [pesoActual, setPesoActual] = useState(0);
  const [pesoEstable, setPesoEstable] = useState(0);
  const [esEstable, setEsEstable] = useState(false);
  const [historialPesos, setHistorialPesos] = useState([]);
  
  // Referencia al EventSource
  const eventSourceRef = useRef(null);
  
  // Cargar puertos al montar el componente
  useEffect(() => {
    cargarPuertos();
    verificarEstado();
    
    // Limpiar EventSource al desmontar
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);
  
  // Función para cargar puertos disponibles
  const cargarPuertos = async () => {
    try {
      setCargando(true);
      const response = await axios.get('/api/balanza/puertos');
      setPuertos(response.data);
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar puertos:', error);
      mostrarMensaje('Error al cargar puertos: ' + (error.response?.data?.error || error.message), 'danger');
      setCargando(false);
    }
  };
  
  // Verificar estado de conexión
  const verificarEstado = async () => {
    try {
      const response = await axios.get('/api/balanza/status');
      setConectado(response.data.connected);
      
      if (response.data.connected) {
        iniciarEscuchaEventos();
      }
    } catch (error) {
      console.error('Error al verificar estado:', error);
    }
  };
  
  // Conectar a la balanza
  const conectarBalanza = async () => {
    if (!puertoSeleccionado) {
      mostrarMensaje('Por favor, seleccione un puerto', 'warning');
      return;
    }
    
    try {
      setCargando(true);
      const response = await axios.post('/api/balanza/connect', {
        port: puertoSeleccionado,
        baudRate: parseInt(baudRate)
      });
      
      mostrarMensaje(response.data.message, 'success');
      setConectado(true);
      iniciarEscuchaEventos();
      setCargando(false);
    } catch (error) {
      console.error('Error al conectar balanza:', error);
      mostrarMensaje('Error al conectar: ' + (error.response?.data?.error || error.message), 'danger');
      setCargando(false);
    }
  };
  
  // Desconectar de la balanza
  const desconectarBalanza = async () => {
    try {
      setCargando(true);
      const response = await axios.post('/api/balanza/disconnect');
      
      mostrarMensaje(response.data.message, 'info');
      setConectado(false);
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      setCargando(false);
    } catch (error) {
      console.error('Error al desconectar balanza:', error);
      mostrarMensaje('Error al desconectar: ' + (error.response?.data?.error || error.message), 'danger');
      setCargando(false);
    }
  };
  
  // Iniciar escucha de eventos SSE
  const iniciarEscuchaEventos = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    const eventSource = new EventSource('/api/balanza/pesaje-realtime');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setPesoActual(data.weight);
        setEsEstable(data.stable);
        
        if (data.stable) {
          setPesoEstable(data.weight);
        }
        
        // Agregar al historial limitando a los últimos 10 registros
        setHistorialPesos(prevHistorial => {
          const nuevoHistorial = [
            {
              timestamp: new Date().toLocaleTimeString(),
              rawData: data.rawData,
              weight: data.weight,
              stable: data.stable
            },
            ...prevHistorial
          ];
          
          return nuevoHistorial.slice(0, 10);
        });
      } catch (error) {
        console.error('Error al procesar datos del evento:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('Error en el EventSource:', error);
      eventSource.close();
    };
    
    eventSourceRef.current = eventSource;
  };
  
  // Guardar el peso actual en la base de datos
  const guardarPeso = async () => {
    if (!ingresoId) {
      mostrarMensaje('No hay un ingreso seleccionado para guardar el peso', 'warning');
      return;
    }
    
    if (!pesoEstable || pesoEstable <= 0) {
      mostrarMensaje('Espere a que el peso se estabilice antes de guardar', 'warning');
      return;
    }
    
    try {
      setCargando(true);
      
      // Obtener el último número de pesaje para este ingreso
      const responseDetalles = await axios.get(`/api/detalles-pesaje/ingreso/${ingresoId}`);
      const detalles = responseDetalles.data;
      const numeroPesaje = detalles.length > 0 ? Math.max(...detalles.map(d => d.numero_pesaje)) + 1 : 1;
      
      // Guardar el nuevo detalle de pesaje
      const response = await axios.post('/api/detalles-pesaje', {
        ingreso_id: ingresoId,
        numero_pesaje: numeroPesaje,
        peso: pesoEstable
      });
      
      mostrarMensaje(`Peso guardado correctamente: ${pesoEstable.toFixed(2)} kg`, 'success');
      
      // Notificar al componente padre
      if (onPesoGuardado) {
        onPesoGuardado(response.data);
      }
      
      setCargando(false);
    } catch (error) {
      console.error('Error al guardar peso:', error);
      mostrarMensaje('Error al guardar peso: ' + (error.response?.data?.error || error.message), 'danger');
      setCargando(false);
    }
  };
  
  // Mostrar mensaje temporal
  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => {
      setMensaje({ texto: '', tipo: '' });
    }, 5000);
  };
  
  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Integración con Balanza</strong>
      </CCardHeader>
      <CCardBody>
        {mensaje.texto && (
          <CAlert color={mensaje.tipo} className="mb-3">
            {mensaje.texto}
          </CAlert>
        )}
        
        <CRow>
          <CCol md={6}>
            <h4>Configuración de la Balanza</h4>
            <div className="mb-3">
              <label className="form-label">Puerto COM:</label>
              <CFormSelect
                value={puertoSeleccionado}
                onChange={(e) => setPuertoSeleccionado(e.target.value)}
                disabled={conectado || cargando}
              >
                <option value="">Seleccionar puerto...</option>
                {puertos.map((puerto, index) => (
                  <option key={index} value={puerto.path}>
                    {puerto.path} - {puerto.manufacturer || 'Desconocido'}
                    {puerto.friendlyName ? ` (${puerto.friendlyName})` : ''}
                  </option>
                ))}
              </CFormSelect>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Velocidad (baudios):</label>
              <CFormSelect
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                disabled={conectado || cargando}
              >
                <option value="9600">9600</option>
                <option value="19200">19200</option>
                <option value="38400">38400</option>
                <option value="57600">57600</option>
                <option value="115200">115200</option>
              </CFormSelect>
            </div>
            
            <div className="mb-3">
              <CButton
                color="primary"
                onClick={conectarBalanza}
                disabled={conectado || cargando || !puertoSeleccionado}
              >
                {cargando ? <CSpinner component="span" size="sm" aria-hidden="true" /> : 'Conectar'}
              </CButton>
              <CButton
                color="danger"
                onClick={desconectarBalanza}
                disabled={!conectado || cargando}
                className="ms-2"
              >
                {cargando ? <CSpinner component="span" size="sm" aria-hidden="true" /> : 'Desconectar'}
              </CButton>
            </div>
            
            <div className="mb-3">
              <CButton
                color="success"
                onClick={guardarPeso}
                disabled={!conectado || cargando || !esEstable}
              >
                {cargando ? <CSpinner component="span" size="sm" aria-hidden="true" /> : 'Guardar Peso'}
              </CButton>
            </div>
          </CCol>
          
          <CCol md={6}>
            <h4>Estado de la Balanza</h4>
            <p><strong>Peso Actual:</strong> {pesoActual.toFixed(2)} kg</p>
            <p><strong>Peso Estable:</strong> {pesoEstable.toFixed(2)} kg</p>
            <p><strong>Estado:</strong> {esEstable ? 'Estable' : 'Inestable'}</p>
            
            <h4>Historial de Pesajes</h4>
            <CTable striped bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Timestamp</CTableHeaderCell>
                  <CTableHeaderCell>Raw Data</CTableHeaderCell>
                  <CTableHeaderCell>Peso (kg)</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {historialPesos.map((pesaje, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{pesaje.timestamp}</CTableDataCell>
                    <CTableDataCell>{pesaje.rawData}</CTableDataCell>
                    <CTableDataCell>{pesaje.weight.toFixed(2)}</CTableDataCell>
                    <CTableDataCell>{pesaje.stable ? 'Estable' : 'Inestable'}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default BalanzaIntegration;