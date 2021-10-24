class Puissance4 {
    constructor(socket) {
        this.socket = socket;
        this.urlRoomId;

        this.player = {
            host: false,
            playedCell: "",
            roomId: null,
            username: "",
            socketId: "",
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

    calculEquality() {
        let equality = true;
        const cells = document.getElementsByClassName('cell');
    
        for (const cell of cells) {
            if (!cell.classList.contains('enemy-cell') && !cell.classList.contains('played-cell')) {
                equality = false;
            }
        };
    
        return equality;
    }

    checkPlacement(playedCell) {
        let newPlayedCell = playedCell;
        let column = playedCell[7];

        for (let i = 1; i < 7; i++) {
            if (!$(`#cell-${i}-${column}`)[0].classList.contains('played-cell') && !$(`#cell-${i}-${column}`)[0].classList.contains('enemy-cell')) {
                newPlayedCell = `#cell-${i}-${column}`.substr(1);
                i = 10;
            }
        }

        return newPlayedCell;
    }
    
    calculWin(playedCell, classname) {
        const row = playedCell[5];
        const column = playedCell[7];

        let serie = 0;
        let arrayElement = [];
    
        // VERTICAL
    
        for (let i = 1; i < 7; i++) {
            if ($(`#cell-${i}-${column}`)[0].classList.contains(classname)) {
                serie++;
                arrayElement.push(`#cell-${i}-${column}`);
            } else if (serie < 4) {
                serie = 0;
                arrayElement = [];
            }
        }

        // console.log(serie)
    
        if (serie >= 4) {
            arrayElement.forEach(element => {
                $(element).addClass("win-cell");
            });
    
            return true;
        }
    
        // HORIZONTAL
    
        serie = 0;
        arrayElement = [];

        for (let i = 1; i < 8; i++) {
            if ($(`#cell-${row}-${i}`)[0].classList.contains(classname)) {
                serie++;
                arrayElement.push(`#cell-${row}-${i}`);
            } else if (serie < 4) {
                serie = 0;
                arrayElement = [];
            }
        }
    
        if (serie >= 4) {
            arrayElement.forEach(element => {
                $(element).addClass("win-cell");
            });
    
            return true;
        }
    
        // DIAGONAL
    
        serie = 0;
        arrayElement = [];

        let calcul = 0;
        let newRow = Number(row);
        let newColumn = Number(column);
        
        if (newColumn > newRow) {
            calcul = newRow - 1;
            newRow = newRow - calcul;
            newColumn = newColumn - calcul;

        } else if (newColumn < newRow) {
            calcul = newColumn - 1;
            newRow = newRow - calcul;
            newColumn = newColumn - calcul;

        } else {
            newRow = 1;
            newColumn = 1;
        }

        for (let i = 1; i < 8; i++) {
            if (newRow < 7 && newRow > 0 && newColumn < 8 && newColumn > 0) {
                if ($(`#cell-${newRow}-${newColumn}`)[0].classList.contains(classname)) {
                    serie++;
                    arrayElement.push(`#cell-${newRow}-${newColumn}`);
                } else if (serie < 4) {
                    serie = 0;
                    arrayElement = [];
                }
            }
            newRow++;
            newColumn++;
        }
    
        if (serie >= 4) {
            arrayElement.forEach(element => {
                $(element).addClass("win-cell");
            });
    
            return true;
        }

        serie = 0;
        calcul = 7 - Number(column);
        newRow = Number(row) - calcul;
        newColumn = Number(column) + calcul;

        for (let i = 1; i < 8; i++) {
            if (newRow < 7 && newRow > 0 && newColumn < 8 && newColumn > 0) {
                if ($(`#cell-${newRow}-${newColumn}`)[0].classList.contains(classname)) {
                    serie++;
                    arrayElement.push(`#cell-${newRow}-${newColumn}`);
                } else if (serie < 4) {
                    serie = 0;
                    arrayElement = [];
                }
            }
            newRow++;
            newColumn--;
        }
    
        if (serie >= 4) {
            arrayElement.forEach(element => {
                $(element).addClass("win-cell");
            });
    
            return true;
        }
    }

    setGameText(message, classToAdd = false, classToRemove = false) {
        this.display.elementGameInfo.textContent = message;
    
        if (classToAdd) {
            classToAdd.forEach(classname => {
                this.display.elementGameInfo.classList.add(classname);
            });
        }
    
        if (classToRemove) {
            classToRemove.forEach(classname => {
                this.display.elementGameInfo.classList.remove(classname);
            });
        }
    }

    getEnemyName(players, socketId) {
        return players.find(player => player.socketId != socketId).username;
    }

    joinRoom(event) {
        if (this.display.elementUsernameInput.value !== "") {
            this.player.username = this.display.elementUsernameInput.value;
            this.player.socketId = this.socket.id;
            this.player.roomId = event.currentTarget.dataset.room;
    
            this.socket.emit('puissance4-playerData', this.player);
    
            this.display.elementWaitingGame.classList.add('hidden');
            this.display.elementGame.classList.remove('hidden');
        }
    }

    restartGame(players = null) {
        if (this.player.host && !players) {
            socket.emit('puissance4-restart', this.player.roomId);
    
            this.display.elementGameRestart.classList.add('hidden');
        } else if (this.player.host && players) {
            this.startGame(players);
            return;
        }
    
        const cells = document.getElementsByClassName('cell');
    
        for (const cell of cells) {
            cell.classList.remove('win-cell', 'enemy-cell', 'played-cell');
        }
    
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

    checkRoomUrl() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const roomId = urlParams.get('room');

        if (roomId) {
            this.urlRoomId = roomId;
            this.display.elementJoinRoom.textContent = "Rejoindre";
        }
    }

    createClientGame() {
        this.checkRoomUrl();

        this.socket.on('puissance4-list', (rooms) => {
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

        this.socket.on('puissance4-disconnectPlayer', (playerTarget) => {
            if (playerTarget.socketId == this.player.socketId) {
                document.location.href="/"; 
            }
        })

        this.socket.on('puissance4-message', (message) => {
            const elementMessage = document.createElement('li');
            elementMessage.textContent = message;
            this.display.elementChatMessage.appendChild(elementMessage);
        })

        this.socket.on('puissance4-start', (players) => {
            this.startGame(players);
        });

        this.socket.on('puissance4-join', (roomId) => {
            this.player.roomId = roomId;
            if (window.location.href.indexOf('room') != -1) {
                this.display.elementLinkShare.innerHTML = 'Partager le lien à un amie : <a href=' + window.location.href + ' target="_blank">' + window.location.href + '</a>';
            } else {
                this.display.elementLinkShare.innerHTML = 'Partager le lien à un amie : <a href=' + window.location.href + "?room=" + this.player.roomId + ' target="_blank">' + window.location.href + '?room=' + this.player.roomId + '</a>';
            }
        });

        this.socket.on('puissance4-restart', (players) => {
            this.restartGame(players);
        });

        this.socket.on('puissance4-play', (playerPlayed, players) => {
            const elementPlayerCell = document.getElementById(playerPlayed.playedCell);
            if (playerPlayed.socketId !== this.player.socketId && !playerPlayed.turn) {

                elementPlayerCell.classList.add('enemy-cell');

                if (playerPlayed.win) {
                    this.setGameText("C'est perdu ! " + this.getEnemyName(players, this.player.socketId) + " à gagnée la partie !", ["red"], ["orange", "green"]);
                    this.calculWin(playerPlayed.playedCell, 'enemy-cell');

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
            const elementTarget = event.currentTarget;
            const playedCell = elementTarget.getAttribute('id');
        
            if (!elementTarget.classList.contains('enemy-cell') && !elementTarget.classList.contains('played-cell') && this.player.turn) {
                this.player.playedCell = this.checkPlacement(playedCell);

                const newElementTarget = document.getElementById(this.player.playedCell);

                newElementTarget.classList.add('played-cell');
        
                this.player.win = this.calculWin(this.player.playedCell, 'played-cell');
                this.player.turn = false;
        
                socket.emit('puissance4-play', this.player);
            }
        });

        $("#chat-send").on('click', () => {
            const message = this.player.username + ": " + this.display.elementChatText.value;
            this.display.elementChatText.textContent = "";
            socket.emit('puissance4-message', message, this.player.roomId);
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
        
            socket.emit('puissance4-playerData', this.player);
        });

        this.socket.emit('puissance4-list');

        setInterval(() => {
            this.socket.emit('puissance4-list');
        }, 10000);
    }
}

const socket = io();

const App_Puissance4 = new Puissance4(socket);
App_Puissance4.createClientGame();