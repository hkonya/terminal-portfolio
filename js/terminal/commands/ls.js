// Gerçek FileSystem'i import et
import { fileSystem } from '../../FileSystem.js';

// Boyut formatı için yardımcı fonksiyon
function formatSize(size, humanReadable = false) {
    if (!size) return '0B';
    
    // Eğer zaten formatlı geliyorsa (örn: 4.0K) doğrudan döndür
    if (typeof size === 'string' && size.match(/^[\d\.]+[BKMGT]?$/)) {
        // NaN değerini kontrol et
        if (size.includes('NaN')) return '0B';
        return size;
    }
    
    // Eğer sayı değilse, 0 olarak kabul et
    const numericSize = parseInt(size);
    if (isNaN(numericSize)) return '0B';
    
    if (!humanReadable) return `${numericSize}`;
    
    if (numericSize < 1024) return numericSize + 'B';
    if (numericSize < 1024 * 1024) return (numericSize / 1024).toFixed(1) + 'K';
    if (numericSize < 1024 * 1024 * 1024) return (numericSize / (1024 * 1024)).toFixed(1) + 'M';
    return (numericSize / (1024 * 1024 * 1024)).toFixed(1) + 'G';
}

// Tarih formatı
function formatDate(date) {
    try {
        if (!date) return '-';
        if (typeof date === 'string') {
            date = new Date(date);
        }
        if (isNaN(date.getTime())) return '-';
        
        const now = new Date();
        const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        
        // Aynı yıl içindeyse ay, gün, saat göster
        if (date.getFullYear() === now.getFullYear()) {
            const month = monthNames[date.getMonth()];
            const day = date.getDate().toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${day} ${month} ${hours}:${minutes}`;
        } else {
            // Farklı yıl ise ay, gün, yıl göster
            const month = monthNames[date.getMonth()];
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        }
    } catch (error) {
        console.error('Tarih formatlanırken hata:', error);
        return '-';
    }
}

function formatEntry(name, item, showDetails = false) {
    try {
        // Detaylı görünüm için
        if (showDetails) {
            const isDir = item.type === 'directory';
            const permissions = item.permissions || (isDir ? 'drwxr-xr-x' : '-rw-r--r--');
            const owner = item.owner || 'hkonya';
            const group = item.group || 'staff';
            
            // Boyutu doğru formatta al
            const size = formatSize(item.size, true);
            
            // Son değiştirilme tarihini formatlı olarak al
            const date = formatDate(item.lastModified);
            
            // Dosya ve klasörleri farklı renklerde göster
            const colorClass = isDir ? 'directory-color' : 'file-color';
            const nameWithClass = `<span class="${colorClass}">${name}${isDir ? '/' : ''}</span>`;
            
            return `${permissions} ${owner} ${group} ${size.padStart(8)} ${date} ${nameWithClass}`;
        } else {
            // Basit görünüm için
            const isDir = item.type === 'directory';
            // Dosya ve klasörleri farklı renklerde göster
            const colorClass = isDir ? 'directory-color' : 'file-color';
            return `<span class="${colorClass}">${name}${isDir ? '/' : ''}</span>`;
        }
    } catch (error) {
        console.error(`Giriş formatlanırken hata: ${name}`, error);
        return name;
    }
}

function listDirectory(path, terminalContent, showDetails = false, showHidden = false, showHumanReadable = false, recursive = false, level = 0, utils) {
    try {
        // Yol boşsa veya kök dizinse, "/" olarak ayarla
        const dirPath = path || '/';
        
        // Dizin içeriğini almayı dene
        const contents = fileSystem.getDirectoryContents(dirPath);
        
        if (!contents || contents.length === 0) {
            // Boş dizin
            return `<div>${dirPath}: Dizin boş</div>`;
        }
        
        // Detaylı görünüm için tüm içerikleri formatla
        let output = [];
        
        // . ve .. gösterimini kaldırdık
        
        // Dizin içeriğini listeleyelim
        for (const name in contents) {
            // Gizli dosyaları kontrol et
            if (name.startsWith('.') && !showHidden) continue;
            
            const item = contents[name];
            const formattedEntry = formatEntry(name, item, showDetails, showHumanReadable);
            output.push(formattedEntry);
            
            // Recursive listeleme
            if (recursive && item.type === 'directory') {
                const subDirPath = `${dirPath}${dirPath.endsWith('/') ? '' : '/'}${name}`;
                const subDirContent = listDirectory(subDirPath, null, showDetails, showHidden, showHumanReadable, recursive, level + 1, utils);
                
                if (subDirContent) {
                    // Recursive olduğunda dizin adını göster
                    output.push(`\n${subDirPath}:`);
                    output.push(subDirContent);
                }
            }
        }
        
        // Kolonlu çıktı için (detaylı olmayan görünümde)
        if (!showDetails) {
            const formattedOutput = output.join('  ');
            if (terminalContent && level === 0) {
                utils.addOutput(formattedOutput, terminalContent);
            }
            return formattedOutput;
        } else {
            const formattedOutput = output.join('\n');
            if (terminalContent && level === 0) {
                utils.addOutput(formattedOutput, terminalContent);
            }
            return formattedOutput;
        }
    } catch (error) {
        console.error(`Dizin listelenirken hata: ${path}`, error);
        if (terminalContent && level === 0) {
            utils.addOutput(`ls: ${path}: ${error.message}`, terminalContent, 'error');
        }
        return null;
    }
}

// ls komutu
export function ls(params, targetContent, commandHistory, currentPath, setPath, utils) {
    try {
        // Parametre analizi
        let showDetails = false;
        let showHidden = false;
        let showHumanReadable = false;
        let recursive = false;
        let paths = [];
        
        // Parametreleri analiz et
        for (const param of params) {
            if (param.startsWith('-')) {
                // Seçenekleri kontrol et
                for (let i = 1; i < param.length; i++) {
                    switch (param[i]) {
                        case 'l':
                            showDetails = true;
                            break;
                        case 'a':
                            showHidden = true;
                            break;
                        case 'h':
                            showHumanReadable = true;
                            break;
                        case 'R':
                            recursive = true;
                            break;
                        default:
                            utils.addOutput(`ls: geçersiz seçenek -- '${param[i]}'`, targetContent, 'error');
                            return;
                    }
                }
            } else {
                // Dizin yolları
                paths.push(param);
            }
        }
        
        // Eğer dizin belirtilmemişse, mevcut dizini kullan
        if (paths.length === 0) {
            paths.push(currentPath);
        }
        
        // Her yol için dizin içeriğini listele
        for (const path of paths) {
            if (paths.length > 1) {
                utils.addOutput(`${path}:`, targetContent);
            }
            
            let targetPath = path;
            
            // Yol göreceli ise mevcut dizine ekle
            if (!path.startsWith('/')) {
                targetPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${path}`;
            }
            
            // ~ karakterini /home/guest ile değiştir
            if (targetPath === '~') {
                targetPath = '/home/guest';
            } else if (targetPath.startsWith('~/')) {
                targetPath = `/home/guest${targetPath.substring(1)}`;
            }
            
            // İçeriği listele
            listDirectory(targetPath, targetContent, showDetails, showHidden, showHumanReadable, recursive, 0, utils);
            
            if (paths.length > 1 && path !== paths[paths.length - 1]) {
                utils.addOutput('', targetContent);
            }
        }
    } catch (error) {
        console.error('ls komutu hatası:', error);
        utils.addOutput(`ls: ${error.message}`, targetContent, 'error');
    }
} 