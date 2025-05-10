// Importar dependencias
import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

// Crear una instancia de Express
const app = express();

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Configurar el URI de conexión de MongoDB
const uri = process.env.MONGODB_URI;

// Conexión a MongoDB
let db;
MongoClient.connect(uri)
    .then(async (client) => {
        console.log('Conectado a MongoDB Atlas');
        db = client.db('dsagredo-ms'); // Base de datos 'dsagredo-ms'
        const collections = await db.listCollections().toArray();

        if (collections.length === 0) {
            console.error(
                `❌ Base de datos '${db.databaseName}' no contiene coleccion`
            );
        } else {
            console.log(
                `✅ Conectado a MongoDB Atlas - Base de datos: ${db.databaseName}`
            );
        }
    })
    .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Ruta para obtener datos de MongoDB
app.get('/portafolio-ms', (req, res) => {
    const collection = db.collection('portafolio');

    collection
        .find()
        .toArray()
        .then((data) => {
            res.json(data); // Si hay datos, devolverlos como respuesta
        })
        .catch((err) => {
            res.status(500).send('Error al obtener datos'); // Enviar error 500 si ocurre un problema
        });
});

// Ruta para agregar datos a MongoDB
app.post('/portafolio-ms', (req, res) => {
    const collection = db.collection('portafolio');
    const newData = req.body;
    collection
        .insertOne(newData)
        .then((result) => res.json(result.ops[0]))
        .catch((err) => res.status(500).send('Error al insertar datos'));
});

// Configurar el puerto del servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
