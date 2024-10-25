const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    // Récupération des informations du livre envoyées dans le corps de la requête au format JSON
    const bookObject = JSON.parse(req.body.book);

    // Suppression des propriétés _id et _userId de bookObject pour éviter des conflits d'identifiants
    delete bookObject._id;
    delete bookObject._userId;

    // Création d'un nouveau livre avec les informations du livre
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: req.processedImageUrl,
        ratings: [],
        averageRating: 0
    });
    // Tentatuve de sauvegarde du livre dans la base de données 
    book.save()
        .then( res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }))
};

exports.createRating = (req, res, next) => {
    // Vérification que la note est comprise entre 0 et 5
    if(req.body.rating >= 0 && req.body.rating <= 5){
        // Création d'un objet rating avec l'identifiant de l'utilisateur et la note qu'il a donnée
        const rating = {
            userId: req.auth.userId,
            grade: req.body.rating
        };
        // Recherche du livre avec l'ID spécifié dans les paramètres de la requête
        Book.findOne({ _id: req.params.id })
            .then(book => {
                // Vérification si l'utilisateur a déjà noté ce livre
                if(book.ratings.find(rating => rating.userId === req.auth.userId)){
                    res.status(409).json({ message: 'User has already attributed a rating' });
                } else { 
                    // Ajout de la nouvelle évaluation au tableau ratings du livre
                    book.ratings.push(rating);
                    
                    // Calcul du nombre total de notes et la somme de toutes les notes
                    const ratingNumber =  book.ratings.length;
                    const totalRating = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
                    // Calcul de la note moyenne du livre
                    const averageRating =  totalRating/ratingNumber;

                    book.averageRating = averageRating.toFixed(1);
                    // Mise à jour du livre dans la base de données avec les nouvelles notes et la moyenne
                    Book.updateOne({ _id: req.params.id }, { ratings: book.ratings, averageRating: book.averageRating, _id: req.params.id })
                        .then(() => res.status(200).json(book ))
                        .catch(error => res.status(401).json({ error }));
                }
            })
            .catch(error => res.status(404).json({ error }));
    }else{
        res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }
}

exports.getOneBook = (req, res, next) => {
    // Recherche du livre avec l'ID spécifié dans les paramètres de la requête
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
    // Recherche de tout les livres
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
    // Recherche des meilleurs livres, trié en ordre décroissant selon averageRating
    Book.find().sort({ averageRating: -1 }).limit(3)
      .then(books => res.status(200).json(books))
      .catch(error => res.status(500).json({ error }));
};

exports.deleteBook = (req, res, next) => {
    // Recherche du livre avec l'ID spécifié dans les paramètres de la requête
    Book.findOne({ _id: req.params.id})
        .then(book => {
            // Vérification que l'utilisateur soit bien le propriétaire du livre
            if (book.userId != req.auth.userId) {
                res.status(403).json({message: 'Unauthorized request'});
            } else {
                // Extraction du nom du fichier image depuis l'URL de l'image
                const filename = book.imageUrl.split('/images/')[1];
                // Suppression de l'image sur le serveur
                fs.unlink(`images/${filename}`, () => {
                    // Suppression du livre dans la base de données
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

exports.modifyBook = (req, res, next) => {
    // Si une image est incluse dans la requête via req.file, on extrait book depuis le req.body.book et remplace l'URL de l'image par req.processedImageUrl
    // Sinon, on prend les données directement depuis req.body
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: req.processedImageUrl
    } : { ...req.body };

    // Suppression du champ _userId pour éviter que l'utilisateur modifie le créateur d'un livre
    delete bookObject._userId;

    // Recherche du livre avec l'ID spécifié dans les paramètres de la requête
    Book.findOne({ _id: req.params.id })
    .then(book => {
      // Vérification que l'utilisateur soit bien le propriétaire du livre
      if(book.userId != req.auth.userId){
          res.status(403).json({ message: 'Unauthorized request' });
      }else{
         // Si une nouvelle image a été fournie, suppression de l'ancienne image
         if (req.file) {
            const oldFile = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${oldFile}`, (error) => {
                if (error) {
                    console.error(error);
                }
            });
        }

        // Mise à jour du livre avec les nouvelles informations
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre modifié !' }))
            .catch(error => res.status(401).json({ error }));
      }
    })
    .catch(error => res.status(400).json({ error }));
}