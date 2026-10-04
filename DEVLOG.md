# Diario de desarrollo

## 03/10/2026
- Idea: app para limpiar fotos del iPhone deslizando (izquierda guardar, derecha borrar), porque las que existen son de pago.
- Usando React Native + Expo porque estoy en Windows y Expo Go me permite probar en el iPhone sin Mac. Comodo escanenado un qr 
- Proyecto creado y subido a GitHub.
- fallos subiendolo a git por que desde terminal tenia iniciada sesion en otra cuenta de git fallo 403  Permission to beatzv/swipeClean.git denied to beatrizvgRO.
-Instalo la libreria para el acceso a las imagenes
-Meto el primer intento de codigo
-Saltan bastantes errores de deprecados asi que migro a la API nueva
-consigo que cargue 50 fotos de galeria y muestre en pantalla la mas reciente

## 04/10/2026
## 04/10/2026

### Hecho
- Logica de clasificacion con botones guardar/borrar primero sin swipe para separar la logica de la animacion.
- Te deja revisar tus ultimas 50 fotos y al acabar muestra pantalla con resumen y borrado, si confirmas borrar iOS muestra su popup de permiso y las fotos pasan a la carpeta eliminados recientemente de fotos.
- Implementado ya con el swipe despues de comprobar que iba con botones 

### Problemas resueltos
- `MediaLibrary.SortBy` no existia en el SDK 57, la libreria habia cambiado.
- `getAssetsAsync` estaba deprecado migrar api
- El `Image` de React Native no carga las URIs `ph://` de iOS, lo cambie por `expo-image`

### Pendiente
- Al terminar, vuelve a cargar las 50 ultimas fotos, incluidas las que ya decidiste guardar
- Boton para deshacer la ultima decision, por si deslizas sin querer
- Mas libertad para elegir que fotos limpiar 