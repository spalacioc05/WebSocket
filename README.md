# 🎨 WebSocket Pictionary

**Autores:**  
👨‍💻 Santiago Palacio Cárdenas  
👩‍💻 Sarai Restrepo Rodríguez

---

## 🤔 ¿Qué es WebSocket?
WebSocket es un protocolo de comunicación que permite la transmisión bidireccional y en tiempo real entre un cliente (navegador) y un servidor. A diferencia de HTTP, WebSocket mantiene una conexión abierta, permitiendo que los datos fluyan en ambas direcciones sin necesidad de realizar múltiples peticiones.

### 🕹️ ¿Para qué sirve?
- 🎮 Juegos en tiempo real (como este Pictionary colaborativo)
- 💬 Chats y mensajería instantánea
- 🔔 Notificaciones en vivo
- 🤝 Aplicaciones colaborativas (tableros, documentos, etc.)

### ⚙️ ¿Cómo funciona?
1. El cliente solicita abrir una conexión WebSocket al servidor.
2. El servidor acepta y se establece un canal de comunicación persistente.
3. Ambos pueden enviar y recibir mensajes en cualquier momento, sin esperar respuesta.

---

## 🛠️ Montaje realizado
- Se desarrolló un juego tipo Pictionary colaborativo usando Node.js, Express y Socket.IO (WebSocket).
- El servidor gestiona usuarios, palabras, chat y dibujo en tiempo real.
- El cliente permite dibujar, borrar, elegir colores, grosor y figuras (lápiz, círculo, cuadrado, triángulo), chatear y ver la palabra actual.
- El tablero se sincroniza entre todos los usuarios conectados.
- El diseño es moderno y responsivo.

---

## 📸 Imágenes de funcionamiento

> _Aquí puedes insertar capturas de pantalla del juego en acción, chat, tablero y herramientas._

- ![Pantalla principal](ruta/a/imagen1.png)
- ![Herramientas de dibujo](ruta/a/imagen2.png)
- ![Chat en tiempo real](ruta/a/imagen3.png)

---

## 🚀 Guía paso a paso para reproducir la experiencia

1. **Instalación de dependencias**
   ```bash
   npm init -y
   npm install express socket.io moment-timezone
   ```
2. **Estructura de archivos**
   - `server.js` (servidor Node.js)
   - `public/index.html` (interfaz principal)
   - `public/script.js` (lógica cliente)
   - `public/styles.css` (estilos)
   - `README.md` (guía)

3. **Ejecutar el servidor**
   ```bash
   node server.js
   ```

4. **Abrir el juego**
   - Ingresa a [http://localhost:3000](http://localhost:3000) desde tu navegador.
   - Haz clic en "Conectar" para unirte.
   - Elige color, grosor y herramienta (lápiz, figuras, borrador).
   - Dibuja en el tablero y conversa en el chat.
   - El tablero y el chat se sincronizan en tiempo real con todos los usuarios.

---

## 📝 Conclusiones
- WebSocket es ideal para aplicaciones colaborativas y en tiempo real.
- Socket.IO simplifica la implementación de WebSocket en Node.js.
- El juego demuestra cómo múltiples usuarios pueden interactuar simultáneamente y ver los cambios al instante.
- La experiencia es fluida, intuitiva y moderna.

---

## 📚 Bibliografía
- [Documentación oficial de WebSocket](https://developer.mozilla.org/es/docs/Web/API/WebSockets_API)
- [Socket.IO](https://socket.io/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MDN Web Docs - Canvas](https://developer.mozilla.org/es/docs/Web/API/Canvas_API)

---