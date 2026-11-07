import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { TempleSceneManager, InteractiveZone } from '../game/threeScene';
import { PlayerController } from '../game/playerController';
import { templeAudio } from '../audio/templeAudio';
import { templeStorage, PlayerProgress } from '../storage/templeStorage';
import { VirtualJoystick } from './VirtualJoystick';
import { RitualModals } from './RitualModals';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Flower2,
  BookOpen,
  Clock,
  Compass,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  User,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TempleGame: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<TempleSceneManager | null>(null);
  const playerControllerRef = useRef<PlayerController | null>(null);

  const [progress, setProgress] = useState<PlayerProgress>(templeStorage.getProgress());
  const [activeZone, setActiveZone] = useState<InteractiveZone | null>(null);
  const [playerState, setPlayerState] = useState<'idle' | 'walking' | 'sitting' | 'bowing'>('idle');
  const [bowCount, setBowCount] = useState<number>(0);
  const [isBowingInProgress, setIsBowingInProgress] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'offering' | 'meditation' | 'chanting' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(progress.playerName);

  const currentLevel = templeStorage.getLevel();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const refreshData = useCallback(() => {
    setProgress(templeStorage.getProgress());
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateAltarOfferings(templeStorage.getProgress().offeringsOnAltar);
    }
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Initialize Scene & Player
    const sceneManager = new TempleSceneManager(mountRef.current);
    const playerController = new PlayerController(sceneManager);

    sceneManagerRef.current = sceneManager;
    playerControllerRef.current = playerController;

    // Update offerings on altar from saved progress
    sceneManager.updateAltarOfferings(templeStorage.getProgress().offeringsOnAltar);

    // 2. Mouse / Touch drag to rotate camera
    let isPointerDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      // First interaction starts ambient audio
      templeAudio.startAmbientWind();

      isPointerDragging = true;
      if (e instanceof MouseEvent) {
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;
      } else if (e.touches && e.touches.length > 0) {
        prevPointerX = e.touches[0].clientX;
        prevPointerY = e.touches[0].clientY;
      }
      playerController.handlePointerDown(e, mountRef.current!);
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isPointerDragging) return;
      let clientX = 0;
      let clientY = 0;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      const dx = clientX - prevPointerX;
      const dy = clientY - prevPointerY;
      prevPointerX = clientX;
      prevPointerY = clientY;

      // Adjust camera yaw and pitch
      playerController.cameraYaw -= dx * 0.005;
      playerController.cameraPitch = Math.max(0.05, Math.min(0.65, playerController.cameraPitch + dy * 0.003));
    };

    const onPointerUp = () => {
      isPointerDragging = false;
    };

    const dom = mountRef.current;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 3. Render Loop
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      playerController.update(delta);
      sceneManager.render();

      setActiveZone(playerController.activeZone);
      setPlayerState(playerController.state);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onPointerDown);
      dom.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);

      dom.removeEventListener('touchstart', onPointerDown);
      dom.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      playerController.dispose();
      sceneManager.dispose();
    };
  }, []);

  // Action handlers
  const handleIncense = () => {
    const success = templeStorage.recordIncense();
    if (success) {
      templeAudio.playIncenseChime();
      templeAudio.playTempleBell(216);
      showToast('Đã thành tâm thắp nén hương trầm thơm ngát (+2 Sen)');
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      refreshData();
    } else {
      showToast('Hôm nay bạn đã thắp đủ 5 lần hương. Hãy tĩnh tâm chiêm bái.');
    }
  };

  const handleBowing = () => {
    if (isBowingInProgress || !playerControllerRef.current) return;
    setIsBowingInProgress(true);

    const step = bowCount + 1;
    setBowCount(step);
    templeAudio.playWoodenFish(620);

    playerControllerRef.current.triggerBowingAnimation(() => {
      setIsBowingInProgress(false);
      if (step >= 3) {
        setBowCount(0);
        const success = templeStorage.recordBowing();
        templeAudio.playTempleBell(216);
        if (success) {
          showToast('Viên mãn 3 lạy trước Tam Bảo (+3 Sen)');
          confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
          refreshData();
        } else {
          showToast('Đã hoàn thành 3 lạy trang nghiêm.');
        }
      } else {
        showToast(`Lạy Phật ${step}/3...`);
      }
    });
  };

  const handleSitOnMat = (zone: InteractiveZone) => {
    if (!playerControllerRef.current) return;
    const data = zone.data as { seatIndex: number; seatPos: THREE.Vector3 };
    playerControllerRef.current.sitDownOnSeat(data.seatIndex, data.seatPos);
    templeAudio.playTempleBell(240);
    showToast(`Đã an tọa trên bồ đoàn #${data.seatIndex}. Bạn có thể Thiền hoặc Tụng kinh.`);
    refreshData();
  };

  const handleStandUp = () => {
    if (!playerControllerRef.current) return;
    playerControllerRef.current.standUp();
    showToast('Đã đứng dậy khỏi bồ đoàn.');
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    templeAudio.setMuted(next);
  };

  const handleSaveName = () => {
    templeStorage.setPlayerName(nameInput);
    setIsEditingName(false);
    refreshData();
    showToast(`Đã cập nhật tên: ${nameInput}`);
  };

  return (
    <div className="relative w-full h-full min-h-[580px] bg-stone-950 overflow-hidden select-none font-sans">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Bar HUD: Player Info & Sen Points */}
      <div className="absolute top-3 inset-x-3 md:inset-x-6 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2.5 bg-stone-900/80 border border-amber-600/40 rounded-2xl px-3.5 py-2 backdrop-blur-md shadow-lg pointer-events-auto">
          <span className="text-xl">{currentLevel.badge}</span>
          <div>
            <div className="flex items-center gap-1.5">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={nameInput}
                    maxLength={20}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-stone-800 text-amber-200 text-xs px-2 py-0.5 rounded border border-amber-500/50 w-28 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-1.5 py-0.5 text-[10px] bg-amber-600 rounded text-white"
                  >
                    Lưu
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="font-semibold text-xs text-amber-200 hover:text-amber-100 flex items-center gap-1"
                  title="Bấm để đổi tên"
                >
                  <span>{progress.playerName}</span>
                  <User className="w-3 h-3 text-stone-400" />
                </button>
              )}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30">
                {currentLevel.name} (Cấp {currentLevel.level})
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-300 mt-0.5">
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {progress.senPoints} Sen
              </span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-400">Ngày tu: {progress.totalDays}</span>
            </div>
          </div>
        </div>

        {/* Audio & Compass Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => templeAudio.playTempleBell(216)}
            className="w-10 h-10 rounded-2xl bg-stone-900/80 border border-amber-600/40 hover:bg-stone-800/90 text-amber-300 flex items-center justify-center shadow-lg transition-transform active:scale-95"
            title="Thỉnh chuông chùa (Web Audio)"
          >
            🔔
          </button>
          <button
            onClick={() => templeAudio.playWoodenFish(580)}
            className="w-10 h-10 rounded-2xl bg-stone-900/80 border border-amber-600/40 hover:bg-stone-800/90 text-amber-300 flex items-center justify-center shadow-lg transition-transform active:scale-95"
            title="Gõ mõ (Web Audio)"
          >
            🪵
          </button>
          <button
            onClick={handleToggleMute}
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              isMuted
                ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                : 'bg-stone-900/80 border-amber-600/40 text-amber-300'
            }`}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300">
          <div className="bg-stone-900/90 border border-amber-500/70 text-amber-200 text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Dynamic Interaction Prompt Badge */}
      {activeZone && playerState !== 'sitting' && playerState !== 'bowing' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-16 z-20 pointer-events-auto animate-bounce">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 rounded-2xl shadow-2xl border-2 border-amber-300 flex items-center gap-2 font-semibold text-xs">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{activeZone.label}</span>
          </div>
        </div>
      )}

      {/* Virtual Joystick for Mobile in Bottom-Left */}
      <div className="absolute bottom-6 left-6 z-20 md:hidden">
        <VirtualJoystick
          onMove={(vec) => {
            if (playerControllerRef.current) {
              playerControllerRef.current.joystickInput = vec;
            }
          }}
        />
      </div>

      {/* Seated State Actions Bar (When sitting on a mat) */}
      {playerState === 'sitting' && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-stone-900/90 border-2 border-amber-500/60 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setActiveModal('meditation')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-xs shadow"
          >
            <Clock className="w-4 h-4" />
            <span>Thiền Định</span>
          </button>
          <button
            onClick={() => setActiveModal('chanting')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-xs shadow"
          >
            <BookOpen className="w-4 h-4" />
            <span>Tụng Kinh</span>
          </button>
          <button
            onClick={handleStandUp}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs"
          >
            Đứng Dậy
          </button>
        </div>
      )}

      {/* Consolidated Bottom Dock (Ergonomic UX - Collapsible) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl transition-transform duration-300 ${
          isDockCollapsed ? 'translate-y-[85%]' : 'translate-y-0'
        }`}
      >
        {/* Toggle Tab */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="px-4 py-1 rounded-t-xl bg-stone-900/90 border-t border-x border-amber-600/40 text-amber-300 text-[11px] font-medium flex items-center gap-1 shadow-md hover:bg-stone-800"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Mở Bảng Hành Lễ
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Ẩn Gọn Giao Diện (Zen Mode)
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container */}
        <div className="bg-stone-900/90 border border-amber-600/40 rounded-2xl p-3 backdrop-blur-md shadow-2xl text-stone-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Quick Action Buttons based on proximity */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Thắp hương */}
              <button
                onClick={handleIncense}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow transition-all ${
                  activeZone?.id === 'outer_incense' || activeZone?.id === 'inner_incense'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white ring-2 ring-amber-400'
                    : 'bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 border border-stone-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Thắp Hương</span>
              </button>

              {/* 2. Dâng lễ */}
              <button
                onClick={() => setActiveModal('offering')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow transition-all ${
                  activeZone?.id === 'altar'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white ring-2 ring-amber-400'
                    : 'bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 border border-stone-700'
                }`}
              >
                <Flower2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Dâng Lễ</span>
              </button>

              {/* 3. Lạy Phật */}
              <button
                onClick={handleBowing}
                disabled={isBowingInProgress}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow transition-all ${
                  activeZone?.id === 'statue'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white ring-2 ring-amber-400'
                    : 'bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 border border-stone-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {isBowingInProgress ? `Đang lạy ${bowCount}/3...` : 'Lạy Phật (3 lạy)'}
                </span>
              </button>

              {/* 4. Ngồi bồ đoàn (if standing near a mat) */}
              {activeZone?.id === 'mat' && playerState !== 'sitting' && (
                <button
                  onClick={() => handleSitOnMat(activeZone)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow ring-2 ring-amber-300 font-bold"
                >
                  <span>🧘 Ngồi Bồ Đoàn #{((activeZone.data as { seatIndex: number })?.seatIndex)}</span>
                </button>
              )}
            </div>

            {/* Instruction Tips */}
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300 font-mono">
                  W A S D
                </span>{' '}
                Di chuyển
              </span>
              <span className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300 font-mono">
                  Chuột
                </span>{' '}
                Xoay / Bấm để đi
              </span>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="mt-2 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
            <span>🪷 Trang web mang tính giải trí & tĩnh tâm online, không thay thế việc hành lễ thực tế.</span>
            <span className="hidden sm:inline">10 Bồ đoàn (với 4-6 Phật tử mô phỏng)</span>
          </div>
        </div>
      </div>

      {/* Ritual Modals */}
      <RitualModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onRefreshData={refreshData}
      />
    </div>
  );
};
