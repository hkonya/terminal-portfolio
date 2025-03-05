import { WindowManager } from '../window/WindowManager.js';
import { i18n } from '../i18n.js';
import { fileSystem } from '../FileSystem.js';

export class DesktopIcon {
    constructor() {
        this.icons = document.querySelectorAll('.desktop-icon');
        this.selectedIcon = null;
        this.draggedIcon = null;
        this.isDragging = false;
        this.startPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
        this.offset = { x: 0, y: 0 };
        this.positions = new Map();
        this.windowManager = WindowManager.getInstance();
        this.mousePos = { x: 0, y: 0 };
        this.dragStartTime = 0;
        this.dragThreshold = 5;
        this.hasMovedBeyondThreshold = false;
        this.iconGrid = new Map();
        this.contextMenu = null;
        this.desktopContextMenu = null;

        // Grid ayarları
        this.GRID_SIZE = 100;
        this.MARGIN_RIGHT = 70;
        this.MARGIN_TOP = 40;
        this.ICONS_PER_COLUMN = Math.floor((window.innerHeight - this.MARGIN_TOP) / this.GRID_SIZE);

        // Async init'i başlat
        (async () => {
            await this.init();
        })();
    }

    async loadFilesystem() {
        const desktopPath = '/home/guest/Masaüstü';
        let desktopNode = fileSystem.traversePath(desktopPath);
        
        // Eğer Masaüstü dizini bulunamazsa, FileSystem'in oluşturulmasını bekle ve tekrar dene
        if (!desktopNode) {
            console.log('Masaüstü dizini bulunamadı, FileSystem oluşturulması bekleniyor...');
            
            // FileSystem'in hazır olmasını bekle
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Masaüstü dizinini oluştur
            try {
                fileSystem.createDirectory(desktopPath);
                desktopNode = fileSystem.traversePath(desktopPath);
            } catch (error) {
                console.error('Masaüstü dizini oluşturulurken hata:', error);
            }
            
            if (!desktopNode) {
                console.error('Masaüstü dizini bulunamadı!');
                return null;
            }
        }
        
        return desktopNode;
    }

    createFileSystemEntry(name, type, x, y) {
        const desktopPath = '/home/guest/Masaüstü';
        const fullPath = `${desktopPath}/${name}`;
        
        try {
            let node = null;
            
            if (type === 'folder') {
                fileSystem.createDirectory(fullPath);
                node = fileSystem.traversePath(fullPath);
                if (node) {
                    node.metadata = {
                        created: new Date().toISOString(),
                        accessed: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0,
                        path: fullPath,
                        position: { x, y }
                    };
                }
            } else {
                fileSystem.createFile(fullPath, '', '-rw-r--r--');
                node = fileSystem.traversePath(fullPath);
                if (node) {
                    const ext = name.split('.').pop() || '';
                    node.metadata = {
                        created: new Date().toISOString(),
                        accessed: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        isHidden: false,
                        path: fullPath,
                        position: { x, y },
                        extension: ext,
                        fileType: this.getFileType(name),
                        description: this.getFileDescription(name),
                        icon: this.getFileIcon(name),
                        mimeType: this.getMimeType(name),
                        version: '1.0',
                        isReadOnly: false,
                        isSystem: false,
                        checksum: Math.random().toString(16).substr(2, 7)
                    };
                }
            }
            
            // Node oluşturulduysa, LocalStorage'a kaydet
            if (node) {
                // Positions Map'i güncelle
                this.positions.set(name, { x, y });
                
                // FileSystem'i LocalStorage'a kaydet
                fileSystem.saveFileSystem();
                
                console.log(`Yeni ${type === 'folder' ? 'klasör' : 'dosya'} oluşturuldu:`, {
                    name: name,
                    position: { x, y },
                    path: fullPath
                });
            }
            
            return node;
        } catch (error) {
            console.error('Dosya sistemi girişi oluşturulurken hata:', error);
            return null;
        }
    }

    deleteFileSystemEntry(name) {
        const desktopPath = '/home/guest/Masaüstü';
        const fullPath = `${desktopPath}/${name}`;
        try {
            fileSystem.deleteItem(fullPath);
        } catch (error) {
            console.error('Dosya sistemi girişi silinirken hata:', error);
        }
    }

    renameFileSystemEntry(oldName, newName, force = false) {
        const desktopPath = '/home/guest/Masaüstü';
        const oldPath = `${desktopPath}/${oldName}`;
        const newPath = `${desktopPath}/${newName}`;
        
        try {
            const node = fileSystem.traversePath(oldPath);
            if (!node) {
                console.error('Yeniden adlandırılacak dosya bulunamadı:', oldPath);
                return false;
            }
            
            // Eğer hedef konumda dosya varsa ve force parametresi true değilse işlemi iptal et
            const existingTarget = fileSystem.traversePath(newPath);
            if (existingTarget && !force) {
                console.error('Hedef konumda dosya zaten var:', newPath);
                return false;
            }
            
            // Eğer hedef konumda dosya varsa ve force parametresi true ise, önce hedefi sil
            if (existingTarget && force) {
                fileSystem.deleteItem(newPath);
            }
            
            // Yeni dosya/dizin oluştur
            if (node.type === 'directory') {
                fileSystem.createDirectory(newPath);
            } else {
                fileSystem.createFile(newPath, node.content || '', node.permissions);
            }
            
            // Eski dosya/dizini sil
            fileSystem.deleteItem(oldPath);
            
            // Metadata'yı güncelle
            const newNode = fileSystem.traversePath(newPath);
            if (newNode) {
                newNode.metadata = {
                    ...node.metadata,
                    path: newPath,
                    accessed: new Date()
                };
            }
            
            // İkon konumunu güncelle
            this.saveIconPositions();
            
            return true;
        } catch (error) {
            console.error('Dosya sistemi girişi yeniden adlandırılırken hata:', error);
            return false;
        }
    }

