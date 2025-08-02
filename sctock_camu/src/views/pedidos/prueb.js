// Modifica la sección donde muestras la lista de pesajes:
{pesajes.length > 0 && (
  <CCard className="mt-3">
    <CCardHeader>
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <CIcon icon={cilList} className="me-2" />
          Pesajes Registrados ({pesajes.length})
        </h6>
        <div>
          <CButton
            color="info"
            variant="outline"
            size="sm"
            onClick={sincronizarPesos}
            disabled={submitting}
            className="me-2"
          >
            <CIcon icon={cilSync} className="me-1" />
            Sincronizar
          </CButton>
          <CButton
            color="danger"
            variant="outline"
            size="sm"
            onClick={limpiarPesos}
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
              <CTableHeaderCell>Fecha/Hora</CTableHeaderCell>
              <CTableHeaderCell>Peso Bruto</CTableHeaderCell>
              <CTableHeaderCell>Jabas</CTableHeaderCell>
              <CTableHeaderCell>Peso Jabas</CTableHeaderCell>
              <CTableHeaderCell>Peso Neto</CTableHeaderCell>
              <CTableHeaderCell>Observación</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {pesajes.map((pesaje, index) => (
              <CTableRow key={pesaje.id}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>
                  <small>
                    {new Date(pesaje.fecha_pesaje).toLocaleDateString()}<br/>
                    {new Date(pesaje.fecha_pesaje).toLocaleTimeString()}
                  </small>
                </CTableDataCell>
                <CTableDataCell>
                  <strong>{parseFloat(pesaje.peso_bruto || 0).toFixed(3)} kg</strong>
                </CTableDataCell>
                <CTableDataCell>
                  <CBadge color="info">
                    {pesaje.num_jabas || 0} jabas
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell>
                  {parseFloat(pesaje.peso_total_jabas || 0).toFixed(2)} kg
                  <br/>
                  <small className="text-muted">
                    ({pesaje.peso_jaba || pesoJaba} kg/jaba)
                  </small>
                </CTableDataCell>
                <CTableDataCell>
                  <strong className="text-success">
                    {parseFloat(pesaje.peso_neto || 0).toFixed(3)} kg
                  </strong>
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
                      onClick={() => editarPesaje(pesaje)}
                      disabled={submitting}
                      title="Editar pesaje"
                    >
                      <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton
                      color="danger"
                      variant="outline"
                      onClick={() => eliminarPesaje(pesaje.id)}
                      disabled={submitting}
                      title="Eliminar pesaje"
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
          <CTableHead>
            <CTableRow className="table-info">
              <CTableHeaderCell colSpan={2}>
                <strong>TOTALES:</strong>
              </CTableHeaderCell>
              <CTableHeaderCell>
                <strong>
                  {pesajes.reduce((sum, p) => sum + (parseFloat(p.peso_bruto) || 0), 0).toFixed(3)} kg
                </strong>
              </CTableHeaderCell>
              <CTableHeaderCell>
                <strong>
                  {pesajes.reduce((sum, p) => sum + (parseInt(p.num_jabas) || 0), 0)} jabas
                </strong>
              </CTableHeaderCell>
              <CTableHeaderCell>
                <strong>
                  {pesajes.reduce((sum, p) => sum + (parseFloat(p.peso_total_jabas) || 0), 0).toFixed(2)} kg
                </strong>
              </CTableHeaderCell>
              <CTableHeaderCell>
                <strong className="text-success">
                  {pesajes.reduce((sum, p) => sum + (parseFloat(p.peso_neto) || 0), 0).toFixed(3)} kg
                </strong>
              </CTableHeaderCell>
              <CTableHeaderCell colSpan={2}></CTableHeaderCell>
            </CTableRow>
          </CTableHead>
        </CTable>
      
      </div>
    </CCardBody>
  </CCard>
)}

{/* Agregar también las funciones necesarias para manejar los pesajes: */}

// Función para editar un pesaje
const editarPesaje = async (pesaje) => {
  const { value: formValues } = await Swal.fire({
    title: 'Editar Pesaje',
    html: `
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="edit-peso-bruto" class="form-label">Peso Bruto (kg):</label>
          <input type="number" id="edit-peso-bruto" class="form-control" step="0.001" value="${pesaje.peso_bruto}" min="0">
        </div>
        <div class="col-md-6 mb-3">
          <label for="edit-num-jabas" class="form-label">Número de Jabas:</label>
          <input type="number" id="edit-num-jabas" class="form-control" step="1" value="${pesaje.num_jabas || 0}" min="0">
        </div>
        <div class="col-md-12 mb-3">
          <label for="edit-observacion" class="form-label">Observación:</label>
          <textarea id="edit-observacion" class="form-control" rows="2">${pesaje.observacion || ''}</textarea>
        </div>
        <div class="col-md-12">
          <div class="alert alert-info">
            <strong>Peso por jaba:</strong> ${pesoJaba} kg<br>
            <strong>Peso total jabas:</strong> <span id="edit-peso-jabas">0.00</span> kg<br>
            <strong>Peso neto calculado:</strong> <span id="edit-peso-neto">0.00</span> kg
          </div>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Actualizar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#321fdb',
    cancelButtonColor: '#6c757d',
    width: '600px',
    didOpen: () => {
      const pesoBrutoInput = document.getElementById('edit-peso-bruto');
      const numJabasInput = document.getElementById('edit-num-jabas');
      const pesoJabasSpan = document.getElementById('edit-peso-jabas');
      const pesoNetoSpan = document.getElementById('edit-peso-neto');
      
      const calcularPesos = () => {
        const pesoBruto = parseFloat(pesoBrutoInput.value) || 0;
        const jabas = parseInt(numJabasInput.value) || 0;
        const pesoTotalJabas = jabas * pesoJaba;
        const pesoNeto = Math.max(0, pesoBruto - pesoTotalJabas);
        
        pesoJabasSpan.textContent = pesoTotalJabas.toFixed(2);
        pesoNetoSpan.textContent = pesoNeto.toFixed(3);
      };
      
      pesoBrutoInput.addEventListener('input', calcularPesos);
      numJabasInput.addEventListener('input', calcularPesos);
      calcularPesos(); // Calcular inicial
    },
    preConfirm: () => {
      const pesoBruto = parseFloat(document.getElementById('edit-peso-bruto').value);
      const numJabas = parseInt(document.getElementById('edit-num-jabas').value);
      const observacion = document.getElementById('edit-observacion').value;
      
      if (isNaN(pesoBruto) || pesoBruto <= 0) {
        Swal.showValidationMessage('El peso bruto debe ser mayor a 0');
        return false;
      }
      
      if (isNaN(numJabas) || numJabas < 0) {
        Swal.showValidationMessage('El número de jabas debe ser válido');
        return false;
      }
      
      return { pesoBruto, numJabas, observacion };
    }
  });

  if (!formValues) return;

  try {
    setSubmitting(true);

    const pesoTotalJabas = formValues.numJabas * pesoJaba;
    const pesoNeto = Math.max(0, formValues.pesoBruto - pesoTotalJabas);

    const updateData = {
      peso_bruto: formValues.pesoBruto,
      num_jabas: formValues.numJabas,
      peso_jaba: pesoJaba,
      peso_total_jabas: pesoTotalJabas,
      peso_neto: pesoNeto,
      observacion: formValues.observacion || null
    };

    const response = await balanzaService.actualizarPesaje(pesaje.id, updateData);

    if (response.success) {
      toast.success('Pesaje actualizado correctamente');
      await cargarPesajes();
      await sincronizarPesos();
    }

  } catch (error) {
    console.error('Error al actualizar pesaje:', error);
    toast.error('Error al actualizar el pesaje: ' + (error.response?.data?.error || error.message));
  } finally {
    setSubmitting(false);
  }
};

// Función para eliminar un pesaje
const eliminarPesaje = async (pesajeId) => {
  const result = await Swal.fire({
    title: '¿Eliminar pesaje?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    setSubmitting(true);

    const response = await balanzaService.eliminarPesaje(pesajeId);

    if (response.success) {
      toast.success('Pesaje eliminado correctamente');
      await cargarPesajes();
      await sincronizarPesos();
    }

  } catch (error) {
    console.error('Error al eliminar pesaje:', error);
    toast.error('Error al eliminar el pesaje: ' + (error.response?.data?.error || error.message));
  } finally {
    setSubmitting(false);
  }
};

// Función para sincronizar los pesos totales en el ingreso
const sincronizarPesos = async () => {
  if (!currentIngreso.id || pesajes.length === 0) return;

  try {
    const totalPesoBruto = pesajes.reduce((sum, p) => sum + (parseFloat(p.peso_bruto) || 0), 0);
    const totalJabas = pesajes.reduce((sum, p) => sum + (parseInt(p.num_jabas) || 0), 0);
    const totalPesoJabas = pesajes.reduce((sum, p) => sum + (parseFloat(p.peso_total_jabas) || 0), 0);
    const totalPesoNeto = pesajes.reduce((sum, p) => sum + (parseFloat(p.peso_neto) || 0), 0);

    // Actualizar el estado del ingreso actual
    setCurrentIngreso(prev => ({
      ...prev,
      peso_bruto: totalPesoBruto.toFixed(3),
      num_jabas: totalJabas,
      peso_neto: totalPesoNeto.toFixed(3)
    }));

    // Recalcular totales basados en el nuevo peso neto
    const event = {
      target: {
        name: 'peso_neto',
        value: totalPesoNeto.toFixed(3)
      }
    };
    handleInputChange(event);

    toast.success(`Pesos sincronizados: ${totalPesoNeto.toFixed(3)} kg neto total`);

  } catch (error) {
    console.error('Error al sincronizar pesos:', error);
    toast.error('Error al sincronizar los pesos');
  }
};

// Función para limpiar todos los pesajes
const limpiarPesos = async () => {
  if (pesajes.length === 0) {
    toast.info('No hay pesajes para limpiar');
    return;
  }

  const result = await Swal.fire({
    title: '¿Limpiar todos los pesajes?',
    text: `Se eliminarán ${pesajes.length} pesajes. Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, limpiar todo',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    setSubmitting(true);

    // Eliminar todos los pesajes uno por uno
    for (const pesaje of pesajes) {
      await balanzaService.eliminarPesaje(pesaje.id);
    }

    // Limpiar el estado local
    setPesajes([]);

    // Resetear los pesos en el ingreso
    setCurrentIngreso(prev => ({
      ...prev,
      peso_bruto: '0.000',
      num_jabas: 0,
      peso_neto: '0.000',
      total: '0.00'
    }));

    toast.success('Todos los pesajes han sido eliminados');

  } catch (error) {
    console.error('Error al limpiar pesajes:', error);
    toast.error('Error al limpiar los pesajes: ' + (error.response?.data?.error || error.message));
  } finally {
    setSubmitting(false);
  }
};

// Función para cargar los pesajes del ingreso actual
const cargarPesajes = async () => {
  if (!currentIngreso.id) return;

  try {
    const response = await balanzaService.obtenerPesajes(currentIngreso.id);
    
    if (response.success && Array.isArray(response.pesajes)) {
      setPesajes(response.pesajes);
    } else {
      setPesajes([]);
    }

  } catch (error) {
    console.error('Error al cargar pesajes:', error);
    setPesajes([]);
  }
};

// Agregar useEffect para cargar pesajes cuando cambie el ingreso actual
useEffect(() => {
  if (currentIngreso.id) {
    cargarPesajes();
  } else {
    setPesajes([]);
  }
}, [currentIngreso.id]);