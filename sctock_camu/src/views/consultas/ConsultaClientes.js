
import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CFormInput, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/react';
import { obtenerClientesConOrdenesYDetalles } from '../../services/api/clienteService';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const ConsultaClientes = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [clientes, setClientes] = useState([]);

  const handleConsultar = async () => {
    try {
      const data = await obtenerClientesConOrdenesYDetalles({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
      setClientes(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener la información de los clientes. Por favor, intente nuevamente.',
        confirmButtonColor: '#321fdb'
      });
    }
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(clientes.flatMap((cliente, index) => 
      cliente.ordenes.flatMap((orden, orderIndex) => 
        orden.detalles.map((detalle, detailIndex) => ({
          '#': `${index + 1}.${orderIndex + 1}.${detailIndex + 1}`,
          Cliente: cliente.razon_social,
          'Número de Orden': orden.numero_orden,
          'Código de Lote': orden.codigo_lote,
          'Fecha de Emisión': orden.fecha_emision,
          'Estado de Orden': orden.estado,
          'Tipo de Lote': orden.tipo_lote,
          'Producto': detalle.producto.nombre,
          'Tipo de Fruta': detalle.tipo_fruta.nombre,
          'Cantidad': detalle.cantidad,
          'Cantidad Ingresada': detalle.cantidad_ingresada,
          'Estado de Detalle': detalle.estado,
        }))
      )
    ));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
    XLSX.writeFile(workbook, 'Clientes_Ordenes.xlsx');
  };

  return (
    <CCard>
      <CCardHeader>
        <strong>Consulta de Órdenes por Cliente</strong>
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
              <CTableHeaderCell>Cliente</CTableHeaderCell>
              <CTableHeaderCell>Número de Orden</CTableHeaderCell>
              <CTableHeaderCell>Código de Lote</CTableHeaderCell>
              <CTableHeaderCell>Fecha de Emisión</CTableHeaderCell>
              <CTableHeaderCell>Estado de Orden</CTableHeaderCell>
              <CTableHeaderCell>Tipo de Lote</CTableHeaderCell>
              <CTableHeaderCell>Producto</CTableHeaderCell>
              <CTableHeaderCell>Tipo de Fruta</CTableHeaderCell>
              <CTableHeaderCell>Cantidad</CTableHeaderCell>
              <CTableHeaderCell>Cantidad Ingresada</CTableHeaderCell>
              <CTableHeaderCell>Estado de Detalle</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {clientes.map((cliente, index) => (
              cliente.ordenes.map((orden, orderIndex) => (
                orden.detalles.map((detalle, detailIndex) => (
                  <CTableRow key={`${index}-${orderIndex}-${detailIndex}`}>
                    <CTableDataCell>{`${index + 1}.${orderIndex + 1}.${detailIndex + 1}`}</CTableDataCell>
                    <CTableDataCell>{cliente.razon_social}</CTableDataCell>
                    <CTableDataCell>{orden.numero_orden}</CTableDataCell>
                    <CTableDataCell>{orden.codigo_lote}</CTableDataCell>
                    <CTableDataCell>{orden.fecha_emision}</CTableDataCell>
                    <CTableDataCell>{orden.estado}</CTableDataCell>
                    <CTableDataCell>{orden.tipo_lote}</CTableDataCell>
                    <CTableDataCell>{detalle.producto.nombre}</CTableDataCell>
                    <CTableDataCell>{detalle.tipo_fruta.nombre}</CTableDataCell>
                    <CTableDataCell>{detalle.cantidad}</CTableDataCell>
                    <CTableDataCell>{detalle.cantidad_ingresada}</CTableDataCell>
                    <CTableDataCell>{orden.estado}</CTableDataCell>
                  </CTableRow>
                ))
              ))
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

export default ConsultaClientes;
