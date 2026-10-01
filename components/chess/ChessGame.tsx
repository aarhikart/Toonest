'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { ChessClock } from './ChessClock';
import { MoveHistory } from './MoveHistory';
import { PromotionModal } from './PromotionModal';
import { GameResultModal } from './GameResultModal';
import { DrawOfferModal } from './DrawOfferModal';
import { chessAudio } from './ChessAudio';
import { getBestBotMove } from '@/lib/chess/botEngine';
import {
  ChessColor,
  ChessDifficulty,
  ChessGameDoc,
  ChessMoveRecord,
  LegalMoveTarget,
  GameMode,
} from '@/lib/chess/types';
import {
  RotateCcw,
  Flag,
  Handshake,
  Volume2,
  VolumeX,
  Repeat,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Bot,
  ArrowLeft,
  Users,
  Settings,
} from 'lucide-react';

interface ChessGameProps {
  mode: GameMode;
  // Bot mode props
  botDifficulty?: ChessDifficulty;
  userAssignedColor?: ChessColor;
  onExitToMenu?: () => void;

  // Friend multiplayer props
  gameId?: string;
  playerToken?: string;
  initialMultiplayerGame?: ChessGameDoc | null;
  multiplayerColor?: ChessColor | 'spectator';
  onGameChange?: (game: ChessGameDoc) => void;
}

