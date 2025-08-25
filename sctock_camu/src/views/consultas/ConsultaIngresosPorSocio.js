import React, { useState, useEffect } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CFormInput, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/react';
import Select from 'react-select';
import { getSocioContribucionPorFecha } from '../../services/api/socioService';
import socioService from '../../services/api/socioService'
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const ConsultaIngresosPorSocio = () => {
  const [socios, setSocios] = useState([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [ingresos, setIngresos] = useState([]);
  const [cargandoSocios, setCargandoSocios] = useState(false);
  const [searchTermSocios, setSearchTermSocios] = useState('');

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    cargarSocios(e.target.value);
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
    const data = await getSocioContribucionPorFecha(socioSeleccionado, fechaInicio, fechaFin);
    setIngresos(data);
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron obtener los ingresos. Por favor, intente nuevamente.',
      confirmButtonColor: '#321fdb'
    });
  }
};

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(ingresos.map((ingreso, index) => ({
      '#': index + 1,
      'Número Ingreso': ingreso.numero_ingreso,
      'Peso Neto': `${ingreso.peso_neto} kg`,
      'Precio Venta/kg': `S/ ${ingreso.precio_venta_kg}`,
      Producto: ingreso.detalle_orden.producto.nombre,
      'Tipo Fruta': ingreso.detalle_orden.tipo_fruta.nombre,
      'Num Jabas': ingreso.num_jabas,
      'Monto Transporte': `S/ ${ingreso.monto_transporte}`,
      'Ingreso Cooperativa': `S/ ${ingreso.ingreso_cooperativa}`,
      'Pago Socio': `S/ ${ingreso.pago_socio}`,
      Fecha: new Date(ingreso.fecha).toLocaleDateString()
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ingresos');
    XLSX.writeFile(workbook, 'Ingresos_Socio.xlsx');
  };

  // Calculate totals
  const totalPesoNeto = ingresos.reduce((acc, ingreso) => acc + parseFloat(ingreso.peso_neto || 0), 0);
  const totalMontoTransporte = ingresos.reduce((acc, ingreso) => acc + parseFloat(ingreso.monto_transporte || 0), 0);
  const totalIngresoCooperativa = ingresos.reduce((acc, ingreso) => acc + parseFloat(ingreso.ingreso_cooperativa || 0), 0);
  const totalPagoSocio = ingresos.reduce((acc, ingreso) => acc + parseFloat(ingreso.pago_socio || 0), 0);
  const totalNumJabas = ingresos.reduce((acc, ingreso) => acc + parseInt(ingreso.num_jabas || 0), 0);

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
            <CButton color="primary" onClick={handleConsultar}>
              Consultar
            </CButton>
          </CCol>
        </CRow>
        {ingresos.length > 0 && (
          <>
            <CButton color="success" onClick={handleDownloadExcel} className="mb-3">
              Descargar Excel
            </CButton>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Número Ingreso</CTableHeaderCell>
                  <CTableHeaderCell>Peso Neto</CTableHeaderCell>
                  <CTableHeaderCell>Precio Venta/kg</CTableHeaderCell>
                  <CTableHeaderCell>Producto</CTableHeaderCell>
                  <CTableHeaderCell>Tipo Fruta</CTableHeaderCell>
                  <CTableHeaderCell>Num Jabas</CTableHeaderCell>
                  <CTableHeaderCell>Monto Transporte</CTableHeaderCell>
                  <CTableHeaderCell>Ingreso Cooperativa</CTableHeaderCell>
                  <CTableHeaderCell>Pago Socio</CTableHeaderCell>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {ingresos.map((ingreso, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{ingreso.numero_ingreso}</CTableDataCell>
                    <CTableDataCell>{ingreso.peso_neto} kg</CTableDataCell>
                    <CTableDataCell>S/ {ingreso.precio_venta_kg}</CTableDataCell>
                    <CTableDataCell>{ingreso.detalle_orden.producto.nombre}</CTableDataCell>
                    <CTableDataCell>{ingreso.detalle_orden.tipo_fruta.nombre}</CTableDataCell>
                    <CTableDataCell>{ingreso.num_jabas}</CTableDataCell>
                    <CTableDataCell>S/ {ingreso.monto_transporte}</CTableDataCell>
                    <CTableDataCell>S/ {ingreso.ingreso_cooperativa}</CTableDataCell>
                    <CTableDataCell>S/ {ingreso.pago_socio}</CTableDataCell>
                    <CTableDataCell>{new Date(ingreso.fecha).toLocaleDateString()}</CTableDataCell>
                  </CTableRow>
                ))}
                <CTableRow>
                  <CTableDataCell colSpan="2" className="text-end"><strong>Total:</strong></CTableDataCell>
                  <CTableDataCell>{totalPesoNeto.toFixed(2)} kg</CTableDataCell>
                  <CTableDataCell colSpan="3"></CTableDataCell>
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
