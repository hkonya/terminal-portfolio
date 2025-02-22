import { addOutput } from '../utils.js';
import { i18n } from '../../i18n.js';

export function history(params, targetContent, commandHistory) {
    if (!commandHistory || commandHistory.length === 0) {
        addOutput(i18n.t('history.empty'), targetContent);
        return;
    }

    let output = '';
    commandHistory.forEach((command, index) => {
        output += `${index + 1}  ${command}\n`;
    });

    addOutput(output.trim(), targetContent);
} 