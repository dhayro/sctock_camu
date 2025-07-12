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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormLabel,
  CFormFeedback,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import { rolesService } from '../../services/api'

const Roles = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = ''
  
  // Estado para el modal de creación/edición
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [currentRole, setCurrentRole] = useState({ nombre: '', descripcion: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  
  // Estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles()
  }, [])

  // Función para cargar los roles desde la API
  const fetchRoles = async () => {
    setLoading(true)
    try {
      const response = await rolesService.getAll()
      setRoles(response.data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar roles:', err)
      setError('Error al cargar los roles. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  // Función para abrir el modal de creación
  const handleOpenCreateModal = () => {
    setCurrentRole({ nombre: '', descripcion: '' })
    setIsEditing(false)
    setModalTitle('Crear Nuevo Rol')
    setFormErrors({})
    setShowModal(true)
  }

  // Función para abrir el modal de edición
  const handleOpenEditModal = async (id) => {
    try {
      setSubmitting(true)
      const response = await rolesService.getById(id)
      setCurrentRole(response.data)
      setIsEditing(true)
      setModalTitle('Editar Rol')
      setFormErrors({})
      setShowModal(true)
    } catch (err) {
      console.error('Error al cargar el rol:', err)
      setError('Error al cargar los datos del rol. Por favor, intente nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentRole({ ...currentRole, [name]: value })
    
    // Limpiar errores al editar
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null })
    }
  }

  // Validar el formulario
  const validateForm = () => {
    const errors = {}
    if (!currentRole.nombre || currentRole.nombre.trim() === '') {
      errors.nombre = 'El nombre del rol es requerido'
    }
    return errors
  }

  // Función para guardar un rol (crear o actualizar)
  const handleSaveRole = async () => {
    // Validar formulario
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      if (isEditing) {
        // Actualizar rol existente
        await rolesService.update(currentRole.id, currentRole)
        setSuccessMessage('Rol actualizado exitosamente')
      } else {
        // Crear nuevo rol
        await rolesService.create(currentRole)
        setSuccessMessage('Rol creado exitosamente')
      }
      
      // Cerrar modal y recargar roles
      setShowModal(false)
      fetchRoles()
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (err) {
      console.error('Error al guardar rol:', err)
      if (err.response && err.response.data && err.response.data.message) {
        setFormErrors({ api: err.response.data.message })
      } else {
        setFormErrors({ api: 'Error al guardar el rol. Por favor, intente nuevamente.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Función para abrir el modal de confirmación de eliminación
  const handleOpenDeleteModal = (role) => {
    setRoleToDelete(role)
    setShowDeleteModal(true)
  }

  // Función para eliminar un rol
  const handleDeleteRole = async () => {
    if (!roleToDelete) return
    
    setDeleting(true)
    try {
      await rolesService.delete(roleToDelete.id)
      setRoles(roles.filter(role => role.id !== roleToDelete.id))
      setSuccessMessage('Rol eliminado exitosamente')
      
      // Cerrar modal
      setShowDeleteModal(false)
      setRoleToDelete(null)
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (err) {
      console.error('Error al eliminar rol:', err)
      setError('Error al eliminar el rol. Por favor, intente nuevamente.')
    } finally {
      setDeleting(false)
    }
  }

  // Renderizar spinner durante la carga
  if (loading && roles.length === 0) {
    return (
      <CCard className="mb-4">
        <CCardBody className="text-center">
          <CSpinner color="primary" />
          <div className="mt-3">Cargando roles...</div>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <CRow>
            <CCol md={6}>
              <h4><strong>Gestión de Roles</strong></h4>
            </CCol>
            <CCol md={6} className="d-flex justify-content-end">
              <CButton 
                color="primary" 
                onClick={handleOpenCreateModal}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Nuevo Rol
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          {error && (
            <CAlert color="danger" dismissible onClose={() => setError(null)}>
              {error}
            </CAlert>
          )}
          
          {successMessage && (
            <CAlert color="success" dismissible onClose={() => setSuccessMessage('')}>
              {successMessage}
            </CAlert>
          )}
          
          {roles.length === 0 && !loading ? (
            <CAlert color="info">
              No hay roles registrados. Cree un nuevo rol usando el botón "Nuevo Rol".
            </CAlert>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Descripción</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {roles.map((role) => (
                  <CTableRow key={role.id}>
                    <CTableDataCell>{role.id}</CTableDataCell>
                    <CTableDataCell>{role.nombre}</CTableDataCell>
                    <CTableDataCell>{role.descripcion || '-'}</CTableDataCell>
                    <CTableDataCell>
                      <CButton 
                        color="info" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleOpenEditModal(role.id)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton 
                        color="danger" 
                        size="sm"
                        onClick={() => handleOpenDeleteModal(role)}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Modal de creación/edición */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>{modalTitle}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel htmlFor="nombre">Nombre</CFormLabel>
              <CFormInput 
                type="text" 
                id="nombre" 
                name="nombre" 
                value={currentRole.nombre} 
                onChange={handleInputChange} 
                invalid={!!formErrors.nombre}
              />
              {formErrors.nombre && (
                <CFormFeedback invalid>{formErrors.nombre}</CFormFeedback>
              )}
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="descripcion">Descripción</CFormLabel>
              <CFormTextarea 
                id="descripcion" 
                name="descripcion" 
                value={currentRole.descripcion} 
                onChange={handleInputChange} 
              />
            </div>
            {formErrors.api && (
              <CAlert color="danger">{formErrors.api}</CAlert>
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleSaveRole} disabled={submitting}>
            {submitting ? <CSpinner component="span" size="sm" aria-hidden="true" /> : null}
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal de confirmación de eliminación */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Está seguro de que desea eliminar el rol <strong>{roleToDelete?.nombre}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDeleteRole} disabled={deleting}>
            {deleting ? <CSpinner component="span" size="sm" aria-hidden="true" /> : null}
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Roles