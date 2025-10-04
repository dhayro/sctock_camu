const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const SSE = require('../utils/SSE');
const EventEmitter = require('events');

class BalanzaService extends EventEmitter {
    constructor() {
        super();
        this.port = null;
        this.parser = null;
        this.connected = false;
        this.config = {
            port: null,
            baudRate: 9600,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false
        };
        
        // Variables para el análisis de datos
        this.dataBuffer = '';
        this.lastDataTime = null;
        this.DATA_TIMEOUT = 100; // milisegundos para considerar que un mensaje está completo
        
        // Inicializar el SSE para el monitor de datos
        this.monitorDataSSE = new SSE();
        
        this.lastWeightEmitTime = 0;
        this.lastWeightValue = null;
    }
    
    async getPorts() {
        try {
            const ports = await SerialPort.list();
            return ports;
        } catch (error) {
            console.error('Error al obtener puertos:', error);
            throw error;
        }
    }
    
    async connect(portConfig) {
        try {
            if (this.connected) {
                await this.disconnect();
            }
            
            // Actualizar configuración
            this.config.port = portConfig.port;
            this.config.baudRate = portConfig.baudRate || 9600;
            
            console.log(`Conectando a puerto ${this.config.port} con baudRate ${this.config.baudRate}...`);
            
            // Crear instancia de SerialPort
            this.port = new SerialPort({
                path: this.config.port,
                baudRate: this.config.baudRate,
                dataBits: this.config.dataBits,
                parity: this.config.parity,
                stopBits: this.config.stopBits,
                flowControl: this.config.flowControl
            });
            
            // Crear parser
            this.parser = this.port.pipe(new ReadlineParser({ delimiter: '=' })); //\r\n
            
            // Configurar eventos
            this.port.on('open', () => {
                console.log(`Puerto ${this.config.port} abierto correctamente`);
                this.connected = true;
                this.emit('connected', { port: this.config.port });
            });
            
            this.port.on('error', (error) => {
                console.error('Error en el puerto serial:', error);
                this.emit('error', { error: error.message });
            });
            
            this.port.on('close', () => {
                console.log(`Puerto ${this.config.port} cerrado`);
                this.connected = false;
                this.emit('disconnected');
            });
            
            // Escuchar datos directamente del puerto (sin parser) para análisis detallado
            this.port.on('data', (data) => {
                const now = Date.now();
                const dataStr = data.toString();
                let timeSinceLastData = null;
                
                // Registrar el tiempo entre fragmentos de datos
                if (this.lastDataTime) {
                    timeSinceLastData = now - this.lastDataTime;
                    
                    // Si ha pasado mucho tiempo desde el último dato, consideramos que es un nuevo mensaje
                    if (timeSinceLastData > this.DATA_TIMEOUT && this.dataBuffer.length > 0) {
                        // console.log('Mensaje completo detectado por timeout:', this.dataBuffer);
                        this.procesarMensajeCompleto(this.dataBuffer, timeSinceLastData);
                        this.dataBuffer = '';
                    }
                }
                
                // Actualizar el tiempo del último dato recibido
                this.lastDataTime = now;
                
                // Agregar los nuevos datos al buffer
                this.dataBuffer += dataStr;
                
                // Verificar si el buffer contiene un mensaje completo (por ejemplo, termina con un delimitador)
                if (this.dataBuffer.includes('=')) { //\n
                    const mensajes = this.dataBuffer.split('=');   //\n
                    // Procesar todos los mensajes completos
                    for (let i = 0; i < mensajes.length - 1; i++) {
                        const mensajeCompleto = mensajes[i].trim();
                        if (mensajeCompleto) {
                            console.log('Mensaje completo detectado por delimitador:', mensajeCompleto);
                            this.procesarMensajeCompleto(mensajeCompleto, timeSinceLastData);
                        }
                    }
                    // Guardar el fragmento incompleto (si existe)
                    this.dataBuffer = mensajes[mensajes.length - 1];
                }
                
                // Mostrar información sobre el fragmento actual
                // console.log('Fragmento recibido:');
                // console.log('  - Como buffer:', data);
                // console.log('  - Como hexadecimal:', data.toString('hex'));
                // console.log('  - Como texto:', dataStr);
                // console.log('  - Buffer acumulado:', this.dataBuffer);
                
                // Mostrar códigos ASCII
                const asciiCodes = Array.from(data).map(byte => byte);
                // console.log('  - Como ASCII (códigos):', asciiCodes);
                
                // Emitir evento con los datos crudos para el monitor
                this.emit('rawData', {
                    timestamp: new Date().toISOString(),
                    rawData: dataStr,
                    hexData: data.toString('hex'),
                    dataType: typeof dataStr,
                    dataLength: dataStr.length,
                    asciiCodes: asciiCodes,
                    timeSinceLastData: timeSinceLastData,
                    bufferAccumulated: this.dataBuffer
                });
            });
            
            // Leer datos del puerto serie con el parser para interpretación de peso
            this.parser.on('data', (data) => {
                console.log('Datos procesados por el parser:');
                console.log('  - Como texto:', data);

                const weightData = this.parseWeight(data);

                // Throttle: solo emitir si pasaron 200ms o el peso cambió
                const now = Date.now();
                const weightChanged = this.lastWeightValue !== weightData;
                if (weightChanged || now - this.lastWeightEmitTime > 200) {
                    this.emit('weightData', weightData);
                    this.lastWeightEmitTime = now;
                    this.lastWeightValue = weightData;
                }
            });
            
            // Esperar a que el puerto se abra
            return new Promise((resolve, reject) => {
                this.port.once('open', () => {
                    resolve({ success: true, message: `Conectado al puerto ${this.config.port}` });
                });
                
                this.port.once('error', (error) => {
                    reject(error);
                });
            });
        } catch (error) {
            console.error('Error al conectar al puerto serial:', error);
            throw error;
        }
    }
    
