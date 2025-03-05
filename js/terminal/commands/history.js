import { i18n } from '../../i18n.js';

export function history(params, targetContent, commandHistory, currentPath, setPath, utils) {
    if (!commandHistory || commandHistory.length === 0) {
        utils.addOutput(i18n.t('history.empty'), targetContent);
        return;
    }

    let output = '';
    commandHistory.forEach((command, index) => {
        output += `${index + 1}  ${command}\n`;
    });

    utils.addOutput(output.trim(), targetContent);
} 