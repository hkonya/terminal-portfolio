import { i18n } from '../../i18n.js';

export function whoami(params, targetContent, addOutput) {
    addOutput(i18n.t('whoami.description'), targetContent);
} 