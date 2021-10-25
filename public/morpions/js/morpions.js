class Morpions {
    // Constructeur
    constructor(socket) {
        this.socket = socket;
        this.urlRoomId;

        this.player = {
            host: false,
            playedCell: "",
            roomId: null,
            username: "",
            socketId: "",
            symbol: "X",
            turn: false,
            win: false,
            first: false,
            point: 0
        }

        this.display = {
            elementUsernameInput: document.getElementById("username"),
            elementWaitingGame: document.getElementById("waiting-game"),
            elementGame: document.getElementById("game"),
            elementGameInfo: document.getElementById('game-text'),
            elementListRooms: document.getElementById("list"),
            elementGameCancel: document.getElementById("game-cancel"),
            elementGameRestart: document.getElementById("game-restart"),
            elementGameBoard: document.getElementById("game-board"),
            elementLinkShare: document.getElementById("link-share"),
            elementVS: document.getElementById("game-vs"),
            elementChat: document.getElementById("chat-room"),
            elementChatMessage: document.getElementById("chat-msg"),
            elementChatText: document.getElementById("chat-text"),
            elementJoinRoom: document.getElementById('join-room')
        }
    }

    // Calcul l'Egalité
    calculEquality() {
        let equality = true;
        const cells = document.getElementsByClassName('cell');
        
        // Verifie chaque cellule
        for (const cell of cells) {
            if (cell.textContent === '') {
                equality = false;
            }
        };
    
        return equality;
    }
    
    // Calcul de la Win
    calculWin(playedCell, symbol = this.player.symbol) {
        let row = playedCell[5];
        let column = playedCell[7];
    
    
        // Cellule Vertical
        let win = true;
    
        for (let i = 1; i < 4; i++) {
            if ($(`#cell-${i}-${column}`).text() !== symbol) {
                win = false;
            }
        }
    
        if (win) {
            for (let i = 1; i < 4; i++) {
                $(`#cell-${i}-${column}`).addClass("win-cell");
            }
    
            return win;
        }
    
        // Cellule Horizontal
        win = true;
        for (let i = 1; i < 4; i++) {
            if ($(`#cell-${row}-${i}`).text() !== symbol) {
                win = false;
            }
        }
    
        if (win) {
            for (let i = 1; i < 4; i++) {
                $(`#cell-${row}-${i}`).addClass("win-cell");
            }
    
            return win;
        }
    
        // Cellule Diagonale
        win = true;
    
        for (let i = 1; i < 4; i++) {
            if ($(`#cell-${i}-${i}`).text() !== symbol) {
                win = false;
            }
        }
    
        if (win) {
            for (let i = 1; i < 4; i++) {
                $(`#cell-${i}-${i}`).addClass("win-cell");
            }
    
            return win;
        }
    
        win = false;
        if ($("#cell-1-3").text() === symbol) {
            if ($("#cell-2-2").text() === symbol) {
                if ($("#cell-3-1").text() === symbol) {
                    win = true;
    
                    $("#cell-1-3").addClass("win-cell");
                    $("#cell-2-2").addClass("win-cell");
                    $("#cell-3-1").addClass("win-cell");
    
                    return win;
                }
            }
        }
    }

    // Info du Joueur
    setGameText(message, classToAdd = false, classToRemove = false) {
        this.display.elementGameInfo.textContent = message;
    
        // On ajoute la class si renseignée
        if (classToAdd) {
            classToAdd.forEach(classname => {
                this.display.elementGameInfo.classList.add(classname);
            });
        }
    
        // On retire la class si renseignée
        if (classToRemove) {
            classToRemove.forEach(classname => {
                this.display.elementGameInfo.classList.remove(classname);
            });
        }
    }

    // Return le nom du Joueur Ennemie
    getEnemyName(players, socketId) {
        return players.find(player => player.socketId != socketId).username;
    }

    // Join de la room
    joinRoom(event) {
        if (this.display.elementUsernameInput.value !== "") {
            this.player.username = this.display.elementUsernameInput.value;
            this.player.socketId = this.socket.id;
            this.player.roomId = event.currentTarget.dataset.room;
    
            this.socket.emit('morpions-playerData', this.player);
    
            this.display.elementWaitingGame.classList.add('hidden');
            this.display.elementGame.classList.remove('hidden');
        }
    }

    // Restart le Jeux
    restartGame(players = null) {
        if (this.player.host && !players) {
            socket.emit('morpions-restart', this.player.roomId);
    
            this.display.elementGameRestart.classList.add('hidden');
        } else if (this.player.host && players) {
            this.startGame(players);
            return;
        }
    
        const cells = document.getElementsByClassName('cell');
    
        // Reset toute les cellules
        for (const cell of cells) {
            cell.textContent = '';
            cell.classList.remove('win-cell', 'enemy-cell', 'played-cell');
        }
    
        // Change de Joueurs dans le Start
        if (this.player.first) {
            this.player.turn = false;
            this.player.first = false;
        } else {
            this.player.turn = true;
            this.player.first = true;
        }
    
        this.player.win = false;
    
        if (players) {
            this.startGame(players);
        }
    }

    // Start le Jeux
    startGame(players) {
        this.display.elementGameCancel.classList.add('hidden');
        this.display.elementGameBoard.classList.remove('hidden');
        this.display.elementChat.classList.remove('hidden');
    
        this.display.elementVS.textContent = players[0].username + "(" + players[0].point + ") VS " + players[1].username + "(" + players[1].point + ")";
    
        if (this.player.turn) {
            this.setGameText("C'est votre tour de jouer", ["green"], ["orange", "red"]);
        } else {
            this.setGameText("C'est au tour de " + this.getEnemyName(players, this.player.socketId), ["orange"], ["red", "green"]);
        }
    }

    // Verification si une room est dans l'url
    checkRoomUrl() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const roomId = urlParams.get('room');

        if (roomId) {
            this.urlRoomId = roomId;
            this.display.elementJoinRoom.textContent = "Rejoindre";
        }
    }

    // Creation du Jeux sur le Client
    createClientGame() {
        this.checkRoomUrl();

        this.socket.on('morpions-list', (rooms) => {
            this.display.elementListRooms.innerHTML = "";
            if (rooms.length > 0) {
                rooms.forEach(room => {
                    if (room.players.length < 2) {
                        const elementRoom = document.createElement("li");
                        elementRoom.textContent = "Salon de " + room.players[0].username;
                        elementRoom.dataset.room = room.id;
                        this.display.elementListRooms.appendChild(elementRoom);

                        elementRoom.addEventListener('click', (event) => {
                            this.joinRoom(event);
                        });
                    }
                });
            } else {
                const elementRoom = document.createElement("li");
                elementRoom.textContent = "Aucun salon disponible";
                elementRoom.dataset.empty = true;
                this.display.elementListRooms.appendChild(elementRoom);
            }
        });

        this.socket.on('morpions-disconnectPlayer', (playerTarget) => {
            if (playerTarget.socketId == this.player.socketId) {
                document.location.href="/"; 
            }
        })

        this.socket.on('morpions-message', (message) => {
            const elementMessage = document.createElement('li');
            elementMessage.textContent = message;
            this.display.elementChatMessage.appendChild(elementMessage);
        })

        this.socket.on('morpions-start', (players) => {
            this.startGame(players);
        });

        this.socket.on('morpions-join', (roomId) => {
            this.player.roomId = roomId;
            if (window.location.href.indexOf('room') != -1) {
                this.display.elementLinkShare.innerHTML = 'Partager le lien à un amie : <a href=' + window.location.href + ' target="_blank">' + window.location.href + '</a>';
            } else {
                this.display.elementLinkShare.innerHTML = 'Partager le lien à un amie : <a href=' + window.location.href + "?room=" + this.player.roomId + ' target="_blank">' + window.location.href + '?room=' + this.player.roomId + '</a>';
            }
        });

        this.socket.on('morpions-restart', (players) => {
            this.restartGame(players);
        });

        this.socket.on('morpions-play', (playerPlayed, players) => {
            const elementPlayerCell = document.getElementById(playerPlayed.playedCell);
            
            if (playerPlayed.socketId !== this.player.socketId && !playerPlayed.turn) {

                elementPlayerCell.classList.add('enemy-cell');
                elementPlayerCell.textContent = 'O';

                if (playerPlayed.win) {
                    this.setGameText("C'est perdu ! " + this.getEnemyName(players, this.player.socketId) + " à gagnée la partie !", ["red"], ["orange", "green"]);
                    this.calculWin(playerPlayed.playedCell, 'O');

                    if (this.player.host) {
                        this.display.elementGameRestart.classList.remove('hidden');
                    }

                    return;
                }

                if (this.calculEquality()) {
                    this.setGameText("C'est une égalité !", ["orange"], ["red", "green"]);
                    
                    if (this.player.host) {
                        this.display.elementGameRestart.classList.remove('hidden');
                    }

                    return;
                }

                this.setGameText("C'est votre tour de jouer", ["green"], ["orange", "red"]);
                this.player.turn = true;
            } else {
                if (this.player.win) {
                    this.setGameText("Bravo ! Vous avez gagnée la partie !", ["green"], ["orange", "red"]);

                    if (this.player.host) {
                        this.display.elementGameRestart.classList.remove('hidden');
                    }

                    return;
                }

                if (this.calculEquality()) {
                    this.setGameText("C'est une égalité !", ["orange"], ["orange", "red"]);
                    
                    if (this.player.host) {
                        this.display.elementGameRestart.classList.remove('hidden');
                    }
                    
                    return;
                }

                this.setGameText("C'est au tour de " + this.getEnemyName(players, this.player.socketId), ["orange"], ["red", "green"]);
                this.player.turn = false;
            }
        });

        $(".cell").on('click', (event) => {
            const playedCell = event.currentTarget.getAttribute('id');
        
            if (event.currentTarget.textContent === "" && this.player.turn) {
                this.player.playedCell = playedCell;
        
                event.currentTarget.textContent = this.player.symbol;
                event.currentTarget.classList.add('played-cell');
        
                this.player.win = this.calculWin(playedCell);
                this.player.turn = false;
        
                socket.emit('morpions-play', this.player);
            }
        });

        $("#chat-send").on('click', () => {
            const message = this.player.username + ": " + this.display.elementChatText.value;
            this.display.elementChatText.textContent = "";
            socket.emit('morpions-message', message, this.player.roomId);
        });
        
        $("#game-restart").on('click', () => {
            this.restartGame();
        });
        
        $("#form").on("submit", (event) => {
            event.preventDefault();
        
            this.player.username = this.display.elementUsernameInput.value;
        
            if (this.urlRoomId) {
                this.player.roomId = this.urlRoomId;
            } else {
                this.player.host = true;
                this.player.turn = true;
                this.player.first = true;
            }
        
            this.player.socketId = socket.id;
        
            this.setGameText("En attente d'un autre joueur", ["red"], ["orange", "green"]);
            this.display.elementWaitingGame.classList.add('hidden');
            this.display.elementGame.classList.remove('hidden');
        
            this.display.elementVS.textContent = this.player.username + " VS ???";
        
            socket.emit('morpions-playerData', this.player);
        });

        this.socket.emit('morpions-list');

        // Rafraichissement de la liste des rooms
        setInterval(() => {
            this.socket.emit('morpions-list');
        }, 10000);
    }
}

const socket = io();

const App_Morpions = new Morpions(socket);
App_Morpions.createClientGame();