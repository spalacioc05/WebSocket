// server.js - Pictionary colaborativo
// Instrucciones para ejecutar:
// 1. npm init -y
// 2. npm install express socket.io moment-timezone
// 3. node server.js

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const moment = require('moment-timezone');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

// Lista de palabras para el juego
const palabras = [
    'Gato', 'Perro', 'Casa', 'Árbol', 'Avión', 'Bicicleta', 'Libro', 'Sol', 'Luna', 'Flor',
    'Carro', 'Mesa', 'Silla', 'Manzana', 'Pez', 'Elefante', 'Taza', 'Zapato', 'Pelota', 'Reloj'
];
let palabraActual = '';
let timer = 60;
let interval = null;

// Gestión de usuarios
let usuarios = [];
let nombresDisponibles = [];
for (let i = 1; i <= 20; i++) nombresDisponibles.push(`Usuario ${i}`);

function logEvento(tipo, detalle) {
    const hora = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss z');
    console.log(`[${hora}] [${tipo}] ${detalle}`);
}

function elegirPalabra() {
    palabraActual = palabras[Math.floor(Math.random() * palabras.length)];
    io.emit('nueva-palabra', palabraActual);
    io.emit('clear-board'); // Limpiar tablero en todos los clientes
    logEvento('Palabra', `Nueva palabra: ${palabraActual}`);
}

function actualizarUsuarios() {
    io.emit('usuarios', usuarios.map(u => u.nombre));
    logEvento('Estado', `Usuarios conectados: ${usuarios.length}`);
}

io.on('connection', (socket) => {
    // Obtener IP del cliente
    const ip = socket.handshake.address;
    // Asignar nombre disponible
    let nombre = nombresDisponibles.shift() || `Usuario ${Math.floor(Math.random()*1000)}`;
    usuarios.push({ id: socket.id, nombre });
    logEvento('Conexión', `${nombre} conectado desde IP: ${ip}`);
    actualizarUsuarios();
    socket.emit('nombre', nombre);
    socket.emit('nueva-palabra', palabraActual);
    socket.emit('clear-board');

    socket.on('draw', (data) => {
        socket.broadcast.emit('draw', data);
        logEvento('Dibujo', `${nombre} dibujó (${JSON.stringify(data)})`);
    });

    socket.on('color', (color) => {
        socket.broadcast.emit('color', { nombre, color });
        logEvento('Color', `${nombre} cambió color a ${color}`);
    });

    socket.on('thickness', (thickness) => {
        socket.broadcast.emit('thickness', { nombre, thickness });
        logEvento('Grosor', `${nombre} cambió grosor a ${thickness}`);
    });

    socket.on('chat', (msg) => {
        io.emit('chat', { nombre, msg });
        logEvento('Chat', `${nombre}: ${msg}`);
    });

    socket.on('disconnect', () => {
        usuarios = usuarios.filter(u => u.id !== socket.id);
        nombresDisponibles.push(nombre);
        io.emit('chat', { nombre: 'Sistema', msg: `${nombre} se ha desconectado (IP: ${ip}).` });
        logEvento('Desconexión', `${nombre} desconectado desde IP: ${ip}`);
        actualizarUsuarios();
    });

    socket.on('connect-request', () => {
        io.emit('chat', { nombre: 'Sistema', msg: `${nombre} se ha conectado (IP: ${ip}).` });
        logEvento('Conexión', `${nombre} solicitó conexión desde IP: ${ip}`);
    });

    socket.on('disconnect-request', () => {
        socket.disconnect();
    });
});

// Temporizador de palabras
function iniciarTemporizador() {
    elegirPalabra();
    timer = 60;
    interval = setInterval(() => {
        timer--;
        io.emit('timer', timer);
        if (timer <= 0) {
            elegirPalabra();
            timer = 60;
        }
    }, 1000);
}

// El juego solo inicia cuando al menos un usuario presiona conectar
iniciarTemporizador();

server.listen(3000, () => {
    logEvento('Servidor', 'Servidor corriendo en http://localhost:3000');
});
