import { i18n } from '../../i18n.js';

export function matrix(params, targetContent, addOutput) {
    addOutput(i18n.t('system.matrix.start'), targetContent);
    document.body.style.backgroundColor = '#000';
    setTimeout(() => {
        document.body.style.backgroundColor = '#0a192f';
        addOutput(i18n.t('system.matrix.stop'), targetContent);
    }, 3000);
} 