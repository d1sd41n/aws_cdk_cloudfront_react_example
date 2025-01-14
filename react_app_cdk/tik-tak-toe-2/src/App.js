import { useState, useEffect } from 'react';

function Square({ value, onClick }) {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
}

function Board({ squares, onSquareClick, status }) {
  const renderSquare = (i) => (
    <Square value={squares[i]} onClick={() => onSquareClick(i)} />
  );

  return (
    <div>
      <div className="status">{status}</div>
      <div className="board-row">
        {renderSquare(0)} {renderSquare(1)} {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)} {renderSquare(4)} {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)} {renderSquare(7)} {renderSquare(8)}
      </div>
    </div>
  );
}

function Menu({ onSelectMode }) {
  return (
    <div className="menu">
      <h1>Choose Game Mode</h1>
      <button onClick={() => onSelectMode('player')}>Play vs Player</button>
      <button onClick={() => onSelectMode('ai')}>Play vs AI</button>
    </div>
  );
}

function InfoPanel({ imageUrl, text }) {
  return (
    <div className="info-panel">
      <img src={imageUrl} alt="Information" style={{ width: '150px', height: '150px' }} />
      <p>{text}</p>
    </div>
  );
}

function Game() {
  const [mode, setMode] = useState(null); // 'player' o 'ai'
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAITurn, setIsAITurn] = useState(false);

  // squares actuales e indicador de si X es el siguiente
  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  // ------------------------------------------------------------------------------
  // 1. Manejador para actualizar el historial y el movimiento actual
  // ------------------------------------------------------------------------------
  const handlePlay = (nextSquares) => {
    const newHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(newHistory);
    setCurrentMove(newHistory.length - 1);
  };

  // ------------------------------------------------------------------------------
  // 2. Saltar a un movimiento anterior
  // ------------------------------------------------------------------------------
  const jumpTo = (move) => {
    setCurrentMove(move);
    setIsAITurn(false);
  };

  // ------------------------------------------------------------------------------
  // 3. El click del jugador en un cuadrado
  //    -> AQUÍ YA NO HACEMOS NADA RELACIONADO CON LA IA
  // ------------------------------------------------------------------------------
  const handleSquareClick = (i) => {
    // Si hay ganador, la casilla está ocupada, o es turno de la IA (deshabilitamos)
    if (calculateWinner(currentSquares) || currentSquares[i] || isAITurn) return;

    const nextSquares = currentSquares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    handlePlay(nextSquares);
  };

  // ------------------------------------------------------------------------------
  // 4. useEffect que detecta "si le toca a la IA" y ejecuta su jugada.
  //    Se lanza cada vez que renderiza el componente y cambian 
  //    [mode, xIsNext, currentSquares, currentMove].
  // ------------------------------------------------------------------------------
  useEffect(() => {
    // 4.1. Validamos si:
    //    - Estamos en modo 'ai'
    //    - Es turno de O (IA)
    //    - No hay un ganador
    // ----------------------------------------------------------------------------
    if (mode === 'ai' && !xIsNext && !calculateWinner(currentSquares)) {
      setIsAITurn(true);
      const timerId = setTimeout(() => {
        const aiMove = getBestMove(currentSquares);
        if (aiMove !== null) {
          const nextSquares = currentSquares.slice();
          nextSquares[aiMove] = 'O';
          handlePlay(nextSquares);
        }
        setIsAITurn(false);
      }, 500);

      // Limpieza del setTimeout
      return () => clearTimeout(timerId);
    }
    // Si no es el turno de la IA, aseguramos que isAITurn sea falso.
    setIsAITurn(false);
  }, [mode, xIsNext, currentSquares, currentMove]);

  // ------------------------------------------------------------------------------
  // 5. Renderizado de los movimientos
  // ------------------------------------------------------------------------------
  const moves = history.map((_, move) => (
    <li key={move}>
      <button onClick={() => jumpTo(move)}>
        {move > 0 ? `Go to move #${move}` : 'Go to game start'}
      </button>
    </li>
  ));

  // ------------------------------------------------------------------------------
  // 6. Calcular el estado del juego
  // ------------------------------------------------------------------------------
  const winner = calculateWinner(currentSquares);
  const status = winner
    ? `Winner: ${winner}`
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  // ------------------------------------------------------------------------------
  // 7. Si el usuario no ha elegido modo, mostramos el menú
  // ------------------------------------------------------------------------------
  if (!mode) return <Menu onSelectMode={setMode} />;

  return (
    <div className="game">
      <InfoPanel
        imageUrl="https://images.pexels.com/photos/1040416/pexels-photo-1040416.jpeg?auto=compress&cs=tinysrgb&w=1000&h=500&dpr=1"
        text=""
      />
      <div className="game-board">
        <Board
          squares={currentSquares}
          onSquareClick={handleSquareClick}
          status={status}
        />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------
// Funciones de utilidad
// ------------------------------------------------------------------------------

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// Sencillamente la IA elige la primera casilla vacía
function getBestMove(squares) {
  return squares.findIndex((square) => square === null);
}

export default Game;
