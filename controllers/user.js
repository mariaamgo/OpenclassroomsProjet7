const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.signup = (req, res, next) => {
    // Hachage du mot de passe
    bcrypt.hash(req.body.password, 10)
        .then(hash =>{
            // Création d'un nouvel utilisateur
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // Tentative de sauvegarde du nouvel utilisateur dans la base de données
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    // Recherche de l'email dans la base de données
    User.findOne({email: req.body.email})
        .then(user => {
            if(user === null){
                res.status(401).json({ message: 'Paire identifiant/mot de passe incorecte !' });
            }else{
                // Comparaison des mots de passe contenu dans le champ et dans la base de données
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if(!valid){
                            res.status(401).json({ message: 'Paire identifiant/mot de passe incorecte !' });
                        }else{
                            res.status(200).json({ 
                                userId: user._id,
                                // Création du token
                                token: jwt.sign(
                                    { userId: user._id },
                                    'RANDOM_TOKEN_SECRET',
                                    { expiresIn: '24h' }
                                )
                            });
                        }
                    })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
};