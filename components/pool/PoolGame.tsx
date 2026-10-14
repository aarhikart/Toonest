'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar } from './TopBar';
import { SpinSelector } from './SpinSelector';
import { PowerBar } from './PowerBar';
import { PocketedTray } from './PocketedTray';
import { PoolTableCanvas } from './PoolTableCanvas';
import {
  BallState,
  ShotParams,
  PlayerInfo,
  PlayerGroup,
  GameMode,
  BotDifficulty,
  PoolGameDoc,
} from '@/lib/pool/types';
import { getInitialBallRack } from '@/lib/pool/constants';
import { calculateBotShot } from '@/lib/pool/botEngine';
import { poolAudio } from '@/lib/pool/audio';
import { MessageSquare, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Zap } from 'lucide-react';

interface PoolGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  onExitToMenu?: () => void;

  // Multiplayer props
  gameId?: string;
  playerToken?: string;
  initialGame?: PoolGameDoc | null;
  multiplayerRole?: 'player1' | 'player2' | 'spectator';
  onGameChange?: (game: PoolGameDoc) => void;
}

export function PoolGame({
  mode,
  botDifficulty = 'medium',
  onExitToMenu,
  gameId,
  playerToken,
  initialGame,
  multiplayerRole = 'player1',
  onGameChange,
}: PoolGameProps) {
  // Game State
  const [balls, setBalls] = useState<BallState[]>(() => {
    return initialGame?.balls && initialGame.balls.length > 0
      ? initialGame.balls
      : getInitialBallRack();
  });

  const [player1, setPlayer1] = useState<PlayerInfo>(() => {
    return initialGame?.player1 || {
      id: 'p1',
      name: 'Interactive Fiddler',
      avatar: 'fiddler',
      group: 'unassigned',
      connected: true,
      lastSeen: Date.now(),
    };
  });

  const [player2, setPlayer2] = useState<PlayerInfo>(() => {
    return initialGame?.player2 || {
      id: 'p2',
      name: mode === 'bot' ? 'Vivid Reindeer' : 'Waiting for friend...',
      avatar: 'reindeer',
      group: 'unassigned',
      connected: mode === 'bot',
      lastSeen: Date.now(),
    };
  });

  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>(
    initialGame?.currentTurn || 'player1'
  );
  const [pocketedHistory, setPocketedHistory] = useState<number[]>(
    initialGame?.pocketedOrder || []
  );

  const [timerSeconds, setTimerSeconds] = useState(
    initialGame?.selectedTimeControl || 27
  );
  const [isBallInHand, setIsBallInHand] = useState(false);

  // Spin control state
  const [spinX, setSpinX] = useState(0);
  const [spinY, setSpinY] = useState(0);

  // External power from PowerBar or Strike button
  const [externalPower, setExternalPower] = useState(0);
  const [selectedPower, setSelectedPower] = useState(65);

  const handleStrike = (powerToUse?: number) => {
    const p = powerToUse || selectedPower;
    setExternalPower(p);
  };

  // Victory / Game over state
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(
    initialGame?.winner || null
  );
  const [winnerReason, setWinnerReason] = useState<string>(
    initialGame?.winnerReason || ''
  );

  // Sound & Settings modal
  const [isMuted, setIsMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState<string | null>(null);

  // Determine if it is currently my turn to shoot
  const isMyTurn =
    !winner &&
    (mode === 'practice' ||
      (mode === 'bot' && currentTurn === 'player1') ||
      (mode === 'friend' && multiplayerRole === currentTurn));

  const myGroup: PlayerGroup =
    multiplayerRole === 'player2' ? player2.group : player1.group;

  // Turn timer countdown
  useEffect(() => {
    if (winner || mode === 'practice') return;

    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          // Time expired -> switch turns with ball in hand!
          poolAudio.playFoul();
          setCurrentTurn((curr) => (curr === 'player1' ? 'player2' : 'player1'));
          setIsBallInHand(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTurn, winner, mode]);

  // Audio mute sync
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    poolAudio.setMuted(next);
  };

  // Bot Turn Automation (Vivid Reindeer)
  useEffect(() => {
    if (mode !== 'bot' || currentTurn !== 'player2' || winner) return;

    const botTimer = setTimeout(() => {
      // Calculate AI Shot
      const shot = calculateBotShot(balls, player2.group, botDifficulty);
      setSpinX(shot.spinX);
      setSpinY(shot.spinY);
      setExternalPower(shot.power);
    }, 1200);

    return () => clearTimeout(botTimer);
  }, [mode, currentTurn, winner, balls, player2.group, botDifficulty]);

  // Real-Time Multiplayer SSE Stream (Matches Chess SSE)
  useEffect(() => {
    if (mode !== 'friend' || !gameId) return;

    let active = true;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(`/api/pool/${gameId}/events`);

      eventSource.addEventListener('shot_taken', (e) => {
        if (!active) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.shot && payload.shooter !== multiplayerRole) {
            // Replay opponent's shot
            setSpinX(payload.shot.spinX || 0);
            setSpinY(payload.shot.spinY || 0);
            setExternalPower(payload.shot.power);
          }
          if (payload.nextTurn) setCurrentTurn(payload.nextTurn);
          if (payload.winner) {
            setWinner(payload.winner);
            setWinnerReason(payload.winnerReason || '');
          }
          if (payload.player1Group) {
            setPlayer1((p) => ({ ...p, group: payload.player1Group }));
          }
          if (payload.player2Group) {
            setPlayer2((p) => ({ ...p, group: payload.player2Group }));
          }
        } catch (_) {}
      });

      eventSource.addEventListener('player_joined', (e) => {
        if (!active) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.game?.player2) {
            setPlayer2(payload.game.player2);
          }
        } catch (_) {}
      });
    } catch (_) {}

    return () => {
      active = false;
      eventSource?.close();
    };
  }, [mode, gameId, multiplayerRole]);

  // Shot Taken callback
  const handleShotTaken = useCallback(
    (shot: ShotParams) => {
      // Reset external power
      setExternalPower(0);

      // If multiplayer, post shot to API
      if (mode === 'friend' && gameId && playerToken) {
        fetch(`/api/pool/${gameId}/shot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerToken,
            shot,
          }),
        }).catch(() => {});
      }
    },
    [mode, gameId, playerToken]
  );

  // Turn Evaluation callback after all balls come to a stop
  const handleTurnEnd = useCallback(
    (pottedThisShot: number[], cueScratch: boolean, firstHitBallId: number | null) => {
      // 1. Update pocketed history tray
      if (pottedThisShot.length > 0) {
        setPocketedHistory((prev) => [...prev, ...pottedThisShot]);
      }

      // Reset timer
      setTimerSeconds(initialGame?.selectedTimeControl || 30);

      const shooterGroup = currentTurn === 'player1' ? player1.group : player2.group;

      // 2. Check 8-Ball win / loss
      if (pottedThisShot.includes(8)) {
        // If shooter has remaining balls or scratched on 8 -> Loss!
        const shooterBallsLeft = balls.filter((b) => {
          if (b.isPocketed || b.id === 8 || b.id === 0) return false;
          if (shooterGroup === 'solids') return b.number >= 1 && b.number <= 7;
          if (shooterGroup === 'stripes') return b.number >= 9 && b.number <= 15;
          return false;
        }).length;

        if (cueScratch || shooterBallsLeft > 0 || shooterGroup === 'unassigned') {
          // Illegal 8-ball pot -> Opponent wins!
          const winRole = currentTurn === 'player1' ? 'player2' : 'player1';
          setWinner(winRole);
          setWinnerReason(
            cueScratch
              ? 'Cue ball scratch while potting 8-Ball.'
              : '8-Ball pocketed prematurely before clearing table.'
          );
          poolAudio.playFoul();
          return;
        } else {
          // Legal 8-ball pot -> Shooter wins!
          setWinner(currentTurn);
          setWinnerReason('8-Ball legally pocketed to victory!');
          poolAudio.playWin();
          return;
        }
      }

      // 3. Handle Cue Scratch Foul
      if (cueScratch) {
        setIsBallInHand(true);
        setCurrentTurn((curr) => (curr === 'player1' ? 'player2' : 'player1'));
        return;
      }

      // 4. Assign Groups on first legal pot
      if (player1.group === 'unassigned' && pottedThisShot.length > 0) {
        const firstPotted = pottedThisShot[0];
        if (firstPotted >= 1 && firstPotted <= 7) {
          // Solids potted
          if (currentTurn === 'player1') {
            setPlayer1((p) => ({ ...p, group: 'solids' }));
            setPlayer2((p) => ({ ...p, group: 'stripes' }));
          } else {
            setPlayer2((p) => ({ ...p, group: 'solids' }));
            setPlayer1((p) => ({ ...p, group: 'stripes' }));
          }
        } else if (firstPotted >= 9 && firstPotted <= 15) {
          // Stripes potted
          if (currentTurn === 'player1') {
            setPlayer1((p) => ({ ...p, group: 'stripes' }));
            setPlayer2((p) => ({ ...p, group: 'solids' }));
          } else {
            setPlayer2((p) => ({ ...p, group: 'stripes' }));
            setPlayer1((p) => ({ ...p, group: 'solids' }));
          }
        }
      }

      // 5. Check if shooter potted one of their own balls
      let pottedOwnBall = false;
      if (shooterGroup === 'solids') {
        pottedOwnBall = pottedThisShot.some((id) => id >= 1 && id <= 7);
      } else if (shooterGroup === 'stripes') {
        pottedOwnBall = pottedThisShot.some((id) => id >= 9 && id <= 15);
      } else {
        pottedOwnBall = pottedThisShot.length > 0;
      }

      // If shooter legally potted their ball, they continue their turn!
      // Otherwise, switch turns!
      if (!pottedOwnBall) {
        setCurrentTurn((curr) => (curr === 'player1' ? 'player2' : 'player1'));
      }
    },
    [balls, currentTurn, player1.group, player2.group, initialGame?.selectedTimeControl]
  );

  // Restart / Play Again
  const handleRestart = () => {
    setBalls(getInitialBallRack());
    setWinner(null);
    setWinnerReason('');
    setPocketedHistory([]);
    setCurrentTurn('player1');
    setTimerSeconds(initialGame?.selectedTimeControl || 30);
    setIsBallInHand(false);
    setPlayer1((p) => ({ ...p, group: 'unassigned' }));
    setPlayer2((p) => ({ ...p, group: 'unassigned' }));
  };

  return (
    <div className="relative w-full min-h-screen bg-[#07090f] text-slate-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Bar (Exact replica of user screenshot) */}
      <TopBar
        player1={player1}
        player2={player2}
        currentTurn={currentTurn}
        timerSeconds={timerSeconds}
        balls={balls}
        onBack={onExitToMenu}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Playing Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 relative">
        {/* Left Side Controls (Spin Widget + Vertical Power Cue Stick) */}
        <div className="flex flex-col items-center justify-between h-[450px] py-4 shrink-0 z-20">
          {/* Top-left Spin Selector (3D sphere with red dot & 'R' button) */}
          <SpinSelector
            spinX={spinX}
            spinY={spinY}
            onChange={(x, y) => {
              setSpinX(x);
              setSpinY(y);
            }}
            disabled={!isMyTurn}
          />

          {/* Lower-left Vertical Power Stick Gauge */}
          <PowerBar
            onShoot={(power) => handleStrike(power)}
            disabled={!isMyTurn}
          />
        </div>

        {/* Center Billiard Table */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <PoolTableCanvas
            balls={balls}
            setBalls={setBalls}
            isMyTurn={isMyTurn}
            myGroup={myGroup}
            currentTurn={currentTurn}
            spinX={spinX}
            spinY={spinY}
            externalPower={externalPower}
            onExternalPowerHandled={() => setExternalPower(0)}
            selectedPower={selectedPower}
            onShotTaken={handleShotTaken}
            onTurnEnd={handleTurnEnd}
            isBallInHand={isBallInHand}
            setIsBallInHand={setIsBallInHand}
          />

          {/* Under-Table Strike & Power Controller */}
          <div className="w-full max-w-2xl mt-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between gap-3 z-20">
            {/* Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Power:</span>
              {[30, 50, 75, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSelectedPower(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedPower === val
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="flex-1 flex items-center gap-2 max-w-[170px]">
              <input
                type="range"
                min="10"
                max="100"
                value={selectedPower}
                onChange={(e) => setSelectedPower(Number(e.target.value))}
                disabled={!isMyTurn || isBallInHand}
                className="w-full h-1.5 rounded-lg bg-slate-800 accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-amber-400 w-9 text-right">
                {selectedPower}%
              </span>
            </div>

            {/* Big STRIKE Button */}
            <button
              type="button"
              onClick={() => handleStrike(selectedPower)}
              disabled={!isMyTurn || isBallInHand}
              className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all ${
                isMyTurn && !isBallInHand
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-orange-500/30 active:scale-95 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Strike</span>
              <span className="text-[10px] opacity-75 font-mono">(Space)</span>
            </button>
          </div>
        </div>

        {/* Right Side Golden Curved Tray (Pocketed Balls) */}
        <div className="flex flex-col items-center justify-center h-[450px] shrink-0 z-20">
          <PocketedTray pocketedIds={pocketedHistory} />
        </div>
      </div>

      {/* Bottom Bar / Quick Chat bar matching screenshot */}
      <div className="w-full max-w-7xl mx-auto px-4 py-2 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowChatModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121522] hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>{chatMessage || 'Click to chat...'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Chat Presets Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white">Send Quick Reaction</span>
              <button
                type="button"
                onClick={() => setShowChatModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Nice shot! 🔥', 'Good luck! 🍀', 'Oops! 😅', 'Well played! 👏', 'Thanks! 😊', ' rematch? 🎱'].map(
                (msg) => (
                  <button
                    key={msg}
                    type="button"
                    onClick={() => {
                      setChatMessage(msg);
                      setShowChatModal(false);
                      setTimeout(() => setChatMessage(null), 4000);
                    }}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 text-slate-300 hover:text-cyan-400 text-left font-medium transition-colors"
                  >
                    {msg}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white">Match Settings</span>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Sound Effects</span>
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`px-3 py-1 rounded-lg font-bold ${
                    !isMuted ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {!isMuted ? 'Enabled' : 'Muted'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Restart Current Game</span>
                <button
                  type="button"
                  onClick={() => {
                    handleRestart();
                    setSettingsOpen(false);
                  }}
                  className="px-3 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-bold"
                >
                  Reset Rack
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Victory / Game Over Overlay */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/40 p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                {winner === 'player1' ? player1.name : player2.name} Wins!
              </h3>
              <p className="text-xs text-slate-400 mt-1">{winnerReason}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              {onExitToMenu && (
                <button
                  type="button"
                  onClick={onExitToMenu}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                >
                  Exit Menu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
