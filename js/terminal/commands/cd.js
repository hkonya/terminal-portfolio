import { addOutput } from '../utils.js';
import { fileSystem } from '../../FileSystem.js';

export function cd(params, targetContent, commandHistory, currentPath, setPath, utils) {
    try {
        if (!params || params.length === 0) {
            setPath('/home/guest');
            return;
        }

        let path = params[0];
        
        // Sondaki "/" karakterini kaldır (kök dizin hariç)
        if (path !== '/' && path.endsWith('/')) {
            path = path.replace(/\/$/, '');
        }
        
        // ~ veya ~/ ile başlayan yolları /home/guest ile değiştir
        if (path === '~') {
            path = '/home/guest';
        } else if (path.startsWith('~/')) {
            path = '/home/guest' + path.substring(1);
        }
        
        // '.' komutu için mevcut dizinde kal
        if (path === '.') {
            return;
        }
        
        // '..' komutu için üst dizine git
        if (path === '..') {
            const parts = currentPath.split('/').filter(p => p);
            if (parts.length === 0) {
                return; // Root dizininde kalın
            }
            path = '/' + parts.slice(0, -1).join('/');
            if (path === '') path = '/';
        }
        
        // Göreceli yol ise, mevcut yola ekle
        if (!path.startsWith('/')) {
            path = currentPath + (currentPath.endsWith('/') ? '' : '/') + path;
        }
        
        // Path'i normalize et, çift slashları ve gereksiz nokta parçalarını temizle
        path = path.replace(/\/+/g, '/').replace(/\/\.\//g, '/');
        
        // Dosya sistemi üzerinden dizinin varlığını kontrol et
        const node = fileSystem.traversePath(path);
        
        if (!node) {
            addOutput(`cd: ${path}: Böyle bir dosya veya dizin yok`, targetContent, 'error');
            return;
        }
        
        if (node.type !== 'directory') {
            addOutput(`cd: ${path}: Bir dizin değil`, targetContent, 'error');
            return;
        }
        
        // Yeni dizine geçiş başarılı
        setPath(path);
    } catch (error) {
        console.error('cd komutu hatası:', error);
        addOutput(`cd: ${error.message}`, targetContent, 'error');
    }
} 