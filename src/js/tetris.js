/**
 * Created by jcollier on 4/6/16.
 */
$(function () {
    var renderer = PIXI.autoDetectRenderer(400, 720, {backgroundColor : 0x1099bb}),
        stage = new PIXI.Container();

    document.body.appendChild(renderer.view);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(stage);
    }

    function drawBlock(x,y,type) {
        var graphics = new PIXI.Graphics(),
            hexColor = 0xFFFFFF;
        if (type === "t") {
            hexColor = 0x663399;
        } else if (type === "o") {
            hexColor = 0xFFFF00;
        } else if (type === "i") {
            hexColor = 0x40e0d0;
        } else if (type === "l") {
            hexColor = 0xffa500;
        } else if (type === "j") {
            hexColor = 0x0000FF;
        } else if (type === "s") {
            hexColor = 0x00FF00;
        } else if (type === "z") {
            hexColor = 0xFF0000;
        } else if (type === "background") {
            hexColor = 0xbbbbbb;
        }
        graphics.beginFill(hexColor);
        var topLeftX = y * 40,
            topLeftY = x * 40;
        graphics.drawRect(topLeftX, topLeftY, 40, 40);
        stage.addChild(graphics);
    }

    function drawBlocks(slots) {
        stage.removeChildren();
        for (var i = 0; i < slots.length; i++) {
            for (var j = 0; j < slots[i].length; j++) {
                if (slots[i][j].getSlottedBlock() !== null) {
                    drawBlock(i, j, slots[i][j].getSlottedBlock().getColor());
                } else {
                    drawBlock(i, j, "background");
                }
            }
        }
    }

    function randomizePieceType() {
        var rand = Math.floor((Math.random() * 7) + 1);
        if (rand === 1) {
            // T
            game.putBlock(0,3,new Block("t"));
            game.putBlock(0,4,new Block("t"));
            game.putBlock(0,5,new Block("t"));
            game.putBlock(1,4,new Block("t"));
        } else if (rand === 2) {
            // O
            game.putBlock(0,4,new Block("o"));
            game.putBlock(0,5,new Block("o"));
            game.putBlock(1,4,new Block("o"));
            game.putBlock(1,5,new Block("o"));
        } else if (rand === 3) {
            // L
            game.putBlock(1,3,new Block("l"));
            game.putBlock(1,4,new Block("l"));
            game.putBlock(1,5,new Block("l"));
            game.putBlock(0,5,new Block("l"));
        } else if (rand === 4) {
            // J
            game.putBlock(0,3,new Block("j"));
            game.putBlock(1,3,new Block("j"));
            game.putBlock(1,4,new Block("j"));
            game.putBlock(1,5,new Block("j"));
        } else if (rand === 5) {
            // S
            game.putBlock(0,4,new Block("s"));
            game.putBlock(0,5,new Block("s"));
            game.putBlock(1,4,new Block("s"));
            game.putBlock(1,3,new Block("s"));
        } else if (rand === 6) {
            // Z
            game.putBlock(0,3,new Block("z"));
            game.putBlock(0,4,new Block("z"));
            game.putBlock(1,4,new Block("z"));
            game.putBlock(1,5,new Block("z"));
        } else if (rand === 7) {
            // I
            game.putBlock(0,3,new Block("i"));
            game.putBlock(0,4,new Block("i"));
            game.putBlock(0,5,new Block("i"));
            game.putBlock(0,6,new Block("i"));
        }
        game.createNewPiece();

    }

    var clockSpeed = 800;
    function clockTick() {

        //increase game speed
        if (clockSpeed > 100) {
            clockSpeed -= clockSpeed/100
        }

        if (!game.checkActive()) {
            // set all blocks as inactive
            game.setAllBlocksInactive();
            // break rows if possible
            game.checkAllRows();
            // spawn new piece
            randomizePieceType();
        } else {
            game.moveActive();
        }
        drawBlocks(game.getSlots());
        if (!game.isGameover) {
            setTimeout(clockTick, clockSpeed);
        } else {
            alert("GAME OVER!");
        }
    }

    var game = new GameBoard(drawBlocks);
    randomizePieceType();

    drawBlocks(game.getSlots());

    $(window).keydown(function(event) {
        console.log(event.which);
        if (event.which === 37) {
            // move left
            game.tryMoveLeft();
        } else if (event.which === 39) {
            // move right
            game.tryMoveRight();
        } else if (event.which === 38) {
            // move up
            game.rotateLeft();
        } else if (event.which === 40) {
            // move down
            game.rotateRight();
        }
    });

    animate();
    setTimeout(clockTick, 100);
});

class Block {
    constructor(type) {
        this.active = true;
        this.type = type;
    }
    getType() {
        return this.type;
    }
    getColor() {
        return this.type;
    }
    setActive(active) {
        this.active = active;
    }
    isActive() {
        return this.active;
    }
}

