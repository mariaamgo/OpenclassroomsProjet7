const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Configuration du stockage en mémoire avec Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware pour traiter l'image après le téléchargement
const linkImage = async(req, res, next) => {
    if (!req.file) {
        // Passage au middleware suivant si aucun fichier
        return next();
    }

    // Répertoire où les images seront enregistrées
    const imagesDir = path.join(__dirname, '../images');
    
    // Vérification si le répertoire existe déjà
    fs.access(imagesDir, (error) => {
        if (error) {
          // Création du répertoire
          fs.mkdirSync(imagesDir);
        }
    });

    // Extraction des informations du fichier téléchargé
    const { buffer, originalname } = req.file;
    const timestamp = Date.now();
    const fileName = `${originalname.split(' ').join('_')}-${timestamp}.webp`;

    // Traitement de l'image pour la convertir au format WebP avec une qualité de 20%
    await sharp(buffer)
        .webp({ quality: 20 })
        .toFile("./images/" + fileName);

    // Construction de l'URL accessible de l'image traitée
    req.processedImageUrl = `${req.protocol}://${req.get('host')}/images/${fileName}`
    next();
}

module.exports = {upload, linkImage};