    async disconnect() {
        return new Promise((resolve, reject) => {
            if (!this.connected || !this.port) {
                this.connected = false;
                resolve({ success: true, message: 'No hay conexión activa' });
                return;
            }
            
            this.port.close((error) => {
                if (error) {
                    console.error('Error al cerrar el puerto:', error);
                    reject(error);
                } else {
                    console.log('Puerto cerrado correctamente');
                    this.connected = false;
                    this.port = null;
                    this.parser = null;
                    resolve({ success: true, message: 'Desconectado correctamente' });
                }
            });
        });
    }
    
    getStatus() {
        return {
            connected: this.connected,
            port: this.config.port,
            baudRate: this.config.baudRate
        };
    }
    
    // Método para procesar un mensaje completo
    procesarMensajeCompleto(mensaje, timeSinceLastData) {
        console.log('\n=== MENSAJE COMPLETO PROCESADO ===');
        console.log('  - Texto:', mensaje);
        
        let numberValue = null;
        let values = null;
        let numericValues = null;
        
        // Intenta interpretar como números si es posible
        numberValue = parseFloat(mensaje);
        if (!isNaN(numberValue)) {
            // Obtener el formato original del número (con todos sus ceros)
            const originalFormat = mensaje.trim();
            
            // Invertir el número preservando el formato exacto
            const invertedNumber = this.invertNumber(originalFormat);
            
            console.log('  - Como número original:', originalFormat);
            console.log('  - Como número invertido:', invertedNumber);
            
            numberValue = invertedNumber;
        } else {
            numberValue = null;
        }
        
        // Si son valores separados por comas, intenta dividirlos
        if (mensaje.includes(',')) {
            values = mensaje.split(',').map(val => val.trim());
            console.log('  - Como valores separados por comas:', values);
            
            // Intenta convertir a números si es posible
            numericValues = values.map(val => {
                const num = parseFloat(val);
                return isNaN(num) ? val : num;
            });
            console.log('  - Como valores numéricos (si es posible):', numericValues);
        }
        
        console.log('====================================\n');
        
        // Emitir evento con el mensaje completo procesado
        this.emit('messageProcessed', {
            timestamp: new Date().toISOString(),
            rawData: mensaje,
            hexData: Buffer.from(mensaje).toString('hex'),
            dataType: typeof mensaje,
            dataLength: mensaje.length,
            parsedNumber: numberValue,
            values: values,
            numericValues: numericValues,
            timeSinceLastData: timeSinceLastData,
            weight: this.extractWeight(mensaje, numberValue, numericValues),
            stable: this.isStableWeight(mensaje)
        });
    }
    
    // Método para extraer el peso de los datos
    extractWeight(mensaje, numberValue, numericValues) {
        // Primero intentamos usar el número directo si existe
        if (numberValue !== null) {
            return numberValue; // Ya está invertido en procesarMensajeCompleto
        }
        
        // Si hay valores numéricos, intentamos encontrar uno que pueda ser el peso
        if (numericValues) {
            for (const value of numericValues) {
                if (typeof value === 'number') {
                    return this.invertNumber(value); // Invertir el valor numérico
                }
            }
        }
        
        // Si no encontramos un peso válido, devolvemos null
        return null;
    }
    