class Slot {
    constructor() {
        this.block = null;
    }

    isSlotted() {
        if (this.block !== null) {
            return true;
        } else {
            return false;
        }
    }

    getSlottedBlock() {
        return this.block;
    }

    setSlottedBlock(block) {
        this.block = block;
    }
}

class GameBoard {
    constructor(drawBlocks) {
        this.slots = new Array(18);
        for (var i = 0; i < this.slots.length; i++) {
            this.slots[i] = new Array(10);
            for (var j = 0; j < this.slots[i].length; j++) {
                this.slots[i][j] = new Slot();
            }
        }
        this.isGameover = false;
        this.activeCenterX = 0;
        this.activeCenterY = 0;
        this.rotation = 0;
        this.drawBlocks = drawBlocks;
    }

    createNewPiece() {
        this.activeCenterX = 0;
        this.activeCenterY = 4;
        this.rotation = 0;
    }

    tryMoveRight() {
        var currentBlock,
            nextBlock,
            isMovable = true;
        for (var i = 0; i < this.slots.length; i++) {
            for (var j = 0; j < this.slots[i].length; j++) {
                currentBlock = this.slots[i][j].getSlottedBlock();
                if (currentBlock !== null && currentBlock.isActive()) {
                    if (j < 9) {
                        nextBlock = this.slots[i][j+1].getSlottedBlock();
                        if (nextBlock !== null && !nextBlock.isActive()) {
                            isMovable = false;
                        } else {
                            //good
                        }
                    } else {
                        isMovable = false;
                    }
                }
            }
        }
        if (isMovable) {
            for (var i = 0; i < this.slots.length-1; i++) {
                for (var j = this.slots[i].length-1; j >= 0; j--) {
                    currentBlock = this.slots[i][j].getSlottedBlock();
                    if (currentBlock !== null && currentBlock.isActive()) {
                        this.moveBlock(i,j, i, j+1);
                        this.activeCenterY++;
                    }
                }
            }
        }
        this.drawBlocks(this.slots);
    }

    tryMoveLeft() {
        var currentBlock,
            nextBlock,
            isMovable = true;
        for (var i = 0; i < this.slots.length; i++) {
            for (var j = 0; j < this.slots[i].length; j++) {
                currentBlock = this.slots[i][j].getSlottedBlock();
                if (currentBlock !== null && currentBlock.isActive()) {
                    if (j > 0) {
                        nextBlock = this.slots[i][j-1].getSlottedBlock();
                        if (nextBlock !== null && !nextBlock.isActive()) {
                            isMovable = false;
                        } else {
                            //good
                        }
                    } else {
                        isMovable = false;
                    }
                }
            }
        }
        if (isMovable) {
            for (var i = 0; i < this.slots.length; i++) {
                for (var j = 0; j < this.slots[i].length; j++) {
                    currentBlock = this.slots[i][j].getSlottedBlock();
                    if (currentBlock !== null && currentBlock.isActive()) {
                        this.moveBlock(i,j, i, j-1);
                        this.activeCenterY--;
                    }
                }
            }
        }
        this.drawBlocks(this.slots);
    }

    getActivePieceType() {
        for (var i = 0; i < this.slots.length; i++) {
            for (var j = 0; j < this.slots[i].length; j++) {
                if (this.slots[i][j].getSlottedBlock() !== null) {
                    if (this.slots[i][j].getSlottedBlock().isActive()) {
                        return this.slots[i][j].getSlottedBlock().getType();
                    }
                }
            }
        }
        return "o";
    }

    normalizeRotation() {
        if (this.rotation === 4) {
            this.rotation = 0;
        } else if (this.rotation === -1) {
            this.rotation = 3;
        }
    }

    rotateLeft() {
        if (this.activeCenterY === 9 || this.activeCenterY === 0) {
            return;
        }

        var pieceType = this.getActivePieceType();
        if (pieceType === "o") {
            return;
        }

        if (pieceType === "l") {

        } else if (pieceType === "j") {

        } else if (pieceType === "i") {
            var currentBlock;
            for (var i = this.slots.length-1; i >= 0; i--) {
                for (var j = this.slots[i].length-1; j >= 0; j--) {
                    currentBlock = this.slots[i][j].getSlottedBlock();
                    if (currentBlock !== null && currentBlock.isActive()) {
                        this.slots[i][j].setSlottedBlock(null);
                    }
                }
            }
            if (this.rotation === 0 || this.rotation == 2) {
                this.putBlock(this.activeCenterX-2,this.activeCenterY,new Block("i"));
                this.putBlock(this.activeCenterX-1,this.activeCenterY,new Block("i"));
                this.putBlock(this.activeCenterX,this.activeCenterY,new Block("i"));
                this.putBlock(this.activeCenterX+1,this.activeCenterY,new Block("i"));
            } else {
                this.putBlock(this.activeCenterX,this.activeCenterY-2,new Block("i"));
                this.putBlock(this.activeCenterX,this.activeCenterY-1,new Block("i"));
                this.putBlock(this.activeCenterX,this.activeCenterY,new Block("i"));
                this.putBlock(this.activeCenterX,this.activeCenterY+1,new Block("i"));
            }
            this.rotation--;
            this.normalizeRotation();

        } else if (pieceType === "t") {

        } else if (pieceType === "s") {

        } else if (pieceType === "z") {

        }
        // replace piece with rotation
        this.drawBlocks(this.slots);

    }

