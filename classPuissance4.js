class Puissance4 {
    constructor(io) {
        this.rooms = [];
        this.io = io;
    }

    chat(message, roomId) {
        const room = this.rooms.find(room => room.id === roomId);

        if (message != "") {
            this.io.to(room.id).emit('puissance4-message', message);
        }
    }

    restart(roomId) {
        const room = this.rooms.find(room => room.id === roomId);

        if (room && room.players.length === 2) {
            this.io.to(room.id).emit('puissance4-restart', room.players);
        }
    }

    play(socket, player) {
        let players = [];
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
        this.io.to(player.roomId).emit('puissance4-play', player, players);
    }

    disconnect(socket) {
        this.rooms.forEach(room => {
            const targetPlayers = room.players;
            targetPlayers.forEach(player => {
                if (player.socketId == socket.id) {
                    targetPlayers.forEach(targetPlayer => {
                        if (targetPlayer.host) {
                            this.rooms = this.rooms.filter(resultRoom => resultRoom !== room);
                            console.log(`[REMOVE : Room] ${socket.id}`);
                            this.io.to(targetPlayer.socketId).emit('puissance4-disconnectPlayer', targetPlayer);
                        } else {
                            this.io.to(targetPlayer.socketId).emit('puissance4-disconnectPlayer', targetPlayer);
                        }
                    });
                }
            });
        });
    }

    list(socket) {
        this.io.to(socket.id).emit('puissance4-list', this.rooms);
    }

    playerData(socket, player) {
        let room = null;

        if (!player.roomId) {
            room = this.createRoom(socket, player);
            console.log(`[CREATE : Room Puissance 4] ${room.id} - ${player.username}`);
        } else {
            room = this.rooms.find(result => result.id === player.roomId);

            if (!room) {
                return;
            }
            
            if (room.players.length == 2) {
                this.io.to(socket.id).emit('puissance4-disconnectPlayer', player);
                return;
            } else {
                player.roomId = room.id;
                room.players.push(player);
            }
        }

        socket.join(room.id);

        this.io.to(socket.id).emit('puissance4-join', room.id);

        if (room.players.length ===2) {
            this.io.to(room.id).emit('puissance4-start', room.players)
        }
    }

    createRoom(socket, player) {
        const room = {id: this.generateRoomId(), players: []};

        player.roomId = room.id;
        room.players.push(player);
        this.rooms.push(room);
    
        return room;
    }

    generateRoomId() {
        return Math.random().toString(36).substr(2, 9);
    }

    createServerGame(app, express, path) {
        this.io.on('connection', (socket) => {
            socket.on('puissance4-playerData', (player) => {
                this.playerData(socket, player);
            });
        
            socket.on('puissance4-list', () => {
                this.list(socket);
            });
        
            socket.on('puissance4-play', (player) => {
                this.play(socket, player);
            })
        
            socket.on('puissance4-restart', (roomId) => {
                this.restart(roomId);
            });
        
            socket.on('disconnect', () => {
                this.disconnect(socket);
            });

            socket.on('puissance4-message', (message, roomId) => {
                this.chat(message, roomId);
            })
        });

        app.get('/puissance4', (request, result) => {
            result.sendFile(path.join(__dirname, 'public/puissance4/puissance4.html'));
        });
        
        app.use('/public/puissance4/css', express.static(path.join(__dirname, 'public/puissance4/css')));
        app.use('/public/puissance4/js', express.static(path.join(__dirname, 'public/puissance4/js')));
    }
}

module.exports = Puissance4;