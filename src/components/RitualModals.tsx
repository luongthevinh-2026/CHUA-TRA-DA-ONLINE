import React, { useState, useEffect, useRef } from 'react';
import { TEMPLE_CONFIG } from '../config/templeConfig';
import { templeStorage } from '../storage/templeStorage';
import { templeAudio } from '../audio/templeAudio';
import { Sparkles, Flower2, Apple, Flame, X, Clock, BookOpen, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RitualModalsProps {
  activeModal: 'offering' | 'meditation' | 'chanting' | null;
  onClose: () => void;
  onRefreshData: () => void;
}

export const RitualModals: React.FC<RitualModalsProps> = ({
  activeModal,
  onClose,
  onRefreshData,
}) => {
  const progress = templeStorage.getProgress();

  // Meditation State
  const [meditationDuration, setMeditationDuration] = useState<number>(60);
  const [meditationRemaining, setMeditationRemaining] = useState<number | null>(null);
  const [isMeditating, setIsMeditating] = useState<boolean>(false);
  const meditationTimerRef = useRef<number | null>(null);

  // Chanting State
  const [selectedChantId, setSelectedChantId] = useState<string>(TEMPLE_CONFIG.chants[0].id);
  const [isChanting, setIsChanting] = useState<boolean>(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
  const chantingIntervalRef = useRef<number | null>(null);

  // Handle meditation countdown
  useEffect(() => {
    if (isMeditating && meditationRemaining !== null) {
      if (meditationRemaining <= 0) {
        // Completed meditation
        setIsMeditating(false);
        setMeditationRemaining(null);
        const earned = Math.max(1, Math.round(meditationDuration / 60));
        templeStorage.recordMeditation(Math.round(meditationDuration / 60), earned);
        templeAudio.playTempleBell(216);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
        onRefreshData();
      } else {
        meditationTimerRef.current = window.setTimeout(() => {
          setMeditationRemaining((prev) => (prev !== null ? prev - 1 : 0));
        }, 1000);
      }
    }
    return () => {
      if (meditationTimerRef.current) clearTimeout(meditationTimerRef.current);
    };
  }, [isMeditating, meditationRemaining, meditationDuration, onRefreshData]);

  // Handle chanting verse progression
  useEffect(() => {
    if (isChanting) {
      const activeChant = TEMPLE_CONFIG.chants.find((c) => c.id === selectedChantId)!;
      chantingIntervalRef.current = window.setInterval(() => {
        // Play wooden fish sound on each verse beat
        templeAudio.playWoodenFish(580);

        setCurrentVerseIndex((prev) => {
          if (prev + 1 >= activeChant.verses.length) {
            // Completed chant
            clearInterval(chantingIntervalRef.current!);
            setIsChanting(false);
            templeStorage.recordChant(activeChant.rewardSen);
            templeAudio.playTempleBell(216);
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
            onRefreshData();
            return prev;
          }
          return prev + 1;
        });
      }, 4200);
    }
    return () => {
      if (chantingIntervalRef.current) clearInterval(chantingIntervalRef.current);
    };
  }, [isChanting, selectedChantId, onRefreshData]);

  if (!activeModal) return null;

  // 1. Offering Modal
  if (activeModal === 'offering') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-stone-900 border-2 border-amber-600/60 rounded-2xl p-6 shadow-2xl text-stone-100">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-serif font-bold text-amber-300">Dâng Lễ Cúng Phật</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-stone-400 mb-4">
            Thành tâm dâng lễ phẩm lên bàn thờ Tam Bảo. Mỗi lễ phẩm mang ý nghĩa nuôi dưỡng tâm lành
            và tăng trưởng công đức Sen (+3 Sen mỗi lễ, tối đa 3 lần/ngày).
          </p>

          <div className="space-y-3 mb-6">
            {TEMPLE_CONFIG.offering.types.map((offering) => {
              const count = progress.dailyStats.offeringCounts[offering.id] || 0;
              const isMaxed = count >= 3;

              return (
                <div
                  key={offering.id}
                  className="p-3.5 rounded-xl border border-stone-800 bg-stone-800/40 hover:border-amber-500/50 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-2xl">
                      {offering.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-200 text-sm">{offering.name}</h4>
                      <p className="text-xs text-stone-400">{offering.desc}</p>
                      <div className="text-[11px] text-amber-400/80 mt-0.5">
                        Đã dâng hôm nay: <span className="font-bold">{count}/3</span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isMaxed}
                    onClick={() => {
                      const success = templeStorage.recordOffering(offering.id);
                      if (success) {
                        templeAudio.playIncenseChime();
                        confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
                        onRefreshData();
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isMaxed
                        ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md'
                    }`}
                  >
                    {isMaxed ? 'Đã đủ hôm nay' : 'Dâng Lễ (+3 Sen)'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-stone-300"
            >
              Đóng lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Meditation Modal
  if (activeModal === 'meditation') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <div className="w-full max-w-md bg-stone-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl text-stone-100 text-center">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-serif font-bold text-amber-300">Tĩnh Tọa Thiền Định</h2>
            </div>
            {!isMeditating && (
              <button onClick={onClose} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {isMeditating ? (
            <div className="py-8">
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-amber-400/40 border-t-amber-400 animate-spin flex items-center justify-center mb-6">
                <div className="text-2xl font-mono font-bold text-amber-200">
                  {Math.floor(meditationRemaining! / 60)}:
                  {String(meditationRemaining! % 60).padStart(2, '0')}
                </div>
              </div>
              <p className="text-sm font-serif italic text-amber-200/90 mb-2">
                "Thở vào tâm tĩnh lặng, thở ra miệng mỉm cười..."
              </p>
              <p className="text-xs text-stone-400 mb-6">
                Giữ thân ngồi thẳng, thả lỏng toàn thân, an trú trong hiện tại.
              </p>
              <button
                onClick={() => {
                  setIsMeditating(false);
                  setMeditationRemaining(null);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-300"
              >
                Tạm dừng thiền
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-stone-400 mb-4">
                Chọn thời lượng thiền định. Tiếng chuông sẽ ngân lúc bắt đầu và khi kết thúc để trợ
                duyên an tĩnh.
              </p>
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {TEMPLE_CONFIG.meditation.durations.map((d) => (
                  <button
                    key={d.seconds}
                    onClick={() => setMeditationDuration(d.seconds)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      meditationDuration === d.seconds
                        ? 'border-amber-400 bg-amber-950/40 text-amber-200 shadow'
                        : 'border-stone-800 bg-stone-800/40 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-semibold text-xs">{d.label}</div>
                    <div className="text-[11px] text-amber-400/80 mt-1">+{d.sen} Sen</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setIsMeditating(true);
                  setMeditationRemaining(meditationDuration);
                  templeAudio.playTempleBell(216);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-sm shadow-lg"
              >
                Bắt Đầu Tọa Thiền
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Chanting Modal
  if (activeModal === 'chanting') {
    const activeChant = TEMPLE_CONFIG.chants.find((c) => c.id === selectedChantId)!;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <div className="w-full max-w-lg bg-stone-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl text-stone-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-serif font-bold text-amber-300">Tụng Kinh Niệm Phật</h2>
            </div>
            {!isChanting && (
              <button onClick={onClose} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {isChanting ? (
            <div className="py-4 text-center">
              <div className="text-xs text-amber-400/80 mb-2 font-semibold">
                {activeChant.title} (Câu {currentVerseIndex + 1}/{activeChant.verses.length})
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-stone-800 rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                  style={{
                    width: `${((currentVerseIndex + 1) / activeChant.verses.length) * 100}%`,
                  }}
                />
              </div>

              {/* Verse Display */}
              <div className="p-6 rounded-xl bg-stone-950/70 border border-amber-600/30 mb-6">
                <p className="text-xl md:text-2xl font-serif text-amber-200 leading-relaxed font-bold animate-pulse">
                  {activeChant.verses[currentVerseIndex]}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-stone-400 mb-6">
                <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>Nhịp mõ gõ khoan thai... hòa tâm theo lời kinh</span>
              </div>

              <button
                onClick={() => {
                  setIsChanting(false);
                  setCurrentVerseIndex(0);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-300"
              >
                Kết thúc sớm
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-stone-400 mb-4">
                Chọn bài kinh cầu an để tụng niệm trên bồ đoàn. Từng câu kinh sẽ hiển thị theo nhịp
                mõ thanh tịnh (+10 Sen khi hoàn thành bài).
              </p>

              <div className="space-y-3 mb-6">
                {TEMPLE_CONFIG.chants.map((chant) => (
                  <div
                    key={chant.id}
                    onClick={() => setSelectedChantId(chant.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedChantId === chant.id
                        ? 'border-amber-400 bg-amber-950/40 text-amber-100 shadow-md'
                        : 'border-stone-800 bg-stone-800/40 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-sm text-amber-300">{chant.title}</h4>
                      <span className="text-xs text-amber-400 font-bold">+{chant.rewardSen} Sen</span>
                    </div>
                    <p className="text-xs text-stone-400">{chant.description}</p>
                    <div className="text-[11px] text-stone-500 mt-2">
                      Gồm {chant.verses.length} câu • Khoảng {Math.round(chant.durationSec / 60)} phút
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setIsChanting(true);
                  setCurrentVerseIndex(0);
                  templeAudio.playTempleBell(216);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-sm shadow-lg"
              >
                Bắt Đầu Tụng Kinh
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