    updateFileSystemEntryPosition(path, position) {
        try {
            // Sadece dosya adını kullan
            const fileName = path.split('/').pop();
            const success = fileSystem.updateNodePosition(fileName, position);
            if (success) {
                // Positions Map'i güncelle
                this.positions.set(fileName, position);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Dosya konumu güncellenirken hata oluştu: ${path}`, error);
            return false;
        }
    }

    loadIconsFromFilesystem() {
        const desktopPath = '/home/guest/Masaüstü';
        const desktop = fileSystem.traversePath(desktopPath);
        
        if (!desktop || !desktop.children) {
            console.error('Masaüstü içeriği yüklenemedi!');
            return;
        }
        
        // Masaüstü içeriğini temizle
        const desktopIcons = document.querySelector('.desktop-icons');
        desktopIcons.innerHTML = '';
        
        // Positions Map'i sıfırla
        this.positions = new Map();
        
        // Masaüstündeki tüm dosya ve klasörleri işle
        Object.keys(desktop.children).forEach(key => {
            const item = desktop.children[key];
            const position = item.metadata && item.metadata.position ? item.metadata.position : this.calculateNewIconPosition();
            const x = position.x;
            const y = position.y;
            
            // Dosya türüne göre ikon oluştur
            const type = item.type === 'directory' ? 'folder' : 'file';
            const icon = this.createIconElement(type, item.name, x, y);
            
            // Positions Map'e ekle
            this.positions.set(item.name, { x, y });
            
            console.log(`Yüklenen öğe: ${item.name}, konum: (${x}, ${y}), tür: ${type}`);
        });
        
        // İkonlar listesini güncelle
        this.icons = document.querySelectorAll('.desktop-icon');
        
        console.log('Masaüstü içeriği yüklendi, toplam öğe sayısı:', this.icons.length);
    }

    createIconElement(type, name, x, y) {
        const newIcon = document.createElement('div');
        newIcon.className = 'desktop-icon';
        newIcon.draggable = true;

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'icon-wrapper';
        
        const img = document.createElement('img');
        // CV dosyası için özel ikon
        if (name === 'CV.pdf') {
            img.src = 'img/cv.png';
        } else if (name.toLowerCase().endsWith('.pdf')) {
            img.src = 'img/pdf_file.png';
        } else if (name.toLowerCase().endsWith('.png') || 
            name.toLowerCase().endsWith('.jpg') || 
            name.toLowerCase().endsWith('.jpeg') || 
            name.toLowerCase().endsWith('.gif')) {
            img.src = 'img/image_file.png';
        } else {
            img.src = type === 'folder' ? 'img/places/folder.png' : 'img/text_file.png';
        }
        img.alt = name;

        const label = document.createElement('span');
        label.className = 'icon-label';
        label.textContent = name;

        iconWrapper.appendChild(img);
        newIcon.appendChild(iconWrapper);
        newIcon.appendChild(label);

        const desktopIcons = document.querySelector('.desktop-icons');
        desktopIcons.appendChild(newIcon);

        // İkonu konumlandır
        newIcon.style.left = `${x}px`;
        newIcon.style.top = `${y}px`;

        // Event listener'ları ekle
        this.setupIconEventListeners(newIcon);

        // İkonları güncelle
        this.icons = document.querySelectorAll('.desktop-icon');
        this.selectedIcon = newIcon;

        // Filesystem'de pozisyonu güncelle
        this.updateFileSystemEntryPosition(name, { x, y });

        return newIcon;
    }

    deleteIcon(icon) {
        const label = icon.querySelector('.icon-label').textContent;
        
        // Filesystem'den sil
        this.deleteFileSystemEntry(label);
        
        // İkonu kaldır
        icon.remove();
        
        // Seçili ikonu sıfırla
        if (this.selectedIcon === icon) {
            this.selectedIcon = null;
        }
    }

    // Onay diyaloğu göster
    showConfirmDialog(title, message, confirmText, cancelText, callback) {
        // Önceki modal varsa kaldır
        const existingModal = document.querySelector('.confirm-dialog-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Tema ayarlarını al
        const config = JSON.parse(localStorage.getItem('config')) || { darkTheme: false };
        const isDarkTheme = config.darkTheme;
        
        // Modal oluştur
        const modal = document.createElement('div');
        modal.className = 'name-dialog-modal confirm-dialog-modal';
        if (isDarkTheme) {
            modal.classList.add('dark-theme');
        }
        
        modal.innerHTML = `
            <div class="name-dialog-content">
                <div class="name-dialog-header">
                    <h3>${title}</h3>
                    <button class="name-dialog-close">&times;</button>
                </div>
                <div class="name-dialog-body">
                    <div class="confirm-message">
                        ${message}
                    </div>
                </div>
                <div class="name-dialog-footer">
                    <button class="name-action-btn cancel-btn">${cancelText || 'İptal'}</button>
                    <button class="name-action-btn confirm-btn">${confirmText || 'Tamam'}</button>
                </div>
            </div>
        `;
        
        // Modalı ekle
        document.body.appendChild(modal);
        
        // Kapatma düğmesi olayı
        const closeBtn = modal.querySelector('.name-dialog-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
                callback(false);
            });
        }
        
        // ESC tuşuna basıldığında modal'ı kapat
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleKeyDown);
                callback(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        // İptal butonu olayı
        const cancelBtn = modal.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.remove();
                document.removeEventListener('keydown', handleKeyDown);
                callback(false);
            });
        }
        
        // Onay butonu olayı
        const confirmBtn = modal.querySelector('.confirm-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                modal.remove();
                document.removeEventListener('keydown', handleKeyDown);
                callback(true);
            });
        }
    }

    renameIcon(icon) {
        const label = icon.querySelector('.icon-label');
        const oldName = label.textContent;
        
        label.contentEditable = true;
        label.focus();
        
        const range = document.createRange();
        range.selectNodeContents(label);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        const saveRename = () => {
            label.contentEditable = false;
            const newName = label.textContent.trim();
            
            if (newName && newName !== oldName) {
                const desktopPath = '/home/guest/Masaüstü';
                const newFullPath = `${desktopPath}/${newName}`;
                const existingFile = fileSystem.traversePath(newFullPath);
                
                if (!existingFile) {
                    // Filesystem'de güncelle
                    this.renameFileSystemEntry(oldName, newName);
                } else {
                    // Yeniden adlandırma işleminde hata - aynı isimde dosya var
                    label.textContent = oldName;
                    
                    // Onay penceresini göster
                    this.showConfirmDialog(
                        'Dosya Zaten Var',
                        `"${newName}" isimli bir dosya veya klasör zaten var. Üzerine yazmak istiyor musunuz?`,
                        'Üzerine Yaz',
                        'İptal',
                        (confirmed) => {
                            if (confirmed) {
                                // Kullanıcı onay verdi, üzerine yaz
                                this.renameFileSystemEntry(oldName, newName, true);
                            } else {
                                // İptal edildi, eski ismi koru
                                label.textContent = oldName;
                            }
                        }
                    );
                }
            } else {
                label.textContent = oldName;
            }
        };

        label.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveRename();
            } else if (e.key === 'Escape') {
                label.textContent = oldName;
                label.contentEditable = false;
            }
        });

        label.addEventListener('blur', saveRename);
    }

    showProperties(icon) {
        const label = icon.querySelector('.icon-label').textContent;
        const desktopPath = '/home/guest/Masaüstü';
        const fullPath = `${desktopPath}/${label}`;
        const entry = fileSystem.traversePath(fullPath);
        
        if (entry) {
            const created = new Date(entry.metadata?.created).toLocaleString();
            const accessed = new Date(entry.metadata?.accessed).toLocaleString();
            const modified = new Date(entry.lastModified).toLocaleString();
            const position = entry.metadata?.position || { x: 0, y: 0 };
            
            alert(`Özellikler:
Dosya Adı: ${entry.name}
Konum: ${entry.metadata?.path || fullPath}
Tür: ${entry.type === 'directory' ? 'Klasör' : 'Dosya'}
İzinler: ${entry.permissions}
Sahibi: ${entry.owner}
Grup: ${entry.group}
Boyut: ${entry.size}
Oluşturulma: ${created}
Son Erişim: ${accessed}
Değiştirilme: ${modified}
Konum (x,y): ${position.x}, ${position.y}
${entry.type === 'directory' ? 
    `Alt Dizinler: ${entry.metadata?.directories || 0}
Alt Dosyalar: ${entry.metadata?.files || 0}` : 
    `Dosya Tipi: ${entry.metadata?.fileType || 'Bilinmiyor'}
Açıklama: ${entry.metadata?.description || ''}`}`);
        }
    }

    handleMouseUp() {
        if (!this.isDragging || !this.draggedIcon) return;
        
        document.body.style.cursor = '';
        this.draggedIcon.style.cursor = '';
        
        if (this.hasMovedBeyondThreshold) {
            // Sürükleme efektlerini kaldır
            this.draggedIcon.classList.remove('dragging');
            this.draggedIcon.style.transform = '';
            this.draggedIcon.style.transition = '';
            this.draggedIcon.style.zIndex = '';
            
            // Yeni pozisyonu al
            const x = parseInt(this.draggedIcon.style.left);
            const y = parseInt(this.draggedIcon.style.top);
            
            // Positions Map'i güncelle
            this.positions.set(this.draggedIcon.querySelector('.icon-label').textContent, { x, y });
            
            // Filesystem'de pozisyonu güncelle
            this.updateFileSystemEntryPosition(this.draggedIcon.querySelector('.icon-label').textContent, { x, y });
            
            // Tüm pozisyonları kaydet
            this.saveIconPositions();
            
            console.log(`İkon pozisyonu güncellendi: ${this.draggedIcon.querySelector('.icon-label').textContent} (${x}, ${y})`);
        }
        
        this.isDragging = false;
        this.draggedIcon = null;
        this.hasMovedBeyondThreshold = false;
    }

    initializeGrid() {
        // İkonları grid sistemine yerleştir
        this.icons.forEach((icon, index) => {
            const gridPos = this.calculateGridPosition(index);
            this.iconGrid.set(icon, gridPos);
        });
    }

    calculateGridPosition(index) {
        const GRID_SIZE = 100; // px cinsinden grid hücre boyutu
        const ICONS_PER_ROW = Math.floor((window.innerWidth - 100) / GRID_SIZE);
        
        const row = Math.floor(index / ICONS_PER_ROW);
        const col = index % ICONS_PER_ROW;
        
        return {
            x: col * GRID_SIZE + 70, // Sol kenardan offset
            y: row * GRID_SIZE + 40  // Üst kenardan offset
        };
    }

    loadIconPositions() {
        const desktopPath = '/home/guest/Masaüstü';
        const desktop = fileSystem.traversePath(desktopPath);
        
        if (!desktop || !desktop.children) return;

        Object.entries(desktop.children).forEach(([name, entry]) => {
            const position = entry.metadata?.position;
            if (position) {
                const icon = Array.from(this.icons).find(icon => 
                    icon.querySelector('.icon-label').textContent === name
                );
                if (icon) {
                    icon.style.left = `${position.x}px`;
                    icon.style.top = `${position.y}px`;
                }
            }
        });
    }

    saveIconPositions() {
        this.icons.forEach(icon => {
            const label = icon.querySelector('.icon-label').textContent;
            const x = parseInt(icon.style.left);
            const y = parseInt(icon.style.top);
            
            // Her ikon için pozisyon güncelle
            if (this.updateFileSystemEntryPosition(label, { x, y })) {
                // Positions Map'i güncelle
                this.positions.set(label, { x, y });
            }
        });
    }

    createContextMenu() {
        // Varsa eski menüyü kaldır
        if (this.contextMenu) {
            this.contextMenu.remove();
        }

        // Yeni menü oluştur
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'context-menu';
        this.contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="open">
                <i class="fas fa-folder-open"></i>
                Aç
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="rename">
                <i class="fas fa-edit"></i>
                Yeniden Adlandır
            </div>
            <div class="context-menu-item" data-action="delete">
                <i class="fas fa-trash-alt"></i>
                Sil
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="properties">
                <i class="fas fa-info-circle"></i>
                Özellikler
            </div>
        `;

        this.contextMenu.style.backgroundColor = isDarkTheme ? 'rgba(32, 32, 32, 0.98)' : 'rgba(250, 251, 250, 0.98)';
        this.contextMenu.style.color = isDarkTheme ? '#fafbfa' : '#202020';
        this.contextMenu.style.boxShadow = isDarkTheme ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)';

        document.body.appendChild(this.contextMenu);

        // Menü öğelerine tıklama olayları ekle
        this.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleContextMenuAction(e, item.dataset.action));
        });

        // Menü öğelerinin renklerini ayarla
        const menuItems = this.contextMenu.querySelectorAll('.context-menu-item');
        menuItems.forEach(item => {
            item.style.color = isDarkTheme ? '#fafbfa' : '#202020';
            const icon = item.querySelector('i');
            if (icon) {
                icon.style.color = isDarkTheme ? '#fafbfa' : '#202020';
            }
        });

        // Ayraç rengini ayarla
        const separators = this.contextMenu.querySelectorAll('.context-menu-separator');
        separators.forEach(sep => {
            sep.style.backgroundColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        });
    }

    handleContextMenuAction(e, action) {
        e.preventDefault();
        if (!this.selectedIcon) return;

        const iconLabel = this.selectedIcon.querySelector('.icon-label').textContent;

        switch(action) {
            case 'open':
                this.handleDoubleClick(e, this.selectedIcon);
                break;
            case 'rename':
                this.renameIcon(this.selectedIcon);
                break;
            case 'delete':
                this.deleteIcon(this.selectedIcon);
                break;
            case 'properties':
                this.showProperties(this.selectedIcon);
                break;
        }

        this.hideContextMenu();
    }

    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.classList.remove('show');
        }
    }

    createDesktopContextMenu() {
        if (this.desktopContextMenu) {
            this.desktopContextMenu.classList.remove('show');
        }

        // Tema ayarlarını al
        const config = JSON.parse(localStorage.getItem('config')) || { darkTheme: false };
        const isDarkTheme = config.darkTheme;

        this.desktopContextMenu = document.createElement('div');
        this.desktopContextMenu.className = 'context-menu';
        this.desktopContextMenu.innerHTML = `
                    <div class="context-menu-item" data-action="new-folder">
                        <i class="fas fa-folder"></i>
                Yeni Klasör
                    </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="paste">
                <i class="fas fa-paste"></i>
                Yapıştır
                    </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="select-all">
                <i class="fas fa-check-square"></i>
                Tümünü Seç
                </div>
            <div class="context-menu-item has-submenu" data-action="sort">
                <i class="fas fa-sort"></i>
                Sırala...
                <i class="fas fa-chevron-right submenu-arrow"></i>
                <div class="submenu">
                    <div class="context-menu-item" data-action="sort-keep">
                        <i class="fas fa-th"></i>
                        Düzenli Tut
            </div>
            <div class="context-menu-separator"></div>
                    <div class="context-menu-item" data-action="sort-name">
                        <i class="fas fa-font"></i>
                        Ada Göre Sırala
            </div>
                    <div class="context-menu-item" data-action="sort-name-desc">
                        <i class="fas fa-sort-alpha-down-alt"></i>
                        Azalan Şekilde Sırala
                    </div>
                </div>
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="show-in-files">
                <i class="fas fa-folder-open"></i>
                Masaüstünü Dosyalar'da Göster
            </div>
            <div class="context-menu-item" data-action="open-terminal">
                <i class="fas fa-terminal"></i>
                Uçbirimde Aç
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="change-background">
                <i class="fas fa-image"></i>
                Arka Planı Değiştir...
            </div>
            <div class="context-menu-item" data-action="display-settings">
                <i class="fas fa-desktop"></i>
                Masaüstü Simgeleri Ayarları
            </div>
            <div class="context-menu-item" data-action="display">
                <i class="fas fa-cog"></i>
                Görüntü Ayarları
            </div>
        `;

        // Tema renklerini uygula
        this.desktopContextMenu.style.backgroundColor = isDarkTheme ? 'rgba(32, 32, 32, 0.98)' : 'rgba(250, 251, 250, 0.98)';
        this.desktopContextMenu.style.color = isDarkTheme ? '#fafbfa' : '#202020';
        this.desktopContextMenu.style.boxShadow = isDarkTheme ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)';

        document.body.appendChild(this.desktopContextMenu);

        // Menü öğelerine tıklama olayları ekle
        this.desktopContextMenu.querySelectorAll('.context-menu-item:not(.has-submenu)').forEach(item => {
            item.addEventListener('click', (e) => this.handleDesktopContextMenuAction(e, item.dataset.action));
        });

        // Menü öğelerinin renklerini ayarla
        const menuItems = this.desktopContextMenu.querySelectorAll('.context-menu-item');
        menuItems.forEach(item => {
            item.style.color = isDarkTheme ? '#fafbfa' : '#202020';
            const icon = item.querySelector('i');
            if (icon) {
                icon.style.color = isDarkTheme ? '#fafbfa' : '#202020';
            }
        });

        // Alt menünün renklerini ayarla
        const submenu = this.desktopContextMenu.querySelector('.submenu');
        if (submenu) {
            submenu.style.backgroundColor = isDarkTheme ? 'rgba(32, 32, 32, 0.98)' : 'rgba(250, 251, 250, 0.98)';
            submenu.style.boxShadow = isDarkTheme ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)';
            
            // Alt menü öğelerinin renklerini ayarla
            const submenuItems = submenu.querySelectorAll('.context-menu-item');
            submenuItems.forEach(item => {
                item.style.color = isDarkTheme ? '#fafbfa' : '#202020';
                const icon = item.querySelector('i');
                if (icon) {
                    icon.style.color = isDarkTheme ? '#fafbfa' : '#202020';
                }
            });
        }

        // Ayraç rengini ayarla
        const separators = this.desktopContextMenu.querySelectorAll('.context-menu-separator');
        separators.forEach(sep => {
            sep.style.backgroundColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        });

        // Alt menü için hover olayları
        const sortMenuItem = this.desktopContextMenu.querySelector('[data-action="sort"]');
        const submenuHover = sortMenuItem.querySelector('.submenu');

        sortMenuItem.addEventListener('mouseenter', () => {
            const rect = sortMenuItem.getBoundingClientRect();
            submenuHover.style.left = '100%';
            submenuHover.style.top = '0';
            
            // Ekran sınırlarını kontrol et
            const submenuRect = submenuHover.getBoundingClientRect();
            if (submenuRect.right > window.innerWidth) {
                submenuHover.style.left = 'auto';
                submenuHover.style.right = '100%';
            }
        });
    }

    handleDesktopContextMenuAction(e, action) {
        e.preventDefault();
        const clickX = e.clientX - 70;
        const clickY = e.clientY - 40;

        switch(action) {
            case 'new-folder':
                this.hideDesktopContextMenu();
                this.showNameDialog('folder', (name) => {
                    // Önce FileSystem'e kaydet
                    const node = this.createFileSystemEntry(name, 'folder', clickX, clickY);
                    if (node) {
                        // Sonra ikon oluştur
                        const icon = this.createIconElement('folder', name, clickX, clickY);
                        console.log('Yeni klasör oluşturuldu:', {
                            name: name,
                            position: { x: clickX, y: clickY },
                            node: node
                        });
                    } else {
                        console.error('Klasör oluşturulamadı:', name);
                    }
                });
                break;
            case 'paste':
                console.log('Yapıştır');
                this.hideDesktopContextMenu();
                break;
            case 'select-all':
                // Tüm ikonları seç
                this.icons.forEach(icon => {
                    icon.classList.add('selected');
                });
                this.selectedIcon = this.icons[0]; // İlk ikonu seçili ikon olarak ayarla
                this.hideDesktopContextMenu();
                break;
            case 'sort-icons':
                console.log('Simgeleri Sırala');
                this.hideDesktopContextMenu();
                break;
            case 'sort-keep':
                console.log('Düzenli Tut');
                this.hideDesktopContextMenu();
                break;
            case 'sort-stack':
                console.log('Türe Göre Yığılı Tut');
                this.hideDesktopContextMenu();
                break;
            case 'sort-devices':
                console.log('Evi/Sürücüleri/Çöp Kutusunu Sırala');
                this.hideDesktopContextMenu();
                break;
            case 'sort-name':
                // İkonları ada göre sırala (A'dan Z'ye)
                const sortedIcons = Array.from(this.icons).sort((a, b) => {
                    const nameA = a.querySelector('.icon-label').textContent.toLowerCase();
                    const nameB = b.querySelector('.icon-label').textContent.toLowerCase();
                    return nameA.localeCompare(nameB);
                });

                // Sağdan sola grid pozisyonlarını hesapla ve uygula
                sortedIcons.forEach((icon, index) => {
                    const column = Math.floor(index / this.ICONS_PER_COLUMN);
                    const row = index % this.ICONS_PER_COLUMN;
                    
                    // Sağdan sola pozisyon hesapla
                    const x = window.innerWidth - ((column + 1) * this.GRID_SIZE) - this.MARGIN_RIGHT;
                    const y = row * this.GRID_SIZE + this.MARGIN_TOP;
                    
                    // İkonu yeni pozisyona yerleştir
                    icon.style.left = `${x}px`;
                    icon.style.top = `${y}px`;
                    
                    // Pozisyonları kaydet
                    const label = icon.querySelector('.icon-label').textContent;
                    this.positions.set(label, { x, y });
                    
                    // Filesystem'de pozisyonu güncelle
                    this.updateFileSystemEntryPosition(label, { x, y });
                });

                this.saveIconPositions();
                this.hideDesktopContextMenu();
                if (this.desktopContextMenu) {
                    this.desktopContextMenu.remove();
                }
                break;
            case 'sort-name-desc':
                // İkonları ada göre sırala (Z'den A'ya)
                const sortedIconsDesc = Array.from(this.icons).sort((a, b) => {
                    const nameA = a.querySelector('.icon-label').textContent.toLowerCase();
                    const nameB = b.querySelector('.icon-label').textContent.toLowerCase();
                    return nameB.localeCompare(nameA);
                });

                // Sağdan sola grid pozisyonlarını hesapla ve uygula
                sortedIconsDesc.forEach((icon, index) => {
                    const column = Math.floor(index / this.ICONS_PER_COLUMN);
                    const row = index % this.ICONS_PER_COLUMN;
                    
                    // Sağdan sola pozisyon hesapla
                    const x = window.innerWidth - ((column + 1) * this.GRID_SIZE) - this.MARGIN_RIGHT;
                    const y = row * this.GRID_SIZE + this.MARGIN_TOP;
                    
                    // İkonu yeni pozisyona yerleştir
                    icon.style.left = `${x}px`;
                    icon.style.top = `${y}px`;
                    
                    // Pozisyonları kaydet
                    const label = icon.querySelector('.icon-label').textContent;
                    this.positions.set(label, { x, y });
                    
                    // Filesystem'de pozisyonu güncelle
                    this.updateFileSystemEntryPosition(label, { x, y });
                });

                this.saveIconPositions();
                this.hideDesktopContextMenu();
                if (this.desktopContextMenu) {
                    this.desktopContextMenu.remove();
                }
                break;
            case 'sort-date':
                console.log('Değiştirilme Zamanına Göre Sırala');
                this.hideDesktopContextMenu();
                break;
            case 'sort-type':
                console.log('Türe Göre Sırala');
                this.hideDesktopContextMenu();
                break;
            case 'sort-size':
                console.log('Boyuta Göre Sırala');
                this.hideDesktopContextMenu();
                break;
            case 'show-in-files':
                console.log('Masaüstünü Dosyalar\'da Göster');
                this.hideDesktopContextMenu();
                break;
            case 'open-terminal':
                console.log('Uçbirimde Aç');
                this.hideDesktopContextMenu();
                break;
            case 'change-background':
                console.log('Arka Planı Değiştir');
                this.hideDesktopContextMenu();
                break;
            case 'display-settings':
                console.log('Masaüstü Simgeleri Ayarları');
                this.hideDesktopContextMenu();
                break;
            case 'display':
                console.log('Görüntü Ayarları');
                this.hideDesktopContextMenu();
                break;
        }
    }

    showNameDialog(type, callback) {
        // Dialog oluştur
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.left = '50%';
        dialog.style.top = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = 'white';
        dialog.style.padding = '20px';
        dialog.style.borderRadius = '8px';
        dialog.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        dialog.style.zIndex = '10000';
        dialog.style.minWidth = '300px';

        const config = JSON.parse(localStorage.getItem('config')) || { darkTheme: false };
        const isDarkTheme = config.darkTheme;

        if (isDarkTheme) {
            dialog.style.backgroundColor = '#202020';
            dialog.style.color = '#fafbfa';
            dialog.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        }

        // Dialog başlığı
        const title = document.createElement('div');
        title.textContent = type === 'folder' ? i18n.t('dialog.folderName') : i18n.t('dialog.fileName');
        title.style.marginBottom = '15px';
        title.style.fontSize = '16px';
        title.style.fontWeight = '500';

        // Input alanı
        const input = document.createElement('input');
        input.type = 'text';
        const defaultName = type === 'folder' ? i18n.t('dialog.newFolder') : i18n.t('dialog.newTextFile');
        input.value = this.getUniqueIconName(defaultName);
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.marginBottom = '15px';
        input.style.border = '1px solid #ddd';
        input.style.borderRadius = '4px';
        input.style.fontSize = '14px';
        input.style.backgroundColor = isDarkTheme ? '#333' : '#fff';
        input.style.color = isDarkTheme ? '#fff' : '#333';
        input.style.outline = 'none';

        // Hata mesajı alanı
        const errorMsg = document.createElement('div');
        errorMsg.style.color = '#ff4444';
        errorMsg.style.fontSize = '12px';
        errorMsg.style.marginBottom = '10px';
        errorMsg.style.display = 'none';

        // Butonlar container
        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.justifyContent = 'flex-end';
        buttons.style.gap = '10px';

        // Tamam butonu
        const okButton = document.createElement('button');
        okButton.textContent = i18n.t('dialog.ok');
        okButton.style.padding = '8px 16px';
        okButton.style.backgroundColor = '#d13d01';
        okButton.style.color = 'white';
        okButton.style.border = 'none';
        okButton.style.borderRadius = '4px';
        okButton.style.cursor = 'pointer';
        okButton.style.fontSize = '14px';

        // İptal butonu
        const cancelButton = document.createElement('button');
        cancelButton.textContent = i18n.t('dialog.cancel');
        cancelButton.style.padding = '8px 16px';
        cancelButton.style.backgroundColor = isDarkTheme ? '#333' : '#f5f5f5';
        cancelButton.style.color = isDarkTheme ? '#fff' : '#333';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.cursor = 'pointer';
        cancelButton.style.fontSize = '14px';

        // Elementleri birleştir
        buttons.appendChild(cancelButton);
        buttons.appendChild(okButton);
        dialog.appendChild(title);
        dialog.appendChild(input);
        dialog.appendChild(errorMsg);
        dialog.appendChild(buttons);

        document.body.appendChild(dialog);

        // Input'u seç
        input.select();

        const validateAndSubmit = () => {
            const name = input.value.trim();
            if (name) {
                const uniqueName = this.getUniqueIconName(name);
                dialog.remove();
                callback(uniqueName);
            }
        };

        // Event listeners
        okButton.onclick = validateAndSubmit;

        cancelButton.onclick = () => {
            dialog.remove();
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                validateAndSubmit();
            } else if (e.key === 'Escape') {
                cancelButton.click();
            }
        };

        // Input değiştiğinde kontrol et
        input.oninput = () => {
            const name = input.value.trim();
            const existingIcons = document.querySelectorAll('.desktop-icon');
            const exists = Array.from(existingIcons).some(icon => 
                icon.querySelector('.icon-label').textContent === name
            );

            if (exists) {
                errorMsg.textContent = 'Bu isimde bir klasör/dosya zaten var!';
                errorMsg.style.display = 'block';
                okButton.disabled = true;
                okButton.style.opacity = '0.5';
            } else {
                errorMsg.style.display = 'none';
                okButton.disabled = false;
                okButton.style.opacity = '1';
            }
        };
    }

    renameLastCreatedIcon(newName) {
        if (this.selectedIcon) {
            const label = this.selectedIcon.querySelector('.icon-label');
            const oldName = label.textContent;
            label.textContent = newName;

            // Pozisyonları güncelle
            const pos = this.positions.get(oldName);
            if (pos) {
                this.positions.delete(oldName);
                this.positions.set(newName, pos);
                this.saveIconPositions();
            }
        }
    }

    deleteLastCreatedIcon() {
        if (this.selectedIcon) {
            const label = this.selectedIcon.querySelector('.icon-label').textContent;
            this.positions.delete(label);
            this.saveIconPositions();
            this.selectedIcon.remove();
            this.selectedIcon = null;
        }
    }

    setupIconEventListeners(icon) {
        icon.addEventListener('mousedown', (e) => this.handleMouseDown(e, icon));
        icon.addEventListener('click', (e) => this.handleClick(e, icon));
        icon.addEventListener('dblclick', (e) => this.handleDoubleClick(e, icon));
        icon.addEventListener('contextmenu', (e) => this.handleContextMenu(e, icon));
        
        icon.addEventListener('touchstart', (e) => this.handleTouchStart(e, icon));
        icon.addEventListener('touchmove', (e => this.handleTouchMove(e, icon)));
        icon.addEventListener('touchend', (e) => this.handleTouchEnd(e, icon));
    }

    calculateNewIconPosition() {
        // Mevcut ikonların pozisyonlarını kontrol et
        const usedPositions = new Set();
        this.icons.forEach(icon => {
            const style = window.getComputedStyle(icon);
            const x = parseInt(style.left);
            const y = parseInt(style.top);
            usedPositions.add(`${x},${y}`);
        });

        // Grid sistemine göre boş bir pozisyon bul
        const GRID_SIZE = 100;
        const MARGIN_LEFT = 70;
        const MARGIN_TOP = 40;
        const MAX_COLUMNS = Math.floor((window.innerWidth - MARGIN_LEFT) / GRID_SIZE);

        for (let row = 0; row < Math.ceil(window.innerHeight / GRID_SIZE); row++) {
            for (let col = 0; col < MAX_COLUMNS; col++) {
                const x = col * GRID_SIZE + MARGIN_LEFT;
                const y = row * GRID_SIZE + MARGIN_TOP;
                
                if (!usedPositions.has(`${x},${y}`)) {
                    return { x, y };
                }
            }
        }

        // Eğer boş pozisyon bulunamazsa en son ikonun altına ekle
        return {
            x: MARGIN_LEFT,
            y: (Math.ceil(this.icons.length / MAX_COLUMNS)) * GRID_SIZE + MARGIN_TOP
        };
    }

    showContextMenu(x, y) {
        // Varsa eski menüyü kaldır
        if (this.contextMenu) {
            this.contextMenu.remove();
        }

        // Yeni menü oluştur
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'context-menu';
        this.contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="open">
                <i class="fas fa-folder-open"></i>
                Aç
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="rename">
                <i class="fas fa-edit"></i>
                Yeniden Adlandır
            </div>
            <div class="context-menu-item" data-action="delete">
                <i class="fas fa-trash-alt"></i>
                Sil
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="properties">
                <i class="fas fa-info-circle"></i>
                Özellikler
            </div>
        `;

        // Tema ayarlarını uygula
        const config = JSON.parse(localStorage.getItem('config')) || { darkTheme: false };
        const isDarkTheme = config.darkTheme;

        this.contextMenu.style.backgroundColor = isDarkTheme ? 'rgba(32, 32, 32, 0.98)' : 'rgba(250, 251, 250, 0.98)';
        this.contextMenu.style.color = isDarkTheme ? '#fafbfa' : '#202020';
        this.contextMenu.style.boxShadow = isDarkTheme ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)';

        // Menü öğelerine tıklama olayları ekle
        this.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleContextMenuAction(e, item.dataset.action));
        });

        // Menüyü konumlandır
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        
        // Ekran sınırlarını kontrol et
        document.body.appendChild(this.contextMenu);
        const rect = this.contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.contextMenu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.contextMenu.style.top = `${y - rect.height}px`;
        }

        // Menüyü göster
        setTimeout(() => this.contextMenu.classList.add('show'), 0);

        // Menü dışına tıklandığında kaldır
        const handleClickOutside = (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.contextMenu.remove();
                document.removeEventListener('click', handleClickOutside);
            }
        };
        document.addEventListener('click', handleClickOutside);
    }

    showDesktopContextMenu(x, y) {
        // Varsa eski menüyü kaldır
        if (this.desktopContextMenu) {
            this.desktopContextMenu.remove();
        }

        // Yeni menü oluştur
        this.createDesktopContextMenu();

        // Menüyü konumlandır
        this.desktopContextMenu.style.left = `${x}px`;
        this.desktopContextMenu.style.top = `${y}px`;
        
        // Ekran sınırlarını kontrol et
        const rect = this.desktopContextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.desktopContextMenu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.desktopContextMenu.style.top = `${y - rect.height}px`;
        }

        // Menüyü göster
        setTimeout(() => this.desktopContextMenu.classList.add('show'), 0);

        // Menü dışına tıklandığında kaldır
        const handleClickOutside = (e) => {
            if (!this.desktopContextMenu.contains(e.target)) {
                this.desktopContextMenu.remove();
                document.removeEventListener('click', handleClickOutside);
            }
        };
        document.addEventListener('click', handleClickOutside);
    }

    setupEventListeners() {
        this.icons.forEach(icon => {
            icon.addEventListener('mousedown', (e) => this.handleMouseDown(e, icon));
            icon.addEventListener('click', (e) => this.handleClick(e, icon));
            icon.addEventListener('dblclick', (e) => this.handleDoubleClick(e, icon));
            icon.addEventListener('contextmenu', (e) => this.handleContextMenu(e, icon));
            
            icon.addEventListener('touchstart', (e) => this.handleTouchStart(e, icon));
            icon.addEventListener('touchmove', (e) => this.handleTouchMove(e, icon));
            icon.addEventListener('touchend', (e) => this.handleTouchEnd(e, icon));
        });

        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
        document.addEventListener('click', (e) => this.handleDocumentClick(e));
        document.addEventListener('contextmenu', (e) => {
            const isDesktopIcon = e.target.closest('.desktop-icon');
            const isDesktopArea = e.target.closest('.desktop-icons') || e.target === document.body;
            
            if (!isDesktopIcon && isDesktopArea) {
                e.preventDefault();
                this.showDesktopContextMenu(e.clientX, e.clientY);
            } else if (!isDesktopIcon) {
                e.preventDefault();
                this.hideDesktopContextMenu();
            }
        });
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    handleKeyDown(e) {
        if (!this.selectedIcon) return;

        const currentIndex = Array.from(this.icons).indexOf(this.selectedIcon);
        let nextIndex = currentIndex;

        switch(e.key) {
            case 'ArrowRight':
                e.preventDefault();
                nextIndex = Math.min(currentIndex + 1, this.icons.length - 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                nextIndex = Math.max(currentIndex - 1, 0);
                break;
            case 'ArrowUp':
                e.preventDefault();
                const iconsPerRow = Math.floor((window.innerWidth - 100) / 100);
                nextIndex = Math.max(currentIndex - iconsPerRow, 0);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const iconsPerRow2 = Math.floor((window.innerWidth - 100) / 100);
                nextIndex = Math.min(currentIndex + iconsPerRow2, this.icons.length - 1);
                break;
            case 'Enter':
                e.preventDefault();
                this.handleDoubleClick(e, this.selectedIcon);
                break;
            case 'Escape':
                e.preventDefault();
                this.selectedIcon.classList.remove('selected');
                this.selectedIcon = null;
                break;
            case 'Delete':
                e.preventDefault();
                // İkonu silme işlemi burada yapılacak
                console.log('İkon siliniyor:', this.selectedIcon.querySelector('.icon-label').textContent);
                break;
        }

        if (nextIndex !== currentIndex) {
            this.selectedIcon.classList.remove('selected');
            this.selectedIcon = this.icons[nextIndex];
            this.selectedIcon.classList.add('selected');
            this.selectedIcon.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    handleClick(e, icon) {
        if (!this.isDragging && !this.hasMovedBeyondThreshold) {
            e.stopPropagation();
            
            // Diğer ikonların seçimini kaldır
            this.icons.forEach(i => {
                if (i !== icon) i.classList.remove('selected');
            });
            
            // Bu ikonu seç
            icon.classList.add('selected');
         this.selectedIcon = icon;
        }
    }

    handleMouseDown(e, icon) {
        e.preventDefault();
        
        if (this.windowManager.isWindowOpen()) {
            this.windowManager.minimizeAllWindows();
            return;
        }

        this.dragStartTime = Date.now();
        
        const rect = icon.getBoundingClientRect();
        const iconCenterX = rect.left + (rect.width / 2);
        const iconCenterY = rect.top + (rect.height / 2);
        
        // Cursor ile icon merkezi arasındaki offset'i hesapla
        this.offset.x = e.clientX - iconCenterX;
        this.offset.y = e.clientY - iconCenterY;
        
        this.mousePos.x = e.clientX;
        this.mousePos.y = e.clientY;
        
        this.startPos.x = rect.left;
        this.startPos.y = rect.top;
        
        this.isDragging = true;
        this.draggedIcon = icon;
        this.hasMovedBeyondThreshold = false;
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.draggedIcon || this.windowManager.isWindowOpen()) return;

        e.preventDefault();

        const deltaX = e.clientX - this.mousePos.x;
        const deltaY = e.clientY - this.mousePos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const dragDuration = Date.now() - this.dragStartTime;

        if (dragDuration > 200 && distance > this.dragThreshold) {
            this.hasMovedBeyondThreshold = true;
            this.draggedIcon.classList.add('dragging');
            document.body.style.cursor = 'grabbing';
            this.draggedIcon.style.cursor = 'grabbing';

            // Grid'e göre en yakın pozisyonu hesapla
            const gridX = Math.round((e.clientX - this.offset.x - (this.draggedIcon.offsetWidth / 2)) / this.GRID_SIZE) * this.GRID_SIZE;
            const gridY = Math.round((e.clientY - this.offset.y - (this.draggedIcon.offsetHeight / 2)) / this.GRID_SIZE) * this.GRID_SIZE;

            // Sınır kontrolleri
            const rightBoundary = window.innerWidth - this.MARGIN_RIGHT;
            const leftBoundary = this.MARGIN_RIGHT;
            const topBoundary = this.MARGIN_TOP;
            const bottomBoundary = window.innerHeight - this.MARGIN_TOP;
            
            // Grid'e göre ayarlanmış pozisyonları sınırlar içinde tut
            this.currentPos.x = Math.max(leftBoundary, Math.min(gridX + this.MARGIN_RIGHT, rightBoundary - this.draggedIcon.offsetWidth));
            this.currentPos.y = Math.max(topBoundary, Math.min(gridY + this.MARGIN_TOP, bottomBoundary - this.draggedIcon.offsetHeight));

            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;

            // İkonu yeni pozisyona taşı
            this.draggedIcon.style.left = `${this.currentPos.x}px`;
            this.draggedIcon.style.top = `${this.currentPos.y}px`;

            // FileSystem'i anlık olarak güncelle
            const label = this.draggedIcon.querySelector('.icon-label').textContent;
            this.updateFileSystemEntryPosition(label, this.currentPos.x, this.currentPos.y);
        }
    }

    handleTouchStart(e, icon) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.handleMouseDown(mouseEvent, icon);
    }

    handleTouchMove(e) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.handleMouseMove(mouseEvent);
    }

    handleTouchEnd(e) {
        this.handleMouseUp();
    }

    handleDoubleClick(e, icon) {
        e.preventDefault();
        const label = icon.querySelector('.icon-label').textContent;
        
        if (label === 'CV.pdf') {
            // Eğer PDF görüntüleyici zaten açıksa, yeni pencere açma
            const existingViewer = document.querySelector('.pdf-viewer');
            if (existingViewer) {
                // Varolan pencereyi öne getir
                this.windowManager.setActiveWindow(existingViewer);
                return;
            }

            // Kenar çubuğuna PDF görüntüleyici ikonu ekle
            const sideBar = document.querySelector('.app-icons');
            const existingViewerIcon = sideBar.querySelector('[data-app="pdf-viewer"]');
            
            if (!existingViewerIcon) {
                const viewerIcon = document.createElement('a');
                viewerIcon.className = 'app-icon active';
                viewerIcon.setAttribute('data-app', 'pdf-viewer');
                viewerIcon.innerHTML = `
                    <img src="img/apps/docviewer-app.png" alt="Belge Görüntüleyici">
                    <span class="tooltip">Belge Görüntüleyici</span>
                `;
                viewerIcon.addEventListener('click', () => {
                    const pdfViewer = document.querySelector('.pdf-viewer');
                    if (pdfViewer) {
                        // Minimize edilmiş durumdan çıkar
                        pdfViewer.classList.remove('minimized');
                        pdfViewer.style.display = 'block';
                        // İkonu aktif yap
                        viewerIcon.classList.add('active');
                        // Pencereyi öne getir
                        this.windowManager.setActiveWindow(pdfViewer);
                    }
                });

                const activeAppsContainer = document.querySelector('.active-apps');
                activeAppsContainer.appendChild(viewerIcon);
            }

            const pdfViewer = document.createElement('div');
            pdfViewer.className = 'window pdf-viewer';
            pdfViewer.innerHTML = `
                <div class="window-header">
                    <div class="window-title">
                        <img src="img/cv.png" alt="CV" style="width: 16px; height: 16px;">
                        ${label}
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
                </div>
                <div class="window-toolbar">
                    <div class="toolbar-group">
                        <button title="Önceki Sayfa" id="prev">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span class="page-info">Sayfa: <span id="page_num">1</span> / <span id="page_count">1</span></span>
                        <button title="Sonraki Sayfa" id="next">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <div class="toolbar-group">
                        <button title="Küçült" id="zoomOut">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        <select class="zoom-level" id="zoomLevel">
                            <option value="0.5">50%</option>
                            <option value="0.75">75%</option>
                            <option value="1" selected>100%</option>
                            <option value="1.25">125%</option>
                            <option value="1.5">150%</option>
                            <option value="2">200%</option>
                        </select>
                        <button title="Büyüt" id="zoomIn">
                            <i class="fas fa-search-plus"></i>
                        </button>
                    </div>
                    <div class="toolbar-group">
                        <button title="Tam Ekran" id="fullscreen">
                            <i class="fas fa-expand"></i>
                        </button>
                        <button title="Yazdır" id="print">
                            <i class="fas fa-print"></i>
                        </button>
                        <button title="İndir" id="download">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                <div class="window-content" id="pdf-container">
                </div>
                <div class="window-statusbar">
                    <span>Sayfa <span id="status_page_num">1</span> / <span id="status_page_count">1</span></span>
                    <span id="zoom-status">100%</span>
                </div>
            `;

            // Pencereyi ekle
            document.body.appendChild(pdfViewer);
            
            // PDF.js'i yükle ve PDF'i aç
            const loadingTask = window.pdfjsLib.getDocument('files/cv.pdf');
            let pdfDoc = null;
            let pageNum = 1;
            let currentZoom = 1.0;
            let currentRenderTask = null;
            
            loadingTask.promise.then(pdf => {
                pdfDoc = pdf;
                
                // PDF bilgilerini güncelle
                document.getElementById('page_count').textContent = pdf.numPages;
                document.getElementById('status_page_count').textContent = pdf.numPages;
                
                // İlk sayfayı göster
                renderPage(pageNum);
            });

            async function renderPage(num) {
                try {
                    // Eğer devam eden bir render işlemi varsa iptal et
                    if (currentRenderTask) {
                        await currentRenderTask.cancel();
                        currentRenderTask = null;
                    }

                    // Eski canvas'ı temizle
                    const container = document.getElementById('pdf-container');
                    container.innerHTML = '';

                    // Yeni canvas oluştur
                    const canvas = document.createElement('canvas');
                    canvas.id = 'pdf-canvas';
                    container.appendChild(canvas);

                    const page = await pdfDoc.getPage(num);
                    const context = canvas.getContext('2d');
                    
                    const viewport = page.getViewport({ scale: currentZoom });
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    
                    // Yeni render işlemini başlat
                    currentRenderTask = page.render(renderContext);
                    
                    // Render işleminin tamamlanmasını bekle
                    await currentRenderTask.promise;
                    
                    // Sayfa numaralarını güncelle
                    document.getElementById('page_num').textContent = num;
                    document.getElementById('status_page_num').textContent = num;
                    document.getElementById('zoom-status').textContent = `${Math.round(currentZoom * 100)}%`;
                    
                    currentRenderTask = null;
                } catch (error) {
                    if (error.name === 'RenderingCancelled') {
                        // Render işlemi iptal edildi, normal bir durum
                        console.log('Rendering cancelled');
                    } else {
                        console.error('Error rendering page:', error);
                    }
                }
            }

            // Sayfa gezinme işlevleri
            document.getElementById('prev').addEventListener('click', () => {
                if (pageNum <= 1) return;
                pageNum--;
                renderPage(pageNum);
            });
            
            document.getElementById('next').addEventListener('click', () => {
                if (pageNum >= pdfDoc.numPages) return;
                pageNum++;
                renderPage(pageNum);
            });
            
            // Zoom işlevleri
            document.getElementById('zoomIn').addEventListener('click', () => {
                currentZoom *= 1.25;
                renderPage(pageNum);
            });
            
            document.getElementById('zoomOut').addEventListener('click', () => {
                currentZoom *= 0.8;
                renderPage(pageNum);
            });
            
            document.getElementById('zoomLevel').addEventListener('change', (e) => {
                currentZoom = parseFloat(e.target.value);
                renderPage(pageNum);
            });

            // Pencere kontrollerini ayarla
            const controls = {
                window: pdfViewer,
                header: pdfViewer.querySelector('.window-header'),
                minimize: pdfViewer.querySelector('.minimize'),
                maximize: pdfViewer.querySelector('.maximize'),
                close: pdfViewer.querySelector('.close')
            };

            // Kapatma düğmesine özel olay dinleyicisi ekle
            controls.close.addEventListener('click', () => {
                // Kenar çubuğundaki ikonu bul ve kaldır
                const viewerIcon = document.querySelector('[data-app="pdf-viewer"]');
                if (viewerIcon) {
                    viewerIcon.remove();
                }
                // Pencereyi kaldır
                pdfViewer.remove();
            });

            // Pencereyi yönetici sınıfına ekle
            this.windowManager.addWindow(controls);
            
            // Pencereyi ortala
            const rect = pdfViewer.getBoundingClientRect();
            pdfViewer.style.left = `${(window.innerWidth - rect.width) / 2}px`;
            pdfViewer.style.top = `${(window.innerHeight - rect.height) / 2}px`;
        }
    }

    handleDocumentClick(e) {
        // Boş alana tıklandığında seçili ikonları temizle
        if (!e.target.closest('.desktop-icon') && !e.target.closest('.context-menu') && !e.target.closest('.submenu')) {
            // Tüm ikonların seçimini kaldır
            this.icons.forEach(icon => {
                icon.classList.remove('selected');
            });
            this.selectedIcon = null;

            // Context menüleri kapat
            this.hideContextMenu();
            this.hideDesktopContextMenu();
        }
    }

    // Grid sistemine göre ikonları düzenle
    arrangeIcons() {
        const desktopPath = '/home/guest/Masaüstü';
        this.icons.forEach((icon, index) => {
            const gridPos = this.calculateGridPosition(index);
            icon.style.left = `${gridPos.x}px`;
            icon.style.top = `${gridPos.y}px`;
            
            // Filesystem'de pozisyonu güncelle
            const label = icon.querySelector('.icon-label').textContent;
            this.updateFileSystemEntryPosition(label, gridPos);
        });
    }

    handleContextMenu(e, icon) {
        e.preventDefault();
        
        // İkonu seç
        if (this.selectedIcon !== icon) {
            this.icons.forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
            this.selectedIcon = icon;
        }
        
        // Menüyü göster
        this.showContextMenu(e.clientX, e.clientY);
    }

    hideDesktopContextMenu() {
        if (this.desktopContextMenu) {
            this.desktopContextMenu.classList.remove('show');
            this.desktopContextMenu.remove();
        }
    }

    // Aynı isimde eleman var mı kontrol et ve yeni isim öner
    getUniqueIconName(baseName) {
        const icons = document.querySelectorAll('.desktop-icon');
        const existingNames = new Set(Array.from(icons).map(icon => 
            icon.querySelector('.icon-label').textContent
        ));

        if (!existingNames.has(baseName)) return baseName;

        let counter = 1;
        let newName = `${baseName} ${counter}`;
        
        while (existingNames.has(newName)) {
            counter++;
            newName = `${baseName} ${counter}`;
        }
        
        return newName;
    }

    getFileType(name) {
        const ext = name.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': 'document',
            'txt': 'text',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image'
        };
        return typeMap[ext] || 'unknown';
    }

    getFileDescription(name) {
        const ext = name.split('.').pop().toLowerCase();
        const descMap = {
            'pdf': 'PDF Dökümanı',
            'txt': 'Metin Dosyası',
            'jpg': 'JPEG Resim Dosyası',
            'jpeg': 'JPEG Resim Dosyası',
            'png': 'PNG Resim Dosyası',
            'gif': 'GIF Animasyon Dosyası'
        };
        return descMap[ext] || 'Bilinmeyen Dosya Türü';
    }

    getFileIcon(name) {
        const ext = name.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': 'pdf_file.png',
            'txt': 'text_file.png',
            'jpg': 'image_file.png',
            'jpeg': 'image_file.png',
            'png': 'image_file.png',
            'gif': 'image_file.png'
        };
        return iconMap[ext] || 'unknown_file.png';
    }

    getMimeType(name) {
        const ext = name.split('.').pop().toLowerCase();
        const mimeMap = {
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif'
        };
        return mimeMap[ext] || 'application/octet-stream';
    }

    async init() {
        // Masaüstü içeriğini yükle
        let desktop = await this.loadFilesystem();
        
        // Eğer ilk denemede başarısız olduysa, kısa bir bekleme sonrası tekrar dene
        if (!desktop) {
            console.log('Masaüstü yüklenemedi, tekrar deneniyor...');
            await new Promise(resolve => setTimeout(resolve, 100));
            desktop = await this.loadFilesystem();
                
            if (!desktop) {
                console.error('Masaüstü dizini yüklenemedi!');
                return;
            }
        }
        
        // Başarılı yükleme sonrası devam et
        this.initializeAfterDesktopLoad(desktop);
    }

    // Yeni yardımcı metod
    initializeAfterDesktopLoad(desktop) {
        // Mevcut dosya sisteminden ikonları yükle
        this.loadIconsFromFilesystem();

        // CV dosyasını kontrol et ve yoksa ekle
        const cvPath = '/home/guest/Masaüstü/CV.pdf';
        const cvFile = fileSystem.traversePath(cvPath);
        if (!cvFile) {
            const defaultPos = this.calculateNewIconPosition();
            this.createFileSystemEntry('CV.pdf', 'file', defaultPos.x, defaultPos.y);
            this.createIconElement('file', 'CV.pdf', defaultPos.x, defaultPos.y);
        }

        this.setupEventListeners();
        this.initializeGrid();
        this.loadIconPositions(); // İkon pozisyonlarını yükle
        
        // Mevcut menüleri kontrol et ve temizle
        const existingContextMenus = document.querySelectorAll('.context-menu');
        existingContextMenus.forEach(menu => menu.remove());
    }
}

// İkonları başlat
let desktopIconInstance = null;
document.addEventListener('DOMContentLoaded', () => {
    if (!desktopIconInstance) {
        desktopIconInstance = new DesktopIcon();
    }
}); 