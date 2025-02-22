/**
 * Terminal çıktısını eklemek için yardımcı fonksiyon
 * @param {string} text - Eklenecek metin
 * @param {HTMLElement} targetContent - Hedef terminal içeriği
 * @param {string} className - Opsiyonel CSS sınıfı
 */
export function addOutput(text, targetContent, className = '') {
    const output = document.createElement('div');
    output.className = `terminal-line ${className}`;
    output.innerHTML = text;
    const promptElement = targetContent.querySelector('.terminal-prompt');
    targetContent.insertBefore(output, promptElement);
}

/**
 * Komut geçmişine komut eklemek için yardımcı fonksiyon
 * @param {string} text - Eklenecek komut metni
 * @param {HTMLElement} targetContent - Hedef terminal içeriği
 */
export function addToHistory(text, targetContent) {
    const historyLine = document.createElement('div');
    historyLine.className = 'terminal-line history';
    const [prompt, command] = text.split('$ ');
    historyLine.innerHTML = `<span style="color: #50fa7b">${prompt}$</span> ${command}`;
    const promptElement = targetContent.querySelector('.terminal-prompt');
    targetContent.insertBefore(historyLine, promptElement);
}

/**
 * Terminal içeriğini en alta kaydırmak için yardımcı fonksiyon
 * @param {HTMLElement} targetContent - Hedef terminal içeriği
 */
export function scrollToBottom(targetContent) {
    targetContent.scrollTop = targetContent.scrollHeight;
}

/**
 * İmleç pozisyonunu güncellemek için yardımcı fonksiyon
 * @param {HTMLInputElement} input - Terminal input elementi
 * @param {HTMLElement} cursor - İmleç elementi
 */
export function updateCursorPosition(input, cursor) {
    const inputValue = input.value;
    const cursorPosition = input.selectionStart;
    const textBeforeCursor = inputValue.substring(0, cursorPosition);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = getComputedStyle(input).font;
    const cursorOffset = context.measureText(textBeforeCursor).width;
    cursor.style.left = `${cursorOffset}px`;
}

/**
 * Metin genişliğini hesaplamak için yardımcı fonksiyon
 * @param {string} text - Ölçülecek metin
 * @param {HTMLElement} element - Font stilini alacağımız element
 * @returns {number} - Metnin piksel cinsinden genişliği
 */
export function getTextWidth(text, element) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = getComputedStyle(element).font;
    return context.measureText(text).width;
}

/**
 * Sekme başlığını güncellemek için yardımcı fonksiyon
 * @param {HTMLElement} tab - Güncellenecek sekme elementi
 * @param {string} path - Yeni yol
 */
export function updateTabTitle(tab, path) {
    const shortPath = path.replace('/home/guest', '~');
    tab.innerHTML = `guest@hasankonya:${shortPath}$ <i class="fas fa-times terminal-tab-close"></i>`;
}

/**
 * Terminal başlığını güncellemek için yardımcı fonksiyon
 * @param {string} path - Yeni yol
 */
export function updateTerminalHeader(path) {
    const terminalTitle = document.querySelector('.terminal-title');
    if (terminalTitle) {
        const shortPath = path.replace('/home/guest', '~');
        terminalTitle.textContent = `guest@hasankonya:${shortPath}`;
    }
}

/**
 * Sekme çubuğunun görünürlüğünü güncellemek için yardımcı fonksiyon
 */
export function updateTabBarVisibility() {
    const terminalTabs = document.querySelector('.terminal-tabs');
    const tabCount = terminalTabs.children.length;
    
    if (tabCount > 1) {
        terminalTabs.classList.add('show');
    } else {
        terminalTabs.classList.remove('show');
    }
} 