export function ChessGame({
  mode,
  botDifficulty = 'medium',
  userAssignedColor = 'white',
  onExitToMenu,
  gameId,
  playerToken,
  initialMultiplayerGame,
  multiplayerColor = 'white',
  onGameChange,
}: ChessGameProps) {
  // Authoritative chess instance
  const [chessInstance, setChessInstance] = useState<Chess>(() => {
    if (mode === 'friend' && initialMultiplayerGame?.currentPosition) {
      return new Chess(initialMultiplayerGame.currentPosition);
    }
    return new Chess();
  });

  const chessInstanceRef = useRef(chessInstance);
  chessInstanceRef.current = chessInstance;

  const [boardOrientation, setBoardOrientation] = useState<ChessColor>(
    mode === 'friend' && multiplayerColor === 'black' ? 'black' : userAssignedColor
  );

  // Auto-align board orientation with assigned multiplayer color
  useEffect(() => {
    if (mode === 'friend' && multiplayerColor !== 'spectator') {
      setBoardOrientation(multiplayerColor);
    }
  }, [mode, multiplayerColor]);

  // Robust Player Token lookup (supports props + localStorage persistence)
  const effectivePlayerToken = useMemo(() => {
    if (playerToken) return playerToken;
    if (typeof window !== 'undefined' && gameId) {
      return localStorage.getItem(`chess_token_${gameId}`) || '';
    }
    return '';
  }, [playerToken, gameId]);

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<LegalMoveTarget[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [moveHistory, setMoveHistory] = useState<ChessMoveRecord[]>(
    initialMultiplayerGame?.moveHistory || []
  );

  // Clocks
  const [whiteTimeMs, setWhiteTimeMs] = useState<number>(
    initialMultiplayerGame?.whiteTimeRemaining ?? 600000
  );
  const [blackTimeMs, setBlackTimeMs] = useState<number>(
    initialMultiplayerGame?.blackTimeRemaining ?? 600000
  );

  // Status & Guidance
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [guidanceMessage, setGuidanceMessage] = useState<string>('Select a piece to see legal moves.');
  const [isMuted, setIsMuted] = useState(false);

  // Modals & End Game
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);
  const [gameResult, setGameResult] = useState<{
    isOpen: boolean;
    winner: 'white' | 'black' | 'draw' | null;
    reason: string;
  }>({
    isOpen: false,
    winner: initialMultiplayerGame?.winner || null,
    reason: initialMultiplayerGame?.resultReason || '',
  });

  // Multiplayer specific
  const [multiplayerGame, setMultiplayerGame] = useState<ChessGameDoc | null>(initialMultiplayerGame || null);
  const [isDrawOfferOpen, setIsDrawOfferOpen] = useState(false);
  const [infoToast, setInfoToast] = useState<string | null>(null);

  // Sync state if initialMultiplayerGame prop updates
  useEffect(() => {
    if (initialMultiplayerGame) {
      setMultiplayerGame(initialMultiplayerGame);
      if (initialMultiplayerGame.whiteTimeRemaining !== undefined) {
        setWhiteTimeMs(initialMultiplayerGame.whiteTimeRemaining);
      }
      if (initialMultiplayerGame.blackTimeRemaining !== undefined) {
        setBlackTimeMs(initialMultiplayerGame.blackTimeRemaining);
      }
      if (
        initialMultiplayerGame.currentPosition &&
        initialMultiplayerGame.currentPosition !== chessInstanceRef.current.fen()
      ) {
        try {
          const fresh = new Chess(initialMultiplayerGame.currentPosition);
          setChessInstance(fresh);
          setMoveHistory(initialMultiplayerGame.moveHistory || []);
          const lastRec = initialMultiplayerGame.moveHistory?.[initialMultiplayerGame.moveHistory.length - 1];
          if (lastRec) {
            setLastMove({ from: lastRec.from, to: lastRec.to });
          }
        } catch {}
      }
    }
  }, [initialMultiplayerGame]);

  // Player identity customization (matches screenshot media_1790887741883.png)
  const [customPlayerName, setCustomPlayerName] = useState('hiteshpatidar1020');
  const [customRating, setCustomRating] = useState('188');
  const [customFlag, setCustomFlag] = useState('🇮🇳');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('chess_player_name');
      if (savedName) setCustomPlayerName(savedName);
      const savedRating = localStorage.getItem('chess_player_rating');
      if (savedRating) setCustomRating(savedRating);
      const savedFlag = localStorage.getItem('chess_player_flag');
      if (savedFlag) setCustomFlag(savedFlag);
    }
  }, []);

  const activeTurn = chessInstance.turn(); // 'w' | 'b'
  const isGameOver = chessInstance.isGameOver() || gameResult.isOpen;

  // Real-time Turn Calculation: Both players can move on their authentic turn without deadlock
  const isMyTurn = useMemo(() => {
    if (isGameOver) return false;
    if (mode === 'bot') {
      const userColorCode = userAssignedColor === 'white' ? 'w' : 'b';
      return activeTurn === userColorCode && !isBotThinking;
    }
    if (multiplayerColor === 'spectator') return false;
    const myColorCode = multiplayerColor === 'white' ? 'w' : 'b';
    return activeTurn === myColorCode;
  }, [isGameOver, mode, userAssignedColor, activeTurn, isBotThinking, multiplayerColor]);

  // Highlight square if King is in check
  const kingInCheckSquare = useMemo(() => {
    if (!chessInstance.inCheck()) return null;
    const currentBoard = chessInstance.board();
    const kingColor = chessInstance.turn();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.type === 'k' && piece.color === kingColor) {
          const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
          const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
          return `${files[c]}${ranks[r]}`;
        }
      }
    }
    return null;
  }, [chessInstance]);

  // Audio mute init
  useEffect(() => {
    setIsMuted(chessAudio.getMuted());
  }, []);

  const toggleSound = () => {
    const next = chessAudio.toggleMute();
    setIsMuted(next);
  };

  // Clock countdown interval
  useEffect(() => {
    if (isGameOver || (mode === 'friend' && multiplayerGame?.status !== 'active')) return;
    if (mode === 'friend' && multiplayerGame?.selectedTimeControl === 0) return;

    const interval = setInterval(() => {
      if (activeTurn === 'w') {
        setWhiteTimeMs((prev) => {
          if (prev <= 1000) {
            handleTimeout('white');
            return 0;
          }
          return prev - 1000;
        });
      } else {
        setBlackTimeMs((prev) => {
          if (prev <= 1000) {
            handleTimeout('black');
            return 0;
          }
          return prev - 1000;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTurn, isGameOver, mode, multiplayerGame?.status, multiplayerGame?.selectedTimeControl]);

  const handleTimeout = (side: 'white' | 'black') => {
    const winner = side === 'white' ? 'black' : 'white';
    const reason = `${side === 'white' ? 'White' : 'Black'} ran out of time`;
    setGameResult({ isOpen: true, winner, reason });
    chessAudio.playGameOver();
  };

  // Check Game Over triggers
  const checkAndSetGameOver = useCallback(
    (game: Chess) => {
      if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'black' : 'white';
        setGameResult({
          isOpen: true,
          winner,
          reason: `${winner === 'white' ? 'White' : 'Black'} won by checkmate!`,
        });
        chessAudio.playGameOver();
        return true;
      }
      if (game.isStalemate()) {
        setGameResult({ isOpen: true, winner: 'draw', reason: 'Draw by stalemate' });
        chessAudio.playGameOver();
        return true;
      }
      if (game.isThreefoldRepetition()) {
        setGameResult({ isOpen: true, winner: 'draw', reason: 'Draw by threefold repetition' });
        chessAudio.playGameOver();
        return true;
      }
      if (game.isInsufficientMaterial()) {
        setGameResult({ isOpen: true, winner: 'draw', reason: 'Draw by insufficient material' });
        chessAudio.playGameOver();
        return true;
      }
      if (game.isDraw()) {
        setGameResult({ isOpen: true, winner: 'draw', reason: 'Draw (50-move rule)' });
        chessAudio.playGameOver();
        return true;
      }
      return false;
    },
    []
  );

  // Apply a local move (for both Bot game and optimistic player moves)
  const applyMove = useCallback(
    (from: string, to: string, promotion = 'q') => {
      try {
        const newGame = new Chess(chessInstance.fen());
        const moveResult = newGame.move({ from, to, promotion });
        if (!moveResult) return false;

        setChessInstance(newGame);
        setLastMove({ from, to });
        setSelectedSquare(null);
        setLegalMoves([]);

        // Sound effect
        if (moveResult.captured) {
          chessAudio.playCapture();
        } else if (newGame.inCheck()) {
          chessAudio.playCheck();
        } else {
          chessAudio.playMove();
        }

        const moveRecord: ChessMoveRecord = {
          from: moveResult.from,
          to: moveResult.to,
          promotion: moveResult.promotion || undefined,
          san: moveResult.san,
          piece: moveResult.piece,
          color: moveResult.color,
          captured: moveResult.captured || undefined,
          fen: newGame.fen(),
          timestamp: Date.now(),
        };

        setMoveHistory((prev) => [...prev, moveRecord]);

        // Check if game over
        const isEnded = checkAndSetGameOver(newGame);
        if (!isEnded) {
          if (newGame.inCheck()) {
            setGuidanceMessage('Check! Protect your King.');
          } else {
            setGuidanceMessage('Select a piece to see legal moves.');
          }
        }

        return true;
      } catch (e) {
        console.error('Move application error:', e);
        return false;
      }
    },
    [chessInstance, checkAndSetGameOver]
  );

  // Bot Turn Trigger
  useEffect(() => {
    if (mode !== 'bot' || isGameOver) return;
    const isBotTurn = activeTurn !== (userAssignedColor === 'white' ? 'w' : 'b');

    if (isBotTurn && !isBotThinking) {
      setIsBotThinking(true);
      setGuidanceMessage('Bot is thinking...');

      getBestBotMove(chessInstance.fen(), botDifficulty)
        .then((botMove) => {
          if (botMove) {
            applyMove(botMove.from, botMove.to, botMove.promotion || 'q');
          }
        })
        .catch((err) => {
          console.error('Bot calculation failed:', err);
        })
        .finally(() => {
          setIsBotThinking(false);
        });
    }
  }, [mode, activeTurn, userAssignedColor, isGameOver, isBotThinking, chessInstance, botDifficulty, applyMove]);

  // Handle Square Clicking (Click-to-Move & Tap-to-Move with guidance)
  const handleSquareClick = (square: string) => {
    if (isGameOver) return;
    if (!isMyTurn) {
      setGuidanceMessage(
        activeTurn === 'w'
          ? "Waiting for White's move..."
          : "Waiting for Black's move..."
      );
      return;
    }

    // 1. If clicking on an existing selected square, unselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      setGuidanceMessage('Select a piece to see legal moves.');
      return;
    }

    // 2. If a piece is already selected, check if clicked square is a legal destination
    if (selectedSquare) {
      const isLegal = legalMoves.some((m) => m.to === square);
      if (isLegal) {
        // Check for pawn promotion (pawn reaching 8th rank for white or 1st rank for black)
        const pieceOnSrc = chessInstance.get(selectedSquare as any);
        const isPawnPromotion =
          pieceOnSrc?.type === 'p' &&
          ((pieceOnSrc.color === 'w' && square.endsWith('8')) ||
            (pieceOnSrc.color === 'b' && square.endsWith('1')));

        if (isPawnPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        // Execute Move
        executeMove(selectedSquare, square, 'q');
        return;
      }
    }

    // 3. Select a piece belonging to the active player
    const piece = chessInstance.get(square as any);
    const myPieceColor = mode === 'bot' ? (userAssignedColor === 'white' ? 'w' : 'b') : (multiplayerColor === 'white' ? 'w' : 'b');

    if (piece && piece.color === myPieceColor && piece.color === activeTurn) {
      setSelectedSquare(square);

      const movesFromSquare = chessInstance.moves({
        square: square as any,
        verbose: true,
      }) as any[];

      const targets: LegalMoveTarget[] = movesFromSquare.map((m) => ({
        to: m.to,
        isCapture: !!m.captured,
        promotion: !!m.promotion,
      }));

      setLegalMoves(targets);

      if (targets.length === 0) {
        setGuidanceMessage('This piece has no legal moves available.');
      } else {
        setGuidanceMessage('Choose a highlighted square to move.');
      }
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
      setGuidanceMessage('Select a piece to see legal moves.');
    }
  };

  // Move execution (handles both Bot local and Multiplayer Server validation)
  const executeMove = async (from: string, to: string, promotion = 'q') => {
    if (mode === 'bot') {
      applyMove(from, to, promotion);
    } else {
      // Optimistic move application locally for instantaneous feedback!
      const previousFen = chessInstanceRef.current.fen();
      const previousHistory = [...moveHistory];
      const previousLastMove = lastMove;
      const moveSuccess = applyMove(from, to, promotion);

      if (!moveSuccess) return;

      try {
        const res = await fetch(`/api/chess/${gameId}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerToken: effectivePlayerToken,
            from,
            to,
            promotion,
          }),
        });

        const data = await res.json();
        if (data.success && data.game) {
          setMultiplayerGame(data.game);
          if (onGameChange) onGameChange(data.game);
        } else {
          // Revert optimistic move if server rejected
          console.error('Server move failed:', data.error);
          setChessInstance(new Chess(previousFen));
          setMoveHistory(previousHistory);
          setLastMove(previousLastMove);
          setInfoToast(data.error || 'Server rejected move.');
          setTimeout(() => setInfoToast(null), 3000);
        }
      } catch (err) {
        console.error('Multiplayer move network error:', err);
        setInfoToast('Network error submitting move.');
        setTimeout(() => setInfoToast(null), 3000);
      }
    }
  };

  // Multiplayer Event Source (SSE) & Fast 800ms Polling
  useEffect(() => {
    if (mode !== 'friend' || !gameId) return;

    let active = true;
    let eventSource: EventSource | null = null;

    // 1. Establish Server-Sent Events stream
    try {
      eventSource = new EventSource(`/api/chess/${gameId}/events`);

      eventSource.addEventListener('move_made', (e) => {
        if (!active) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.game) {
            setMultiplayerGame(payload.game);
            if (onGameChange) onGameChange(payload.game);
            setWhiteTimeMs(payload.game.whiteTimeRemaining);
            setBlackTimeMs(payload.game.blackTimeRemaining);

            if (payload.game.currentPosition !== chessInstanceRef.current.fen()) {
              const newGame = new Chess(payload.game.currentPosition);
              setChessInstance(newGame);
              setMoveHistory(payload.game.moveHistory || []);

              if (payload.move) {
                setLastMove({ from: payload.move.from, to: payload.move.to });
                if (payload.move.captured) chessAudio.playCapture();
                else if (newGame.inCheck()) chessAudio.playCheck();
                else chessAudio.playMove();
              }
            }
          }
        } catch {}
      });

      eventSource.addEventListener('player_joined', (e) => {
        if (!active) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.game) {
            setMultiplayerGame(payload.game);
            if (onGameChange) onGameChange(payload.game);
            setInfoToast('Friend joined! Game is now active.');
            setTimeout(() => setInfoToast(null), 3000);
          }
        } catch {}
      });

      eventSource.addEventListener('draw_offered', (e) => {
        if (!active) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.from !== multiplayerColor) {
            setIsDrawOfferOpen(true);
          }
        } catch {}
      });

      eventSource.addEventListener('game_over', (e) => {
        if (!active) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.game) {
            setMultiplayerGame(payload.game);
            if (onGameChange) onGameChange(payload.game);
            setGameResult({
              isOpen: true,
              winner: payload.game.winner,
              reason: payload.game.resultReason || 'Game completed.',
            });
            chessAudio.playGameOver();
          }
        } catch {}
      });
    } catch {}

    // 2. High-speed 800ms polling fallback for ultra-reliable sync
    const pollInterval = setInterval(async () => {
      if (!active) return;
      try {
        const queryToken = effectivePlayerToken || '';
        const res = await fetch(`/api/chess/${gameId}?token=${encodeURIComponent(queryToken)}`);
        const data = await res.json();
        if (data.success && data.game) {
          setMultiplayerGame(data.game);
          if (onGameChange) onGameChange(data.game);

          if (data.game.currentPosition !== chessInstanceRef.current.fen()) {
            const newGame = new Chess(data.game.currentPosition);
            setChessInstance(newGame);
            setMoveHistory(data.game.moveHistory || []);
            setWhiteTimeMs(data.game.whiteTimeRemaining);
            setBlackTimeMs(data.game.blackTimeRemaining);

            const lastRec = data.game.moveHistory?.[data.game.moveHistory.length - 1];
            if (lastRec) {
              setLastMove({ from: lastRec.from, to: lastRec.to });
              if (lastRec.captured) chessAudio.playCapture();
              else if (newGame.inCheck()) chessAudio.playCheck();
              else chessAudio.playMove();
            }
          }

          if (['checkmate', 'stalemate', 'draw', 'resigned', 'timeout'].includes(data.game.status)) {
            setGameResult({
              isOpen: true,
              winner: data.game.winner,
              reason: data.game.resultReason || 'Game ended.',
            });
          }
        }
      } catch {}
    }, 800);

    return () => {
      active = false;
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, [mode, gameId, effectivePlayerToken, multiplayerColor, onGameChange]);

  // Resignation Handler
  const handleResign = async () => {
    if (!window.confirm('Are you sure you want to resign this game?')) return;

    if (mode === 'bot') {
      const winner = userAssignedColor === 'white' ? 'black' : 'white';
      setGameResult({
        isOpen: true,
        winner,
        reason: `${userAssignedColor === 'white' ? 'White' : 'Black'} resigned.`,
      });
      chessAudio.playGameOver();
    } else {
      try {
        await fetch(`/api/chess/${gameId}/resign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerToken }),
        });
      } catch {}
    }
  };

  // Draw Offer Handler
  const handleOfferDraw = async () => {
    if (mode === 'bot') {
      setInfoToast('The bot declined your draw offer.');
      setTimeout(() => setInfoToast(null), 2500);
      return;
    }
    try {
      await fetch(`/api/chess/${gameId}/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, action: 'offer' }),
      });
      setInfoToast('Draw offer sent to opponent.');
      setTimeout(() => setInfoToast(null), 2500);
    } catch {}
  };

  const handleRespondDraw = async (accept: boolean) => {
    setIsDrawOfferOpen(false);
    try {
      await fetch(`/api/chess/${gameId}/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, action: accept ? 'accept' : 'decline' }),
      });
    } catch {}
  };

  // Restart / Reset game
  const handleRestart = () => {
    const fresh = new Chess();
    setChessInstance(fresh);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setMoveHistory([]);
    setWhiteTimeMs(600000);
    setBlackTimeMs(600000);
    setGameResult({ isOpen: false, winner: null, reason: '' });
    setGuidanceMessage('Select a piece to see legal moves.');
  };

  // Flip board perspective
  const handleFlipBoard = () => {
    setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  // Player & Opponent profile details
  const topPlayerInfo = useMemo(() => {
    if (mode === 'bot') {
      const isBotWhite = userAssignedColor === 'black';
      return {
        name: 'Opponent',
        initial: 'O',
        color: 'bg-zinc-800',
        isWhite: isBotWhite,
        timeMs: isBotWhite ? whiteTimeMs : blackTimeMs,
        isActive: isBotWhite ? activeTurn === 'w' : activeTurn === 'b',
      };
    }
    // Multiplayer
    const isTopWhite = boardOrientation === 'black';
    const player = isTopWhite ? multiplayerGame?.whitePlayer : multiplayerGame?.blackPlayer;
    return {
      name: player?.name || 'Opponent',
      initial: (player?.name || 'O')[0].toUpperCase(),
      color: 'bg-zinc-800',
      isWhite: isTopWhite,
      timeMs: isTopWhite ? whiteTimeMs : blackTimeMs,
      isActive: isTopWhite ? activeTurn === 'w' : activeTurn === 'b',
    };
  }, [mode, userAssignedColor, boardOrientation, multiplayerGame, whiteTimeMs, blackTimeMs, activeTurn]);

  const bottomPlayerInfo = useMemo(() => {
    if (mode === 'bot') {
      const isUserWhite = userAssignedColor === 'white';
      return {
        name: customPlayerName || 'hiteshpatidar1020',
        initial: (customPlayerName || 'H')[0].toUpperCase(),
        color: 'bg-[#8035ea]',
        isWhite: isUserWhite,
        timeMs: isUserWhite ? whiteTimeMs : blackTimeMs,
        isActive: isUserWhite ? activeTurn === 'w' : activeTurn === 'b',
      };
    }
    // Multiplayer
    const isBottomWhite = boardOrientation === 'white';
    const player = isBottomWhite ? multiplayerGame?.whitePlayer : multiplayerGame?.blackPlayer;
    return {
      name: player?.name || customPlayerName || 'hiteshpatidar1020',
      initial: (player?.name || customPlayerName || 'H')[0].toUpperCase(),
      color: 'bg-[#8035ea]',
      isWhite: isBottomWhite,
      timeMs: isBottomWhite ? whiteTimeMs : blackTimeMs,
      isActive: isBottomWhite ? activeTurn === 'w' : activeTurn === 'b',
    };
  }, [mode, userAssignedColor, boardOrientation, multiplayerGame, whiteTimeMs, blackTimeMs, activeTurn, customPlayerName]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {infoToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-700 shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{infoToast}</span>
        </div>
      )}

      {/* Top Header & Mode Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          {onExitToMenu && (
            <button
              type="button"
              onClick={onExitToMenu}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Return to Chess setup"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {mode === 'bot' ? `Play vs Bot (${botDifficulty})` : 'Play With Friend'}
              </h2>
              {mode === 'bot' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-[#5722AF] dark:text-purple-300 border border-[#5722AF]/20">
                  Offline AI
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  {multiplayerGame?.status === 'waiting' ? 'Waiting for Friend' : 'Real-time Live'}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {mode === 'bot'
                ? 'High-speed Minimax AI with piece-square evaluation and quiescence search'
                : `Room ID: ${gameId || '...'}`}
            </p>
          </div>
        </div>

        {/* Global Toolbar Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={toggleSound}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleFlipBoard}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Flip Board View"
          >
            <Repeat className="w-4 h-4" />
          </button>
          {mode === 'bot' && (
            <button
              type="button"
              onClick={handleRestart}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Chess Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Board & Clocks */}
        <div className="lg:col-span-8 flex flex-col items-center w-full">
          {/* Authentic Dark Gaming Arena Container matching media_1790888465768.png */}
          <div
            className="w-full max-w-[560px] rounded-2xl p-2.5 sm:p-4 shadow-2xl flex flex-col items-center gap-1.5 border border-zinc-800"
            style={{ backgroundColor: '#262522' }}
          >
            {/* Opponent Bar (Top) */}
            <ChessClock
              playerName={
                multiplayerGame?.status === 'waiting'
                  ? 'Waiting for friend...'
                  : topPlayerInfo.name.startsWith('Player 2')
                  ? 'Opponent'
                  : topPlayerInfo.name
              }
              isOpponent={true}
              isWhite={topPlayerInfo.isWhite}
              timeRemainingMs={topPlayerInfo.timeMs}
              isActive={topPlayerInfo.isActive}
              isUnlimited={mode === 'bot' || multiplayerGame?.selectedTimeControl === 0}
              onSettingsClick={() => setIsSettingsModalOpen(true)}
            />

            {/* Razor Flush Interactive Chess Board with Drag & Drop */}
            <div className="w-full">
              <ChessBoard
                board={chessInstance.board()}
                orientation={boardOrientation}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                kingInCheckSquare={kingInCheckSquare}
                onSquareClick={handleSquareClick}
                disabled={isGameOver || !isMyTurn}
              />
            </div>

            {/* Player Bar (Bottom) */}
            <ChessClock
              playerName={customPlayerName || bottomPlayerInfo.name}
              rating={customRating || 188}
              flag={customFlag || '🇮🇳'}
              hasSignalBars={true}
              avatarInitial={(customPlayerName || bottomPlayerInfo.name || 'H')[0]?.toUpperCase()}
              avatarColor="bg-[#8035ea]"
              isWhite={bottomPlayerInfo.isWhite}
              timeRemainingMs={bottomPlayerInfo.timeMs}
              isActive={bottomPlayerInfo.isActive}
              isUnlimited={mode === 'bot' || multiplayerGame?.selectedTimeControl === 0}
            />
          </div>

          {/* Quick Action Toolbar Below Board */}
          <div className="w-full max-w-[560px] mt-3.5 p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFlipBoard}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                title="Flip board view"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Flip</span>
              </button>
              <button
                type="button"
                onClick={toggleSound}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                title="Toggle audio effects"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
              </button>
              {mode === 'bot' && (
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                  title="Restart game"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Restart</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOfferDraw}
                disabled={isGameOver || !isMyTurn}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Draw</span>
              </button>
              <button
                type="button"
                onClick={handleResign}
                disabled={isGameOver}
                className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/40 text-rose-300 disabled:opacity-40 flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Resign</span>
              </button>
            </div>
          </div>

          {/* Turn and In-Check Guidance Bar */}
          <div className="w-full max-w-[560px] mt-2 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {isBotThinking ? (
                <div className="flex items-center gap-1.5 font-bold text-purple-400">
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>Bot is calculating...</span>
                </div>
              ) : kingInCheckSquare ? (
                <div className="flex items-center gap-1.5 font-bold text-rose-400 animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  <span>King is in Check!</span>
                </div>
              ) : isMyTurn ? (
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Your Turn ({activeTurn === 'w' ? 'White' : 'Black'})! Click or drag to move.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-medium text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span>Waiting for {activeTurn === 'w' ? 'White' : 'Black'} to make their move...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeTurn === 'w' ? 'bg-white shadow-xs' : 'bg-zinc-950 border border-zinc-500'
                }`}
              />
              <span>{activeTurn === 'w' ? 'White to move' : 'Black to move'}</span>
            </div>
          </div>
        </div>

        {/* Right: Move History & Status */}
        <div className="lg:col-span-4 space-y-4 w-full">
          <MoveHistory moves={moveHistory} />

          {/* Game Info Card */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-2">
            <div className="font-bold text-zinc-100 flex items-center gap-1.5">
              <span>Game Details</span>
            </div>
            <div className="text-zinc-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="font-semibold text-zinc-200 capitalize">
                  {mode === 'bot' ? 'Play vs Computer' : 'Play With Friend'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Your Color:</span>
                <span className="font-semibold text-zinc-200 capitalize">
                  {mode === 'bot' ? userAssignedColor : multiplayerColor}
                </span>
              </div>
              {mode === 'bot' && (
                <div className="flex justify-between">
                  <span>AI Level:</span>
                  <span className="font-semibold text-zinc-200 capitalize">{botDifficulty}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Total Moves:</span>
                <span className="font-semibold text-zinc-200">{moveHistory.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pawn Promotion Modal */}
      <PromotionModal
        isOpen={!!pendingPromotion}
        color={activeTurn}
        onSelect={(piece) => {
          if (pendingPromotion) {
            executeMove(pendingPromotion.from, pendingPromotion.to, piece);
            setPendingPromotion(null);
          }
        }}
        onCancel={() => setPendingPromotion(null)}
      />

      {/* Game Result Modal */}
      <GameResultModal
        isOpen={gameResult.isOpen}
        winner={gameResult.winner}
        reason={gameResult.reason}
        onNewGame={() => {
          if (mode === 'bot') {
            handleRestart();
          } else if (onExitToMenu) {
            onExitToMenu();
          }
        }}
        onBackToMenu={() => {
          if (onExitToMenu) onExitToMenu();
        }}
      />

      {/* Draw Offer Modal (for multiplayer opponent) */}
      <DrawOfferModal
        isOpen={isDrawOfferOpen}
        onAccept={() => handleRespondDraw(true)}
        onDecline={() => handleRespondDraw(false)}
      />

      {/* Settings Modal (Configures Username, Rating, Flag) */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-100">
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Player Profile & Settings</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Username</label>
                <input
                  type="text"
                  value={customPlayerName}
                  onChange={(e) => setCustomPlayerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-medium focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Rating Number</label>
                <input
                  type="text"
                  value={customRating}
                  onChange={(e) => setCustomRating(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-medium focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1.5 font-semibold">Country Flag</label>
                <div className="flex flex-wrap gap-2">
                  {['🇮🇳', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇯🇵', '🇩🇪', '🇫🇷', '🇪🇸', '🇧🇷'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setCustomFlag(f)}
                      className={`p-2 rounded-xl text-lg border transition-all cursor-pointer ${
                        customFlag === f
                          ? 'border-purple-500 bg-purple-950/60 scale-105'
                          : 'border-zinc-800 bg-zinc-800/60 hover:bg-zinc-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('chess_player_name', customPlayerName);
                    localStorage.setItem('chess_player_rating', customRating);
                    localStorage.setItem('chess_player_flag', customFlag);
                  }
                  setIsSettingsModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl font-bold bg-[#8035ea] hover:bg-[#6c28d2] text-white transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
