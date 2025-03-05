export class WindowManager {
    constructor() {
        this.windows = new Set();
        this.activeWindow = null;
        this.isAnyWindowOpen = false;
        this.setupTerminalIcon();
    }

    setupTerminalIcon() {
        const terminalIcon = document.querySelector('[data-app="terminal"]');
        const terminal = document.querySelector('.terminal');
        
        if (terminalIcon && terminal) {
            terminalIcon.addEventListener('click', () => {
                if (this.windows.size > 0) {  // Başka pencereler açıksa
                    if (terminal.classList.contains('minimized')) {
                        terminal.classList.remove('minimized');
                    }
                    this.setActiveWindow(terminal);
                }
            });
        }
    }

    static getInstance() {
        if (!WindowManager.instance) {
            WindowManager.instance = new WindowManager();
        }
        return WindowManager.instance;
    }

    addWindow(controls) {
        if (!controls || !controls.window) return;
        
        const { window, header, minimize, maximize, close } = controls;
        
        // Pencereyi koleksiyona ekle
        this.windows.add(window);
        
        // Pencere kontrollerini ayarla
        if (minimize) {
            minimize.addEventListener('click', () => {
                // Pencereyi minimize et
                window.classList.add('minimized');
                window.style.display = 'none';
                
                // Terminal hariç diğer pencerelerin ikonlarından active class'ını kaldır
                if (!window.classList.contains('terminal')) {
                    if (window.classList.contains('file-manager')) {
                        const fileManagerIcon = document.querySelector('[data-app="filemanager"]');
                        if (fileManagerIcon) {
                            fileManagerIcon.classList.remove('active');
                        }
                    } else if (window.classList.contains('pdf-viewer')) {
                        const viewerIcon = document.querySelector('[data-app="pdf-viewer"]');
                        if (viewerIcon) {
                            viewerIcon.classList.remove('active');
                        }
                    }
                }
                
                this.updateWindowState();
            });
        }
        
        if (maximize) {
            maximize.addEventListener('click', () => {
                window.classList.toggle('maximized');
                this.updateWindowState();
            });
        }
        
        if (close) {
            close.addEventListener('click', () => {
                window.remove();
                this.removeWindow(window);
            });
        }
        
        if (header) {
            let isDragging = false;
            let startX, startY;
            let initialX, initialY;
            
            header.addEventListener('mousedown', (e) => {
                if (!window.classList.contains('maximized')) {
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    
                    const rect = window.getBoundingClientRect();
                    initialX = rect.left;
                    initialY = rect.top;
                    
                    window.style.transition = 'none';
                }
            });
            
            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    
                    window.style.left = `${initialX + deltaX}px`;
                    window.style.top = `${initialY + deltaY}px`;
                }
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
                window.style.transition = '';
            });
        }
        
        // Pencereyi aktif hale getir
        this.setActiveWindow(window);
        
        // Pencere durumunu güncelle
        this.updateWindowState();
    }

    removeWindow(window) {
        this.windows.delete(window);
        // PDF görüntüleyici için özel işlem
        if (window.classList.contains('pdf-viewer')) {
            const viewerIcon = document.querySelector('[data-app="pdf-viewer"]');
            if (viewerIcon) {
                viewerIcon.remove();
            }
        }
        this.updateWindowState();
    }

    minimizeAllWindows() {
        this.windows.forEach(window => {
            window.classList.add('minimized');
        });
        this.updateWindowState();
    }

    updateWindowState() {
        this.isAnyWindowOpen = Array.from(this.windows).some(window => 
            window && !window.classList.contains('minimized')
        );
    }

    setActiveWindow(window) {
        if (!window) return;
        
        // Diğer pencerelerin z-index'ini düşür
        this.windows.forEach(w => {
            if (w !== window) {
                w.style.zIndex = '100';
            }
        });
        
        // Aktif pencereyi en üste getir
        window.style.zIndex = '101';
        this.activeWindow = window;
    }

    isWindowOpen() {
        return this.isAnyWindowOpen;
    }

    createWindowHeader(title, iconPath) {
        const header = document.createElement('div');
        header.className = 'window-header';
        header.innerHTML = `
            <div class="window-title">
                <img src="${iconPath}" alt="${title}" style="width: 16px; height: 16px;">
                ${title}
            </div>
            <div class="window-controls">
                <button class="minimize">
                    <i class="fas fa-window-minimize"></i>
                </button>
                <button class="maximize">
                    <i class="fas fa-window-maximize"></i>
                </button>
                <button class="close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        return header;
    }
}

// Singleton instance
WindowManager.instance = null; 