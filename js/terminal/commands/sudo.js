import { i18n } from '../../i18n.js';

export function sudo(params, targetContent, commandHistory, currentPath, setPath, utils) {
    utils.addOutput(i18n.t('system.noPermission'), targetContent);
} 