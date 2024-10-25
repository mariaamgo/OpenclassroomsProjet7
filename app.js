require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

// Connexion à la base de données
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// Création de l'application Express
const app = express();

// Middleware pour gérer les en-têtes CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Middleware pour analyser le corps des requêtes au format JSON
app.use(bodyParser.json());

// Middleware pour servir les fichiers statiques dans le dossier images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Configuration des routes pour les livres et les utilisateurs
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;