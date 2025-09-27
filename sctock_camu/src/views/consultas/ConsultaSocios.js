import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CFormInput, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge } from '@coreui/react';
import { getSociosContribucionPorFecha } from '../../services/api/socioService';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const ConsultaSocios = () => {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), 0, 1);
    return firstDayOfMonth.toISOString().split('T')[0];
  });
  
  const [fechaFin, setFechaFin] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [socios, setSocios] = useState([]);

  const handleConsultar = async () => {
    try {
      const data = await getSociosContribucionPorFecha(fechaInicio, fechaFin);
      setSocios(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener las contribuciones de socios. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const handleDownloadExcel = () => {
    // Crear una lista plana de todos los ingresos de todos los socios
    const datosExcel = socios.flatMap(socio => 
      socio.ingresos.map(ingreso => {
        // Usar valores reales del backend
        const pesoNeto = parseFloat(ingreso.peso_neto) || 0;
        const precioVentaKg = parseFloat(ingreso.precio_venta_kg) || 0;
        const numJabas = ingreso.num_jabas || 0;
        const montoTransporte = parseFloat(ingreso.monto_transporte) || 0;
        const ingresoCooperativa = parseFloat(ingreso.ingreso_cooperativa) || 0;
        const pagoSocio = parseFloat(ingreso.pago_socio) || 0;
        const subtotal = parseFloat(ingreso.subtotal) || 0;
        
        return {
          'Socio': `${socio.nombres} ${socio.apellidos}`,
          'Código': ingreso.parcela_codigo,
          'Número Ingreso': ingreso.numero_ingreso,
          'Peso Neto': `${pesoNeto.toFixed(2)} kg`,
          'Precio Venta/kg': `S/ ${precioVentaKg.toFixed(2)}`,
          'Subtotal': `S/ ${subtotal.toFixed(2)}`,
          'Producto': ingreso.detalle_orden?.producto,
          'Tipo Fruta': ingreso.detalle_orden?.tipo_fruta,
          'Num Jabas': numJabas,
          'Monto Transporte': `S/ ${montoTransporte.toFixed(2)}`,
          'Ingreso Cooperativa': `S/ ${ingresoCooperativa.toFixed(2)}`,
          'Pago Socio': `S/ ${pagoSocio.toFixed(2)}`,
          'Fecha': new Date(ingreso.fecha).toLocaleDateString()
        };
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contribuciones');
    XLSX.writeFile(workbook, 'Contribuciones_Socios.xlsx');
  };

  // Calcular totales
  const totalSocios = socios.length;
  const totalParcelas = socios.reduce((acc, socio) => acc + socio.parcelas.length, 0);
  const totalKg = socios.reduce((acc, socio) => acc + parseFloat(socio.total_kg || 0), 0);
  const totalIngresos = socios.reduce((acc, socio) => acc + socio.ingresos.length, 0);
  
  // Calcular totales financieros
  let totalMontoTransporte = 0;
  let totalIngresoCooperativa = 0;
  let totalPagoSocios = 0;
  let totalSubtotal = 0;
  
  socios.forEach(socio => {
    socio.ingresos.forEach(ingreso => {
      totalMontoTransporte += parseFloat(ingreso.monto_transporte) || 0;
      totalIngresoCooperativa += parseFloat(ingreso.ingreso_cooperativa) || 0;
      totalPagoSocios += parseFloat(ingreso.pago_socio) || 0;
      totalSubtotal += parseFloat(ingreso.subtotal) || 0;
    });
  });

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
        
        {socios.length > 0 && (
          <>
            <CRow className="mb-3">
              <CCol>
                <CButton color="success" onClick={handleDownloadExcel}>
                  Descargar Excel
                </CButton>
              </CCol>
            </CRow>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Socio</CTableHeaderCell>
                  <CTableHeaderCell>Código</CTableHeaderCell>
                  <CTableHeaderCell>Número Ingreso</CTableHeaderCell>
                  <CTableHeaderCell>Peso Neto</CTableHeaderCell>
                  <CTableHeaderCell>Precio Venta/kg</CTableHeaderCell>
                  <CTableHeaderCell>Subtotal</CTableHeaderCell>
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
                {socios.flatMap((socio, socioIndex) => 
                  socio.ingresos.map((ingreso, ingresoIndex) => {
                    // Usar los valores reales del backend en lugar de calcularlos
                    const pesoNeto = parseFloat(ingreso.peso_neto) || 0;
                    const precioVentaKg = parseFloat(ingreso.precio_venta_kg) || 0;
                    const numJabas = ingreso.num_jabas || 0;
                    const montoTransporte = parseFloat(ingreso.monto_transporte) || 0;
                    const ingresoCooperativa = parseFloat(ingreso.ingreso_cooperativa) || 0;
                    const pagoSocio = parseFloat(ingreso.pago_socio) || 0;
                    const subtotal = parseFloat(ingreso.subtotal) || 0;
                    
                    return (
                      <CTableRow key={`${socio.id}-${ingreso.id}`}>
                        <CTableDataCell>{socioIndex + ingresoIndex + 1}</CTableDataCell>
                        <CTableDataCell>{socio.nombres} {socio.apellidos}</CTableDataCell>
                        <CTableDataCell>{ingreso.parcela_codigo}</CTableDataCell>
                        <CTableDataCell>{ingreso.numero_ingreso}</CTableDataCell>
                        <CTableDataCell>{pesoNeto.toFixed(2)} kg</CTableDataCell>
                        <CTableDataCell>S/ {precioVentaKg.toFixed(2)}</CTableDataCell>
                        <CTableDataCell>S/ {subtotal.toFixed(2)}</CTableDataCell>
                        <CTableDataCell>{ingreso.detalle_orden?.producto}</CTableDataCell>
                        <CTableDataCell>{ingreso.detalle_orden?.tipo_fruta}</CTableDataCell>
                        <CTableDataCell>{numJabas}</CTableDataCell>
                        <CTableDataCell>S/ {montoTransporte.toFixed(2)}</CTableDataCell>
                        <CTableDataCell>S/ {ingresoCooperativa.toFixed(2)}</CTableDataCell>
                        <CTableDataCell>S/ {pagoSocio.toFixed(2)}</CTableDataCell>
                        <CTableDataCell>{new Date(ingreso.fecha).toLocaleDateString()}</CTableDataCell>
                      </CTableRow>
                    );
                  })
                )}
                {/* Fila de totales */}
                <CTableRow className="table-primary fw-bold">
                  <CTableDataCell colSpan={4}>TOTALES</CTableDataCell>
                  <CTableDataCell>{totalKg.toFixed(2)} kg</CTableDataCell>
                  <CTableDataCell></CTableDataCell>
                  <CTableDataCell>S/ {totalSubtotal.toFixed(2)}</CTableDataCell>
                  <CTableDataCell colSpan={3}></CTableDataCell>
                  <CTableDataCell>S/ {totalMontoTransporte.toFixed(2)}</CTableDataCell>
                  <CTableDataCell>S/ {totalIngresoCooperativa.toFixed(2)}</CTableDataCell>
                  <CTableDataCell>S/ {totalPagoSocios.toFixed(2)}</CTableDataCell>
                  <CTableDataCell></CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </>
        )}
        
        {socios.length === 0 && fechaInicio && fechaFin && (
          <div className="text-center p-4">
            <p>No se encontraron contribuciones en el rango de fechas seleccionado.</p>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

export default ConsultaSocios;