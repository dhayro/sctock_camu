const { Ingreso, DetallePesaje } = require('../models');

const actualizarTotalesIngreso = async (ingresoId, transaction = null) => {
  try {
    const ingreso = await Ingreso.findByPk(ingresoId, {
      include: [
        {
          model: DetallePesaje,
          as: 'pesajes',
          where: { estado: true },
          required: false
        }
      ],
      transaction
    });

    if (!ingreso) return;

    const pesajes = ingreso.pesajes || [];
    
    // Calcular totales de pesajes
    const totalPesoBruto = pesajes.reduce((sum, pesaje) => sum + parseFloat(pesaje.peso_bruto || 0), 0);
    const totalPesoJabas = pesajes.reduce((sum, pesaje) => sum + parseFloat(pesaje.peso_jaba || 0), 0);
    const totalDescuentoMerma = pesajes.reduce((sum, pesaje) => sum + parseFloat(pesaje.descuento_merma_pesaje || 0), 0);
    const numJabas = pesajes.length;
    
    // Calcular peso neto
    const pesoNeto = totalPesoBruto - totalPesoJabas - totalDescuentoMerma;
    
    // Actualizar el ingreso con los totales calculados
    await ingreso.update({
      peso_bruto: totalPesoBruto,
      peso_total_jabas: totalPesoJabas,
      num_jabas: numJabas,
      peso_neto: pesoNeto,
      dscto_merma: totalDescuentoMerma,
      dscto_jaba: totalPesoJabas
    }, { transaction });

    return ingreso;
  } catch (error) {
    console.error('Error al actualizar totales del ingreso:', error);
    throw error;
  }
};

module.exports = { actualizarTotalesIngreso }