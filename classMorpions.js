class Morpions {
    constructor(io) {
        this.rooms = [];
        this.io = io;
    }

    restart(socket, roomId) {
        const room = this.rooms.find(room => room.id === roomId);

        if (room && room.players.length === 2) {
            this.io.to(room.id).emit('morpions-restart', room.players);
        }
    }

    play(socket, player) {
        let players = [];
        this.rooms.forEach(room => {
            if (room.id == player.roomId) {
                players = room.players;
            }
        });
        this.io.to(player.roomId).emit('morpions-play', player, players);
    }

    disconnect(socket) {
        console.log(`[INFO : Disconnecting] ${socket.id}`);
    
        this.rooms.forEach(room => {
            const targetPlayers = room.players;
            targetPlayers.forEach(player => {
                if (player.socketId == socket.id) {
                    targetPlayers.forEach(targetPlayer => {
                        if (targetPlayer.host) {
                            this.rooms = this.rooms.filter(resultRoom => resultRoom !== room);
                            console.log(`[REMOVE : Room] ${socket.id}`);
                            this.io.to(targetPlayer.socketId).emit('morpions-disconnectPlayer', targetPlayer);
                        } else {
                            this.io.to(targetPlayer.socketId).emit('morpions-disconnectPlayer', targetPlayer);
                        }
                    });
                }
            });
        });
    }

    list(socket) {
        this.io.to(socket.id).emit('morpions-list', this.rooms);
    }

    playerData(socket, player) {
        let room = null;

        if (!player.roomId) {
            room = this.createRoom(socket, player);
            console.log(`[CREATE : Room Morpions] ${room.id} - ${player.username}`);
        } else {
            room = this.rooms.find(result => result.id === player.roomId);

            if (!room) {
                return;
            }
            
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

        if (room.players.length ===2) {
            this.io.to(room.id).emit('morpions-start', room.players)
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
            console.log(`[INFO : Connecting] ${socket.id}`);
        
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
                this.restart(socket, roomId);
            });
        
            socket.on('disconnect', () => {
                this.disconnect(socket);
            });
        });

        app.get('/morpions', (request, result) => {
            result.sendFile(path.join(__dirname, 'public/morpions/morpions.html'));
        });
        
        app.use('/public/morpions/css', express.static(path.join(__dirname, 'public/morpions/css')));
        app.use('/public/morpions/js', express.static(path.join(__dirname, 'public/morpions/js')));
    }
}

module.exports = Morpions;