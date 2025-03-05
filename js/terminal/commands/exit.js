import { i18n } from '../../i18n.js';

export function exit(params, targetContent, commandHistory, currentPath, setPath, utils) {
    utils.addOutput(i18n.t('system.goodbye'), targetContent);
    
    const terminal = document.querySelector('.terminal-container');
    const terminalWindow = document.querySelector('.terminal-window');
    
    if (terminal) {
        setTimeout(() => {
            terminal.classList.add('closing');
            
            setTimeout(() => {
                if (terminalWindow) {
                    terminalWindow.style.display = 'none';
                }
                
                // 1 saniye sonra yönlendirme yap
                setTimeout(() => {
                    window.location.href = 'https://hkonya.me';
                }, 1000);
            }, 1000);
        }, 500);
    } else {
        window.location.href = 'https://hkonya.me';
    }
} 