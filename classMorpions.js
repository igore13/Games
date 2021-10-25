class Morpions {
    // Constructeur de la class
    constructor(io) {
        this.rooms = [];
        this.io = io;
    }

    // Chat
    chat(message, roomId) {
        // Recherche de la room par roomId
        const room = this.rooms.find(room => room.id === roomId);

        // On verifie que message ne soit pas vide et que room soit existant
        if (message != "") {
            this.io.to(room.id).emit('morpions-message', message);
        }
    }

    // Restart
    restart(roomId) {
        // Recherche de la room par roomId
        const room = this.rooms.find(room => room.id === roomId);

        // On verifie que players ne soit pas vide et que room soit existant
        if (room && room.players.length === 2) {
            this.io.to(room.id).emit('morpions-restart', room.players);
        }
    }

    // Play
    play(socket, player) {
        let players = [];

        // On recherche la room du player
        this.rooms.forEach(room => {
            if (room.id == player.roomId) {
                if (player.win) {
                    room.players.forEach(playerTarget => {
                        if (playerTarget.socketId == player.socketId) {
                            playerTarget.point++;
                        }
                    });
                }
                players = room.players;
            }
        });

        this.io.to(player.roomId).emit('morpions-play', player, players);
    }

    // Deconnection
    disconnect(socket) {
        this.rooms.forEach(room => {
            const targetPlayers = room.players;

            // On recherche le joueur dans chaque room pour deconnecter les joueurs
            let resultFind = targetPlayers.find(player => player.socketId == socket.id);

            if (resultFind) {
                targetPlayers.forEach(targetPlayer => {
                    if (targetPlayer.host) {
                        // Si le joueur etait le host la room se supprime a la deconnection
                        this.rooms = this.rooms.filter(resultRoom => resultRoom !== room);
                        console.log(`[REMOVE : Room] ${socket.id}`);
                        this.io.to(targetPlayer.socketId).emit('morpions-disconnectPlayer', targetPlayer);
                    } else {
                        this.io.to(targetPlayer.socketId).emit('morpions-disconnectPlayer', targetPlayer);
                    }
                });
            }
        });
    }

    // Liste des Rooms
    list(socket) {
        this.io.to(socket.id).emit('morpions-list', this.rooms);
    }

    // Player Data au lancement du Jeux
    playerData(socket, player) {
        let room = null;

        if (!player.roomId) {
            // Creation de la room
            room = this.createRoom(socket, player);
            console.log(`[CREATE : Room Morpions] ${room.id} - ${player.username}`);
        } else {
            // Join de la room
            room = this.rooms.find(result => result.id === player.roomId);

            if (!room) {
                return;
            }
            
            // Si le salon est deja plein, on ejecte les autre arrivant
            if (room.players.length == 2) {
                this.io.to(socket.id).emit('morpions-disconnectPlayer', player);
                return;
            } else {
                player.roomId = room.id;
                room.players.push(player);
            }
        }

        socket.join(room.id);

        this.io.to(socket.id).emit('morpions-join', room.id);

        // Si le salon a 2 joueur on start le Jeux
        if (room.players.length ===2) {
            this.io.to(room.id).emit('morpions-start', room.players)
        }
    }

    // Creation de la room
    createRoom(socket, player) {
        // Generation d'un code unique pour la room
        const room = {id: this.generateRoomId(), players: []};

        player.roomId = room.id;
        room.players.push(player);
        this.rooms.push(room);
    
        return room;
    }

    // Generation d'un code unique
    generateRoomId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Creation du Jeux pour le Server
    createServerGame(app, express, path) {
        this.io.on('connection', (socket) => {
            socket.on('morpions-playerData', (player) => {
                this.playerData(socket, player);
            });
        
            socket.on('morpions-list', () => {
                this.list(socket);
            });
        
            socket.on('morpions-play', (player) => {
                this.play(socket, player);
            })
        
            socket.on('morpions-restart', (roomId) => {
                this.restart(roomId);
            });
        
            socket.on('disconnect', () => {
                this.disconnect(socket);
            });

            socket.on('morpions-message', (message, roomId) => {
                this.chat(message, roomId);
            })
        });

        app.get('/morpions', (request, result) => {
            result.sendFile(path.join(__dirname, 'public/morpions/morpions.html'));
        });
        
        app.use('/public/morpions/css', express.static(path.join(__dirname, 'public/morpions/css')));
        app.use('/public/morpions/js', express.static(path.join(__dirname, 'public/morpions/js')));
    }
}

module.exports = Morpions;