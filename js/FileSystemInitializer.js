import { fileSystem } from './FileSystem.js';

// LocalStorage kontrolü
export function checkAndInitializeFileSystem() {
    console.log('FileSystem kontrol ediliyor...');
    const existingFileSystem = localStorage.getItem('FileSystem');
    
    if (!existingFileSystem) {
        console.log('FileSystem bulunamadı, varsayılan yapı oluşturuluyor...');
        const fs = initializeFileSystem();
        return true;
    } else {
        try {
            const fs = JSON.parse(existingFileSystem);
            // Temel dizin yapısını kontrol et
            if (!fs.children?.home?.children?.guest) {
                console.log('FileSystem yapısı bozuk, yeniden oluşturuluyor...');
                localStorage.removeItem('FileSystem');
                initializeFileSystem();
                return true;
            }
            // Varsayılan dizinleri kontrol et
            const guestDir = fs.children.home.children.guest;
            const hasAllDefaultDirs = defaultDirectories.every(dir => 
                guestDir.children && guestDir.children[dir.name]
            );
            
            if (!hasAllDefaultDirs) {
                console.log('Eksik dizinler bulundu, tamamlanıyor...');
                initializeFileSystem();
                return true;
            }

            console.log('Mevcut FileSystem yapısı kullanılıyor.');
            return false;
        } catch (error) {
            console.log('FileSystem yapısı hatalı, yeniden oluşturuluyor...');
            localStorage.removeItem('FileSystem');
            initializeFileSystem();
            return true;
        }
    }
}

const defaultDirectories = [
    {
        name: 'Belgeler',
        translations: { en: 'Documents', tr: 'Belgeler' }
    },
    {
        name: 'Genel',
        translations: { en: 'General', tr: 'Genel' }
    },
    {
        name: 'İndirilenler',
        translations: { en: 'Downloads', tr: 'İndirilenler' }
    },
    {
        name: 'Masaüstü',
        translations: { en: 'Desktop', tr: 'Masaüstü' }
    },
    {
        name: 'Müzik',
        translations: { en: 'Music', tr: 'Müzik' }
    },
    {
        name: 'Resimler',
        translations: { en: 'Images', tr: 'Resimler' }
    },
    {
        name: 'Sablonlar',
        translations: { en: 'Templates', tr: 'Sablonlar' }
    },
    {
        name: 'Videolar',
        translations: { en: 'Videos', tr: 'Videolar' }
    }
];

const portfolioStructure = {
    'LICENSE': { 
        content: 'MIT License\n\nCopyright (c) 2024 Hasan Konya\n\nPermission is hereby granted...',
        size: '1.0K',
        permissions: '-rw-r--r--'
    },
    'README.md': {
        content: '# Terminal Portfolio\n\nBu proje, terminal benzeri bir arayüz üzerinden portfolyo sunumu yapar.',
        size: '2.9K',
        permissions: '-rw-r--r--'
    },
    'index.html': {
        content: '<!DOCTYPE html><html><head><title>Terminal Portfolio</title></head><body>...</body></html>',
        size: '4.8K',
        permissions: '-rw-r--r--'
    },
    'css': {
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: '160B',
        children: {
            'mobile.css': {
                content: '/* Mobile styles */',
                size: '5.2K',
                permissions: '-rw-r--r--'
            },
            'style.css': {
                content: '/* Main styles */',
                size: '21K',
                permissions: '-rw-r--r--'
            },
            'windows.css': {
                content: '/* Window styles */',
                size: '17K',
                permissions: '-rw-r--r--'
            }
        }
    },
    'files': {
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: '128B',
        children: {
            'cv.pdf': { content: '', size: '132K', permissions: '-rw-r--r--' },
            'preview.jpg': { content: '', size: '834K', permissions: '-rw-r--r--' }
        }
    },
    'img': {
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: '736B',
        children: {
            'actions': { type: 'directory', permissions: 'drwxr-xr-x', size: '2.1K', children: {} },
            'apps': { type: 'directory', permissions: 'drwxr-xr-x', size: '2.9K', children: {} },
            'bg.png': { content: '', size: '2.8M', permissions: '-rw-r--r--' },
            'bg2.png': { content: '', size: '6.1M', permissions: '-rw-r--r--' },
            'bg_dark.png': { content: '', size: '3.0M', permissions: '-rw-r--r--' },
            'bg_dark2.png': { content: '', size: '4.6M', permissions: '-rw-r--r--' },
            'categories': { type: 'directory', permissions: 'drwxr-xr-x', size: '896B', children: {} },
            'cv.png': { content: '', size: '486K', permissions: '-rw-r--r--' },
            'dev.png': { content: '', size: '9.0K', permissions: '-rw-r--r--' },
            'devices': { type: 'directory', permissions: 'drwxr-xr-x', size: '800B', children: {} },
            'emblems': { type: 'directory', permissions: 'drwxr-xr-x', size: '704B', children: {} },
            'github.png': { content: '', size: '18K', permissions: '-rw-r--r--' },
            'instagram.png': { content: '', size: '52K', permissions: '-rw-r--r--' },
            'legacy': { type: 'directory', permissions: 'drwxr-xr-x', size: '192B', children: {} },
            'linkedin.png': { content: '', size: '11K', permissions: '-rw-r--r--' },
            'medium.png': { content: '', size: '14K', permissions: '-rw-r--r--' },
            'mimetypes': { type: 'directory', permissions: 'drwxr-xr-x', size: '4.8K', children: {} },
            'places': { type: 'directory', permissions: 'drwxr-xr-x', size: '608B', children: {} },
            'status': { type: 'directory', permissions: 'drwxr-xr-x', size: '800B', children: {} },
            'terminal.png': { content: '', size: '7.9K', permissions: '-rw-r--r--' },
            'text_file.png': { content: '', size: '110K', permissions: '-rw-r--r--' }
        }
    },
    'js': {
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: '256B',
        children: {
            'apps': { type: 'directory', permissions: 'drwxr-xr-x', size: '128B', children: {} },
            'desktop': { type: 'directory', permissions: 'drwxr-xr-x', size: '96B', children: {} },
            'i18n.js': { content: '', size: '8.2K', permissions: '-rw-r--r--' },
            'main.js': { content: '', size: '32K', permissions: '-rw-r--r--' },
            'terminal': { type: 'directory', permissions: 'drwxr-xr-x', size: '160B', children: {} },
            'window': { type: 'directory', permissions: 'drwxr-xr-x', size: '96B', children: {} }
        }
    },
    'locales': {
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: '128B',
        children: {
            'en.js': { content: '', size: '8.6K', permissions: '-rw-r--r--' },
            'tr.js': { content: '', size: '9.2K', permissions: '-rw-r--r--' }
        }
    }
};

