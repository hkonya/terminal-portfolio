import { i18n } from '../../i18n.js';

export function sudo(params, targetContent, addOutput) {
    addOutput(i18n.t('system.noPermission'), targetContent);
} 