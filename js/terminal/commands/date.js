import { i18n } from '../../i18n.js';

export function date(params, targetContent, commandHistory, currentPath, setPath, utils) {
    const now = new Date();
    utils.addOutput(now.toLocaleString(i18n.getCurrentLocale() === 'tr' ? 'tr-TR' : 'en-US'), targetContent);
} 