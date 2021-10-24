// Dependance
const { Socket } = require('socket.io');
const express = require('express');
const path = require('path');

// Construction du Server
const app = express();
const http = require('http').createServer(app);
const port = 8080;

// Liaison entre Express et Socket IO
/**
 ** Permet d'avoir l'autocompletion :
*   @type { Socket }
*/
const io = require('socket.io')(http);

// Ecoute du Port Server
http.listen(port, () => {
    console.log(`Listening on http://localhost:${port}/`);
});

// Resolve la Page Index
app.get('/', (request, result) => {
    result.sendFile(path.join(__dirname, 'public/index/index.html'));
});

// Enregistrement des modules pour le Web (CSS, JS, ETC...)
app.use('/public/index/css', express.static(path.join(__dirname, 'public/index/css')));
app.use('/public/index/js', express.static(path.join(__dirname, 'public/index/js')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));

// Generation du Morpions
const Morpions = require('./classMorpions');
const App_Morpions = new Morpions(io);
App_Morpions.createServerGame(app, express, path);

// Utilisation du Repertoire Public
app.use(express.static('public'));