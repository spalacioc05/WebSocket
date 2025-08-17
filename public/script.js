// script.js - Cliente Pictionary

let socket = null;
let nombre = '';
let color = '#222';
let drawing = false;
let prev = null;
let thickness = 2;
let erasing = false;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('color-picker');
const chatDiv = document.getElementById('chat');
const chatInput = document.getElementById('msg');
const sendBtn = document.getElementById('send-btn');
const usersList = document.getElementById('users-list');

const wordSpan = document.getElementById('current-word');
const timerDiv = document.getElementById('timer');
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const userNameSpan = document.getElementById('user-name');
const toolPicker = document.getElementById('tool-picker');
let tool = 'pencil';

// Crear controles de grosor (ya no agregamos el botón de borrador aquí)
const thicknessLabel = document.createElement('label');
thicknessLabel.textContent = 'Grosor:';
thicknessLabel.style.marginLeft = '10px';
const thicknessInput = document.createElement('input');
thicknessInput.type = 'range';
thicknessInput.min = 2;
thicknessInput.max = 16;
thicknessInput.value = thickness;
thicknessInput.id = 'thickness-input';
thicknessInput.style.marginLeft = '5px';
colorPicker.appendChild(thicknessLabel);
colorPicker.appendChild(thicknessInput);

// Herramientas de dibujo con íconos SVG
if (toolPicker) {
    toolPicker.innerHTML = `
        <button class="tool-btn selected" data-tool="pencil" title="Lápiz">
            <svg width="20" height="20" viewBox="0 0 20 20"><path d="M3 17l2-2 10-10a1.5 1.5 0 0 1 2 2L7 17l-4 1z" fill="#2a7ae2"/></svg>
        </button>
        <button class="tool-btn" data-tool="circle" title="Círculo">
            <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" stroke="#2a7ae2" stroke-width="2" fill="none"/></svg>
        </button>
        <button class="tool-btn" data-tool="square" title="Cuadrado">
            <svg width="20" height="20" viewBox="0 0 20 20"><rect x="4" y="4" width="12" height="12" stroke="#2a7ae2" stroke-width="2" fill="none"/></svg>
        </button>
        <button class="tool-btn" data-tool="triangle" title="Triángulo">
            <svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,4 18,16 2,16" stroke="#2a7ae2" stroke-width="2" fill="none"/></svg>
        </button>
        <button class="tool-btn" data-tool="eraser" title="Borrador">
            <svg width="20" height="20" viewBox="0 0 20 20"><rect x="3" y="13" width="14" height="4" rx="2" fill="#e74c3c"/><rect x="6" y="3" width="8" height="10" rx="2" fill="#bbb"/></svg>
        </button>
    `;
    toolPicker.addEventListener('click', (e) => {
        if (e.target.closest('.tool-btn')) {
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('selected'));
            e.target.closest('.tool-btn').classList.add('selected');
            tool = e.target.closest('.tool-btn').getAttribute('data-tool');
        }
    });
}

thicknessInput.addEventListener('input', (e) => {
    thickness = parseInt(e.target.value);
    // El grosor es local, no se envía al servidor
});

// Guardar el estado del canvas para previsualización
let savedBoard = null;
function saveBoard() {
    savedBoard = ctx.getImageData(0, 0, canvas.width, canvas.height);
}
function restoreBoard() {
    if (savedBoard) ctx.putImageData(savedBoard, 0, 0);
}

function conectar() {
    socket = io();
    socket.on('nombre', (n) => {
        nombre = n;
        if (userNameSpan) userNameSpan.textContent = nombre;
    });
    socket.on('usuarios', (usuarios) => {
        usersList.innerHTML = '';
        usuarios.forEach(u => {
            const li = document.createElement('li');
            li.textContent = u;
            usersList.appendChild(li);
        });
    });
    socket.on('nueva-palabra', (palabra) => {
        wordSpan.textContent = palabra;
    });
    socket.on('timer', (t) => {
        timerDiv.textContent = `Tiempo: ${t}s`;
    });
    socket.on('draw', (data) => {
        if (data.tool === 'circle') {
            drawCircle(data.from, data.to, data.color || '#222', data.thickness || 2);
        } else if (data.tool === 'square') {
            drawSquare(data.from, data.to, data.color || '#222', data.thickness || 2);
        } else if (data.tool === 'triangle') {
            drawTriangle(data.from, data.to, data.color || '#222', data.thickness || 2);
        } else {
            drawLine(data.from, data.to, data.color || '#222', data.thickness || 2, data.erasing || false);
        }
    });
    socket.on('chat', (data) => {
        addChatMsg(data.nombre, data.msg);
    });
    socket.on('clear-board', () => {
        clearBoard();
    });
    socket.on('thickness', (data) => {
        thickness = data.thickness;
    });
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'inline-block';
    socket.emit('connect-request');
}

