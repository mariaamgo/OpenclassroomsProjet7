const http = require('http');
const app = require('./app');

// Fonction pour normaliser le port
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// Définition du port à utiliser, avec une valeur par défaut de '4000'
const port = normalizePort(process.env.PORT || '4000');

// Enregistrement du port dans l'application Express
app.set('port', port); 

// Gestion des erreurs
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;

  // Gestion des différentes erreurs possibles
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Création du serveur HTTP avec l'application Express
const server = http.createServer(app);

// Événement pour gérer les erreurs du serveur
server.on('error', errorHandler);

// Événement lorsque le serveur commence à écouter
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

// Démarrage du serveur sur le port spécifié
server.listen(port);
