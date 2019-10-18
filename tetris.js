const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");


const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "#272821";

//DESENHO O QUADRADO
function drawSquadre(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    ctx.strokeStyle = "WHITE";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

//drawSquadre(0,0,"red");
//CRIANDO BOARD/BORDA
let board = [];
for (r = 0; r < ROW; r++) {
    board[r] = [];
    for (c = 0; c < COL; c++) {
        board[r][c] = VACANT;
    }
}
//DESENHANDO BORDA
function drawBoard() {
    for (r = 0; r < ROW; r++) {
        for (c = 0; c < COL; c++) {
            drawSquadre(c, r, board[r][c]);
        }
    }
}
drawBoard();
//CORES DAS PEÇAS
const PIECES = [
    [Z, "red"],
    [S, "chartreuse"],
    [T, "yellow"],
    [O, "darkturquoise"],
    [L, "purple"],
    [I, "deeppink"],
    [J, "orange"]
];

//INICIANDO UMA PEÇA
//CRIANDO PEÇAS ALEATÓRIAS
function randomPiece() {
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();


//A PEÇA DO OBJETO
function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0;//COMEÇANDO COM PADRÃO DE PISTAS
    this.activeTetromino = this.tetromino[this.tetrominoN];

    /// CONTROLE DAS PEÇAS
    this.x = 3;
    this.y = -2;
}

// PREENCHIMENTO
Piece.prototype.fill = function (color) {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            //WE DRAW ONLY OCCUPIED SQUARES
            if (this.activeTetromino[r][c]) {
                drawSquadre(this.x + c, this.y + r, color);
            }
        }
    }
}

//DESENHANDO UMA PEÇA NO QUADRO
Piece.prototype.draw = function () {
    this.fill(this.color);
}

// REMOVE DESENHO DA PEÇA
Piece.prototype.unDraw = function () {
    this.fill(VACANT);
}

//MOVER A PEÇA PARA BAIXO

Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        // BLOQUEIA A PEÇA E GERA UMA NOVA
        this.lock();
        p = randomPiece();
    }

}

// MOVER PEÇA PARA DIREITA
Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// MOVER PEÇA PARA ESQUERDA
Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}
//GIRAR A PEÇA
Piece.prototype.rotate = function () {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;
    if (this.collision(0, 0, nextPattern)) {
        if (this.x > COL / 2) {
            //PAREDE A DIREITA
            kick = -1;// PRECISAMOS DEIXAR A PEÇA PARA A ESQUERDA
        } else {
            //PAREDE A ESQUERDA
            kick = 1;//// PRECISAMOS DEIXAR A PEÇA PARA A DIRETA
        }
    }

    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;


Piece.prototype.lock = function () {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            // PULANDO QUADROS VAZIOS
            if (!this.activeTetromino[r][c]) {
                continue;
            }
            // PEÇA TOCAM O TOP=GAMEOVER
            if (this.y + r < 0) {
                alert("Game Over");
                // PARA O [animation frame]
                gameOver = true;
                break;
            }
            // TRANCANDO A PEÇA
            board[this.y + r][this.x + c] = this.color;
        }
    }
    //ELIMINA TODA LINHA 
    for (r = 0; r < ROW; r++) {
        let isRowfull = true;
        for (c = 0; c < COL; c++) {
            isRowfull = isRowfull && (board[r][c] != VACANT);
        }
        if(isRowfull){
            //SE LINHA ESTÁ CHEIA
            //ABAIXAMOS TODAS AS LINHAS ACIMA
            for(y = r;y>1;y--){
                for (c = 0; c < COL; c++) {
                    board[y][c]=board[y-1][c];
                }
            }
            // O TOPO, ROW BOARD [0] [..] NÃO TEM LINHA ACIMA
            for (c = 0; c < COL; c++) {
                board[0][c]= VACANT;
            }
            //ADICONANDO PONTUÇÃO
            score +=10;
        }
    }
    //ATULIZA O QUADRO
    drawBoard();

    //ATULIZA PONTUAÇÃO
    scoreElement.innerHTML = score;
}
//FUNÇÃO DE COLISÃO
Piece.prototype.collision = function (x, y, piece) {
    for (r = 0; r < piece.length; r++) {
        for (c = 0; c < piece.length; c++) {
            // SE O QUADRADO ESTÁ VAZIO, PULAMOS
            if (!piece[r][c]) {
                continue;
            }
          // COORDENADAS DA PEÇA DEPOIS DO MOVIMENTO
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            //CONDITIONS
            if (newX < 0 || newX >= COL || newY >= ROW) {
                return true;
            }
            //SALTE NEWY <0;BOARD[-1] ESMAGARÁ SEU JOGO
            if (newY < 0) {
                continue;
            }
            // VERIFIQUE SE EXISTE UMA PEÇA BLOQUEADA NO LOCAL
            if (board[newY][newX] != VACANT) {
                return true
            }
        }
    }
    return false;
}

//CONTROLE DAS PEÇA DO JOGO
document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
    if (event.keyCode == 37) {
        p.moveLeft();
        dropStart = Date.now();
    } else if (event.keyCode == 38) {
        p.rotate();
        dropStart = Date.now();
    } else if (event.keyCode == 39) {
        p.moveRight();
        dropStart = Date.now();
    } else if (event.keyCode == 40) {
        p.moveDown();
    }
}
//PEÇA CAI A CADA 1SEC
let dropStart = Date.now();
let gameOver = false;
function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if (delta > 1000)//1000 = 1s
    {
        p.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(drop);
    }

}
drop();