export function initializeFileSystem() {
    // Temel dizinleri oluştur
    fileSystem.createDirectory('/home');
    fileSystem.createDirectory('/home/guest');
    
    // Varsayılan dizinleri oluştur
    defaultDirectories.forEach(dir => {
        const path = `/home/guest/${dir.name}`;
        fileSystem.createDirectory(path);
        const node = fileSystem.traversePath(path);
        if (node) {
            node.translatedName = dir.translations;
            node.metadata = {
                ...node.metadata,
                created: new Date(),
                accessed: new Date(),
                isHidden: false,
                itemCount: 0,
                directories: 0,
                files: 0,
                path: path,
                position: dir.name === 'Masaüstü' ? { x: 70, y: 40 } : undefined
            };
        }
    });
    
    // CV.pdf dosyasını oluştur
    const desktopPath = '/home/guest/Masaüstü';
    fileSystem.createFile(desktopPath + '/CV.pdf', '', '-rw-r--r--');
    const cvNode = fileSystem.traversePath(desktopPath + '/CV.pdf');
    if (cvNode) {
        cvNode.metadata = {
            created: new Date(),
            accessed: new Date(),
            modified: new Date(),
            position: { x: 70, y: 40 },
            path: desktopPath + '/CV.pdf',
            extension: 'pdf',
            fileType: 'PDF Document',
            description: 'Curriculum Vitae',
            icon: 'pdf-icon.png',
            mimeType: 'application/pdf',
            version: '1.0',
            isReadOnly: false,
            isSystem: false,
            checksum: 'abc123'
        };
    }
    
    fileSystem.saveFileSystem();
    return fileSystem;
}

function createPortfolioStructure(basePath, structure) {
    // Önce ana dizini oluştur
    try {
        fileSystem.createDirectory(basePath);
        const node = fileSystem.traversePath(basePath);
        if (node && !node.metadata?.path) {
            node.metadata = {
                ...(node.metadata || {}),
                path: basePath
            };
        }
        console.log(`Ana dizin oluşturuldu: ${basePath}`);
    } catch (error) {
        console.log(`Ana dizin zaten mevcut: ${basePath}`);
    }

    // Sonra alt dizin ve dosyaları oluştur
    for (const [name, item] of Object.entries(structure)) {
        const fullPath = `${basePath}/${name}`;
        try {
            if (item.type === 'directory') {
                // Dizin oluştur
                fileSystem.createDirectory(fullPath, item.permissions);
                const node = fileSystem.traversePath(fullPath);
                if (node) {
                    node.size = item.size;
                    node.metadata = {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: name.startsWith('.'),
                        itemCount: Object.keys(item.children || {}).length,
                        directories: Object.values(item.children || {})
                            .filter(child => child.type === 'directory').length,
                        files: Object.values(item.children || {})
                            .filter(child => !child.type || child.type !== 'directory').length,
                        path: fullPath
                    };
                }
                // Alt dizinleri ve dosyaları oluştur
                if (item.children) {
                    createPortfolioStructure(fullPath, item.children);
                }
            } else {
                // Dosya oluştur
                fileSystem.createFile(fullPath, item.content || '', item.permissions);
                const node = fileSystem.traversePath(fullPath);
                if (node) {
                    node.size = item.size;
                    node.metadata = {
                        ...(node.metadata || {}),
                        path: fullPath
                    };
                }
            }
        } catch (error) {
            console.log(`Hata: ${fullPath} oluşturulurken: ${error.message}`);
        }
    }
}

// Dosya sistemi API'sini kullanım örneği
export function fileSystemExample() {
    // Dizin içeriğini listele
    const contents = fileSystem.getDirectoryContents('/home/guest');
    console.log('Directory contents:', contents);

    // Dosya oku
    const fileContent = fileSystem.readFile('/home/guest/hello.txt');
    console.log('File content:', fileContent);

    // Çeviri örneği
    const trPath = '/home/guest/Masaüstü';
    const enPath = fileSystem.getTranslatedPath(trPath, 'en');
    console.log('Translated path:', enPath); // /home/guest/Desktop
} 