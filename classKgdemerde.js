class Kgdemerde {
    // Constructeur de la class
    constructor(io) {
        this.rooms = [];
        this.io = io;
    }

    // Creation du Jeux pour le Server
    createServerGame(app, express, path) {
        app.get('/kgdemerde', (request, result) => {
            result.sendFile(path.join(__dirname, 'public/kgdemerde/kgdemerde.html'));
        });
        
        app.use('/public/kgdemerde/css', express.static(path.join(__dirname, 'public/kgdemerde/css')));
        app.use('/public/kgdemerde/js', express.static(path.join(__dirname, 'public/kgdemerde/js')));
    }
}

module.exports = Kgdemerde;