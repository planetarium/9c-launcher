import {gameRunningAtom} from '@/store/game';
import {atom, useAtom} from 'jotai';
import {useEffect, useMemo, useState} from 'react';

export function GameStartButton() {
  // State for button text and whether it is disabled
  const [isGameRunning, setIsGameRunning] = useAtom(gameRunningAtom);

  useMemo(() => {
    // Listen for 'game-state' updates from the main process
    window.game.gameState((running: boolean) => {
      console.log(running);
      setIsGameRunning(running);
    });
  }, [setIsGameRunning]);

  const handleButtonClick = () => {
    window.game.startGame();
  };

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      disabled={isGameRunning}
      className="px-5 py-3 text-base font-medium text-center inline-flex items-center text-black bg-yellow-400 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
    >
      {isGameRunning ? 'Stop Game' : 'Start Game'}
    </button>
  );
}
