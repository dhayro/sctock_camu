import React, { useState, useEffect } from 'react'
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
  CButton,
  CSpinner,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

const ListaSocios = () => {
  const [socios, setSocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Aquí harías la llamada a tu API para obtener los socios
    // Por ahora, usaremos datos de ejemplo
    setTimeout(() => {
      const sociosEjemplo = [
        { id: 1, codigo: 'SOC001', dni: '12345678', nombres: 'Juan', apellidos: 'Pérez', caserio: 'San Juan', certificado: true, telefono: '987654321' },
        { id: 2, codigo: 'SOC002', dni: '87654321', nombres: 'María', apellidos: 'López', caserio: 'San Pedro', certificado: false, telefono: '123456789' },
        { id: 3, codigo: 'SOC003', dni: '45678912', nombres: 'Carlos', apellidos: 'Gómez', caserio: 'San José', certificado: true, telefono: '456789123' },
      ]
      setSocios(sociosEjemplo)
      setLoading(false)
    }, 1000)
  }, [])

  const handleNuevoSocio = () => {
    navigate('/socios/nuevo')
  }

  const handleEditar = (id) => {
    navigate(`/socios/editar/${id}`)
  }

  const handleEliminar = (id) => {
    // Aquí implementarías la lógica para eliminar un socio
    if (window.confirm('¿Está seguro de eliminar este socio?')) {
      console.log(`Eliminando socio con ID: ${id}`)
      // Llamada a la API para eliminar
      // Luego actualizar la lista
      setSocios(socios.filter(socio => socio.id !== id))
    }
  }

  if (loading) {
    return (
      <CCard className="mb-4">
        <CCardBody className="text-center">
          <CSpinner color="primary" />
          <div className="mt-3">Cargando socios...</div>
        </CCardBody>
      </CCard>
    )
  }

  if (error) {
    return (
      <CCard className="mb-4">
        <CCardBody className="text-center text-danger">
          <div>Error al cargar los socios: {error}</div>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Lista de Socios</strong>
          <CButton 
            color="primary" 
            className="float-end"
            onClick={handleNuevoSocio}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Nuevo Socio
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">Código</CTableHeaderCell>
                <CTableHeaderCell scope="col">DNI</CTableHeaderCell>
                <CTableHeaderCell scope="col">Nombres</CTableHeaderCell>
                <CTableHeaderCell scope="col">Apellidos</CTableHeaderCell>
                <CTableHeaderCell scope="col">Caserío</CTableHeaderCell>
                <CTableHeaderCell scope="col">Certificado</CTableHeaderCell>
                <CTableHeaderCell scope="col">Teléfono</CTableHeaderCell>
                <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {socios.map((socio) => (
                <CTableRow key={socio.id}>
                  <CTableDataCell>{socio.codigo}</CTableDataCell>
                  <CTableDataCell>{socio.dni}</CTableDataCell>
                  <CTableDataCell>{socio.nombres}</CTableDataCell>
                  <CTableDataCell>{socio.apellidos}</CTableDataCell>
                  <CTableDataCell>{socio.caserio}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={socio.certificado ? 'success' : 'danger'}>
                      {socio.certificado ? 'Sí' : 'No'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{socio.telefono}</CTableDataCell>
                  <CTableDataCell>
                    <CButton 
                      color="info" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEditar(socio.id)}
                    >
                      <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton 
                      color="danger" 
                      size="sm"
                      onClick={() => handleEliminar(socio.id)}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}

export default ListaSocios