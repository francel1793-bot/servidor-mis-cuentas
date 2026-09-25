// Servidor mínimo para "Mis Cuentas": guarda pares clave-valor en un
// archivo, protegido por un código de acceso. Pensado para desplegarse
// gratis en Render.com (ver README.md).

const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.ACCESS_TOKEN || '';
const DATA_FILE = path.join(__dirname, 'data.json');

const app = express();
app.use(express.json());

// Permite que la app (abierta como archivo o desde el teléfono) llame a este servidor
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

function leerDatos() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (e) { return {}; }
}
function guardarDatos(datos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(datos));
}

function requiereToken(req, res, next) {
  if (!TOKEN) return next(); // sin código configurado: acceso libre (no recomendado)
  if (req.get('X-Auth-Token') !== TOKEN) {
    return res.status(401).json({ error: 'Código de acceso incorrecto' });
  }
  next();
}

app.get('/', (req, res) => res.send('Servidor de Mis Cuentas funcionando.'));

app.get('/api/kv/:key', requiereToken, (req, res) => {
  const datos = leerDatos();
  const value = Object.prototype.hasOwnProperty.call(datos, req.params.key) ? datos[req.params.key] : null;
  res.json({ value });
});

app.put('/api/kv/:key', requiereToken, (req, res) => {
  const datos = leerDatos();
  datos[req.params.key] = req.body.value;
  guardarDatos(datos);
  res.json({ ok: true });
});

app.delete('/api/kv/:key', requiereToken, (req, res) => {
  const datos = leerDatos();
  delete datos[req.params.key];
  guardarDatos(datos);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log('Servidor de Mis Cuentas escuchando en el puerto ' + PORT));