    rotateRight() {
        if (this.checkActive()) {
            this.moveActive();
        }
        this.drawBlocks(this.slots);
    }

    checkActive() {
        var currentBlock,
            nextBlock,
            isMovable = true;
        for (var i = 0; i < this.slots.length; i++) {
            for (var j = 0; j < this.slots[i].length; j++) {
                currentBlock = this.slots[i][j].getSlottedBlock();
                if (currentBlock !== null && currentBlock.isActive()) {
                    if (i !== 17) {
                        nextBlock = this.slots[i+1][j].getSlottedBlock();
                        if (nextBlock !== null && !nextBlock.isActive()) {
                            isMovable = false;
                        } else {
                            //good
                        }
                    } else {
                        isMovable = false;
                    }
                }
            }
        }

        if (!isMovable) {
            // piece needs to freeze
            return false;
        } else {
            // move all active down
            return true;
        }
    }

    rangeCheckX(x) {
        if (x >= 0 && x <=17) {
            return true;
        } else {
            return false;
        }
    }

    rangeCheckY(y) {
        if (y >= 0 && y <=9) {
            return true;
        } else {
            return false;
        }
    }

    rangeCheck(x,y) {
        if (this.rangeCheckX(x) && this.rangeCheckY(y)) {
            return true;
        } else {
            return false;
        }
    }

    putBlock(x, y, block) {
        if (!this.rangeCheck(x,y)) {return;}
        if (this.slots[x][y].isSlotted()) {
            this.isGameover = true;
        }
        this.slots[x][y].setSlottedBlock(block);
    }

    moveBlock(srcX, srcY, destX, destY) {
        var srcSlot = this.slots[srcX][srcY];
        var srcBlock = srcSlot.getSlottedBlock();
        var destSlot = this.slots[destX][destY];
        var destBlock = destSlot.getSlottedBlock();
        if (destBlock === null) {
            // good state, perform the move
            destSlot.setSlottedBlock(srcBlock);
            srcSlot.setSlottedBlock(null);
        } else {
            console.log("dest: (" + destX + ", " + destY + ") already occupied...");
        }
    }

    moveActive() {
        var currentBlock;
        for (var i = this.slots.length-1; i >= 0; i--) {
            for (var j = this.slots[i].length-1; j >= 0; j--) {
                currentBlock = this.slots[i][j].getSlottedBlock();
                if (currentBlock !== null && currentBlock.isActive()) {
                    this.moveBlock(i,j, i+1,j);
                }
            }
        }
        this.activeCenterX++;
    }

    moveRowsDown(rowIndex) {
        for (var i = rowIndex; i >= 0; i--) {
            for (var j = 0; j < 10; j++) {
                if (i === 17) {
                    this.putBlock(i,j, null);
                } else if (i === 0) {
                    this.moveBlock(i,j, i+1,j);
                    this.putBlock(i,j, null);
                } else {
                    this.moveBlock(i,j, i+1,j);
                }
            }
        }
        this.activeCenterX++;
    }

    breakRow(rowIndex) {
        for (var i = 0; i < this.slots[rowIndex].length; i++) {
            this.slots[rowIndex][i].setSlottedBlock(null);
        }
        this.moveRowsDown(rowIndex);
    }

    checkRow(index) {
        for (var i = 0; i < this.slots[index].length; i++) {
            if (!this.slots[index][i].isSlotted()) {
                return false;
            }
        }
        return true;
    }

    checkAllRows() {
        for (var i = 0; i < this.slots.length; i++) {
            if (this.checkRow(i)) {
                this.breakRow(i);
            }
        }
    }

    debugGameBoardState() {
        var debugString = "";
        for (var i = 0; i < this.slots.length; i++) {
            debugString += "row " + i + ": ";
            for (var j = 0; j < this.slots[i].length; j++) {
                debugString += "[" + j + ":" + this.slots[i][j].isSlotted() + "] ";
            }
            console.log(debugString);
            debugString = "";
        }
    }

    getSlots() {
        return this.slots;
    }

    setAllBlocksInactive() {
        for (var i = 0; i < this.slots.length; i++) {
            for (var j = 0; j < this.slots[i].length; j++) {
                if (this.slots[i][j].getSlottedBlock() !== null) {
                    this.slots[i][j].getSlottedBlock().setActive(false);
                }
            }
        }
    }
}

































