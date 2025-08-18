import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CProgress,
  CBadge,
} from '@coreui/react'
import Swal from 'sweetalert2'
import ordenCompraService from '../../services/api/ordenCompraService'

const Dashboard = () => {
  const [ordenesPendientes, setOrdenesPendientes] = useState([])

  useEffect(() => {
    const obtenerOrdenesPendientes = async () => {
      try {
        const response = await ordenCompraService.getPendientes()
        setOrdenesPendientes(response.data.ordenesPendientes)
      } catch (error) {
        console.error('Error al obtener órdenes pendientes:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al obtener órdenes pendientes. Por favor, intente nuevamente más tarde.',
          confirmButtonColor: '#321fdb',
        })
      }
    }

    obtenerOrdenesPendientes()
  }, [])

  const obtenerColorProgreso = (porcentaje) => {
    if (porcentaje >= 75) return 'success'
    if (porcentaje >= 50) return 'info'
    if (porcentaje >= 25) return 'warning'
    return 'danger'
  }

  const obtenerColorCabecera = (index) => {
    const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark']
    return colors[index % colors.length]
  }

  return (
    <CRow>
      {ordenesPendientes.map((orden, index) => {
        const colorCabecera = obtenerColorCabecera(index)

        return (
          <CCol xs={12} sm={6} md={4} lg={3} key={index} className="mb-4">
            <CCard className="h-100">
              <CCardHeader className={`bg-${colorCabecera} text-white`}>
                <h5 className="card-title mb-0">
                  {orden.codigo_lote} (Orden #{orden.numero_orden})
                </h5>
              </CCardHeader>
              <CCardBody>
                <div className="mb-2">
                  <strong>Registros:</strong> {orden.detalles.length}
                </div>
                <div className="mb-2">
                  <strong>Cliente:</strong> {orden.cliente.razon_social}
                </div>
                {orden.detalles.map((detalle, detalleIndex) => {
                  const porcentajeProgreso = detalle.cantidad > 0 ? (detalle.cantidad_ingresada / detalle.cantidad) * 100 : 0
                  const colorProgreso = obtenerColorProgreso(porcentajeProgreso)

                  return (
                    <div key={detalleIndex} className="mb-2">
                      <strong>Detalle {detalleIndex + 1}:</strong>
                      <div>
                        <CBadge color="secondary" className="ms-3">
                          Tipo de Fruta: {detalle.tipo_fruta.nombre}
                        </CBadge>
                      </div>
                      <div>
                        <span className="ms-3">Cantidad: {detalle.cantidad}</span>
                        <span className="ms-3">Ingresada: {detalle.cantidad_ingresada}</span>
                      </div>
                      <CProgress
                        thin
                        color={colorProgreso}
                        value={porcentajeProgreso}
                        className="mt-2"
                      />
                      <span className={`ms-2 text-${colorProgreso}`}>
                        {porcentajeProgreso.toFixed(2)}%
                      </span>
                    </div>
                  )
                })}
              </CCardBody>
            </CCard>
          </CCol>
        )
      })}
    </CRow>
  )
}

export default Dashboard