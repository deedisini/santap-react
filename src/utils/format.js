import { localParts } from '../../shared/operations.js';
export const todayKey = (now = new Date()) => localParts(now).date;
export const currentTime = (now = new Date()) => localParts(now).clock.slice(0, 5);
