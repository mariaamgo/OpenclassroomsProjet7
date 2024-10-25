const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
       // Récupération du token d'authentification
       const token = req.headers.authorization.split(' ')[1];

       // Vérification du token avec la clé secrète
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;

       // Stockage du token dans req.auth
       req.auth = {
           userId: userId
       };
	   next();
   } catch(error) {
       res.status(401).json({ error });
   }
};