    // Método para determinar si el peso es estable
    isStableWeight(mensaje) {
        // Implementamos un sistema de detección de estabilidad basado en:
        // 1. Historial de lecturas recientes
        // 2. Tiempo que el valor ha permanecido constante
        // 3. Indicadores específicos en el mensaje (si existen)
        
        // Si no tenemos estas propiedades, las inicializamos
        if (!this.weightHistory) {
            this.weightHistory = [];
            this.stableCount = 0;
            this.lastStableWeight = null;
            this.stabilityThreshold = 3; // Número de lecturas consecutivas similares para considerar estable
            this.maxHistoryLength = 5;   // Tamaño máximo del historial
            this.toleranceRange = 0.02;  // Tolerancia para considerar dos pesos como iguales (±0.02 kg)
        }
        
        // Extraer el peso del mensaje
        const currentWeight = this.extractWeight(mensaje, 
            parseFloat(mensaje) !== NaN ? this.invertNumber(parseFloat(mensaje)) : null, 
            null);
        
        // Si no hay peso válido, no podemos determinar estabilidad
        if (currentWeight === null) {
            return false;
        }
        
        // Buscar indicadores específicos de estabilidad en el mensaje
        // Algunos modelos de balanzas envían indicadores como "ST" (stable)
        const hasStableIndicator = /\bST\b/i.test(mensaje);
        
        // Si el mensaje contiene un indicador explícito de estabilidad, confiamos en él
        if (hasStableIndicator) {
            console.log('Indicador de estabilidad detectado en el mensaje');
            this.lastStableWeight = currentWeight;
            return true;
        }
        
        // Añadir el peso actual al historial
        this.weightHistory.push(currentWeight);
        
        // Mantener el historial con el tamaño máximo definido
        if (this.weightHistory.length > this.maxHistoryLength) {
            this.weightHistory.shift(); // Eliminar el elemento más antiguo
        }
        
        // Verificar si el peso actual está dentro del rango de tolerancia del último peso estable
        const isWithinTolerance = this.lastStableWeight !== null && 
            Math.abs(currentWeight - this.lastStableWeight) <= this.toleranceRange;
        
        // Si el peso está dentro de la tolerancia, incrementar el contador de estabilidad
        if (isWithinTolerance) {
            this.stableCount++;
        } else {
            // Reiniciar el contador si el peso cambió significativamente
            this.stableCount = 1;
            this.lastStableWeight = currentWeight;
        }
        
        // Verificar si tenemos suficientes lecturas consecutivas similares
        const isStable = this.stableCount >= this.stabilityThreshold;
        
        // Si es estable, actualizar el último peso estable conocido
        if (isStable) {
            console.log(`Peso estable detectado: ${currentWeight} kg después de ${this.stableCount} lecturas similares`);
        }
        
        return isStable;
    }
    
    // Método para analizar el peso desde los datos crudos
    parseWeight(rawData) {
        try {
            console.log('Intentando parsear:', rawData);
            
            // Si es una cadena vacía o no es una cadena
            if (!rawData || typeof rawData !== 'string') {
                console.warn('Datos inválidos para parsear:', rawData);
                return 0;
            }
            
            // Limpiar la cadena
            const cleanData = rawData.trim();
            
            // Intentar diferentes patrones comunes de balanzas
            let weight = 0;
            
            // Patrón 1: Número simple (ej: "12.345")
            if (/^-?\d+(\.\d+)?$/.test(cleanData)) {
                weight = parseFloat(cleanData);
                return this.invertNumber(weight);
            }
            
            // Patrón 2: Formato con ST,GS (ej: "ST,GS,+   12.345kg")
            const stgsMatch = cleanData.match(/ST,GS,\+?\s*(-?\d+(\.\d+)?)\s*kg/i);
            if (stgsMatch) {
                weight = parseFloat(stgsMatch[1]);
                return this.invertNumber(weight);
            }
            
            // Patrón 3: Formato con kg al final (ej: "12.345kg" o "12.345 kg")
            const kgMatch = cleanData.match(/(-?\d+(\.\d+)?)\s*kg/i);
            if (kgMatch) {
                weight = parseFloat(kgMatch[1]);
                return this.invertNumber(weight);
            }
            
            // Patrón 4: Formato con g al final (ej: "12345g" o "12345 g")
            const gMatch = cleanData.match(/(-?\d+(\.\d+)?)\s*g/i);
            if (gMatch) {
                weight = parseFloat(gMatch[1]) / 1000; // Convertir a kg
                return this.invertNumber(weight);
            }
            
            // Patrón 5: Buscar cualquier número en la cadena
            const numericMatch = cleanData.match(/-?\d+(\.\d+)?/);
            if (numericMatch) {
                weight = parseFloat(numericMatch[0]);
                return this.invertNumber(weight);
            }
            
            console.warn('No se pudo extraer un peso de los datos:', cleanData);
            return 0;
        } catch (error) {
            console.error('Error al analizar el peso:', error);
            return 0;
        }
    }

    // Método para invertir un número (ej: 51.001 -> 100.15, 10.00 -> 00.01)
    invertNumber(numStr) {
        try {
            // Si recibimos un número, convertirlo a string
            if (typeof numStr === 'number') {
                numStr = numStr.toString();
            }
            
            // Limpiar el string de espacios
            numStr = numStr.trim();
            
            // Verificar si tiene punto decimal
            if (numStr.includes('.')) {
                // Separar la parte entera y decimal
                const [intPart, decPart] = numStr.split('.');
                
                // Invertir cada parte por separado manteniendo los ceros
                const invertedIntPart = intPart.split('').reverse().join('');
                const invertedDecPart = decPart.split('').reverse().join('');
                
                // Combinar las partes invertidas
                return parseFloat(`${invertedDecPart}.${invertedIntPart}`);
            } else {
                // Si no tiene punto decimal, simplemente invertir todos los dígitos
                const invertedStr = numStr.split('').reverse().join('');
                return parseFloat(invertedStr);
            }
        } catch (error) {
            console.error('Error al invertir el número:', error);
            // Si es un string, intentar convertirlo a número antes de devolverlo
            return typeof numStr === 'string' ? parseFloat(numStr) || 0 : numStr;
        }
    }
}

module.exports = BalanzaService;