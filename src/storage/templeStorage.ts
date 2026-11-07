import { TEMPLE_LEVELS, TempleLevel } from '../config/templeConfig';

export interface DailyStats {
  incenseCount: number;
  offeringCounts: Record<string, number>;
  bowingSets: number;
  meditationMinutes: number;
  chantsCount: number;
}

export interface PlayerProgress {
  playerName: string;
  senPoints: number;
  totalDays: number;
  lastActiveDate: string;
  dailyStats: DailyStats;
  offeringsOnAltar: Array<{ type: string; timestamp: number }>;
}

const STORAGE_KEY = 'chua_online_3d_save_v1';

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DEFAULT_STATS: DailyStats = {
  incenseCount: 0,
  offeringCounts: { lotus: 0, fruit: 0, lamp: 0 },
  bowingSets: 0,
  meditationMinutes: 0,
  chantsCount: 0,
};

export class TempleStorageService {
  private progress: PlayerProgress;

  constructor() {
    this.progress = this.load();
    this.checkDayRollover();
  }

  private load(): PlayerProgress {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          playerName: parsed.playerName || 'Phật tử thiện tâm',
          senPoints: typeof parsed.senPoints === 'number' ? parsed.senPoints : 10,
          totalDays: parsed.totalDays || 1,
          lastActiveDate: parsed.lastActiveDate || getTodayString(),
          dailyStats: { ...DEFAULT_STATS, ...(parsed.dailyStats || {}) },
          offeringsOnAltar: parsed.offeringsOnAltar || [],
        };
      }
    } catch {
      // Fallback
    }

    return {
      playerName: 'Phật tử thiện tâm',
      senPoints: 10,
      totalDays: 1,
      lastActiveDate: getTodayString(),
      dailyStats: { ...DEFAULT_STATS },
      offeringsOnAltar: [],
    };
  }

  public save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch {
      // Storage unavailable
    }
  }

  private checkDayRollover() {
    const today = getTodayString();
    if (this.progress.lastActiveDate !== today) {
      this.progress.lastActiveDate = today;
      this.progress.totalDays += 1;
      this.progress.dailyStats = { ...DEFAULT_STATS };
      this.progress.offeringsOnAltar = []; // Fresh altar for new day
      this.save();
    }
  }

  public getProgress(): PlayerProgress {
    this.checkDayRollover();
    return this.progress;
  }

  public setPlayerName(name: string) {
    this.progress.playerName = name.trim().slice(0, 20) || 'Phật tử thiện tâm';
    this.save();
  }

  public addSen(amount: number) {
    this.progress.senPoints += amount;
    this.save();
  }

  public getLevel(): TempleLevel {
    const sen = this.progress.senPoints;
    for (let i = TEMPLE_LEVELS.length - 1; i >= 0; i--) {
      if (sen >= TEMPLE_LEVELS[i].minSen) {
        return TEMPLE_LEVELS[i];
      }
    }
    return TEMPLE_LEVELS[0];
  }

  public recordIncense(): boolean {
    this.checkDayRollover();
    if (this.progress.dailyStats.incenseCount >= 5) return false;
    this.progress.dailyStats.incenseCount += 1;
    this.addSen(2);
    this.save();
    return true;
  }

  public recordOffering(type: string): boolean {
    this.checkDayRollover();
    const current = this.progress.dailyStats.offeringCounts[type] || 0;
    if (current >= 3) return false;

    this.progress.dailyStats.offeringCounts[type] = current + 1;
    this.progress.offeringsOnAltar.push({ type, timestamp: Date.now() });
    this.addSen(3);
    this.save();
    return true;
  }

  public recordBowing(): boolean {
    this.checkDayRollover();
    if (this.progress.dailyStats.bowingSets >= 3) return false;
    this.progress.dailyStats.bowingSets += 1;
    this.addSen(3);
    this.save();
    return true;
  }

  public recordMeditation(minutes: number, earnedSen: number) {
    this.checkDayRollover();
    this.progress.dailyStats.meditationMinutes += minutes;
    this.addSen(earnedSen);
    this.save();
  }

  public recordChant(earnedSen: number) {
    this.checkDayRollover();
    this.progress.dailyStats.chantsCount += 1;
    this.addSen(earnedSen);
    this.save();
  }
}

export const templeStorage = new TempleStorageService();
