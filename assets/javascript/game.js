var game = document.getElementById("game");
var charactersSection;
var playerCharacterSection;
var fightSection;
var defenderSection;

function Character(name, sprite, hp, atk) {
    this.name = name;
    this.sprite = sprite;
    this.hp = hp;
    this.atk = atk;
    this.currentState = "idle";
}

function removeFromArray(array, value) {
    var index = array.indexOf(value);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

var game = {
    selectedCharacter: null,
    selectedEnemy: null,
    characters: [],
    characterDiv: {},
    mainSection: null,
    characterSection: null,
    subSection: null,
    titleSection: null,
    attacking: false,

    imagePath: function (name, state, type = 'gif') {
        return "./assets/images/" + name + "/" + state + "." + type;
    },

    image: function (name, state, type = 'gif') {
        var image = $("<img>");
        image[0].src = this.imagePath(name, state, type);
        image.addClass("pixelated");
        image[0].style.width = "50px";
        image[0].style.height = "50px";
        return image;
    },

    divWithTileCountWithClass(count, className) {
        var div = $("<div>");
        div.addClass("ground");
        div.addClass("clearfix");
        div.addClass("center");
        div[0].style.width = count * 20 + 'px';
        for (var i = 0; i < count; i++) {
            div.append($("<div class='" + className + "'></div>"));
        }
        return div;
    },

    characterDiv(character) {
        var characterDiv = this.characterDiv[character.name];
        if (characterDiv) {
            characterDiv.addClickHandling();
            return characterDiv;
        }

        var div = $("<div>");
        div.addClass("character");
        div.addClass("clearfix");
        div.append("<p id='name'>" + character.name + "</p>");
        var stats = $("<p><h8 id='hp' /> | <h8 id='atk' /></p>");
        div.append(stats);
        // var atk = $("<h8 id='hp'>" + " ATK: " + character.atk + "</h8>");
        // div.append(atk);
        var img = this.image(character.sprite, "idle");
        div.append(img);
        div.append(this.divWithTileCountWithClass(10, "grass-tile"));
        div.append(this.divWithTileCountWithClass(10, "dirt-tile"));

        div.mirror = function (flip) {
            if (!flip && img.hasClass("flip-image")) {
                img.removeClass("flip-image");
            } else if (flip && !img.hasClass("flip-image")) {
                img.addClass("flip-image");
            }
            return div
        };

        div.update = function () {
            console.log("Hi");
            $("#hp", stats).text("HP: " + character.hp);
            $("#atk", stats).text("ATK: " + character.atk);
            return div
        }

        div.addClickHandling = function () {
            div.on("click", function () {
                game.selectCharacter(div, character);
            });
            return div
        }

        div.addClickHandling();
        div.update();
        this.characterDiv[character.name] = div;
        return div;
    },

    clearSections: function () {
        if (this.characterSection) {
            this.characterSection.empty();
        }
        if (this.titleSection) {
            this.titleSection.empty();
        }
        if (this.subSection) {
            this.subSection.empty();
        }
    },

    displayCharactersInSection: function (characters, section) {
        for (var index = 0; index < characters.length; index++) {
            var character = characters[index];
            var div = this.characterDiv(character).mirror(index & 1 > 0);
            section.append(div);
        }
    },

    animateCharacterInDiv: function (character, animation, reset = true) {
        var div = this.characterDiv(character);
        var image = $(".pixelated", div);
        var previousState = character.currentState;
        image.attr('src', this.imagePath(character.sprite, animation));
        if (reset) {
            setTimeout(function () {
                image.attr('src', this.imagePath(character.sprite, previousState));
            }.bind(this), 500);
        };
    },

    displayPlayerVsOpponentInSection: function (section) {
        if (!this.selectedCharacter || !this.selectedEnemy) {
            return;
        }

        $(".title").text("Battle")

        var selectedCharacterDiv = this.characterDiv(this.selectedCharacter).mirror(false);
        section.append(selectedCharacterDiv);
        var attackButton = $("<button id='attack-button' class='btn btn-danger'>Attack</button>");
        section.append(attackButton);
        var selectedEnemyDiv = this.characterDiv(this.selectedEnemy).mirror(true);
        section.append(selectedEnemyDiv);

        attackButton.on("click", function () {
            if (this.attacking) {
                return // Can't attack while already attacking
            }
            this.animateCharacterInDiv(this.selectedCharacter, "attack");
            this.selectedEnemy.hp -= this.selectedCharacter.atk;
            this.selectedCharacter.atk += 20;
            if (this.selectedEnemy.hp <= 0) {
                this.selectedEnemy.hp = 0;
            }
            selectedEnemyDiv.update();
            console.log(this.selectedEnemy.hp);
            console.log(this.selectedCharacter.atk);
            this.attacking = true;
            attackButton.fadeTo("fast", 0.5);
            setTimeout(function () {
                if (this.selectedEnemy.hp <= 0) {
                    this.attacking = false;
                    selectedEnemyDiv.update();
                    if (this.characters.length > 0) {
                        this.setupSelectAnOpponent();
                    } else {
                        this.setupWinScreen();
                    }
                    return;
                }
                this.animateCharacterInDiv(this.selectedEnemy, "attack");
                this.selectedCharacter.hp -= this.selectedEnemy.atk;
                if (this.selectedCharacter.hp <= 0) {
                    this.selectedCharacter.hp = 0;
                }
                selectedCharacterDiv.update();
                setTimeout(function () {
                    if (this.selectedCharacter.hp <= 0) {
                        this.setupLoseScreen();
                    }
                    attackButton.fadeTo("fast", 1.0);
                    this.attacking = false;
                }.bind(this), 500)
            }.bind(this), 500)
        }.bind(this));
    },

    setupSelectAnOpponent: function () {
        this.clearSections();
        this.selectedEnemy = null;
        $(".title").text("Select an Opponent");
        this.displayCharactersInSection(this.characters, this.characterSection);
    },

    setupWinScreen: function () {
        this.clearSections();
        this.selectedEnemy = null;
        $(".title").text("You win!");
        this.displayCharactersInSection([this.selectedCharacter], this.characterSection);
        this.animateCharacterInDiv(this.selectedCharacter, "victory", false);
        this.addNewGameButton()
    },

    setupLoseScreen: function () {
        this.clearSections();
        this.selectedEnemy = null;
        $(".title").text("You Lose!");
        this.displayCharactersInSection([this.selectedCharacter], this.characterSection);
        this.animateCharacterInDiv(this.selectedCharacter, "lose", false);
        this.addNewGameButton()
    },

    addNewGameButton() {
        var reloadButton = $("<button class='btn btn-info mx-auto'>New Game</button>");
        this.subSection.append(reloadButton);
        reloadButton.on("click", function () {
            window.location.reload();
        });
    },

    newGame: function () {
        if (!this.mainSection) {
            console.log("Error: Need to set main characterSection");
            return;
        }

        this.mainSection.empty()

        this.characters = [
            new Character("Mage", "mage", 100, 30),
            new Character("Slime", "slime", 100, 5),
            new Character("Goblin", "goblin", 100, 20),
            new Character("Mummy", "mummy", 100, 10)
        ];

        this.titleSection = $("<h1 class='title'>Select a Character</h1>");
        this.mainSection.append(this.titleSection)

        this.characterSection = $("<div class='center'></div>");
        this.characterSection.addClass("clearfix");
        this.mainSection.append(this.characterSection)

        this.subSection = $("<div class='center mt-5'></div>");
        this.mainSection.append(this.subSection)

        this.displayCharactersInSection(this.characters, this.characterSection);
    },

    selectCharacter: function (div, selectedCharacter) {
        if (this.selectedCharacter == null) {
            this.selectPlayer(selectedCharacter);
            this.setupSelectAnOpponent();
            return
        } else if (this.selectedEnemy == null && this.characters.length > 0) {
            this.selectEnemy(selectedCharacter);
            this.displayPlayerVsOpponentInSection(this.characterSection)
        }
    },

    selectPlayer: function (selectedCharacter) {
        this.selectedCharacter = selectedCharacter;
        removeFromArray(this.characters, selectedCharacter);
        this.clearSections();
    },

    selectEnemy: function (selectedCharacter) {
        this.selectedEnemy = selectedCharacter;
        removeFromArray(this.characters, selectedCharacter);
        this.clearSections();
    }

};

window.onload = function (event) {
    console.log("window.onload");
    game.mainSection = $("#game");
    game.newGame()
}