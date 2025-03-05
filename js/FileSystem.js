class FileSystem {
    constructor() {
        this.fileTypes = {
            // Metin dosyaları
            'txt': { type: 'text', icon: 'text_file.png', description: 'Metin Dosyası' },
            'md': { type: 'text', icon: 'text_file.png', description: 'Markdown Dosyası' },
            'js': { type: 'code', icon: 'text_file.png', description: 'JavaScript Dosyası' },
            'css': { type: 'code', icon: 'text_file.png', description: 'CSS Stil Dosyası' },
            'html': { type: 'code', icon: 'text_file.png', description: 'HTML Dosyası' },
            'json': { type: 'code', icon: 'text_file.png', description: 'JSON Veri Dosyası' },

            // Resim dosyaları
            'jpg': { type: 'image', icon: 'image_file.png', description: 'JPEG Resim' },
            'jpeg': { type: 'image', icon: 'image_file.png', description: 'JPEG Resim' },
            'png': { type: 'image', icon: 'image_file.png', description: 'PNG Resim' },
            'gif': { type: 'image', icon: 'image_file.png', description: 'GIF Animasyon' },
            'svg': { type: 'image', icon: 'image_file.png', description: 'SVG Vektör Resim' },

            // Döküman dosyaları
            'pdf': { type: 'document', icon: 'pdf_file.png', description: 'PDF Dökümanı' },
            'doc': { type: 'document', icon: 'doc_file.png', description: 'Word Dökümanı' },
            'docx': { type: 'document', icon: 'doc_file.png', description: 'Word Dökümanı' },
            'xls': { type: 'document', icon: 'xls_file.png', description: 'Excel Dökümanı' },
            'xlsx': { type: 'document', icon: 'xls_file.png', description: 'Excel Dökümanı' },

            // Medya dosyaları
            'mp3': { type: 'audio', icon: 'audio_file.png', description: 'MP3 Ses Dosyası' },
            'wav': { type: 'audio', icon: 'audio_file.png', description: 'WAV Ses Dosyası' },
            'mp4': { type: 'video', icon: 'video_file.png', description: 'MP4 Video' },
            'avi': { type: 'video', icon: 'video_file.png', description: 'AVI Video' },

            // Sıkıştırılmış dosyalar
            'zip': { type: 'archive', icon: 'archive_file.png', description: 'ZIP Arşivi' },
            'rar': { type: 'archive', icon: 'archive_file.png', description: 'RAR Arşivi' },
            'tar': { type: 'archive', icon: 'archive_file.png', description: 'TAR Arşivi' },
            'gz': { type: 'archive', icon: 'archive_file.png', description: 'GZIP Arşivi' }
        };
        this.initializeFileSystem();
    }

    initializeFileSystem() {
        const defaultFileSystem = {
            type: 'directory',
            name: 'root',
            permissions: 'drwxr-xr-x',
            owner: 'root',
            group: 'root',
            size: '4.0K',
            lastModified: new Date(),
            metadata: {
                created: new Date(),
                accessed: new Date(),
                isHidden: false,
                itemCount: 20,
                directories: 20,
                files: 0
            },
            children: {
                bin: {
                    type: 'directory',
                    name: 'bin',
                    permissions: 'lrwxrwxrwx',
                    owner: 'root',
                    group: 'root',
                    size: '7',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        isSymlink: true,
                        symlinkTarget: '/usr/bin',
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                boot: {
                    type: 'directory',
                    name: 'boot',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                cdrom: {
                    type: 'directory',
                    name: 'cdrom',
                    permissions: 'dr-xr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                dev: {
                    type: 'directory',
                    name: 'dev',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4.2K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                etc: {
                    type: 'directory',
                    name: 'etc',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '12K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                home: {
                    type: 'directory',
                    name: 'home',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 1,
                        directories: 1,
                        files: 0
                    },
                    children: {
                        guest: {
                            type: 'directory',
                            name: 'guest',
                            permissions: 'drwxr-xr-x',
                            owner: 'hkonya',
                            group: 'staff',
                            size: '4.0K',
                            lastModified: new Date(),
                            metadata: {
                                created: new Date(),
                                accessed: new Date(),
                                isHidden: false,
                                itemCount: 0,
                                directories: 0,
                                files: 0
                            },
                            children: {}
                        }
                    }
                },
                lib: {
                    type: 'directory',
                    name: 'lib',
                    permissions: 'lrwxrwxrwx',
                    owner: 'root',
                    group: 'root',
                    size: '7',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        isSymlink: true,
                        symlinkTarget: '/usr/lib',
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                'lost+found': {
                    type: 'directory',
                    name: 'lost+found',
                    permissions: 'drwx------',
                    owner: 'root',
                    group: 'root',
                    size: '16K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                media: {
                    type: 'directory',
                    name: 'media',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                mnt: {
                    type: 'directory',
                    name: 'mnt',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                opt: {
                    type: 'directory',
                    name: 'opt',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                proc: {
                    type: 'directory',
                    name: 'proc',
                    permissions: 'dr-xr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '0',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                root: {
                    type: 'directory',
                    name: 'root',
                    permissions: 'drwx------',
                    owner: 'root',
                    group: 'root',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                run: {
                    type: 'directory',
                    name: 'run',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '900',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                sbin: {
                    type: 'directory',
                    name: 'sbin',
                    permissions: 'lrwxrwxrwx',
                    owner: 'root',
                    group: 'root',
                    size: '8',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        isSymlink: true,
                        symlinkTarget: '/usr/sbin',
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                snap: {
                    type: 'directory',
                    name: 'snap',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                srv: {
                    type: 'directory',
                    name: 'srv',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                'swap.img': {
                    type: 'file',
                    name: 'swap.img',
                    permissions: '-rw-------',
                    owner: 'root',
                    group: 'root',
                    size: '3.3G',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        extension: 'img',
                        fileType: 'disk',
                        description: 'Takas Dosyası',
                        icon: 'swap_file.png'
                    },
                    content: ''
                },
                sys: {
                    type: 'directory',
                    name: 'sys',
                    permissions: 'dr-xr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '0',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                tmp: {
                    type: 'directory',
                    name: 'tmp',
                    permissions: 'drwxrwxrwt',
                    owner: 'root',
                    group: 'root',
                    size: '420',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                usr: {
                    type: 'directory',
                    name: 'usr',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                },
                var: {
                    type: 'directory',
                    name: 'var',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: false,
                        itemCount: 0,
                        directories: 0,
                        files: 0
                    },
                    children: {}
                }
            }
        };

        const existingFileSystem = localStorage.getItem('FileSystem');
        if (!existingFileSystem) {
            this.fileSystem = defaultFileSystem;
        } else {
            try {
                this.fileSystem = JSON.parse(existingFileSystem);
                // Tarihleri string'den Date objesine çevir
                this.convertDates(this.fileSystem);
            } catch (error) {
                console.error('FileSystem yüklenirken hata:', error);
                this.fileSystem = defaultFileSystem;
            }
        }
    }

    // Tarihleri düzeltmek için yardımcı metod
    convertDates(node) {
        if (node.lastModified) {
            node.lastModified = new Date(node.lastModified);
        }
        if (node.metadata) {
            if (node.metadata.created) {
                node.metadata.created = new Date(node.metadata.created);
            }
            if (node.metadata.accessed) {
                node.metadata.accessed = new Date(node.metadata.accessed);
            }
        }
        if (node.children) {
            Object.values(node.children).forEach(child => this.convertDates(child));
        }
    }

    // Dosya sistemi operasyonları
    getDirectoryContents(path) {
        try {
            const node = this.traversePath(path);
            if (!node) {
                console.error(`Dizin bulunamadı: ${path}`);
                return null;
            }
            
            if (node.type !== 'directory') {
                console.error(`Path bir dizin değil: ${path}`);
                return null;
            }
            
            return node.children || {};
        } catch (error) {
            console.error(`Dizin içeriği alınırken hata: ${path}`, error);
            return null;
        }
    }

    createFile(path, content = '', permissions = '-rw-r--r--') {
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        const fileName = path.substring(path.lastIndexOf('/') + 1);
        const extension = fileName.split('.').pop().toLowerCase();
        const parent = this.traversePath(parentPath);

        if (!parent || parent.type !== 'directory') {
            throw new Error('Parent path is not a directory');
        }

        const fileType = this.fileTypes[extension] || { 
            type: 'unknown', 
            icon: 'unknown_file.png', 
            description: 'Bilinmeyen Dosya Tipi' 
        };

        parent.children[fileName] = {
            type: 'file',
            name: fileName,
            content: content,
            permissions: permissions,
            owner: 'hkonya',
            group: 'staff',
            size: this.calculateSize(content),
            lastModified: new Date(),
            metadata: {
                extension: extension,
                fileType: fileType.type,
                description: fileType.description,
                icon: fileType.icon,
                mimeType: this.getMimeType(extension),
                created: new Date(),
                accessed: new Date(),
                version: '1.0',
                isHidden: fileName.startsWith('.'),
                isReadOnly: permissions.charAt(2) === '-',
                isSystem: false,
                checksum: this.calculateChecksum(content)
            }
        };

        this.saveFileSystem();
        this.updateParentSizes(parentPath);
    }

    createDirectory(path, permissions = 'drwxr-xr-x') {
        const parts = path.split('/').filter(p => p);
        let current = this.fileSystem;
        let currentPath = '';

        // Yol üzerindeki her bir dizini kontrol et ve gerekirse oluştur
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            currentPath += '/' + part;

            if (!current.children) {
                current.children = {};
            }

            if (!current.children[part]) {
                current.children[part] = {
                    type: 'directory',
                    name: part,
                    permissions: permissions,
                    owner: 'hkonya',
                    group: 'staff',
                    size: '4.0K',
                    lastModified: new Date(),
                    metadata: {
                        created: new Date(),
                        accessed: new Date(),
                        isHidden: part.startsWith('.'),
                        itemCount: 0,
                        directories: 0,
                        files: 0,
                        path: currentPath
                    },
                    children: {}
                };
            }
            current = current.children[part];
        }

        this.saveFileSystem();
    }

    deleteItem(path) {
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        const itemName = path.substring(path.lastIndexOf('/') + 1);
        const parent = this.traversePath(parentPath);

        if (!parent || !parent.children[itemName]) {
            throw new Error('Path does not exist');
        }

        delete parent.children[itemName];
        this.saveFileSystem();
    }

    readFile(path) {
        const node = this.traversePath(path);
        if (!node || node.type !== 'file') {
            throw new Error('Path is not a file');
        }
        return node.content;
    }

    writeFile(path, content) {
        const node = this.traversePath(path);
        if (!node || node.type !== 'file') {
            throw new Error('Path is not a file');
        }
        node.content = content;
        node.size = this.calculateSize(content);
        node.lastModified = new Date();
        this.saveFileSystem();
    }

    // Yardımcı metodlar
    traversePath(path) {
        // Path kontrolü
        if (!path || typeof path !== 'string') {
            console.error('Geçersiz yol:', path);
            return null;
        }
        
        // Kök dizin kontrolü
        if (path === '/') {
            return this.fileSystem;
        }
        
        const parts = path.split('/').filter(p => p);
        let current = this.fileSystem;

        for (const part of parts) {
            if (!current.children || !current.children[part]) {
                return null;
            }
            current = current.children[part];
        }

        return current;
    }

    calculateSize(content) {
        if (!content) return '0B';
        const size = content.length;
        if (size < 1024) return `${size}B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}K`;
        if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}M`;
        return `${(size / (1024 * 1024 * 1024)).toFixed(1)}G`;
    }

    formatDate(date) {
        const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 
                       'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        const d = new Date(date);
        return `${d.getDate()} ${months[d.getMonth()]} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    updateParentSizes(path) {
        const parts = path.split('/').filter(p => p);
        let currentPath = '';
        
        for (const part of parts) {
            currentPath += '/' + part;
            const node = this.traversePath(currentPath);
            if (node && node.type === 'directory') {
                let totalSize = 0;
                Object.values(node.children).forEach(child => {
                    const size = child.size.replace(/[KMGT]$/, match => {
                        const multiplier = { 'K': 1024, 'M': 1024**2, 'G': 1024**3, 'T': 1024**4 };
                        return multiplier[match];
                    });
                    totalSize += parseFloat(size);
                });
                node.size = this.calculateSize(totalSize);
            }
        }
        this.saveFileSystem();
    }

    getFormattedDirectoryContents(path) {
        const contents = this.getDirectoryContents(path);
        return Object.entries(contents).map(([name, item]) => ({
            name,
            type: item.type,
            permissions: item.permissions,
            owner: item.owner,
            group: item.group,
            size: item.size,
            lastModified: this.formatDate(item.lastModified),
            translatedName: item.translatedName
        }));
    }

    saveFileSystem() {
        localStorage.setItem('FileSystem', JSON.stringify(this.fileSystem));
    }

    getTranslatedPath(path, language) {
        const parts = path.split('/').filter(p => p);
        let translatedParts = [];

        for (const part of parts) {
            const node = this.traversePath(translatedParts.join('/') + '/' + part);
            if (node && node.translatedName && node.translatedName[language]) {
                translatedParts.push(node.translatedName[language]);
            } else {
                translatedParts.push(part);
            }
        }

        return translatedParts.join('/');
    }

    // Yeni yardımcı metodlar
    getMimeType(extension) {
        const mimeTypes = {
            // Metin
            'txt': 'text/plain',
            'html': 'text/html',
            'css': 'text/css',
            'js': 'text/javascript',
            'json': 'application/json',
            'md': 'text/markdown',
            
            // Resimler
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            
            // Dökümanlar
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            
            // Medya
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            
            // Arşivler
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            'tar': 'application/x-tar',
            'gz': 'application/gzip'
        };
        
        return mimeTypes[extension] || 'application/octet-stream';
    }

    calculateChecksum(content) {
        // Basit bir checksum hesaplama
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    getFileInfo(path) {
        const node = this.traversePath(path);
        if (!node) {
            throw new Error('Dosya veya dizin bulunamadı');
        }

        if (node.type === 'file') {
            return {
                name: node.name,
                type: node.type,
                size: node.size,
                permissions: node.permissions,
                owner: node.owner,
                group: node.group,
                lastModified: this.formatDate(node.lastModified),
                metadata: node.metadata,
                path: path
            };
        } else {
            const childCount = Object.keys(node.children).length;
            const directChildDirs = Object.values(node.children)
                .filter(child => child.type === 'directory').length;
            const directChildFiles = childCount - directChildDirs;

            return {
                name: node.name,
                type: 'directory',
                size: node.size,
                permissions: node.permissions,
                owner: node.owner,
                group: node.group,
                lastModified: this.formatDate(node.lastModified),
                metadata: {
                    itemCount: childCount,
                    directories: directChildDirs,
                    files: directChildFiles,
                    isHidden: node.name.startsWith('.'),
                    created: node.metadata?.created || node.lastModified,
                    accessed: new Date(),
                    translatedName: node.translatedName
                },
                path: path
            };
        }
    }

    updateNodePosition(path, position) {
        const fullPath = path.startsWith('/') ? path : `/${path}`;
        const node = this.traversePath(fullPath);
        
        if (!node) return false;
        
        if (!node.metadata) {
            node.metadata = {};
        }
        
        node.metadata.position = position;
        this.saveFileSystem();
        return true;
    }

    // Dosya veya klasörü yeniden adlandırma
    renameItem(sourcePath, targetPath, isDirectory) {
        try {
            // Kaynak düğümünü al
            const sourceNode = this.traversePath(sourcePath);
            if (!sourceNode) {
                console.error(`Kaynak bulunamadı: ${sourcePath}`);
                return false;
            }
            
            // Hedef klasör yolunu al
            const targetDirPath = targetPath.substring(0, targetPath.lastIndexOf('/'));
            const targetDir = this.traversePath(targetDirPath);
            if (!targetDir || targetDir.type !== 'directory') {
                console.error(`Hedef klasör bulunamadı: ${targetDirPath}`);
                return false;
            }
            
            // Hedef dizinde bu isimde bir dosya/klasör var mı?
            const targetName = targetPath.split('/').pop();
            if (targetDir.children[targetName]) {
                // Üzerine yazılacaksa, önceki öğeyi sil
                delete targetDir.children[targetName];
            }
            
            // Kaynak düğümü kopyala
            const sourceName = sourcePath.split('/').pop();
            const sourceDir = this.traversePath(sourcePath.substring(0, sourcePath.lastIndexOf('/')));
            
            // Hedef dizine ekle
            targetDir.children[targetName] = sourceNode;
            
            // Kaynak klasörden sil
            delete sourceDir.children[sourceName];
            
            // Dosya sistemi değişikliklerini kaydet
            this.saveFileSystem();
            
            return true;
        } catch (error) {
            console.error(`Yeniden adlandırma sırasında hata oluştu: ${error}`);
            return false;
        }
    }
    
    // Dosya kopyalama
    copyFile(sourcePath, targetPath) {
        try {
            // Kaynak düğümünü al
            const sourceNode = this.traversePath(sourcePath);
            if (!sourceNode || sourceNode.type !== 'file') {
                console.error(`Kaynak dosya bulunamadı: ${sourcePath}`);
                return false;
            }
            
            // Hedef klasör yolunu al
            const targetDirPath = targetPath.substring(0, targetPath.lastIndexOf('/'));
            const targetDir = this.traversePath(targetDirPath);
            if (!targetDir || targetDir.type !== 'directory') {
                console.error(`Hedef klasör bulunamadı: ${targetDirPath}`);
                return false;
            }
            
            // Hedef dosya adını al
            const targetName = targetPath.split('/').pop();
            
            // Kaynak düğümünü derin kopyala
            const nodeCopy = JSON.parse(JSON.stringify(sourceNode));
            nodeCopy.name = targetName;
            nodeCopy.lastModified = new Date();
            
            // Hedef dizine ekle
            targetDir.children[targetName] = nodeCopy;
            
            // Dosya sistemi değişikliklerini kaydet
            this.saveFileSystem();
            
            return true;
        } catch (error) {
            console.error(`Dosya kopyalama sırasında hata oluştu: ${error}`);
            return false;
        }
    }
    
    // Klasör kopyalama (alt klasör ve dosyalarıyla birlikte)
    copyDirectory(sourcePath, targetPath) {
        try {
            // Kaynak düğümünü al
            const sourceNode = this.traversePath(sourcePath);
            if (!sourceNode || sourceNode.type !== 'directory') {
                console.error(`Kaynak klasör bulunamadı: ${sourcePath}`);
                return false;
            }
            
            // Hedef klasör yolunu al
            const targetDirPath = targetPath.substring(0, targetPath.lastIndexOf('/'));
            const targetDir = this.traversePath(targetDirPath);
            if (!targetDir || targetDir.type !== 'directory') {
                console.error(`Hedef klasör bulunamadı: ${targetDirPath}`);
                return false;
            }
            
            // Hedef klasör adını al
            const targetName = targetPath.split('/').pop();
            
            // Kaynak düğümünü derin kopyala
            const nodeCopy = JSON.parse(JSON.stringify(sourceNode));
            nodeCopy.name = targetName;
            nodeCopy.lastModified = new Date();
            
            // Hedef dizine ekle
            targetDir.children[targetName] = nodeCopy;
            
            // Dosya sistemi değişikliklerini kaydet
            this.saveFileSystem();
            
            return true;
        } catch (error) {
            console.error(`Klasör kopyalama sırasında hata oluştu: ${error}`);
            return false;
        }
    }
}

// Singleton instance
export const fileSystem = new FileSystem(); 