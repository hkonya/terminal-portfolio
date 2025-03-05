export function pwd(params, targetContent, commandHistory, currentPath, setPath, utils) {
    try {
        // Sadece mevcut çalışma dizinini göster
        utils.addOutput(currentPath, targetContent);
    } catch (error) {
        console.error('pwd komutu hatası:', error);
        utils.addOutput(`pwd: ${error.message}`, targetContent, 'error');
    }
} 