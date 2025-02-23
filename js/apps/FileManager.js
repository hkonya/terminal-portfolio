export class FileManager {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.currentPath = '/home/guest';
        this.window = null;
        this.icon = null;
        this.lastPosition = null;
    }

    open() {
        // Eğer pencere zaten açıksa, sadece öne getir
        if (this.window) {
            if (this.window.classList.contains('minimized')) {
                this.window.classList.remove('minimized');
                this.window.style.display = 'block';
                if (this.icon) this.icon.classList.add('active');
            }
            this.windowManager.setActiveWindow(this.window);
            return;
        }

        // İkon referansını sakla
        this.icon = document.querySelector('[data-app="filemanager"]');

        // Eğer başka bir dosya yöneticisi penceresi varsa, onu kapat
        const existingFileManager = document.querySelector('.file-manager:not(.trash-manager)');
        if (existingFileManager) {
            // Son konumu sakla
            const rect = existingFileManager.getBoundingClientRect();
            this.lastPosition = {
                left: existingFileManager.style.left,
                top: existingFileManager.style.top
            };
            existingFileManager.remove();
            if (this.icon) this.icon.classList.remove('active');
        }

        this.window = document.createElement('div');
        this.window.className = 'window file-manager';
        
        this.window.innerHTML = `
            <div class="file-manager-header">
                <div class="header-left">
                    <button class="search-button">
                        <i class="fas fa-search"></i>
                    </button>
                    <span class="header-title">Dosyalar</span>
                    <button class="menu-button">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
                <div class="header-center">
                    <div class="navigation-buttons">
                        <button class="back"><i class="fas fa-chevron-left"></i></button>
                        <button class="forward"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="path-button">
                        <i class="fas fa-home"></i>
                        <span>Başlangıç</span>
                    </div>
                </div>
                <div class="header-right">
                    <button class="view-button">
                        <i class="fas fa-th-large"></i>
                    </button>
                    <button class="minimize">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="maximize">
                        <i class="fas fa-square"></i>
                    </button>
                    <button class="close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="file-manager-body">
                <div class="sidebar">
                    <div class="sidebar-section">
                        <a href="#" class="sidebar-item active">
                            <i class="fas fa-home"></i>
                            <span>Başlangıç</span>
                        </a>
                        <a href="#" class="sidebar-item">
                            <i class="fas fa-clock"></i>
                            <span>Son</span>
                        </a>
                        <a href="#" class="sidebar-item">
                            <i class="fas fa-star"></i>
                            <span>Yıldızlı</span>
                        </a>
                        <a href="#" class="sidebar-item">
                            <i class="fas fa-network-wired"></i>
                            <span>Ağ</span>
                        </a>
                        <a href="#" class="sidebar-item">
                            <i class="fas fa-trash"></i>
                            <span>Çöp</span>
                        </a>
                    </div>
                    <div class="sidebar-separator"></div>
                    <div class="sidebar-section">
                        <a href="#" class="sidebar-item">
                            <i class="fas fa-folder"></i>
                            <span>Belgeler</span>
                        </a>
                        <a href="#" class="sidebar-item">
                            <i class="fas fa-music"></i>
                            <span>Müzik</span>
                        </a>
                        <a href="#" class="sidebar-item">
                            <i class="fas fa-image"></i>
                            <span>Resimler</span>
                        </a>
                        <a href="#" class="sidebar-item">
                            <i class="fas fa-video"></i>
                            <span>Videolar</span>
                        </a>
                        <a href="#" class="sidebar-item">
                            <i class="fas fa-download"></i>
                            <span>İndirilenler</span>
                        </a>
                    </div>
                    <div class="sidebar-separator"></div>
                    <div class="sidebar-section">
                        <a href="#" class="sidebar-item">
                            <i class="fas fa-hdd"></i>
                            <span>Ubuntu 24.04</span>
                        </a>
                    </div>
                </div>
                <div class="content">
                    <div class="file-list">
                    </div>
                </div>
            </div>
        `;

        // Mevcut ikonu aktif yap
        if (this.icon) {
            this.icon.classList.add('active');
        }

        // Pencereyi DOM'a ekle
        document.body.appendChild(this.window);

        // WindowManager'a pencereyi ekle
        this.windowManager.addWindow({
            window: this.window,
            header: this.window.querySelector('.file-manager-header'),
            minimize: this.window.querySelector('.minimize'),
            maximize: this.window.querySelector('.maximize'),
            close: this.window.querySelector('.close')
        });

        // Pencereyi konumlandır
        if (this.lastPosition) {
            // Eğer kaydedilmiş konum varsa, onu kullan
            this.window.style.left = this.lastPosition.left;
            this.window.style.top = this.lastPosition.top;
        } else {
            // İlk açılışta ortala
            const rect = this.window.getBoundingClientRect();
            this.window.style.left = `${(window.innerWidth - rect.width) / 2}px`;
            this.window.style.top = `${(window.innerHeight - rect.height) / 2}px`;
        }
        
        this.setupEventListeners();
        this.loadCurrentDirectory();

        // Kapatma düğmesine özel olay dinleyicisi ekle
        const closeButton = this.window.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                // Son konumu sakla
                this.lastPosition = {
                    left: this.window.style.left,
                    top: this.window.style.top
                };
                if (this.icon) {
                    this.icon.classList.remove('active');
                }
                this.window.remove();
                this.window = null;
            });
        }
    }

    loadCurrentDirectory() {
        const fileList = this.window.querySelector('.file-list');
        fileList.innerHTML = `
            <div class="file-item directory">
                <img src="img/places/folder-documents.png" alt="Belgeler">
                <span>Belgeler</span>
            </div>
            <div class="file-item directory">
                <img src="img/places/folder-publicshare.png" alt="Genel">
                <span>Genel</span>
            </div>
            <div class="file-item directory">
                <img src="img/places/folder-download.png" alt="İndirilenler">
                <span>İndirilenler</span>
            </div>
            <div class="file-item directory">
                <img src="img/places/user-desktop.png" alt="Masaüstü">
                <span>Masaüstü</span>
            </div>
            <div class="file-item directory">
                <img src="img/places/folder-music.png" alt="Müzik">
                <span>Müzik</span>
            </div>
            <div class="file-item directory">
                <img src="img/places/folder-pictures.png" alt="Resimler">
                <span>Resimler</span>
            </div>
            <div class="file-item directory">
                <img src="img/places/folder.png" alt="snap">
                <span>snap</span>
            </div>
            <div class="file-item directory">
                <img src="img/places/folder-templates.png" alt="Şablonlar">
                <span>Şablonlar</span>
            </div>
            <div class="file-item directory">
                <img src="img/places/folder-videos.png" alt="Videolar">
                <span>Videolar</span>
            </div>
        `;

        const fileItems = fileList.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            item.addEventListener('click', () => {
                fileItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });

            item.addEventListener('dblclick', () => {
                if (item.classList.contains('directory')) {
                    const folderName = item.querySelector('span').textContent;
                    this.currentPath = `${this.currentPath}/${folderName}`;
                    this.loadCurrentDirectory();
                }
            });
        });
    }

    setupEventListeners() {
        // Sidebar öğelerine tıklama olayı
        const sidebarItems = this.window.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Dosya öğelerine tıklama olayı
        const fileItems = this.window.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            item.addEventListener('click', () => {
                fileItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });

            item.addEventListener('dblclick', () => {
                if (item.classList.contains('directory')) {
                    const folderName = item.querySelector('span').textContent;
                    this.currentPath = `${this.currentPath}/${folderName}`;
                    this.loadCurrentDirectory();
                }
            });
        });
    }
} 