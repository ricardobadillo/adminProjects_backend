const express = require('express');
const connect = require('./config/db');
const cors = require('cors');

// Crear el servidor.
const app = express();
connect();

//Habilitar cors.
app.use(cors());

// Habilitar express.json.
app.use(express.json({extended: true}));

// Importar rutas.
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

const PORT = process.env.PORT || 4000;

// Arrancar la app.
app.listen(PORT, ()=> {
    console.log('Escuchando desde el puerto 4000');
} );
