function GameController () {

    this.stats = {
        crimesSolved: 0,
        gamesPlayed: 0,
        attempts: 0,
        accuracy: 0,
    };

    //More complicated than the other stats, and is done for every registered event, so it's a separate method
    this.calculateAccuracy = () => {
        let result = 100 * (this.stats.crimesSolved / this.stats.attempts).toFixed(2);
            if( isNaN(result)) {
                result = 0;
            }
            if(result > 100) {
                result = 100;
            }
            this.stats.accuracy = result;
    }

    //Calculates the player's statistics
    this.calculateStats = (registeredEvent) => {
        switch(registeredEvent){
            case 'crimeSolved':
                this.stats.crimesSolved++;
                this.calculateAccuracy();
                break;
            case 'matchAttempted':
                this.stats.attempts++;
                this.calculateAccuracy();
                break;
            case 'newGameStarted':
                this.stats.crimesSolved = 0;
                this.stats.gamesPlayed++;
                this.stats.attempts = 0;
                this.calculateAccuracy();
                break;
            default:
                return null;
        }
        gameView.showStats(this.stats)
    };

    //Figures out if the cards placed in the room match one of the generated crimes
    this.detectCrime = (roomIndex) => {
        //Defines matched objects from the gameView and finds the room the cards were dropped into and the cards
        let matchedObjects = gameView.matchedObjects;
        let possibleCrime = matchedObjects[roomIndex];

        //Matches the room the cards were dropped into to the room in the generated crime list
        let crimeForThisRoom =  gameModel.crimes.find((crime) => {
           return (crime.room) === possibleCrime.room
        });

        let crimeForThisRoomIndex =  gameModel.crimes.findIndex((crime) => {
            return (crime.room) === possibleCrime.room
         });

        let isCrimeSolved = '';

        //If the suspect, room, and item from the matchedObjects (from the gameView) are the same as those in the crime list, the crime has been solved and the view is notified that the crime is solved and the matching items passed in
        if(( (crimeForThisRoom.suspect === possibleCrime.item1 || crimeForThisRoom.suspect === possibleCrime.item2)) && ((crimeForThisRoom.weapon === possibleCrime.item1 || crimeForThisRoom.weapon === possibleCrime.item2))){
            isCrimeSolved = true;
            console.log('crimeForThisRoomIndex', crimeForThisRoomIndex)
            gameView.flipCards(possibleCrime.item1 , possibleCrime.item2, isCrimeSolved, crimeForThisRoomIndex);

            gameModel.crimesSolvedCounter++;

            if(gameModel.crimesSolvedCounter === 6){
                console.log('all crimes solved', gameModel.crimesSolvedCounter)
                console.log('current stats', this.stats);
                gameView.allCrimesSolved();
            }

            this.calculateStats('crimeSolved')
        }
        //If the crime is not solved, the view is still notified and the items are passed in
        else {
            isCrimeSolved = false;
            gameView.flipCards(possibleCrime.item1 , possibleCrime.item2, isCrimeSolved);

            this.calculateStats('matchAttempted')
        }

    };

    //Generates a new game
    this.startNewGame = () => {
        let suspectArray = ['Mrs_White', 'Professor_Plum', 'Mrs_Peacock', 'Mr_Green', 'Miss_Scarlett', 'Colonel_Mustard'];
        let weaponsArray = ['Revolver', 'Candlestick', 'Knife', 'Lead_Pipe', 'Wrench', 'Rope'];
        let roomsArray = ['Billiard_Room', 'Kitchen', 'Conservatory', 'Ballroom', 'Dining_Room', 'Library'];
        let arrayForCards = ['Mrs_White', 'Professor_Plum', 'Mrs_Peacock', 'Mr_Green', 'Miss_Scarlett', 'Colonel_Mustard', 'Revolver', 'Candlestick', 'Knife', 'Lead_Pipe', 'Wrench', 'Rope'];

        gameView.displayLoadingScreen();

        //So the animation has a chance to start before everything on the screen changes
        setTimeout(() => {
            $('.crime').remove();
        $('.room').remove();
        $('.card').remove();

        gameView.matchedObjects = [
            {room: 'Ballroom', item1: '', item2: ''},
            {room: 'Dining_Room', item1: '', item2: ''},
            {room: 'Library', item1: '', item2: ''},
            {room: 'Conservatory', item1: '', item2: ''},
            {room: 'Billiard_Room', item1: '', item2: ''},
            {room: 'Kitchen', item1: '', item2: ''},
        ];
        gameModel.crimes = [];
        gameModel.randomizedCards = [];

        gameModel.randomizeCards(arrayForCards);
        gameModel.makeCrimes(roomsArray, suspectArray, weaponsArray);
        gameView.displayCrimes(gameModel.crimes);
        gameView.makeCards(gameModel.randomizedCards);
        gameView.makeRooms(gameModel.crimes);

        gameModel.crimesSolvedCounter = 0;

        this.calculateStats('newGameStarted');
        }, 3000 )
    };
}

