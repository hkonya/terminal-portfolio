import { i18n } from '../../i18n.js';

export function exit(params, targetContent, addOutput, { terminalInput, clearTerminal }) {
    addOutput(i18n.t('system.goodbye'), targetContent);
    setTimeout(() => {
        const terminal = document.querySelector('.terminal');
        const terminalIcon = document.querySelector('.app-icon.active');
        
        // Terminal ekranını gizle
        terminal.style.display = 'none';
        
        // Terminal ikonunun active sınıfını kaldır
        terminalIcon.classList.remove('active');
        
        // Terminal ikonuna tıklama olayı ekle
        terminalIcon.addEventListener('click', () => {
            // Terminal ekranını göster
            terminal.style.display = 'flex';
            
            // Terminal ikonunu aktif yap
            terminalIcon.classList.add('active');
            
            // Terminal içeriğini başlangıç durumuna getir
            clearTerminal(targetContent);
            
            // Input'u focusla
            terminalInput.focus();
        }, { once: true }); // Sadece bir kez çalışması için
    }, 1000);
} 