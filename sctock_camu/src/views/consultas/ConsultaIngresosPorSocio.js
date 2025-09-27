import React, { useState, useEffect } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CFormInput, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge } from '@coreui/react';
import Select from 'react-select';
import { getSocioContribucionPorFecha } from '../../services/api/socioService';
import socioService from '../../services/api/socioService'
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const ConsultaIngresosPorSocio = () => {
  const [socios, setSocios] = useState([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), 0, 1);
    return firstDayOfMonth.toISOString().split('T')[0];
  });
  
  const [fechaFin, setFechaFin] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [socioData, setSocioData] = useState(null);
  const [cargandoSocios, setCargandoSocios] = useState(false);
  const [cargandoIngresos, setCargandoIngresos] = useState(false);
  const [searchTermSocios, setSearchTermSocios] = useState('');
  const [parcelasInfo, setParcelasInfo] = useState([]);

  useEffect(() => {
    cargarSocios();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      cargarSocios(searchTermSocios);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTermSocios]);

  const cargarSocios = async (searchTerm = '') => {
    try {
      setCargandoSocios(true);
      const response = await socioService.getAllSocios({
        search: searchTerm,
        page: 1,
        itemsPerPage: 100,
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
        confirmButtonColor: '#321fdb',
      });
    } finally {
      setCargandoSocios(false);
    }
  };

  const handleConsultar = async () => {
    if (!socioSeleccionado || !fechaInicio || !fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, seleccione un socio y especifique el rango de fechas.',
        confirmButtonColor: '#321fdb'
      });
      return;
    }

    try {
      setCargandoIngresos(true);
      const data = await getSocioContribucionPorFecha(socioSeleccionado, fechaInicio, fechaFin);
      
      if (Array.isArray(data) && data.length > 0) {
        setSocioData(data[0]); // Tomamos el primer elemento del array
      } else {
        setSocioData(null);
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron ingresos para el socio en el rango de fechas seleccionado.',
          confirmButtonColor: '#321fdb'
        });
      }
    } catch (error) {
      console.error('Error al obtener ingresos:', error);
      setSocioData(null);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron obtener los ingresos. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    } finally {
      setCargandoIngresos(false);
    }
  };

  useEffect(() => {
    if (socioData && socioData.parcelas) {
      setParcelasInfo(socioData.parcelas);
    } else {
      setParcelasInfo([]);
    }
  }, [socioData]);

  const handleDownloadExcel = () => {
    if (!socioData || !socioData.ingresos || socioData.ingresos.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(socioData.ingresos.map((ingreso, index) => ({
      '#': index + 1,
      'Número Ingreso': ingreso.numero_ingreso,
      'Código Parcela': ingreso.parcela_codigo,
      'Peso Neto': `${ingreso.peso_neto} kg`,
      'Precio Venta/kg': `S/ ${ingreso.precio_venta_kg}`,
      'Producto': ingreso.detalle_orden?.producto || 'N/A',
      'Tipo Fruta': ingreso.detalle_orden?.tipo_fruta || 'N/A',
      'Código Lote': ingreso.detalle_orden?.orden_compra?.codigo_lote || 'N/A',
      'Tipo Lote': ingreso.detalle_orden?.orden_compra?.tipo_lote || 'N/A',
      'Num Jabas': ingreso.num_jabas,
      'Monto Transporte': `S/ ${ingreso.monto_transporte}`,
      'Ingreso Cooperativa': `S/ ${ingreso.ingreso_cooperativa}`,
      'Pago Socio': `S/ ${ingreso.pago_socio}`,
      'Fecha': new Date(ingreso.fecha).toLocaleDateString()
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ingresos');
    
    // Nombre del archivo con el código del socio
    const fileName = `Ingresos_Socio_${socioData.codigo}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Calculate totals from socioData
  const totalPesoNeto = socioData?.ingresos?.reduce((acc, ingreso) => acc + parseFloat(ingreso.peso_neto || 0), 0) || 0;
  const totalMontoTransporte = socioData?.ingresos?.reduce((acc, ingreso) => acc + parseFloat(ingreso.monto_transporte || 0), 0) || 0;
  const totalIngresoCooperativa = socioData?.ingresos?.reduce((acc, ingreso) => acc + parseFloat(ingreso.ingreso_cooperativa || 0), 0) || 0;
  const totalPagoSocio = socioData?.ingresos?.reduce((acc, ingreso) => acc + parseFloat(ingreso.pago_socio || 0), 0) || 0;
  const totalNumJabas = socioData?.ingresos?.reduce((acc, ingreso) => acc + parseInt(ingreso.num_jabas || 0), 0) || 0;

  return (
    <CCard>
      <CCardHeader>
        <strong>Consulta de Ingresos por Socio</strong>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3">
          <CCol md={4}>
            <Select
              id="socio_pesaje"
              value={
                socios.find((socio) => socio.id === socioSeleccionado)
                  ? {
                    value: socioSeleccionado,
                    label: `${socios.find((socio) => socio.id === socioSeleccionado).codigo} - ${socios.find((socio) => socio.id === socioSeleccionado).nombres} ${socios.find((socio) => socio.id === socioSeleccionado).apellidos}`,
                  }
                  : null
              }
              onChange={(selectedOption) => {
                const socioId = selectedOption ? selectedOption.value : ''
                setSocioSeleccionado(socioId)
              }}
              options={socios.map((socio) => ({
                value: socio.id,
                label: `${socio.codigo} - ${socio.nombres} ${socio.apellidos}`,
              }))}
              placeholder="Buscar y seleccionar socio..."
              isClearable
              isSearchable
              isLoading={cargandoSocios}
              filterOption={() => true}
              onInputChange={(inputValue, { action }) => {
                if (action === 'input-change') {
                  setSearchTermSocios(inputValue)
                }
              }}
              className="basic-single"
              classNamePrefix="select"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderColor: state.isFocused ? '#321fdb' : provided.borderColor,
                  boxShadow: state.isFocused
                    ? '0 0 0 0.2rem rgba(50, 31, 219, 0.25)'
                    : provided.boxShadow,
                  '&:hover': {
                    borderColor: '#321fdb',
                  },
                }),
              }}
              noOptionsMessage={({ inputValue }) =>
                cargandoSocios
                  ? 'Buscando socios...'
                  : inputValue
                    ? `No se encontraron socios que coincidan con "${inputValue}"`
                    : 'No se encontraron socios'
              }
              loadingMessage={() => 'Cargando socios...'}
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              placeholder="Fecha de inicio"
            />
          </CCol>
          <CCol md={3}>
            <CFormInput
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              placeholder="Fecha de fin"
            />
          </CCol>
          <CCol md={2}>
            <CButton 
              color="primary" 
              onClick={handleConsultar}
              disabled={cargandoIngresos}
            >
              {cargandoIngresos ? 'Cargando...' : 'Consultar'}
            </CButton>
          </CCol>
        </CRow>

        {socioData && socioData.ingresos && socioData.ingresos.length > 0 && (
          <>
            <CRow className="mb-3">
              <CCol>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4>
                      {socioData.codigo} - {socioData.nombres} {socioData.apellidos}
                      {socioData.certificado && (
                        <CBadge color="success" className="ms-2">Certificado</CBadge>
                      )}
                    </h4>
                    <p>Total de ingresos: {socioData.ingresos.length} | Total KG: {totalPesoNeto.toFixed(2)} kg</p>
                  </div>
                  <CButton color="success" onClick={handleDownloadExcel}>
                    Descargar Excel
                  </CButton>
                </div>
                {parcelasInfo.length > 0 && (
                  <CRow className="mt-3">
                    {parcelasInfo.map((parcela, index) => {
                      const volumenEnKilos = parseFloat(parcela.volumen || 0) * 1000;
                      const totalIngresado = parseFloat(parcela.total_kg || 0);
                      const diferencia = volumenEnKilos - totalIngresado;

                      return (
                        <CCol md={4} key={index}>
                          <CCard className="mb-3">
                            <CCardHeader>
                              <strong>Parcela: {parcela.codigo}</strong> (Periodo: {parcela.periodo})
                            </CCardHeader>
                            <CCardBody>
                              <p><strong>Hectáreas:</strong> {parcela.hectarias} ha</p>
                              <p><strong>Volumen Proyectado:</strong> {volumenEnKilos.toFixed(2)} kg</p>
                              <p><strong>Total Ingresado:</strong> {totalIngresado.toFixed(2)} kg</p>
                              <p className={diferencia < 0 ? 'text-danger' : 'text-success'}>
                                <strong>Diferencia:</strong> {diferencia.toFixed(2)} kg
                              </p>
                            </CCardBody>
                          </CCard>
                        </CCol>
                      );
                    })}
                  </CRow>
                )}
              </CCol>
            </CRow>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Número Ingreso</CTableHeaderCell>
                  <CTableHeaderCell>Código Parcela</CTableHeaderCell>
                  <CTableHeaderCell>Peso Neto</CTableHeaderCell>
                  <CTableHeaderCell>Precio Venta/kg</CTableHeaderCell>
                  <CTableHeaderCell>Producto</CTableHeaderCell>
                  <CTableHeaderCell>Tipo Fruta</CTableHeaderCell>
                  <CTableHeaderCell>Código Lote</CTableHeaderCell>
                  <CTableHeaderCell>Tipo Lote</CTableHeaderCell>
                  <CTableHeaderCell>Num Jabas</CTableHeaderCell>
                  <CTableHeaderCell>Monto Transporte</CTableHeaderCell>
                  <CTableHeaderCell>Ingreso Cooperativa</CTableHeaderCell>
                  <CTableHeaderCell>Pago Socio</CTableHeaderCell>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {socioData.ingresos.map((ingreso, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{ingreso.numero_ingreso}</CTableDataCell>
                    <CTableDataCell>{ingreso.parcela_codigo}</CTableDataCell>
                    <CTableDataCell>{ingreso.peso_neto} kg</CTableDataCell>
                    <CTableDataCell>S/ {ingreso.precio_venta_kg}</CTableDataCell>
                    <CTableDataCell>{ingreso.detalle_orden?.producto || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{ingreso.detalle_orden?.tipo_fruta || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{ingreso.detalle_orden?.orden_compra?.codigo_lote || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{ingreso.detalle_orden?.orden_compra?.tipo_lote || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{ingreso.num_jabas}</CTableDataCell>
                    <CTableDataCell>S/ {ingreso.monto_transporte}</CTableDataCell>
                    <CTableDataCell>S/ {ingreso.ingreso_cooperativa}</CTableDataCell>
                    <CTableDataCell>S/ {ingreso.pago_socio}</CTableDataCell>
                    <CTableDataCell>{new Date(ingreso.fecha).toLocaleDateString()}</CTableDataCell>
                  </CTableRow>
                ))}
                <CTableRow className="table-primary fw-bold">
                  <CTableDataCell colSpan="3" className="text-end"><strong>Total:</strong></CTableDataCell>
                  <CTableDataCell>{totalPesoNeto.toFixed(2)} kg</CTableDataCell>
                  <CTableDataCell colSpan="5"></CTableDataCell>
                  <CTableDataCell>{totalNumJabas}</CTableDataCell>
                  <CTableDataCell>S/ {totalMontoTransporte.toFixed(2)}</CTableDataCell>
                  <CTableDataCell>S/ {totalIngresoCooperativa.toFixed(2)}</CTableDataCell>
                  <CTableDataCell>S/ {totalPagoSocio.toFixed(2)}</CTableDataCell>
                  <CTableDataCell></CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </>
        )}
      </CCardBody>
    </CCard>
  );
};

export default ConsultaIngresosPorSocio;
