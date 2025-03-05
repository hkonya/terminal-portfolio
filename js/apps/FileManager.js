// FileSystem'i import et
import { fileSystem } from '../FileSystem.js';

export class FileManager {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.currentPath = '/home/guest';
        this.window = null;
        this.icon = null;
        this.lastPosition = null;
        this.navigationHistory = ['/home/guest']; // Başlangıç değeri olarak varsayılan yolu ekle
        this.currentHistoryIndex = 0;
        this.contextMenu = null; // Bağlam menüsü için referans
    }

    open() {
        // Eğer pencere zaten açıksa, sadece öne getir
        if (this.window) {
            if (this.window.classList.contains('minimized')) {
                this.window.classList.remove('minimized');
                this.window.style.display = 'block';
            }
            this.window.style.zIndex = 10;
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
                        <a href="#" class="sidebar-item">
                            <i class="fas fa-server"></i>
                            <span>Sistem</span>
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

        // Pencereye tek bir genel tıklama olayı dinleyicisi ekle
        this.window.addEventListener('click', (e) => {
            // Tıklanan öğe veya üst öğelerinden biri .file-item sınıfına sahip mi kontrol et
            let targetElement = e.target;
            let isFileItem = false;
            
            // Tıklanan öğeden başlayarak yukarı doğru git ve .file-item sınıfını kontrol et
            while (targetElement && targetElement !== this.window) {
                if (targetElement.classList && targetElement.classList.contains('file-item')) {
                    isFileItem = true;
                    break;
                }
                targetElement = targetElement.parentElement;
            }
            
            // Eğer dosya öğesine tıklanmadıysa seçimleri temizle
            if (!isFileItem) {
                this.clearSelections();
            }
        });
        
        // Context menüsü oluştur
        this.createContextMenu();
    }

    loadCurrentDirectory() {
        const fileList = this.window.querySelector('.file-list');
        fileList.innerHTML = ''; // İçeriği temizle
        
        // Başlık ve yolu güncelle
        const pathButton = this.window.querySelector('.path-button');
        if (pathButton) {
            const pathSpan = pathButton.querySelector('span');
            if (pathSpan) {
                // Gösterim için yolu düzenle
                let displayPath = this.currentPath;
                if (this.currentPath === '/home/guest') {
                    displayPath = 'Başlangıç';
                } else if (this.currentPath === '/') {
                    displayPath = 'Kök Dizin';
                } else if (this.currentPath.startsWith('/home/guest/')) {
                    displayPath = this.currentPath.replace('/home/guest/', '');
                }
                pathSpan.textContent = displayPath;
            }
            
            // İkon güncelle
            const pathIcon = pathButton.querySelector('i');
            if (pathIcon) {
                if (this.currentPath === '/home/guest') {
                    pathIcon.className = 'fas fa-home';
                } else if (this.currentPath === '/') {
                    pathIcon.className = 'fas fa-hdd';
                } else if (this.currentPath === '/home/guest/Masaüstü') {
                    pathIcon.className = 'fas fa-desktop';
                } else {
                    pathIcon.className = 'fas fa-folder-open';
                }
            }
        }
        
        // Dosya sisteminden mevcut dizin içeriğini al
        const contents = fileSystem.getDirectoryContents(this.currentPath);
        
        if (!contents) {
            // Dizin bulunamadı veya erişim hatası
            console.error(`Dizin içeriği alınamadı: ${this.currentPath}`);
            return;
        }
        
        // Dosya ve klasörleri ayrı dizilerde tut (önce klasörler gösterilecek)
        const directories = [];
        const files = [];
        
        // Dizin içeriğini sırala
        Object.entries(contents).forEach(([name, item]) => {
            if (item.type === 'directory') {
                directories.push({ name, item });
            } else {
                files.push({ name, item });
            }
        });
        
        // Alfabetik sırala
        directories.sort((a, b) => a.name.localeCompare(b.name));
        files.sort((a, b) => a.name.localeCompare(b.name));
        
        // Klasörleri ekle
        directories.forEach(({ name, item }) => {
            // Klasör ikonunu belirle
            let iconSrc = 'img/places/folder.png';
            let isSymlink = item.metadata && item.metadata.isSymlink;
            
            // Özel klasörler için özel ikonlar
            if (name === 'Belgeler') iconSrc = 'img/places/folder-documents.png';
            else if (name === 'Masaüstü') iconSrc = 'img/places/user-desktop.png';
            else if (name === 'İndirilenler') iconSrc = 'img/places/folder-download.png';
            else if (name === 'Müzik') iconSrc = 'img/places/folder-music.png';
            else if (name === 'Resimler') iconSrc = 'img/places/folder-pictures.png';
            else if (name === 'Videolar') iconSrc = 'img/places/folder-videos.png';
            else if (name === 'Genel') iconSrc = 'img/places/folder-publicshare.png';
            else if (name === 'Şablonlar' || name === 'Sablonlar') iconSrc = 'img/places/folder-templates.png';
            else if (name === 'home') iconSrc = 'img/places/user-home.png';
            else if (name === 'root') iconSrc = 'img/places/network-server.png';
            else if (name === 'tmp') iconSrc = 'img/places/folder.png';
            else if (name === 'bin' || name === 'lib' || name === 'sbin') iconSrc = 'img/places/folder-remote.png';
            
            // DOM elementini oluştur
            const dirElement = document.createElement('div');
            dirElement.className = 'file-item directory';
            
            // Sembolik bağlantı için özel görünüm
            if (isSymlink) {
                dirElement.classList.add('symlink');
                const symlinkTarget = item.metadata.symlinkTarget || '';
                
                dirElement.innerHTML = `
                    <img src="${iconSrc}" alt="${name}">
                    <span>${name} <i class="fas fa-link symlink-icon"></i></span>
                    <div class="symlink-target">${symlinkTarget}</div>
                `;
            } else {
                dirElement.innerHTML = `
                    <img src="${iconSrc}" alt="${name}">
                    <span>${name}</span>
                `;
            }
            
            // Klasör izinlerini tooltip olarak ekle
            if (item.permissions) {
                dirElement.title = `${name} (${item.permissions})`;
            }
            
            // Ekle
            fileList.appendChild(dirElement);
        });
        
        // Dosyaları ekle
        files.forEach(({ name, item }) => {
            // Dosya ikonunu belirle
            let iconSrc = 'img/mimetypes/text-x-generic.png';
            
            // Dosya uzantısına göre ikon belirle
            const extension = name.split('.').pop().toLowerCase();
            
            if (extension === 'pdf') iconSrc = 'img/mimetypes/application-pdf.png';
            else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) iconSrc = 'img/mimetypes/image-x-generic.png';
            else if (['mp3', 'wav', 'ogg'].includes(extension)) iconSrc = 'img/mimetypes/audio-x-generic.png';
            else if (['mp4', 'avi', 'mkv'].includes(extension)) iconSrc = 'img/mimetypes/video-x-generic.png';
            else if (['zip', 'rar', 'tar', 'gz'].includes(extension)) iconSrc = 'img/mimetypes/package-x-generic.png';
            else if (['html', 'htm'].includes(extension)) iconSrc = 'img/mimetypes/text-html.png';
            else if (['doc', 'docx'].includes(extension)) iconSrc = 'img/mimetypes/x-office-document.png';
            else if (['xls', 'xlsx'].includes(extension)) iconSrc = 'img/mimetypes/x-office-spreadsheet.png';
            else if (['ppt', 'pptx'].includes(extension)) iconSrc = 'img/mimetypes/x-office-presentation.png';
            else if (['js', 'py', 'java', 'c', 'cpp', 'cs'].includes(extension)) iconSrc = 'img/mimetypes/text-x-script.png';
            else if (name === 'swap.img') iconSrc = 'img/devices/drive-harddisk.png';
            
            // Dosya elementini oluştur
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item file';
            fileElement.innerHTML = `
                <img src="${iconSrc}" alt="${name}">
                <span>${name}</span>
            `;
            
            // Dosya izinlerini tooltip olarak ekle
            if (item.permissions) {
                fileElement.title = `${name} (${item.permissions})`;
            }
            
            // Ekle
            fileList.appendChild(fileElement);
        });
        
        // Olay dinleyicilerini ekle
        this.setupFileItemEventListeners();
        
        // Aktif olan sidebar öğesini güncelle
        this.updateActiveSidebarItem();
        
        // Seçimleri temizle
        this.clearSelections();
        
        // Navigasyon butonlarını güncelle
        this.updateNavigationButtons();
    }
    
    setupFileItemEventListeners() {
        const fileItems = this.window.querySelectorAll('.file-item');
        
        fileItems.forEach(item => {
            // Seçim için tıklama
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Olayın üst elemanlara yayılmasını engelle
                e.preventDefault(); // Varsayılan davranışı engelle
                
                console.log("Dosya öğesine tıklandı:", item.querySelector('span').textContent);
                
                // CTRL tuşuna basılı değilse önceki seçimleri temizle
                if (!e.ctrlKey) {
                    fileItems.forEach(i => i.classList.remove('selected'));
                }
                
                // Öğeyi seç
                item.classList.add('selected');
                
                // Seçili öğeyi kaydet
                this.selectedFileItem = item;
            });
            
            // Çift tıklama ile içeri girme veya dosya açma
            item.addEventListener('dblclick', (e) => {
                e.stopPropagation(); // Olayın üst elemanlara yayılmasını engelle
                
                const name = item.querySelector('span').textContent;
                
                if (item.classList.contains('directory')) {
                    // Yeni dizine git
                    let newPath;
                    if (this.currentPath.endsWith('/')) {
                        newPath = `${this.currentPath}${name}`;
                    } else {
                        newPath = `${this.currentPath}/${name}`;
                    }
                    
                    // Gezinme geçmişi güncellemesi - Mevcut noktadan sonraki tüm girişleri temizle
                    if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
                        this.navigationHistory = this.navigationHistory.slice(0, this.currentHistoryIndex + 1);
                    }
                    
                    // Yeni yolu geçmişe ekle
                    this.navigationHistory.push(newPath);
                    this.currentHistoryIndex = this.navigationHistory.length - 1;
                    this.currentPath = newPath;
                    
                    this.loadCurrentDirectory();
                    this.updateNavigationButtons();
                } else {
                    // Dosya açma işlemi (ileride eklenecek)
                    console.log(`Dosya açılıyor: ${this.currentPath}/${name}`);
                }
            });
            
            // Dosya/klasör için sağ tıklama context menüsü
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Event bubble olmasını engelle
                
                // Önce dosyayı seç
                fileItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                // Seçili öğeyi kaydet
                this.selectedFileItem = item;
                
                // Varsa önceki menüyü kapat
                this.hideContextMenu();
                
                // Dosya context menüsünü göster
                this.showFileContextMenu(e.clientX, e.clientY, item);
            });
        });
    }
    
    updateNavigationButtons() {
        const backButton = this.window.querySelector('.back');
        const forwardButton = this.window.querySelector('.forward');
        
        if (backButton) {
            // Geçmişte gidebileceğimiz yer var mı?
            if (this.currentHistoryIndex > 0) {
                backButton.disabled = false;
                backButton.classList.remove('disabled');
            } else {
                // Kök dizinde değilsek, üst dizine gidilebilir
                if (this.currentPath !== '/') {
                    backButton.disabled = false;
                    backButton.classList.remove('disabled');
                } else {
                    backButton.disabled = true;
                    backButton.classList.add('disabled');
                }
            }
        }
        
        if (forwardButton) {
            // İleride gidebileceğimiz yer var mı?
            if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
                forwardButton.disabled = false;
                forwardButton.classList.remove('disabled');
            } else {
                forwardButton.disabled = true;
                forwardButton.classList.add('disabled');
            }
        }
    }

    setupEventListeners() {
        // Önce bu fonksiyonun this bağlamını sabit tut
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.clearSelections = this.clearSelections.bind(this);
        
        // Boş alana tıklama olayı ekle
        const fileContainer = this.window.querySelector('.file-container');
        if (fileContainer) {
            // Kapsayıcıya tıklama olayı ekle
            fileContainer.addEventListener('click', (e) => {
                // Eğer doğrudan dosya öğesine değil de arka plana tıklandıysa
                if (e.target === fileContainer || 
                    e.target.classList.contains('file-view') || 
                    e.target.classList.contains('file-view-inner') || 
                    e.target.classList.contains('file-list')) {
                    this.clearSelections();
                    e.stopPropagation(); // Olayın yukarı yayılmasını engelle
                }
            });
            
            // Sağ tıklama olayı
            fileContainer.addEventListener('contextmenu', (e) => {
                // Eğer doğrudan dosya öğesine değil de arka plana tıklandıysa
                if (e.target === fileContainer || 
                    e.target.classList.contains('file-view') || 
                    e.target.classList.contains('file-view-inner') || 
                    e.target.classList.contains('file-list')) {
                    this.clearSelections();
                    
                    // Boş alana sağ tıklandığında normal bağlam menüsü göster
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Varsa önceki menüyü kapat
                    this.hideContextMenu();
                    
                    // Context menüsünü göster
                    this.showContextMenu(e.clientX, e.clientY);
                }
            });
        }
        
        // Sidebar öğelerine tıklama olayı
        const sidebarItems = this.window.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Aktif öğeyi güncelle
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Öğe metni
                const text = item.querySelector('span').textContent;
                
                let newPath = this.currentPath;
                
                // İlgili yola git
                if (text === 'Başlangıç') {
                    newPath = '/home/guest';
                } else if (text === 'Son') {
                    // Son erişilen dosyaları göster (ileride eklenecek)
                    return;
                } else if (text === 'Yıldızlı') {
                    // Yıldızlı dosyaları göster (ileride eklenecek)
                    return;
                } else if (text === 'Ağ') {
                    // Ağ konumlarını göster (ileride eklenecek)
                    return;
                } else if (text === 'Çöp') {
                    // Çöp klasörünü göster (ileride eklenecek)
                    return;
                } else if (text === 'Sistem') {
                    // Kök dizine git
                    newPath = '/';
                }
                
                // Aynı dizindeyse işlem yapma
                if (newPath === this.currentPath) return;
                
                // Gezinme geçmişi güncellemesi - Mevcut noktadan sonraki tüm girişleri temizle
                if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
                    this.navigationHistory = this.navigationHistory.slice(0, this.currentHistoryIndex + 1);
                }
                
                // Yeni yolu geçmişe ekle
                this.navigationHistory.push(newPath);
                this.currentHistoryIndex = this.navigationHistory.length - 1;
                this.currentPath = newPath;
                
                // Dizin içeriğini yükle
                this.loadCurrentDirectory();
                
                // Navigasyon butonlarını güncelle
                this.updateNavigationButtons();
            });
        });
        
        // Geri butonu
        const backButton = this.window.querySelector('.back');
        if (backButton) {
            backButton.addEventListener('click', () => {
                if (this.currentHistoryIndex > 0) {
                    // Gezinme geçmişinde geriye git
                    this.currentHistoryIndex--;
                    this.currentPath = this.navigationHistory[this.currentHistoryIndex];
                    this.loadCurrentDirectory();
                    this.updateNavigationButtons();
                } else {
                    // Geçmişte geri gidilemiyorsa, üst dizine çık
                    if (this.currentPath !== '/') {
                        // Yolu parçalara ayırıp son dizini kaldır
                        const pathParts = this.currentPath.split('/').filter(p => p);
                        pathParts.pop();
                        
                        // Yeni yolu oluştur
                        const newPath = pathParts.length === 0 ? "/" : `/${pathParts.join('/')}`;
                        
                        // Yeni yolu geçmişe ekle
                        this.navigationHistory.push(newPath);
                        this.currentHistoryIndex = this.navigationHistory.length - 1;
                        this.currentPath = newPath;
                        
                        this.loadCurrentDirectory();
                        this.updateNavigationButtons();
                    }
                }
            });
        }
        
        // İleri butonu
        const forwardButton = this.window.querySelector('.forward');
        if (forwardButton) {
            forwardButton.addEventListener('click', () => {
                if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
                    this.currentHistoryIndex++;
                    this.currentPath = this.navigationHistory[this.currentHistoryIndex];
                    this.loadCurrentDirectory();
                    this.updateNavigationButtons();
                }
            });
        }
        
        // Yol butonuna tıklama
        const pathButton = this.window.querySelector('.path-button');
        if (pathButton) {
            pathButton.addEventListener('click', () => {
                // Aynı dizindeyse işlem yapma
                if (this.currentPath === '/home/guest') return;
                
                // Ana dizine git
                const newPath = '/home/guest';
                
                // Gezinme geçmişi güncellemesi - Mevcut noktadan sonraki tüm girişleri temizle
                if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
                    this.navigationHistory = this.navigationHistory.slice(0, this.currentHistoryIndex + 1);
                }
                
                // Yeni yolu geçmişe ekle
                this.navigationHistory.push(newPath);
                this.currentHistoryIndex = this.navigationHistory.length - 1;
                this.currentPath = newPath;
                
                // Yeni dizini yükle
                this.loadCurrentDirectory();
                this.updateNavigationButtons();
            });
        }

        // İçerik alanına sağ tıklama olayı
        const contentArea = this.window.querySelector('.content');
        if (contentArea) {
            contentArea.addEventListener('contextmenu', (e) => {
                // Eğer bir dosya/klasör öğesine tıklanmadıysa (boş alana tıklandıysa)
                if (!e.target.closest('.file-item')) {
                    e.preventDefault();
                    e.stopPropagation(); // Event bubble olmasını engelle
                    
                    // Varsa önceki menüyü kapat
                    this.hideContextMenu();
                    
                    // Yeni menüyü göster
                    this.showContextMenu(e.clientX, e.clientY);
                }
            });
        }
        
        // Tüm pencerede contextmenu eventi için listener ekle
        this.window.addEventListener('contextmenu', (e) => {
            // Eğer zaten gösterilen bir contextmenu varsa ve tıklanan şey 
            // menünün içinde değilse, menüyü kapat
            if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                // İçerik alanında contentArea listener'ı zaten var, karışmasın
                if (!contentArea.contains(e.target)) {
                    e.preventDefault();
                    this.hideContextMenu();
                }
            }
        });

        // Pencere seviyesinde genel tıklama dinleyicisi
        this.window.addEventListener('click', (e) => {
            // Tıklanan öğe veya üst öğelerinden herhangi birinin .file-item sınıfına sahip olup olmadığını kontrol et
            let targetElement = e.target;
            let isFileItem = false;
            
            // Tıklanan öğeden başlayarak yukarı doğru git ve .file-item sınıfını kontrol et
            while (targetElement && targetElement !== this.window) {
                if (targetElement.classList && targetElement.classList.contains('file-item')) {
                    isFileItem = true;
                    break;
                }
                targetElement = targetElement.parentElement;
            }
            
            // Eğer dosya öğesine tıklanmadıysa seçimleri temizle
            if (!isFileItem) {
                this.clearSelections();
            }
        });
    }

    // Sidebar'da aktif öğeyi güncelleme
    updateActiveSidebarItem() {
        if (!this.window) return;
        
        const sidebarItems = this.window.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.classList.remove('active');
            const text = item.querySelector('span').textContent;
            
            if (this.currentPath === '/home/guest' && text === 'Başlangıç') {
                item.classList.add('active');
            } else if (this.currentPath === '/' && text === 'Sistem') {
                item.classList.add('active');
            }
        });
    }

    // Bağlam menüsü oluşturma
    createContextMenu() {
        // Varsa eski menüyü kaldır
        if (this.contextMenu) {
            this.contextMenu.remove();
        }

        // Tema ayarlarını al
        const config = JSON.parse(localStorage.getItem('config')) || { darkTheme: false };
        const isDarkTheme = config.darkTheme;

        // Yeni menü oluştur
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'context-menu';
        this.contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="new-folder">
                <i class="fas fa-folder"></i>
                Yeni Klasör...
                <span class="context-menu-shortcut">Shift+Ctrl+N</span>
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
                <span class="context-menu-shortcut">Ctrl+A</span>
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="open-terminal">
                <i class="fas fa-terminal"></i>
                Uçbirimde Aç
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="properties">
                <i class="fas fa-info-circle"></i>
                Özellikler
            </div>
        `;

        // Tema stillerini uygula
        this.contextMenu.style.backgroundColor = isDarkTheme ? 'rgba(32, 32, 32, 0.98)' : 'rgba(250, 251, 250, 0.98)';
        this.contextMenu.style.color = isDarkTheme ? '#fafbfa' : '#202020';
        this.contextMenu.style.boxShadow = isDarkTheme ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)';

        document.body.appendChild(this.contextMenu);

        // Menü öğelerine tıklama ve sağ tıklama olayları ekle
        this.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            // Sol tıklama için action
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Event bubble olmasını engelle
                this.handleContextMenuAction(e, item.dataset.action);
            });
            
            // Sağ tıklama için engelle
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Varsayılan context menu'yü engelle
                e.stopPropagation(); // Event bubble olmasını engelle
                return false;
            });
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

        // Kısayol metin stilini ayarla
        const shortcuts = this.contextMenu.querySelectorAll('.context-menu-shortcut');
        shortcuts.forEach(shortcut => {
            shortcut.style.color = isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
        });
        
        // Context menü içinde sağ tıklama olursa kapatma
        this.contextMenu.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    // Bağlam menüsü eylemlerini işle
    handleContextMenuAction(e, action) {
        e.preventDefault();

        switch(action) {
            case 'new-folder':
                this.createNewFolder();
                break;
            case 'open-with':
                // Birlikte aç işlevi
                console.log('Birlikte aç seçildi');
                break;
            case 'paste':
                // Yapıştır işlevi
                this.pasteItem();
                break;
            case 'select-all':
                this.selectAllItems();
                break;
            case 'open-terminal':
                this.openInTerminal();
                break;
            case 'properties':
                this.showDirectoryProperties();
                break;
        }

        this.hideContextMenu();
    }

    // Yeni klasör oluştur
    createNewFolder() {
        this.showNameDialog('Yeni Klasör', 'Klasör Adı', '', 'Oluştur', (folderName) => {
            if (folderName) {
                // Yol oluştur
                const currentPath = this.currentPath.endsWith('/') ? 
                    this.currentPath : 
                    `${this.currentPath}/`;
                
                // Klasör oluştur
                try {
                    fileSystem.createDirectory(`${currentPath}${folderName}`);
                    
                    // Klasör içeriğini güncelle
                    this.loadCurrentDirectory();
                } catch (error) {
                    alert(`Klasör oluşturulamadı: ${error}`);
                }
            }
        });
    }

    // Dosya/Klasör yeniden adlandırma
    renameFileSystemEntry(path, isDirectory) {
        const oldName = path.split('/').pop();
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        
        this.showNameDialog('Yeniden Adlandır', 'Yeni Ad', oldName, 'Kaydet', (newName) => {
            if (newName && newName !== oldName) {
                try {
                    // FileSystem sınıfını kullanarak yeniden adlandırma işlemi
                    fileSystem.renameItem(path, `${parentPath}/${newName}`, isDirectory);
                    this.loadCurrentDirectory(); // Klasör içeriğini güncelle
                } catch (error) {
                    console.error(`Yeniden adlandırma işlemi sırasında hata oluştu: ${error}`);
                }
            }
        });
    }
    
    // İsim düzenleme iletişim kutusu (hem yeni klasör hem de yeniden adlandırma için)
    showNameDialog(title, label, defaultValue, actionButtonText, callback) {
        // Varsa açık context menüsünü kapat
        this.hideContextMenu();
        
        // Önceki modal varsa kaldır
        const existingModal = document.querySelector('.name-dialog-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Tema ayarlarını al
        const config = JSON.parse(localStorage.getItem('config')) || { darkTheme: false };
        const isDarkTheme = config.darkTheme;
        
        // Modal oluştur
        const modal = document.createElement('div');
        modal.className = 'name-dialog-modal';
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
                    <div class="name-input-container">
                        <label for="itemName">${label}</label>
                        <input type="text" id="itemName" class="name-input" value="${defaultValue}" autofocus>
                    </div>
                </div>
                <div class="name-dialog-footer">
                    <button class="name-action-btn">${actionButtonText}</button>
                </div>
            </div>
        `;
        
        // Modalı dosya yöneticisine ekle
        this.window.appendChild(modal);
        
        // Form işlemi - Önce tanımla
        function submitAction() {
            const nameValue = modal.querySelector('#itemName').value.trim();
            
            if (!nameValue) {
                alert('Lütfen bir isim girin.');
                return;
            }
            
            // Geçersiz karakterleri kontrol et
            const invalidChars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
            for (const char of invalidChars) {
                if (nameValue.includes(char)) {
                    alert(`İsim "${char}" karakterini içeremez.`);
                    return;
                }
            }
            
            // Callback ile işle
            callback(nameValue);
            
            // Modalı kapat
            modal.remove();
            document.removeEventListener('keydown', handleKeyDown);
        }
        
        // Input'a fokus ver
        setTimeout(() => {
            const input = modal.querySelector('#itemName');
            if (input) {
                input.focus();
                input.setSelectionRange(0, input.value.length);
            }
        }, 100);
        
        // Kapatma düğmesi olayı
        const closeBtn = modal.querySelector('.name-dialog-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // ESC tuşuna basıldığında modal'ı kapat
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        // Input alanında Enter tuşu olayı
        const input = modal.querySelector('#itemName');
        if (input) {
            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    submitAction();
                }
            });
        }
        
        // İşlem butonu olayı
        const actionBtn = modal.querySelector('.name-action-btn');
        if (actionBtn) {
            actionBtn.addEventListener('click', submitAction);
        }
    }

    // Tüm öğeleri seç
    selectAllItems() {
        try {
            const fileItems = this.window.querySelectorAll('.file-item');
            
            // Hiç dosya yoksa işlem yapma
            if (fileItems.length === 0) {
                console.log("Seçilecek dosya/klasör bulunmuyor");
                return;
            }
            
            // Tüm öğeleri seç
            fileItems.forEach(item => {
                item.classList.add('selected');
            });
            
            console.log(`Toplam ${fileItems.length} dosya/klasör seçildi`);
            
            // Son öğeyi seçili olarak işaretle (birden fazla seçim olduğunu belirtmek için)
            this.selectedFileItem = fileItems[fileItems.length - 1];
        } catch (error) {
            console.error("Tümünü seçerken hata:", error);
        }
    }

    // Terminal'de aç
    openInTerminal() {
        console.log(`Terminal'de açılıyor: ${this.currentPath}`);
        // Burada terminalin açılması için gereken kod eklenecek
        // Örnek: window.terminalInstance.openDirectory(this.currentPath);
    }

    // Dizin özelliklerini göster
    showDirectoryProperties() {
        console.log(`Dizin özellikleri gösteriliyor: ${this.currentPath}`);
        // Burada dizin özelliklerinin gösterilmesi için gereken kod eklenecek
    }

    // Bağlam menüsünü göster
    showContextMenu(x, y) {
        this.createContextMenu();
        
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.add('show');
        
        // Menünün ekranın dışına taşmasını önle
        const rect = this.contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.contextMenu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.contextMenu.style.top = `${y - rect.height}px`;
        }
        
        // Menü dışına tıklayınca kapanmasını sağla
        document.addEventListener('click', this.handleClickOutside);
    }

    // Dosya/Klasör için bağlam menüsü oluşturma
    createFileContextMenu(isDirectory) {
        // Varsa eski menüyü kaldır
        if (this.contextMenu) {
            this.contextMenu.remove();
        }

        // Tema ayarlarını al
        const config = JSON.parse(localStorage.getItem('config')) || { darkTheme: false };
        const isDarkTheme = config.darkTheme;

        // Yeni menü oluştur
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'context-menu';
        
        // Eğer klasörse bir menü, dosyaysa başka bir menü göster
        if (isDirectory) {
            this.contextMenu.innerHTML = `
                <div class="context-menu-item" data-action="open">
                    <i class="fas fa-folder-open"></i>
                    Aç
                </div>
                <div class="context-menu-separator"></div>
                <div class="context-menu-item" data-action="cut">
                    <i class="fas fa-cut"></i>
                    Kes
                    <span class="context-menu-shortcut">Ctrl+X</span>
                </div>
                <div class="context-menu-item" data-action="copy">
                    <i class="fas fa-copy"></i>
                    Kopyala
                    <span class="context-menu-shortcut">Ctrl+C</span>
                </div>
                <div class="context-menu-separator"></div>
                <div class="context-menu-item" data-action="rename">
                    <i class="fas fa-edit"></i>
                    Yeniden Adlandır...
                    <span class="context-menu-shortcut">F2</span>
                </div>
                <div class="context-menu-item" data-action="compress">
                    <i class="fas fa-file-archive"></i>
                    Sıkıştır...
                </div>
                <div class="context-menu-item" data-action="delete">
                    <i class="fas fa-trash"></i>
                    Çöpe Taşı
                    <span class="context-menu-shortcut">Delete</span>
                </div>
                <div class="context-menu-separator"></div>
                <div class="context-menu-item" data-action="open-terminal">
                    <i class="fas fa-terminal"></i>
                    Uçbirimde Aç
                </div>
                <div class="context-menu-separator"></div>
                <div class="context-menu-item" data-action="properties">
                    <i class="fas fa-info-circle"></i>
                    Özellikler
                    <span class="context-menu-shortcut">Alt+Return</span>
                </div>
            `;
        } else {
            this.contextMenu.innerHTML = `
                <div class="context-menu-item" data-action="open">
                    <i class="fas fa-external-link-alt"></i>
                    Aç
                </div>
                <div class="context-menu-item" data-action="cut">
                    <i class="fas fa-cut"></i>
                    Kes
                    <span class="context-menu-shortcut">Ctrl+X</span>
                </div>
                <div class="context-menu-item" data-action="copy">
                    <i class="fas fa-copy"></i>
                    Kopyala
                    <span class="context-menu-shortcut">Ctrl+C</span>
                </div>
                <div class="context-menu-separator"></div>
                <div class="context-menu-item" data-action="rename">
                    <i class="fas fa-edit"></i>
                    Yeniden Adlandır...
                    <span class="context-menu-shortcut">F2</span>
                </div>
                <div class="context-menu-item" data-action="compress">
                    <i class="fas fa-file-archive"></i>
                    Sıkıştır...
                </div>
                <div class="context-menu-item" data-action="delete">
                    <i class="fas fa-trash"></i>
                    Çöpe Taşı
                    <span class="context-menu-shortcut">Delete</span>
                </div>
                <div class="context-menu-separator"></div>
                <div class="context-menu-item" data-action="open-terminal">
                    <i class="fas fa-terminal"></i>
                    Uçbirimde Aç
                </div>
                <div class="context-menu-separator"></div>
                <div class="context-menu-item" data-action="properties">
                    <i class="fas fa-info-circle"></i>
                    Özellikler
                    <span class="context-menu-shortcut">Alt+Return</span>
                </div>
            `;
        }

        // Tema stillerini uygula
        this.contextMenu.style.backgroundColor = isDarkTheme ? 'rgba(32, 32, 32, 0.98)' : 'rgba(250, 251, 250, 0.98)';
        this.contextMenu.style.color = isDarkTheme ? '#fafbfa' : '#202020';
        this.contextMenu.style.boxShadow = isDarkTheme ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)';

        document.body.appendChild(this.contextMenu);

        // Menü öğelerine tıklama ve sağ tıklama olayları ekle
        this.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            // Sol tıklama için action
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Event bubble olmasını engelle
                this.handleFileContextMenuAction(e, item.dataset.action);
            });
            
            // Sağ tıklama için engelle
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Varsayılan context menu'yü engelle
                e.stopPropagation(); // Event bubble olmasını engelle
                return false;
            });
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

        // Kısayol metin stilini ayarla
        const shortcuts = this.contextMenu.querySelectorAll('.context-menu-shortcut');
        shortcuts.forEach(shortcut => {
            shortcut.style.color = isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
        });
        
        // Context menü içinde sağ tıklama olursa kapatma
        this.contextMenu.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    // Dosya/Klasör için bağlam menüsünü göster
    showFileContextMenu(x, y, fileItem) {
        const isDirectory = fileItem.classList.contains('directory');
        this.createFileContextMenu(isDirectory);
        
        // Seçilen dosya/klasör bilgisini sakla
        this.selectedFileItem = fileItem;
        
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.add('show');
        
        // Menünün ekranın dışına taşmasını önle
        const rect = this.contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.contextMenu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.contextMenu.style.top = `${y - rect.height}px`;
        }
        
        // Menü dışına tıklayınca kapanmasını sağla
        document.addEventListener('click', this.handleClickOutside);
    }

    // Dosya/Klasör bağlam menüsü eylemlerini işle
    handleFileContextMenuAction(e, action) {
        e.preventDefault();
        
        // Seçilen dosya/klasör bilgisi
        const fileName = this.selectedFileItem.querySelector('span').textContent;
        const isDirectory = this.selectedFileItem.classList.contains('directory');
        const filePath = this.currentPath.endsWith('/') ? 
            `${this.currentPath}${fileName}` : 
            `${this.currentPath}/${fileName}`;
        
        switch(action) {
            case 'open':
                if (isDirectory) {
                    // Klasör açma işlemi - çift tıklama olayında yapılan işlemin aynısı
                    let newPath;
                    if (this.currentPath.endsWith('/')) {
                        newPath = `${this.currentPath}${fileName}`;
                    } else {
                        newPath = `${this.currentPath}/${fileName}`;
                    }
                    
                    // Gezinme geçmişi güncellemesi - Mevcut noktadan sonraki tüm girişleri temizle
                    if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
                        this.navigationHistory = this.navigationHistory.slice(0, this.currentHistoryIndex + 1);
                    }
                    
                    // Yeni yolu geçmişe ekle
                    this.navigationHistory.push(newPath);
                    this.currentHistoryIndex = this.navigationHistory.length - 1;
                    this.currentPath = newPath;
                    
                    this.loadCurrentDirectory();
                    this.updateNavigationButtons();
                } else {
                    // Dosya açma işlemi
                    const fileStat = fileSystem.getItemStats(filePath);
                    if (fileStat) {
                        try {
                            const fileType = this.getFileType(fileName);
                            this.windowManager.openFile(filePath, fileType);
                        } catch (error) {
                            console.error(`Dosya açılırken hata oluştu: ${error}`);
                        }
                    }
                }
                break;
            case 'cut':
                // Kes işlevi (Seçili öğeyi panoya taşıma için işaretle)
                localStorage.setItem('fileOperation', JSON.stringify({
                    type: 'cut',
                    source: filePath,
                    isDirectory: isDirectory,
                    fileName: fileName
                }));
                
                // Kesilmiş öğeyi görsel olarak belirt (opacity'yi azalt)
                this.selectedFileItem.style.opacity = '0.5';
                
                // Kesilmiş öğeyi kaydet
                this.cutItem = this.selectedFileItem;
                
                console.log(`Kes: ${filePath}`);
                break;
            case 'copy':
                // Kopyala işlevi (Seçili öğeyi panoya kopyalama için işaretle)
                localStorage.setItem('fileOperation', JSON.stringify({
                    type: 'copy',
                    source: filePath,
                    isDirectory: isDirectory,
                    fileName: fileName
                }));
                
                // Kopyalanmış öğe için herhangi bir görsel değişiklik yapmıyoruz
                // Kesilmiş öğeyi sıfırla
                if (this.cutItem) {
                    this.cutItem.style.opacity = '1';
                    this.cutItem = null;
                }
                
                console.log(`Kopyala: ${filePath}`);
                break;
            case 'rename':
                // Yeniden adlandır işlevi
                this.renameFileSystemEntry(filePath, isDirectory);
                break;
            case 'compress':
                // Sıkıştır işlevi
                if (isDirectory) {
                    fileSystem.compressDirectory(filePath, `${filePath}.zip`);
                    this.loadCurrentDirectory(); // Klasör içeriğini güncelle
                } else {
                    fileSystem.compressFile(filePath, `${filePath}.zip`);
                    this.loadCurrentDirectory(); // Klasör içeriğini güncelle
                }
                break;
            case 'delete':
                // Sil işlevi
                this.showConfirmDialog(
                    'Çöpe Taşı',
                    `"${fileName}" öğesini çöp kutusuna taşımak istiyor musunuz?`,
                    'Çöpe Taşı',
                    'İptal',
                    (confirmed) => {
                        if (confirmed) {
                            try {
                                fileSystem.moveToTrash(filePath, isDirectory);
                                this.loadCurrentDirectory(); // Klasör içeriğini güncelle
                            } catch (error) {
                                console.error(`Dosya/klasör silinirken hata oluştu: ${error}`);
                            }
                        }
                    }
                );
                break;
            case 'open-terminal':
                // Uçbirimde aç işlevi
                if (isDirectory) {
                    this.windowManager.openTerminal(filePath);
                } else {
                    this.windowManager.openTerminal(this.currentPath);
                }
                break;
            case 'properties':
                // Özellikler işlevi
                this.showProperties(fileName, isDirectory, filePath);
                break;
        }

        this.hideContextMenu();
    }

    // Dosya boyutunu biçimlendir
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bayt';
        
        const sizes = ['Bayt', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }

    // Dosya türünü belirle
    getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        // Dosya uzantısına göre tür belirle
        switch(extension) {
            case 'txt': return 'Metin Belgesi';
            case 'pdf': return 'PDF Belgesi';
            case 'doc': 
            case 'docx': return 'Word Belgesi';
            case 'xls':
            case 'xlsx': return 'Excel Çalışma Sayfası';
            case 'ppt':
            case 'pptx': return 'PowerPoint Sunumu';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return 'Resim Dosyası';
            case 'mp3': 
            case 'wav': return 'Ses Dosyası';
            case 'mp4':
            case 'avi':
            case 'mov': return 'Video Dosyası';
            case 'zip':
            case 'rar': return 'Arşiv Dosyası';
            case 'js': return 'JavaScript Dosyası';
            case 'html': return 'HTML Dosyası';
            case 'css': return 'CSS Dosyası';
            default: return 'Dosya';
        }
    }

    // Bağlam menüsünü gizle
    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.classList.remove('show');
            document.removeEventListener('click', this.handleClickOutside);
        }
    }

    // Dışarı tıklamaları yönet
    handleClickOutside(e) {
        if (this.contextMenu && !this.contextMenu.contains(e.target)) {
            this.hideContextMenu();
        }
    }

    // Yapıştır işlemi
    pasteItem() {
        try {
            // Panodaki işlemi al
            const fileOperation = localStorage.getItem('fileOperation');
            if (!fileOperation) return; // İşlem yoksa çık
            
            const operation = JSON.parse(fileOperation);
            const sourcePath = operation.source;
            const isDirectory = operation.isDirectory;
            const fileName = operation.fileName;
            
            // Hedef yolu oluştur
            const targetPath = this.currentPath.endsWith('/') ? 
                `${this.currentPath}${fileName}` : 
                `${this.currentPath}/${fileName}`;
            
            // Aynı konumsa ve kes işlemi ise bir şey yapma
            if (sourcePath === targetPath && operation.type === 'cut') {
                return;
            }
            
            // Hedefte aynı isimli dosya/klasör var mı kontrol et
            // fileSystem.traversePath ile dosyanın varlığını kontrol ediyoruz
            const targetExists = fileSystem.traversePath(targetPath) !== null;
            
            const processPaste = (overwrite) => {
                if (!overwrite) return;
                
                let success = false;
                
                if (operation.type === 'cut') {
                    // Taşıma işlemi
                    success = fileSystem.renameItem(sourcePath, targetPath, isDirectory);
                    
                    // Kesilmiş öğe varsa görünümünü normale çevir
                    if (this.cutItem) {
                        this.cutItem.style.opacity = '1';
                        this.cutItem = null;
                    }
                    
                    // İşlem tamamlandı, panoyu temizle
                    localStorage.removeItem('fileOperation');
                } else if (operation.type === 'copy') {
                    // Kopyalama işlemi
                    if (isDirectory) {
                        success = fileSystem.copyDirectory(sourcePath, targetPath);
                    } else {
                        success = fileSystem.copyFile(sourcePath, targetPath);
                    }
                }
                
                if (success) {
                    this.loadCurrentDirectory();
                } else {
                    console.error('Yapıştırma işlemi başarısız oldu.');
                }
            };
            
            if (targetExists) {
                // Modal onay kutusu göster
                this.showConfirmDialog(
                    'Dosya Zaten Var',
                    `"${fileName}" bu konumda zaten var. Üzerine yazmak istiyor musunuz?`,
                    'Üzerine Yaz',
                    'İptal',
                    processPaste
                );
            } else {
                // Doğrudan işlemi yap
                processPaste(true);
            }
        } catch (error) {
            console.error('Yapıştırma işlemi sırasında hata:', error);
        }
    }

    // Özellikler penceresini göster
    showProperties(fileName, isDirectory, filePath) {
        try {
            const stats = fileSystem.getItemStats(filePath);
            if (!stats) throw new Error("Dosya/klasör bilgileri alınamadı.");
            
            // Özellikler penceresini oluştur
            const propertiesWindow = document.createElement('div');
            propertiesWindow.className = 'dialog properties-dialog';
            
            const fileType = isDirectory ? "Klasör" : this.getFileType(fileName);
            const fileSize = isDirectory ? 
                fileSystem.getDirectorySize(filePath) : 
                stats.size;
            
            const fileSizeFormatted = this.formatFileSize(fileSize);
            const modifiedDate = new Date(stats.mtime).toLocaleDateString('tr-TR', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            propertiesWindow.innerHTML = `
                <div class="dialog-header">
                    <span>${fileName} Özellikleri</span>
                    <button class="close-button">×</button>
                </div>
                <div class="dialog-content">
                    <div class="properties-icon">
                        <i class="${isDirectory ? 'fas fa-folder' : 'fas fa-file'}"></i>
                    </div>
                    <div class="properties-details">
                        <div class="property">
                            <span class="property-name">Ad:</span>
                            <span class="property-value">${fileName}</span>
                        </div>
                        <div class="property">
                            <span class="property-name">Tür:</span>
                            <span class="property-value">${fileType}</span>
                        </div>
                        <div class="property">
                            <span class="property-name">Konum:</span>
                            <span class="property-value">${this.currentPath}</span>
                        </div>
                        <div class="property">
                            <span class="property-name">Boyut:</span>
                            <span class="property-value">${fileSizeFormatted}</span>
                        </div>
                        <div class="property">
                            <span class="property-name">Değiştirilme:</span>
                            <span class="property-value">${modifiedDate}</span>
                        </div>
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="ok-button">Tamam</button>
                </div>
            `;
            
            document.body.appendChild(propertiesWindow);
            
            // Tamam butonuna tıklama olayı
            propertiesWindow.querySelector('.ok-button').addEventListener('click', () => {
                propertiesWindow.remove();
            });
            
            // Kapatma butonuna tıklama olayı
            propertiesWindow.querySelector('.close-button').addEventListener('click', () => {
                propertiesWindow.remove();
            });
            
            // Dışarı tıklama olayı
            document.addEventListener('click', function closeDialog(e) {
                if (!propertiesWindow.contains(e.target)) {
                    propertiesWindow.remove();
                    document.removeEventListener('click', closeDialog);
                }
            });
        } catch (error) {
            console.error(`Özellikler gösterilirken hata oluştu: ${error}`);
        }
    }

    // Tüm seçimleri kaldır
    clearSelections() {
        console.log("clearSelections çağrıldı - Tüm seçimler temizleniyor");
        
        try {
            // Tüm seçimleri kaldır
            const fileItems = this.window.querySelectorAll('.file-item');
            let selectionCount = 0;
            
            fileItems.forEach(item => {
                if (item.classList.contains('selected')) {
                    selectionCount++;
                    item.classList.remove('selected');
                }
            });
            
            console.log(`${selectionCount} adet seçim temizlendi`);
            
            // Kesme işlemi yapılıyorsa iptal et
            if (this.cutItem) {
                this.cutItem.style.opacity = '1';
                this.cutItem = null;
                console.log("Kesme işlemi iptal edildi");
            }
            
            // Seçili dosya/klasör referansını temizle
            this.selectedFileItem = null;
            
            // localStorage'da depolanan işlemi de temizle
            if (localStorage.getItem('fileOperation')) {
                const operation = JSON.parse(localStorage.getItem('fileOperation'));
                if (operation.type === 'cut') {
                    localStorage.removeItem('fileOperation');
                    console.log("localStorage'daki cut işlemi temizlendi");
                }
            }
        } catch (error) {
            console.error("Seçimleri temizlerken hata:", error);
        }
    }
    
    // Onay diyaloğu göster
    showConfirmDialog(title, message, confirmText, cancelText, callback) {
        // Varsa açık context menüsünü kapat
        this.hideContextMenu();
        
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
        
        // Modalı dosya yöneticisine ekle
        this.window.appendChild(modal);
        
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
}