function desconectar() {
    if (socket) {
        socket.emit('disconnect-request');
        socket = null;
    }
    connectBtn.style.display = 'inline-block';
    disconnectBtn.style.display = 'none';
}



canvas.addEventListener('mousedown', (e) => {
    if (!socket) return;
    drawing = true;
    prev = getPos(e);
    saveBoard();
});
canvas.addEventListener('mouseup', (e) => {
    if (!socket) return;
    if (drawing && tool !== 'pencil' && tool !== 'eraser' && prev) {
        const pos = getPos(e);
        clearBoard();
        restoreBoard();
        if (tool === 'circle') {
            drawCircle(prev, pos, color, thickness);
            socket.emit('draw', { from: prev, to: pos, color, thickness, tool });
        } else if (tool === 'square') {
            drawSquare(prev, pos, color, thickness);
            socket.emit('draw', { from: prev, to: pos, color, thickness, tool });
        } else if (tool === 'triangle') {
            drawTriangle(prev, pos, color, thickness);
            socket.emit('draw', { from: prev, to: pos, color, thickness, tool });
        }
    }
    drawing = false;
    prev = null;
});
canvas.addEventListener('mousemove', (e) => {
    if (!drawing || !socket) return;
    const pos = getPos(e);
    if (tool === 'pencil') {
        drawLine(prev, pos, color, thickness, false);
        socket.emit('draw', { from: prev, to: pos, color, thickness, erasing: false, tool });
        prev = pos;
    } else if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        drawLine(prev, pos, '#fff', thickness, true);
        ctx.globalCompositeOperation = 'source-over';
        socket.emit('draw', { from: prev, to: pos, color: '#fff', thickness, erasing: true, tool });
        prev = pos;
    } else if (tool === 'circle' || tool === 'square' || tool === 'triangle') {
        // Previsualización de figura
        clearBoard();
        restoreBoard();
        if (tool === 'circle') drawCircle(prev, pos, color, thickness);
        if (tool === 'square') drawSquare(prev, pos, color, thickness);
        if (tool === 'triangle') drawTriangle(prev, pos, color, thickness);
    }
});

// Herramientas de dibujo
if (toolPicker) {
    toolPicker.addEventListener('click', (e) => {
        if (e.target.classList.contains('tool-btn')) {
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
            tool = e.target.getAttribute('data-tool');
            erasing = false;
        }
    });
}
function drawCircle(from, to, color, thickness) {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    const r = Math.hypot(to.x - from.x, to.y - from.y);
    ctx.arc(from.x, from.y, r, 0, 2 * Math.PI);
    ctx.stroke();
}
function drawSquare(from, to, color, thickness) {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    const side = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
    ctx.rect(from.x, from.y, side * Math.sign(to.x - from.x), side * Math.sign(to.y - from.y));
    ctx.stroke();
}
function drawTriangle(from, to, color, thickness) {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.lineTo(from.x - (to.x - from.x), to.y);
    ctx.closePath();
    ctx.stroke();
}


colorPicker.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-btn')) {
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
        if (e.target.id === 'eraser-btn') {
            erasing = true;
        } else {
            color = e.target.getAttribute('data-color');
            erasing = false;
            if (socket) socket.emit('color', color);
        }
    }
});

thicknessInput.addEventListener('input', (e) => {
    thickness = parseInt(e.target.value);
    if (socket) socket.emit('thickness', thickness);
});

sendBtn.addEventListener('click', enviarMsg);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enviarMsg();
});
function enviarMsg() {
    const msg = chatInput.value.trim();
    if (msg && socket) {
        socket.emit('chat', msg);
        chatInput.value = '';
    }
}
function addChatMsg(nombre, msg) {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${nombre}:</strong> ${msg}`;
    chatDiv.appendChild(div);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function drawLine(from, to, color, thickness = 2, erasing = false) {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
}

function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
connectBtn.addEventListener('click', conectar);
disconnectBtn.addEventListener('click', desconectar);
