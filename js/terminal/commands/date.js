import { i18n } from '../../i18n.js';

export function date(params, targetContent, addOutput) {
    const now = new Date();
    addOutput(now.toLocaleString(i18n.getCurrentLocale() === 'tr' ? 'tr-TR' : 'en-US'), targetContent);
} 