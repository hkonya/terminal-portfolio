import { i18n } from '../../i18n.js';

export function whoami(params, targetContent, commandHistory, currentPath, setPath, utils) {
    utils.addOutput(i18n.t('whoami.description'), targetContent);
} 