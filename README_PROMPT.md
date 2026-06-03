# Prompt de Diagnóstico y Corrección: Error "No autorizado. Token no proporcionado"

Copia y utiliza este prompt con un asistente de IA de codificación para resolver el problema persistente con el token de autorización en las rutas de compras y ventas.

---

## <PROMPT_START>
### Contexto del Problema
Al intentar realizar operaciones de **Compras** o **Ventas** (crear transacciones), el backend responde con un error `401 Unauthorized`:
```json
{
  "status": "fail",
  "message": "No autorizado. Token no proporcionado",
  "timestamp": "2026-06-03T19:53:22.977Z"
}
```
Sin embargo, otras operaciones como **Registrar Producto** funcionan correctamente y sí envían el token de autenticación. Necesitamos diagnosticar por qué las peticiones de compras y ventas no incluyen la cabecera `Authorization: Bearer <token>` o por qué el estado de la sesión se limpia/pierde antes de realizar estas peticiones.

---

### Diagnóstico de Arquitectura

1. **Intercepción de Peticiones en el Frontend**:
   - Archivo: `frontend/src/services/api.ts`
   - El interceptor de peticiones lee el token mediante `tokenStore.get()`. Si existe, intenta agregarlo tanto a `config.headers.Authorization` como a través de `config.headers.set('Authorization', ...)`.
   - Si `tokenStore.get()` retorna `null`, se emite una advertencia en la consola y la petición se envía sin cabecera, provocando el error `401`.

2. **Persistencia del Token**:
   - El token se guarda en `localStorage` con la clave `'tenebrosa.token'` (usado por `tokenStore.get()`).
   - El token también se guarda en la tienda de Zustand `useAuthStore` bajo la clave de persistencia `'tenebrosa.auth'`.
   - Si ocurre una respuesta `401` en cualquier endpoint, el interceptor de respuesta de Axios llama a `tokenStore.clear()`, limpiando el token e iniciando la redirección a `/login`.

3. **Causa Probable**:
   - **Rehidratación Tardía**: Las páginas de Ventas y Compras se cargan y llaman a la API antes de que el estado de Zustand (`useAuthStore`) se haya rehidratado desde `localStorage`, haciendo que el interceptor lea un token vacío.
   - **Fuga de Sesión**: La acción `switchUser` implementada en los almacenes de `compraStore` y `ventaStore` se dispara en cascada y podría estar forzando una limpieza de la sesión debido a una evaluación incorrecta del ID de usuario activo en el momento de transición de vistas.
   - **Intersección / Axios Mismatch**: Las llamadas en `compras.service.ts` y `ventas.service.ts` importan la instancia `api` de `./api`, pero si hay dependencias circulares (por ejemplo, `api.ts` -> `authStore.ts` -> `compraStore.ts` -> `api.ts`), la instancia de `api` puede no inicializarse correctamente con sus interceptores cuando se invoca.

---

### Instrucciones para Solucionar

1. **Validar las Cabeceras en Tránsito (Network Tab)**:
   - Inspecciona la petición de red a `POST /api/compras` y `POST /api/ventas`. Confirma si la cabecera `Authorization` está ausente o si lleva un valor vacío/indefinido.
   - Si la cabecera está ausente, verifica el flujo de rehidratación en `frontend/src/store/authStore.ts`. Asegúrate de que los componentes no inicien peticiones a la API hasta que Zustand marque la sesión como rehidratada (`onRehydrateStorage`).

2. **Corregir Dependencias Circulares**:
   - Revisa si al importar `useCompraStore` y `useVentaStore` dentro de `authStore.ts` se están importando indirectamente dependencias que terminen importando `api.ts` antes de tiempo.
   - Si es necesario, desvincula las llamadas de `switchUser` de la definición directa de `useAuthStore.ts` y manéjalas en un componente React global (por ejemplo, un listener de sesión en `App.tsx` usando `useAuthStore.subscribe()`) para evitar importaciones circulares en los archivos de Zustand.

3. **Garantizar la Persistencia Única del Token**:
   - Unifica la lectura del token. En lugar de tener dos mecanismos (`tenebrosa.token` en crudo y `tenebrosa.auth` en Zustand), haz que la instancia de Axios en `api.ts` dependa exclusivamente de una sola fuente rehidratada y síncrona.
   
4. **Verificar el Backend**:
   - Confirma que el middleware de autenticación `backend/src/middleware/auth.ts` no esté experimentando fallos de parseo de CORS en peticiones preflight `OPTIONS` que carecen de tokens.
### <PROMPT_END>


{
    "status": "fail",
    "message": "El registro de referencia no existe",
    "timestamp": "2026-06-03T20:05:27.914Z"
}