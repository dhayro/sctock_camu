
import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CFormInput, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/react';
import { getSociosContribucionPorFecha } from '../../services/api/socioService';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const ConsultaSocios = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [contribuciones, setContribuciones] = useState([]);

  const handleConsultar = async () => {
    try {
      const data = await getSociosContribucionPorFecha(fechaInicio, fechaFin);
      setContribuciones(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener las contribuciones. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(contribuciones.map((contribucion, index) => ({
      '#': index + 1,
      Socio: `${contribucion.socio.nombres} ${contribucion.socio.apellidos}`,
      Código: contribucion.socio.codigo,
      'Número Ingreso': contribucion.numero_ingreso,
      'Peso Neto': `${contribucion.peso_neto} kg`,
      'Precio Venta/kg': `S/ ${contribucion.precio_venta_kg}`,
      Producto: contribucion.detalle_orden.producto.nombre,
      'Tipo Fruta': contribucion.detalle_orden.tipo_fruta.nombre,
      'Num Jabas': contribucion.num_jabas,
      'Monto Transporte': `S/ ${contribucion.monto_transporte}`,
      'Ingreso Cooperativa': `S/ ${contribucion.ingreso_cooperativa}`,
      'Pago Socio': `S/ ${contribucion.pago_socio}`,
      Fecha: new Date(contribucion.fecha).toLocaleDateString()
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contribuciones');
    XLSX.writeFile(workbook, 'Contribuciones_Socios.xlsx');
  };

  // Calculate totals
  const totalPesoNeto = contribuciones.reduce((acc, contribucion) => acc + parseFloat(contribucion.peso_neto || 0), 0);
  const totalMontoTransporte = contribuciones.reduce((acc, contribucion) => acc + parseFloat(contribucion.monto_transporte || 0), 0);
  const totalIngresoCooperativa = contribuciones.reduce((acc, contribucion) => acc + parseFloat(contribucion.ingreso_cooperativa || 0), 0);
  const totalPagoSocio = contribuciones.reduce((acc, contribucion) => acc + parseFloat(contribucion.pago_socio || 0), 0);
  const totalNumJabas = contribuciones.reduce((acc, contribucion) => acc + parseInt(contribucion.num_jabas || 0), 0);

  return (
    <CCard>
      <CCardHeader>
        <strong>Consulta de Contribuciones de Socios</strong>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3">
          <CCol md={5}>
            <CFormInput
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              placeholder="Fecha de inicio"
            />
          </CCol>
          <CCol md={5}>
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
        <CButton color="success" onClick={handleDownloadExcel} className="mb-3">
          Descargar Excel
        </CButton>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Socio</CTableHeaderCell>
              <CTableHeaderCell>Código</CTableHeaderCell>
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
            {contribuciones.map((contribucion, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{contribucion.socio.nombres} {contribucion.socio.apellidos}</CTableDataCell>
                <CTableDataCell>{contribucion.socio.codigo}</CTableDataCell>
                <CTableDataCell>{contribucion.numero_ingreso}</CTableDataCell>
                <CTableDataCell>{contribucion.peso_neto} kg</CTableDataCell>
                <CTableDataCell>S/ {contribucion.precio_venta_kg}</CTableDataCell>
                <CTableDataCell>{contribucion.detalle_orden.producto.nombre}</CTableDataCell>
                <CTableDataCell>{contribucion.detalle_orden.tipo_fruta.nombre}</CTableDataCell>
                <CTableDataCell>{contribucion.num_jabas}</CTableDataCell>
                <CTableDataCell>S/ {contribucion.monto_transporte}</CTableDataCell>
                <CTableDataCell>S/ {contribucion.ingreso_cooperativa}</CTableDataCell>
                <CTableDataCell>S/ {contribucion.pago_socio}</CTableDataCell>
                <CTableDataCell>{new Date(contribucion.fecha).toLocaleDateString()}</CTableDataCell>
              </CTableRow>
            ))}
            <CTableRow>
              <CTableDataCell colSpan="4" className="text-end"><strong>Total:</strong></CTableDataCell>
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
      </CCardBody>
    </CCard>
  );
};

export default ConsultaSocios;
