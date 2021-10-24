const elementGames = document.querySelectorAll('.games');

elementGames.forEach(game => {
    game.addEventListener('click', function() {
        document.location.href="/" + this.dataset.game; 
    })
});