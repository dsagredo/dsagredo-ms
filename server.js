import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Crear una instancia de Express
const app = express();

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Habilitar CORS
app.use(cors());

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
app.get('/portfolio-ms', (req, res) => {
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
app.post('/portfolio-add-ms', async (req, res) => {
    try {
        const collection = db.collection('portafolio');
        const newData = req.body;
        const result = await collection.insertOne(newData);
        res.status(200).json({
            mensaje: 'Guardado exitosamente',
            id: result.insertedId,
        });
    } catch (err) {
        res.status(500).send('Error al insertar datos');
    }
});

// Ruta para obtener un portafolio por ID
app.get('/portfolio-ms/:id', async (req, res) => {
    try {
        const collection = db.collection('portafolio');
        const id = req.params.id;
        const data = await collection.findOne({ _id: new ObjectId(id) });
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ mensaje: 'No se encontró el portafolio' });
        }
    } catch (err) {
        res.status(500).send('Error al obtener el portafolio');
    }
});

app.delete('/portfolio-delete-ms/:id', async (req, res) => {
    try {
        const collection = db.collection('portafolio');
        const id = req.params.id;
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.status(200).json({ mensaje: 'Eliminado exitosamente' });
        } else {
            res.status(404).json({ mensaje: 'No se encontró el id' });
        }
    } catch (err) {
        res.status(500).send('Error al eliminar datos');
    }
});

// Configurar el puerto del servidor
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
