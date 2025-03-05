import { fileSystem } from '../../FileSystem.js';

export function tree(params, targetContent, commandHistory, currentPath, setPath, utils) {
    try {
        // Varsayılan olarak geçerli dizinden başla
        const path = params[0] || currentPath;
        
        // Dizini kontrol et
        const dirContents = fileSystem.getContents(path);
        if (!dirContents) throw new Error(`'${path}' dizini bulunamadı.`);
        
        // Ağaç görünümünü oluştur
        let tree = path;
        
        // Dosya ve dizinleri listele
        Object.keys(dirContents).forEach(key => {
            tree += `\n├── ${key}`;
        });
        
        // Çıktıyı göster
        utils.addOutput(tree, targetContent);
    } catch (error) {
        console.error('Tree komutu hatası:', error);
        utils.addOutput(`tree: ${error.message}`, targetContent, 'error');
    }
} 