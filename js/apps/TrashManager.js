export class TrashManager {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.window = null;
        this.trashItems = [];
        this.lastPosition = null;
    }

    open() {
        if (this.window) {
            if (this.window.classList.contains('minimized')) {
                this.window.classList.remove('minimized');
                this.window.style.display = 'block';
                const trashIcon = document.querySelector('[data-app="trash"]');
                if (trashIcon) {
                    trashIcon.classList.add('active');
                }
            }
            this.windowManager.setActiveWindow(this.window);
            return;
        }

        const existingTrash = document.querySelector('.trash-manager');
        if (existingTrash) {
            this.lastPosition = {
                left: existingTrash.style.left,
                top: existingTrash.style.top
            };
            existingTrash.remove();
            const trashIcon = document.querySelector('[data-app="trash"]');
            if (trashIcon) {
                trashIcon.classList.remove('active');
            }
        }

        this.window = document.createElement('div');
        this.window.className = 'window trash-manager file-manager';
        
        this.window.innerHTML = `
            <div class="file-manager-header">
                <div class="header-left">
                    <button class="search-button">
                        <i class="fas fa-search"></i>
                    </button>
                    <span class="header-title">Çöp Kutusu</span>
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
                        <i class="fas fa-trash"></i>
                        <span>Çöp Kutusu</span>
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
                        <a href="#" class="sidebar-item">
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
                        <a href="#" class="sidebar-item active">
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
                        <div class="file-item">
                            <img src="img/mimetypes/text-x-generic.png" alt="Dosya">
                            <span>silinmis_dosya.txt</span>
                        </div>
                        <div class="file-item">
                            <img src="img/places/folder.png" alt="Klasör">
                            <span>silinmis_klasor</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const trashIcon = document.querySelector('[data-app="trash"]');
        if (trashIcon) {
            trashIcon.classList.add('active');
        }

        document.body.appendChild(this.window);

        this.windowManager.addWindow({
            window: this.window,
            header: this.window.querySelector('.file-manager-header'),
            minimize: this.window.querySelector('.minimize'),
            maximize: this.window.querySelector('.maximize'),
            close: this.window.querySelector('.close')
        });
        
        if (this.lastPosition) {
            this.window.style.left = this.lastPosition.left;
            this.window.style.top = this.lastPosition.top;
        } else {
            const rect = this.window.getBoundingClientRect();
            this.window.style.left = `${(window.innerWidth - rect.width) / 2}px`;
            this.window.style.top = `${(window.innerHeight - rect.height) / 2}px`;
        }
        
        this.setupEventListeners();
        this.loadTrashItems();

        const closeButton = this.window.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.lastPosition = {
                    left: this.window.style.left,
                    top: this.window.style.top
                };
                const trashIcon = document.querySelector('[data-app="trash"]');
                if (trashIcon) {
                    trashIcon.classList.remove('active');
                }
                this.window.remove();
                this.window = null;
            });
        }
    }

    setupEventListeners() {
        const sidebarItems = this.window.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        const fileItems = this.window.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            item.addEventListener('click', () => {
                fileItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
    }

    loadTrashItems() {
        const fileList = this.window.querySelector('.file-list');
        if (!fileList) return;

        const items = [
            {
                name: 'silinmis_dosya.txt',
                type: 'text',
                icon: 'img/mimetypes/text-x-generic.png'
            },
            {
                name: 'silinmis_klasor',
                type: 'folder',
                icon: 'img/places/folder.png'
            }
        ];

        fileList.innerHTML = items.map(item => `
            <div class="file-item">
                <img src="${item.icon}" alt="${item.type === 'folder' ? 'Klasör' : 'Dosya'}">
                <span>${item.name}</span>
            </div>
        `).join('');

        this.setupEventListeners();
    }
} 