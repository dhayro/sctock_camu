# sctock_camu

Sistema de control de ingreso y salida de productos de camucamu

---

## Requisitos

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Estructura del proyecto

```
sctock_camu/
│
├── sctock_camu/           # Frontend (React)
├── stock_camu_backend/    # Backend (Node.js)
├── docker-compose.yaml
└── README.md
```

---

## Pasos para levantar el sistema con Docker

1. **Clona el repositorio y entra a la carpeta raíz del proyecto:**

   ```sh
   git clone <url-del-repo>
   cd sctock_camu
   ```

2. **Asegúrate de que no existan las carpetas `node_modules` ni archivos `package-lock.json` en los proyectos frontend y backend.**

3. **Levanta los servicios con Docker Compose:**

   ```sh
   docker-compose up --build
   ```

   Esto construirá y levantará los contenedores de:
   - Frontend (React) en el puerto **3001**
   - Backend (Node.js) en el puerto **3000**
   - Base de datos MySQL en el puerto **3307** (internamente 3306)

4. **Accede a la aplicación:**

   - **Frontend:** [http://localhost:3001](http://localhost:3001)
   - **Backend (Swagger):** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
   - **MySQL:** puerto 3307 (usuario y contraseña según tu configuración)

---

## Notas

- Si cambias la configuración de puertos, asegúrate de actualizar los archivos de configuración correspondientes.
- Para detener los servicios y eliminar los contenedores y volúmenes:

  ```sh
  docker-compose down -v
  ```

- Si tienes problemas con dependencias, elimina `node_modules` y `package-lock.json` en frontend y backend antes de levantar los contenedores.

---

## Inicio automático de los servicios

### Docker

Para que tus contenedores Docker se inicien automáticamente al arrancar tu sistema, ejecuta estos comandos (una sola vez):

```sh
docker update --restart=always sctock_camu-backend-1
docker update --restart=always sctock_camu-frontend-1
docker update --restart=always sctock_camu-mysql-1
```

Esto configurará los contenedores para que se inicien automáticamente con Docker.

### XAMPP

Si usas MySQL de XAMPP, puedes crear una tarea programada en Windows para iniciar el **Panel de Control de XAMPP** automáticamente al encender tu computadora.

1. Abre el **Programador de tareas** de Windows.
2. Crea una nueva tarea que ejecute el archivo `xampp-control.exe` al iniciar sesión.
3. Asegúrate de que el servicio de MySQL esté configurado para iniciar automáticamente desde el panel de XAMPP.

### Docker Desktop

Asegúrate de que **Docker Desktop** esté configurado para iniciarse automáticamente al arrancar Windows.  
Puedes activar esta opción desde la configuración de Docker Desktop.

---

Con esto, tanto tus contenedores Docker como XAMPP/MySQL estarán disponibles automáticamente cada vez que inicies tu sistema.

---

## Validar política de reinicio automático en Docker

Para verificar que tus contenedores están configurados para reiniciarse automáticamente, ejecuta estos comandos:

```sh
docker inspect -f "{{ .HostConfig.RestartPolicy.Name }}" sctock_camu-backend-1
docker inspect -f "{{ .HostConfig.RestartPolicy.Name }}" sctock_camu-frontend-1
docker inspect -f "{{ .HostConfig.RestartPolicy.Name }}" sctock_camu-mysql-1
```

Cada comando debe devolver:  
```
always
```
Esto confirma que la política de reinicio automático está correctamente aplicada.

---

¿Dudas o problemas?  
Revisa los logs de los servicios con:

```sh
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

---

## Notas importantes sobre MySQL/XAMPP

Si usas MySQL de XAMPP y quieres que Docker acceda a tu base de datos, debes permitir conexiones externas.

1. **Edita el archivo `my.ini` o `my.cnf` de MySQL**  
   (usualmente en `C:\xampp\mysql\bin\my.ini`).

2. Busca la línea:
   ```
   bind-address=127.0.0.1
   ```
   y cámbiala por:
   ```
   bind-address=0.0.0.0
   ```
   o coméntala así:
   ```
   #bind-address=127.0.0.1
   ```

3. **Reinicia MySQL** desde el panel de XAMPP después de hacer este cambio.

Esto permitirá que tu base de datos acepte conexiones desde otros contenedores Docker o desde otras máquinas en tu red.

---
