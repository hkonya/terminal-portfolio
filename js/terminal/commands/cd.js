import { addOutput } from '../utils.js';

export function cd(params, targetContent, currentPath, setPath, { updateCursorPosition }) {
    if (!params || params.length === 0) {
        addOutput(currentPath, targetContent);
        const input = targetContent.querySelector('.terminal-input');
        if (input) {
            input.value = '';
            input.style.color = '#f8f8f2';
            const cursor = targetContent.querySelector('.cursor');
            if (cursor) updateCursorPosition(input, cursor);
        }
        return;
    }

    let path = params[0];
    // Sondaki "/" karakterini kaldır
    path = path.replace(/\/$/, '');

    const fileSystem = {
        '/home/guest': ['portfolio'],
        '/home/guest/portfolio': ['css', 'js', 'img'],
        '/home/guest/portfolio/css': [],
        '/home/guest/portfolio/js': [],
        '/home/guest/portfolio/img': []
    };

    let newPath = currentPath;

    // '.' komutu için mevcut dizinde kal
    if (path === '.') {
        addOutput(currentPath, targetContent);
        const input = targetContent.querySelector('.terminal-input');
        if (input) {
            input.value = '';
            input.style.color = '#f8f8f2';
            const cursor = targetContent.querySelector('.cursor');
            if (cursor) updateCursorPosition(input, cursor);
        }
        return;
    }

    // '..' komutu için üst dizine git
    if (path === '..') {
        newPath = currentPath.split('/').slice(0, -1).join('/');
        if (newPath.startsWith('/home/guest')) {
            setPath(newPath || '/home/guest');
            addOutput(newPath || '/home/guest', targetContent);
        } else {
            addOutput('cd: izin reddedildi: ..', targetContent);
            const input = targetContent.querySelector('.terminal-input');
            if (input) {
                input.value = '';
                input.style.color = '#f8f8f2';
                const cursor = targetContent.querySelector('.cursor');
                if (cursor) updateCursorPosition(input, cursor);
            }
            return;
        }
    }
    // '~' veya '/home/guest' için ana dizine git
    else if (path === '~' || path === '/home/guest') {
        newPath = '/home/guest';
        setPath(newPath);
        addOutput(newPath, targetContent);
    }
    // Tam yol verilmişse
    else if (path.startsWith('/')) {
        if (fileSystem[path]) {
            newPath = path;
            setPath(newPath);
            addOutput(newPath, targetContent);
        } else {
            addOutput(`cd: ${path}: Böyle bir dizin yok`, targetContent);
            const input = targetContent.querySelector('.terminal-input');
            if (input) {
                input.value = '';
                input.style.color = '#f8f8f2';
                const cursor = targetContent.querySelector('.cursor');
                if (cursor) updateCursorPosition(input, cursor);
            }
            return;
        }
    }
    // Göreceli yol için
    else {
        newPath = `${currentPath}/${path}`;
        const parentDirs = fileSystem[currentPath] || [];

        if (parentDirs.includes(path)) {
            setPath(newPath);
            addOutput(newPath, targetContent);
        } else {
            addOutput(`cd: ${path}: Böyle bir dizin yok`, targetContent);
            const input = targetContent.querySelector('.terminal-input');
            if (input) {
                input.value = '';
                input.style.color = '#f8f8f2';
                const cursor = targetContent.querySelector('.cursor');
                if (cursor) updateCursorPosition(input, cursor);
            }
            return;
        }
    }

    // Input'u temizle
    const input = targetContent.querySelector('.terminal-input');
    if (input) {
        input.value = '';
        input.style.color = '#f8f8f2';
        const cursor = targetContent.querySelector('.cursor');
        if (cursor) updateCursorPosition(input, cursor);
    }
} 