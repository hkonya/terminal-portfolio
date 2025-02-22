// Dosya sistemi yapısı
const fileSystem = {
    '/home/guest': {
        'portfolio': { type: 'directory', size: '320B', modified: '9 Şub 00:24', permissions: 'drwxr-xr-x' }
    },
    '/home/guest/portfolio': {
        'css': { type: 'directory', size: '96B', modified: '8 Şub 17:52', permissions: 'drwxr-xr-x' },
        'js': { type: 'directory', size: '96B', modified: '8 Şub 17:52', permissions: 'drwxr-xr-x' },
        'img': { type: 'directory', size: '320B', modified: '9 Şub 00:24', permissions: 'drwxr-xr-x' },
        'index.html': { type: 'file', size: '5.5K', modified: '9 Şub 00:06', permissions: '-rw-r--r--' },
        'README.md': { type: 'file', size: '0B', modified: '8 Şub 17:53', permissions: '-rw-r--r--' }
    },
    '/home/guest/portfolio/css': {
        'style.css': { type: 'file', size: '14K', modified: '9 Şub 00:35', permissions: '-rw-r--r--' }
    },
    '/home/guest/portfolio/js': {
        'main.js': { type: 'file', size: '63K', modified: '9 Şub 00:35', permissions: '-rw-r--r--' }
    },
    '/home/guest/portfolio/img': {
        'terminal.png': { type: 'file', size: '7.9K', modified: '8 Şub 18:39', permissions: '-rw-r--r--' },
        'github.png': { type: 'file', size: '18K', modified: '8 Şub 18:40', permissions: '-rw-r--r--' },
        'linkedin.png': { type: 'file', size: '11K', modified: '8 Şub 18:41', permissions: '-rw-r--r--' },
        'dev.png': { type: 'file', size: '9.0K', modified: '8 Şub 18:41', permissions: '-rw-r--r--' },
        'medium.png': { type: 'file', size: '14K', modified: '8 Şub 18:43', permissions: '-rw-r--r--' },
        'instagram.png': { type: 'file', size: '52K', modified: '8 Şub 18:40', permissions: '-rw-r--r--' },
        'bg.png': { type: 'file', size: '6.1M', modified: '9 Şub 00:23', permissions: '-rw-r--r--' },
        'bg_dark.png': { type: 'file', size: '4.6M', modified: '9 Şub 00:23', permissions: '-rw-r--r--' }
    }
};

function formatEntry(name, info, isDirectory = false, showDetails = false, showHumanReadable = false) {
    if (showDetails) {
        const size = showHumanReadable ? info.size : info.size.replace(/[KMG]/, '000');
        return `${info.permissions} 1 hkonya admin ${size.padStart(8)} ${info.modified} ${isDirectory ? `<span style="color: #f1c40f">${name}/</span>` : `<span style="color: #f8f8f2">${name}</span>`}`;
    }
    return isDirectory ? `<span style="color: #f1c40f">${name}/</span>` : `<span style="color: #f8f8f2">${name}</span>`;
}

function listDirectory(path, content, showDetails = false, showHumanReadable = false, level = 0) {
    let result = '';
    if (level > 0) {
        result += `\n\n${path}:`;
    }

    const dirs = [];
    const fils = [];

    // Özel dizinleri ekle
    if (path !== '/' && !showDetails) {
        dirs.push('.');
        dirs.push('..');
    }

    // Dosya ve dizinleri ayır
    for (const [name, info] of Object.entries(content)) {
        if (info.type === 'directory') {
            dirs.push(name);
        } else {
            fils.push(name);
        }
    }

    // Sırala ve formatla
    const entries = [];
    [...dirs.sort(), ...fils.sort()].forEach(name => {
        if (name === '.' || name === '..') {
            entries.push(`<span style="color: #f1c40f">${name}</span>`);
        } else {
            const info = content[name];
            entries.push(formatEntry(name, info, info.type === 'directory', showDetails, showHumanReadable));
        }
    });

    result += '\n' + entries.join('\n');

    return result;
}

export function ls(params = [], targetContent, currentPath, { addOutput, updateCursorPosition }) {
    // Parametreleri analiz et
    const showDetails = params.includes('-l') || params.includes('-lh');
    const showHumanReadable = params.includes('-h') || params.includes('-lh');
    const showRecursive = params.includes('-R');

    // Hedef dizini belirle
    let targetPath = currentPath;
    const nonOptionParams = params.filter(p => !p.startsWith('-'));
    
    if (nonOptionParams.length > 0) {
        const dirParam = nonOptionParams[0];
        
        // Tam yol verilmişse
        if (dirParam.startsWith('/')) {
            targetPath = dirParam;
        }
        // Göreceli yol verilmişse
        else {
            // ".." için üst dizine git
            if (dirParam === '..') {
                targetPath = currentPath.split('/').slice(0, -1).join('/') || '/';
            }
            // "." için mevcut dizinde kal
            else if (dirParam === '.') {
                targetPath = currentPath;
            }
            // Normal dizin adı verilmişse
            else {
                targetPath = `${currentPath}/${dirParam}`;
            }
        }
    }

    const currentDirContent = fileSystem[targetPath];
    
    if (!currentDirContent) {
        addOutput(`ls: '${targetPath}': Böyle bir dizin yok`, targetContent);
        // Input'u temizle
        const input = targetContent.querySelector('.terminal-input');
        if (input) {
            input.value = '';
            input.style.color = '#f8f8f2';
            const cursor = targetContent.querySelector('.cursor');
            if (cursor) updateCursorPosition(input, cursor);
        }
        return;
    }

    let output = listDirectory(targetPath, currentDirContent, showDetails, showHumanReadable).trim();

    // Rekürsif listeleme
    if (showRecursive) {
        for (const [name, info] of Object.entries(currentDirContent)) {
            if (info.type === 'directory') {
                const subPath = `${targetPath}/${name}`;
                const subContent = fileSystem[subPath];
                if (subContent) {
                    output += listDirectory(subPath, subContent, showDetails, showHumanReadable, 1);
                }
            }
        }
    }

    addOutput(output || 'Dizin boş', targetContent);

    // Input'u temizle
    const input = targetContent.querySelector('.terminal-input');
    if (input) {
        input.value = '';
        input.style.color = '#f8f8f2';
        const cursor = targetContent.querySelector('.cursor');
        if (cursor) updateCursorPosition(input, cursor);
    }
} 