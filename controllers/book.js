const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: req.processedImageUrl
    });
    book.save()
        .then( res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }))
};

exports.createRating = (req, res, next) => {
    if(req.body.rating >= 0 && req.body.rating <= 5){
        const rating = {
            userId: req.auth.userId,
            grade: req.body.rating
        };
        Book.findOne({ _id: req.params.id })
            .then(book => {
                if(book.ratings.find(rating => rating.userId === req.auth.userId)){
                    res.status(409).json({ message: 'User has already attributed a rating' });
                } else {    
                    book.ratings.push(rating);

                    const ratingNumber =  book.ratings.length;
                    const totalRating = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
                    const averageRating =  totalRating/ratingNumber;

                    book.averageRating = averageRating.toFixed(1);
                    
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
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
    Book.find().sort({ rating: -1 }).limit(3) // Utilisez le champ "rating" pour trier les livres par ordre décroissant
      .then(books => res.status(200).json(books))
      .catch(error => res.status(500).json({ error }));
  };

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({message: 'Unauthorized request'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
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
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: req.processedImageUrl
    } : { ...req.body };

    delete bookObject._userId;

    Book.findOne({ _id: req.params.id })
    .then(book => {
      if(book.userId != req.auth.userId){
          res.status(403).json({ message: 'Unauthorized request' });
      }else{
        const oldFile = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${oldFile}`, () => {
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Livre modifié !' }))
                .catch(error => res.status(401).json({ error }));
        }) 
      }
    })
    .catch(error => res.status(400).json({ error }));
}