export const STAT_MIN = 0;
export const STAT_MAX = 100;

export function clampStat(value: number): number {
    if (value < STAT_MIN) return STAT_MIN;
    if (value > STAT_MAX) return STAT_MAX;
    return value;
}
