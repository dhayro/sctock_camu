/**
 * Clase simple para manejar Server-Sent Events (SSE)
 */
class SSE {
  constructor() {
    this.clients = new Set();
    this.history = [];
    this.historySize = 100; // Número máximo de eventos a mantener en el historial
  }

  /**
   * Añade un cliente a la lista de suscriptores
   * @param {object} res - Objeto de respuesta Express
   */
  addClient(res) {
    // Configurar cabeceras para SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Enviar eventos históricos al nuevo cliente
    this.history.forEach(event => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    // Añadir cliente a la lista
    this.clients.add(res);

    // Manejar desconexión
    res.on('close', () => {
      this.clients.delete(res);
      console.log(`Cliente SSE desconectado. Total: ${this.clients.size}`);
    });

    console.log(`Nuevo cliente SSE conectado. Total: ${this.clients.size}`);
  }

  /**
   * Envía un evento a todos los clientes conectados
   * @param {object} data - Datos a enviar
   */
  send(data) {
    // Añadir timestamp si no existe
    const eventData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString()
    };

    // Añadir al historial
    this.history.push(eventData);
    
    // Limitar tamaño del historial
    if (this.history.length > this.historySize) {
      this.history.shift();
    }

    // Enviar a todos los clientes
    const eventString = `data: ${JSON.stringify(eventData)}\n\n`;
    this.clients.forEach(client => {
      try {
        client.write(eventString);
      } catch (error) {
        console.error('Error al enviar evento SSE:', error);
        this.clients.delete(client);
      }
    });
  }

  /**
   * Envía un evento con un tipo específico
   * @param {string} type - Tipo de evento
   * @param {object} data - Datos a enviar
   */
  sendEvent(type, data) {
    this.send({
      type,
      ...data
    });
  }

  /**
   * Obtiene el número de clientes conectados
   * @returns {number} Número de clientes
   */
  getClientCount() {
    return this.clients.size;
  }

  /**
   * Obtiene el historial de eventos
   * @returns {Array} Historial de eventos
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Limpia el historial de eventos
   */
  clearHistory() {
    this.history = [];
  }
}

module.exports = SSE;