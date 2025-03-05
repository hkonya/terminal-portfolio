import { i18n } from '../i18n.js';
import { 
    addOutput, 
    addToHistory, 
    scrollToBottom, 
    updateCursorPosition, 
    getTextWidth,
    updateTabTitle,
    updateTerminalHeader,
    updateTabBarVisibility 
} from './utils.js';
import { ls } from './commands/ls.js';
import { experience } from './commands/experience.js';
import { help } from './commands/help.js';
import { about } from './commands/about.js';
import { skills } from './commands/skills.js';
import { projects } from './commands/projects.js';
import { contact } from './commands/contact.js';
import { social } from './commands/social.js';
import { whoami } from './commands/whoami.js';
import { date } from './commands/date.js';
import { clear } from './commands/clear.js';
import { coffee } from './commands/coffee.js';
import { sudo } from './commands/sudo.js';
import { matrix } from './commands/matrix.js';
import { exit } from './commands/exit.js';
import { neofetch } from './commands/neofetch.js';
import { tree } from './commands/tree.js';
import { cd } from './commands/cd.js';
import { history } from './commands/history.js';
import { pwd } from './commands/pwd.js';

// Terminal modülünü oluştur
export const Terminal = {
    terminalData: new Map(),
    tabCounter: 0,
    
    // Komut önerisi için yardımcı fonksiyon
    suggestCommand(input, targetContent) {
        const availableCommands = [
            'help', 'clear', 'about', 'skills', 'projects', 'contact',
            'social', 'experience', 'whoami', 'date', 'ls', 'cd',
            'matrix', 'sudo', 'exit', 'coffee', 'neofetch', 'tree',
            'history', 'pwd', 'setlocale'
        ];

        // Levenshtein mesafesini hesapla
        function levenshteinDistance(a, b) {
            if (a.length === 0) return b.length;
            if (b.length === 0) return a.length;

            const matrix = [];

            for (let i = 0; i <= b.length; i++) {
                matrix[i] = [i];
            }

            for (let j = 0; j <= a.length; j++) {
                matrix[0][j] = j;
            }

            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1,
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j] + 1
                        );
                    }
                }
            }

            return matrix[b.length][a.length];
        }

        // En yakın komutu bul
        let closestCommand = '';
        let minDistance = Infinity;

        availableCommands.forEach(cmd => {
            const distance = levenshteinDistance(input, cmd);
            if (distance < minDistance && distance <= 2) {
                minDistance = distance;
                closestCommand = cmd;
            }
        });

        if (closestCommand) {
            const suggestion = document.createElement('div');
            suggestion.className = 'terminal-line suggestion';
            suggestion.innerHTML = `<span style="color: #e74c3c">${i18n.t('system.notFound')} ${i18n.t('system.suggestion')} </span><span style="color: #2ecc71">${closestCommand}</span>`;
            const promptElement = targetContent.querySelector('.terminal-prompt');
            targetContent.insertBefore(suggestion, promptElement);
            scrollToBottom(targetContent);
        }
    },

    // Komut tamamlama için yardımcı fonksiyon
    async getCompletions(input, currentPath) {
        try {
            // FileSystem modülünü import et
            const fileSystemModule = await import('../FileSystem.js');
            const fileSystem = fileSystemModule.fileSystem;
            
            if (!fileSystem) {
                console.error('FileSystem yüklenemedi');
                return [];
            }

            const parts = input.split(' ');
            const lastWord = parts[parts.length - 1];
            const command = parts[0];

            let completions = [];

            // Eğer komut henüz girilmemişse veya tek kelime ise komut listesini göster
            if (parts.length === 1) {
                const availableCommands = [
                    { name: 'help', color: '#2ecc71' },
                    { name: 'clear', color: '#2ecc71' },
                    { name: 'about', color: '#2ecc71' },
                    { name: 'skills', color: '#2ecc71' },
                    { name: 'projects', color: '#2ecc71' },
                    { name: 'contact', color: '#2ecc71' },
                    { name: 'social', color: '#2ecc71' },
                    { name: 'experience', color: '#2ecc71' },
                    { name: 'whoami', color: '#2ecc71' },
                    { name: 'date', color: '#2ecc71' },
                    { name: 'ls', color: '#2ecc71' },
                    { name: 'cd', color: '#2ecc71' },
                    { name: 'matrix', color: '#2ecc71' },
                    { name: 'sudo', color: '#2ecc71' },
                    { name: 'exit', color: '#2ecc71' },
                    { name: 'coffee', color: '#2ecc71' },
                    { name: 'neofetch', color: '#2ecc71' },
                    { name: 'tree', color: '#2ecc71' },
                    { name: 'history', color: '#2ecc71' },
                    { name: 'pwd', color: '#2ecc71' }
                ];

                const commandCompletions = availableCommands
                    .filter(cmd => cmd.name.startsWith(input))
                    .map(cmd => ({ value: cmd.name, color: cmd.color }));
                completions.push(...commandCompletions);
                return completions;
            }

            // Mevcut dizindeki dosya ve klasörleri al
            const dirContents = fileSystem.getDirectoryContents(currentPath);
            if (!dirContents) {
                console.error(`Dizin içeriği alınamadı: ${currentPath}`);
                return [];
            }

            // cd komutu için dizin tamamlama
            if (command === 'cd') {
                // Özel durumlar
                if (lastWord === '~' || lastWord === '') {
                    completions.push({ value: `cd /home/guest`, color: '#3498db' });
                    return completions;
                }

                // ~ ile başlayan yollar için
                if (lastWord.startsWith('~/')) {
                    const subPath = lastWord.substring(2);
                    const homePath = '/home/guest';
                    
                    // Home dizinini kontrol et
                    const homeContents = fileSystem.getDirectoryContents(homePath);
                    if (homeContents) {
                        Object.entries(homeContents)
                            .filter(([name, item]) => 
                                item.type === 'directory' && name.startsWith(subPath))
                            .forEach(([name, item]) => {
                                completions.push({ 
                                    value: `cd ~/${name}`, 
                                    color: '#3498db' 
                                });
                            });
                    }
                    
                    return completions;
                }

                // Mutlak yol için
                if (lastWord.startsWith('/')) {
                    // Yolu bölümlere ayır
                    const pathParts = lastWord.split('/').filter(p => p);
                    const lastPart = pathParts.pop() || '';
                    let checkPath = '/';
                    
                    // Son bölüm hariç yolu oluştur
                    if (pathParts.length > 0) {
                        checkPath = '/' + pathParts.join('/');
                    }
                    
                    const targetContents = fileSystem.getDirectoryContents(checkPath);
                    if (targetContents) {
                        Object.entries(targetContents)
                            .filter(([name, item]) => 
                                item.type === 'directory' && name.startsWith(lastPart))
                            .forEach(([name, item]) => {
                                const newPath = `${checkPath}${checkPath === '/' ? '' : '/'}${name}`;
                                completions.push({ 
                                    value: `cd ${newPath}`, 
                                    color: '#3498db' 
                                });
                            });
                    }
                    
                    return completions;
                }

                // Göreceli yol için mevcut dizindeki klasörleri kontrol et
                Object.entries(dirContents)
                    .filter(([name, item]) => 
                        item.type === 'directory' && name.startsWith(lastWord))
                    .forEach(([name, item]) => {
                        completions.push({ 
                            value: `cd ${name}`, 
                            color: '#3498db' 
                        });
                    });
            } 
            // ls komutu için dosya ve klasör tamamlama
            else if (command === 'ls') {
                // Tüm dosya ve klasörleri göster
                Object.entries(dirContents)
                    .filter(([name]) => name.startsWith(lastWord))
                    .forEach(([name, item]) => {
                        const color = item.type === 'directory' ? '#3498db' : '#ffffff';
                        completions.push({ 
                            value: `ls ${name}`, 
                            color 
                        });
                    });
            }

            return completions;
        } catch (error) {
            console.error('Otomatik tamamlama hatası:', error);
            return [];
        }
    },

    // Komut tamamlamalarını göstermek için yardımcı fonksiyon
    showCompletions(completions, targetContent) {
        if (completions.length === 0) return;

        // Varsa önceki önerileri kaldır
        const existingCompletions = targetContent.querySelector('.terminal-line.completions');
        if (existingCompletions) {
            existingCompletions.remove();
        }

        const output = document.createElement('div');
        output.className = 'terminal-line completions';
        
        if (completions.length === 1) {
            // Tek eşleşme varsa direkt tamamla
            const activeInput = targetContent.querySelector('.terminal-input');
            if (activeInput) {
                activeInput.value = completions[0].value;
                activeInput.style.color = '#f8f8f2';
                const cursor = targetContent.querySelector('.cursor');
                if (cursor) updateCursorPosition(activeInput, cursor);
            }
        } else {
            // Birden fazla eşleşme varsa hepsini göster
            completions.forEach(completion => {
                const span = document.createElement('span');
                span.textContent = completion.value;
                span.style.color = completion.color;
                span.addEventListener('click', () => {
                    const activeInput = targetContent.querySelector('.terminal-input');
                    if (activeInput) {
                        activeInput.value = completion.value;
                        activeInput.focus();
                        const cursor = targetContent.querySelector('.cursor');
                        if (cursor) updateCursorPosition(activeInput, cursor);
                    }
                });
                output.appendChild(span);
            });
            
            const promptElement = targetContent.querySelector('.terminal-prompt');
            targetContent.insertBefore(output, promptElement);
            scrollToBottom(targetContent);
        }
    },

    // Terminal komutları
    commands: {
        'help': (params, targetContent) => help(params, targetContent, addOutput),
        'clear': (params, targetContent) => clear(params, targetContent),
        'about': (params, targetContent) => about(params, targetContent, addOutput),
        'skills': (params, targetContent) => skills(params, targetContent, addOutput),
        'projects': (params, targetContent) => projects(params, targetContent, addOutput),
        'contact': (params, targetContent) => contact(params, targetContent, addOutput),
        'social': (params, targetContent) => social(params, targetContent, addOutput),
        'experience': (params, targetContent) => experience(params, targetContent, addOutput),
        'whoami': (params, targetContent) => whoami(params, targetContent, addOutput),
        'date': (params, targetContent) => date(params, targetContent, addOutput),
        'ls': (params, targetContent, history, path) => ls(params, targetContent, path, { addOutput, updateCursorPosition }),
        'matrix': (params, targetContent) => matrix(params, targetContent, addOutput),
        'sudo': (params, targetContent) => sudo(params, targetContent, addOutput),
        'exit': (params, targetContent) => exit(params, targetContent, addOutput),
        'coffee': (params, targetContent) => coffee(params, targetContent, addOutput),
        'neofetch': (params, targetContent) => neofetch(params, targetContent, addOutput),
        'tree': (params, targetContent) => tree(params, targetContent, addOutput),
        'history': (params, targetContent, history) => history(params, targetContent, history),
        'pwd': (params, targetContent, history, path) => pwd(params, targetContent, history, path),
        'cd': (params, targetContent, history, path, setPath) => cd(params, targetContent, path, setPath, { updateCursorPosition }),
        'setlocale': (params, targetContent) => {
            if (params.length === 0) {
                addOutput(`Mevcut dil: ${i18n.getCurrentLocale()}`, targetContent);
                return;
            }

            const locale = params[0].toLowerCase();
            if (locale === 'tr_tr.utf-8' || locale === 'tr') {
                if (i18n.setLocale('tr')) {
                    addOutput('Dil Türkçe olarak ayarlandı.', targetContent);
                } else {
                    addOutput('Dil değiştirilemedi.', targetContent);
                }
            } else if (locale === 'en_us.utf-8' || locale === 'en') {
                if (i18n.setLocale('en')) {
                    addOutput('Language set to English.', targetContent);
                } else {
                    addOutput('Could not change language.', targetContent);
                }
            } else {
                addOutput(`Desteklenmeyen dil: ${locale}`, targetContent);
            }
        }
    },

    createTerminalContent() {
        const terminalContent = document.createElement('div');
        terminalContent.className = 'terminal-content active';
        
        // Sistem başlangıç mesajı
        const systemStart = document.createElement('div');
        systemStart.className = 'terminal-line';
        systemStart.innerHTML = `[SYSTEM] ${i18n.t('system.starting')}

[OK] ${i18n.t('system.connected')}`;
        
        // Whoami komutu ve çıktısı
        const whoami = document.createElement('div');
        whoami.className = 'terminal-line';
        whoami.innerHTML = `
<span style="color: #50fa7b">guest@hasankonya:~$</span> whoami

${i18n.t('whoami.description')}`;

        // Hello.txt içeriği
        const helloTxt = document.createElement('div');
        helloTxt.className = 'terminal-line';
        helloTxt.innerHTML = `
<span style="color: #50fa7b">guest@hasankonya:~$</span> cat hello.txt

${i18n.t('about.title')}

${i18n.t('about.description')}

  about      -> ${i18n.t('commandDescriptions.about')}
  skills     -> ${i18n.t('commandDescriptions.skills')}
  projects   -> ${i18n.t('commandDescriptions.projects')}
  experience -> ${i18n.t('commandDescriptions.experience')}
  contact    -> ${i18n.t('commandDescriptions.contact')}
  social     -> ${i18n.t('commandDescriptions.social')}

${i18n.t('help.intro')}!`;

        // ASCII banner
        const banner = document.createElement('pre');
        banner.className = 'ascii-banner';
        banner.innerHTML = `
██╗  ██╗ █████╗ ███████╗ █████╗ ███╗   ██╗    ██╗  ██╗ ██████╗ ███╗   ██╗██╗   ██╗ █████╗ 
██║  ██║██╔══██╗██╔════╝██╔══██╗████╗  ██║    ██║ ██╔╝██╔═══██╗████╗  ██║╚██╗ ██╔╝██╔══██╗
███████║███████║███████╗███████║██╔██╗ ██║    █████╔╝ ██║   ██║██╔██╗ ██║ ╚████╔╝ ███████║
██╔══██║██╔══██║╚════██║██╔══██║██║╚██╗██║    ██╔═██╗ ██║   ██║██║╚██╗██║  ╚██╔╝  ██╔══██║
██║  ██║██║  ██║███████║██║  ██║██║ ╚████║    ██║  ██╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝    ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝
`;
        
        // Prompt
        const prompt = document.createElement('div');
        prompt.className = 'terminal-prompt';
        prompt.innerHTML = `
            <span class="prompt">guest@hasankonya:~$</span>
            <div class="input-container">
                <input type="text" class="terminal-input">
                <span class="cursor"></span>
            </div>
        `;
        
        // Tüm elementleri terminalContent'e ekle
        terminalContent.appendChild(systemStart);
        terminalContent.appendChild(whoami);
        terminalContent.appendChild(banner);
        terminalContent.appendChild(helloTxt);
        terminalContent.appendChild(prompt);
        
        return terminalContent;
    },

    setupTerminalEvents(terminal, input, cursor) {
        const tabId = terminal.dataset.tabId;
        const data = this.terminalData.get(tabId);
        
        if (!input || !cursor) return; // Input veya cursor yoksa işlemi sonlandır
        
        // Input container oluştur
        const inputContainer = document.createElement('div');
        inputContainer.className = 'terminal-input-container';
        
        // Input'un parent elementi varsa replace et, yoksa yeni oluştur
        if (input.parentNode) {
            input.parentNode.replaceChild(inputContainer, input);
        }
        inputContainer.appendChild(input);

        // Komut vurgulaması için fonksiyon
        function highlightCommand() {
            const inputValue = input.value;
            
            // Input boş ise veya sadece boşluklardan oluşuyorsa normal renk kullan
            if (!inputValue || inputValue.trim() === '') {
                input.style.color = '#f8f8f2';
                return;
            }
            
            const firstWord = inputValue.split(' ')[0];
            input.style.color = '#f8f8f2';
        }

        // Input olaylarını dinle
        input.addEventListener('input', () => {
            updateCursorPosition(input, cursor);
            highlightCommand();
        });

        input.addEventListener('keydown', (e) => {
            // Backspace veya Delete tuşuna basıldığında
            if (e.key === 'Backspace' || e.key === 'Delete') {
                setTimeout(() => {
                    highlightCommand();
                }, 0);
            }
        });

        // İlk açılışta sekme başlığını, prompt'u ve header'ı güncelle
        const tab = document.querySelector(`.terminal-tab[data-tab-id="${tabId}"]`);
        if (tab) {
            updateTabTitle(tab, data.currentPath);
            updateTerminalHeader(data.currentPath);
            const promptSpan = terminal.querySelector('.prompt');
            if (promptSpan) {
                const shortPath = data.currentPath.replace('/home/guest', '~');
                promptSpan.textContent = `guest@hasankonya:${shortPath}$`;
            }
        }

        // Input olaylarını dinle
        input.addEventListener('input', () => updateCursorPosition(input, cursor));
        input.addEventListener('keyup', () => updateCursorPosition(input, cursor));
        input.addEventListener('click', () => updateCursorPosition(input, cursor));
        input.addEventListener('select', () => updateCursorPosition(input, cursor));

        // Focus olaylarını dinle
        input.addEventListener('focus', () => updateCursorPosition(input, cursor));
        input.addEventListener('blur', () => {
            setTimeout(() => {
                if (document.querySelector('.terminal-instance.active') === terminal) {
                    input.focus();
                }
            }, 10);
        });

        // Klavye olaylarını dinle
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (data.historyIndex < data.commandHistory.length - 1) {
                    data.historyIndex++;
                    input.value = data.commandHistory[data.historyIndex];
                    updateCursorPosition(input, cursor);
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (data.historyIndex >= 0) {
                    data.historyIndex--;
                    input.value = data.historyIndex >= 0 ? data.commandHistory[data.historyIndex] : '';
                    updateCursorPosition(input, cursor);
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                // Async fonksiyonu çağır
                this.getCompletions(input.value, data.currentPath)
                    .then(completions => {
                        const terminalContent = terminal.querySelector('.terminal-content');
                        this.showCompletions(completions, terminalContent);
                    })
                    .catch(error => {
                        console.error('Tab tamamlama hatası:', error);
                    });
            }
        });

        // Enter tuşuna basıldığında
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const inputValue = input.value.trim();
                const terminalContent = terminal.querySelector('.terminal-content');
                
                if (inputValue) {
                    data.commandHistory.unshift(inputValue);
                    data.historyIndex = -1;
                    
                    const shortPath = data.currentPath.replace('/home/guest', '~');
                    addToHistory(`guest@hasankonya:${shortPath}$ ${inputValue}`, terminalContent);
                    
                    const args = inputValue.split(' ');
                    const command = args[0].toLowerCase();
                    const params = args.slice(1);
                    
                    // Input'u temizle
                    input.value = '';
                    input.style.color = '#f8f8f2';
                    
                    if (this.commands[command]) {
                        try {
                            // Yardımcı fonksiyonlar
                            const utils = { 
                                addOutput: (text, target, className = '') => {
                                    const output = document.createElement('div');
                                    output.className = `terminal-line ${className}`;
                                    output.innerHTML = text;
                                    const promptElement = target.querySelector('.terminal-prompt');
                                    target.insertBefore(output, promptElement);
                                },
                                updateCursorPosition
                            };
                            
                            // Komutu çalıştır
                            this.commands[command](
                                params, 
                                terminalContent, 
                                data.commandHistory, 
                                data.currentPath, 
                                (newPath) => {
                                    data.currentPath = newPath;
                                    if (tab) {
                                        updateTabTitle(tab, newPath);
                                        updateTerminalHeader(newPath);
                                        const promptSpan = terminal.querySelector('.prompt');
                                        if (promptSpan) {
                                            const shortPath = newPath.replace('/home/guest', '~');
                                            promptSpan.textContent = `guest@hasankonya:${shortPath}$`;
                                        }
                                    }
                                },
                                utils
                            );
                        } catch (error) {
                            console.error(`Komut çalıştırma hatası (${command}):`, error);
                            addOutput(`Komut çalıştırılırken hata oluştu: ${error.message}`, terminalContent, 'error');
                        }
                    } else {
                        // Komut bulunamadıysa öneri göster
                        this.suggestCommand(inputValue.split(' ')[0].toLowerCase(), terminalContent);
                        addOutput(`${i18n.t('errors.commandNotFound')} ${inputValue}`, terminalContent);
                    }
                }
                
                input.value = '';
                updateCursorPosition(input, cursor);
                scrollToBottom(terminalContent);
            }
        });

        // İlk focus'u ayarla
        setTimeout(() => {
            if (document.querySelector('.terminal-instance.active') === terminal) {
                input.focus();
                updateCursorPosition(input, cursor);
            }
        }, 0);
    },

    async init() {
        // Dosya sistemine erişimi sağla
        window.Terminal = this;
        
        // Terminal verilerini başlat
        this.commandHistory = [];
        this.commands = {
            'help': help,
            'clear': clear,
            'about': about,
            'skills': skills,
            'projects': projects,
            'contact': contact,
            'social': social,
            'experience': experience,
            'whoami': whoami,
            'date': date,
            'ls': ls,
            'cd': cd,
            'pwd': pwd,
            'matrix': matrix,
            'sudo': sudo,
            'exit': exit,
            'coffee': coffee,
            'neofetch': neofetch,
            'tree': tree,
            'history': history
        };
        
        const self = this;

        // İlk sekme için veri oluştur
        const firstTabId = `terminal-${this.tabCounter++}`;
        this.terminalData.set(firstTabId, {
            commandHistory: [],
            historyIndex: -1,
            currentPath: '/home/guest'
        });
        
        // İlk terminal içeriğini oluştur
        const initialTerminalInstance = document.querySelector('.terminal-instance');
        if (initialTerminalInstance) {
            const initialContent = this.createTerminalContent();
            initialTerminalInstance.innerHTML = '';
            initialTerminalInstance.appendChild(initialContent);
        }
        
        const terminalInput = initialTerminalInstance.querySelector('.terminal-input');
        const terminalContent = initialTerminalInstance.querySelector('.terminal-content');
        const terminalPrompt = initialTerminalInstance.querySelector('.terminal-prompt');
        const cursor = initialTerminalInstance.querySelector('.cursor');
        
        // İlk sekmeye ID ata
        const firstTab = document.querySelector('.terminal-tab');
        if (firstTab) {
            firstTab.dataset.tabId = firstTabId;
            updateTabTitle(firstTab, this.terminalData.get(firstTabId).currentPath);
            
            // İlk sekmeye kapatma olayını ekle
            const closeBtn = firstTab.querySelector('.terminal-tab-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const terminalTabs = document.querySelector('.terminal-tabs');
                    const terminalContainer = document.querySelector('.terminal-container');
                    const firstInstance = document.querySelector('.terminal-instance');
                    
                    // En az bir sekme daha varsa kapat
                    if (terminalTabs.children.length > 1) {
                        // Sekme verilerini temizle
                        this.terminalData.delete(firstTabId);
                        
                        // Sekmeyi ve içeriğini kaldır
                        firstTab.remove();
                        firstInstance.remove();
                        
                        // Sonraki sekmeyi aktif yap
                        const nextTab = terminalTabs.children[0];
                        const nextInstance = terminalContainer.children[0];
                        if (nextTab && nextInstance) {
                            nextTab.classList.add('active');
                            nextInstance.classList.add('active');
                            const nextInput = nextInstance.querySelector('.terminal-input');
                            if (nextInput) {
                                nextInput.focus();
                                const nextCursor = nextInstance.querySelector('.cursor');
                                updateCursorPosition(nextInput, nextCursor);
                            }
                        }
                        
                        // Sekme barının görünürlüğünü güncelle
                        updateTabBarVisibility();
                    }
                });
            }
        }
        
        // İlk terminal instance'ı için event listener'ları ayarla
        const firstInstance = document.querySelector('.terminal-instance');
        if (firstInstance) {
            firstInstance.dataset.tabId = firstTabId;
            this.setupTerminalEvents(firstInstance, terminalInput, cursor);
        }
        
        // Terminal inputunu sürekli focuslu tut
        terminalInput.focus();
        
        // Herhangi bir yere tıklandığında focus'u geri getir
        document.addEventListener('click', () => {
            const activeInput = document.querySelector('.terminal-instance.active .terminal-input');
            if (activeInput) activeInput.focus();
        });
        
        // Focus kaybedildiğinde geri getir
        terminalInput.addEventListener('blur', () => {
            setTimeout(() => {
                const activeInput = document.querySelector('.terminal-instance.active .terminal-input');
                if (activeInput) activeInput.focus();
            }, 10);
        });

        // İmleç pozisyonunu güncelle
        function updateCursorPosition(input, cursor) {
            const inputValue = input.value;
            const cursorPosition = input.selectionStart;
            const textBeforeCursor = inputValue.substring(0, cursorPosition);
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = getComputedStyle(input).font;
            const cursorOffset = context.measureText(textBeforeCursor).width;
            cursor.style.left = `${cursorOffset}px`;
        }

        // Input değeri değiştiğinde imleç pozisyonunu güncelle
        terminalInput.addEventListener('input', () => {
            const activeCursor = document.querySelector('.terminal-instance.active .cursor');
            if (activeCursor) updateCursorPosition(terminalInput, activeCursor);
        });
        terminalInput.addEventListener('keyup', () => {
            const activeCursor = document.querySelector('.terminal-instance.active .cursor');
            if (activeCursor) updateCursorPosition(terminalInput, activeCursor);
        });
        terminalInput.addEventListener('click', () => {
            const activeCursor = document.querySelector('.terminal-instance.active .cursor');
            if (activeCursor) updateCursorPosition(terminalInput, activeCursor);
        });
        terminalInput.addEventListener('select', () => {
            const activeCursor = document.querySelector('.terminal-instance.active .cursor');
            if (activeCursor) updateCursorPosition(terminalInput, activeCursor);
        });

        // Metin genişliğini hesapla
        function getTextWidth(text) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = getComputedStyle(terminalInput).font;
            return context.measureText(text).width;
        }
        
        // Eski terminal giriş olayını kaldır
        terminalInput.removeEventListener('keypress', () => {});

        function addToHistory(text, targetContent = terminalContent) {
            const historyLine = document.createElement('div');
            historyLine.className = 'terminal-line history';
            const [prompt, command] = text.split('$ ');
            historyLine.innerHTML = `<span style="color: #50fa7b">${prompt}$</span> ${command}`;
            const promptElement = targetContent.querySelector('.terminal-prompt');
            targetContent.insertBefore(historyLine, promptElement);
        }

        // Sekme barının görünürlüğünü kontrol eden fonksiyon
        function updateTabBarVisibility() {
            const terminalTabs = document.querySelector('.terminal-tabs');
            const tabCount = terminalTabs.children.length;
            
            if (tabCount > 1) {
                terminalTabs.classList.add('show');
            } else {
                terminalTabs.classList.remove('show');
            }
        }

        // Sekme başlığını güncelleme fonksiyonu
        function updateTabTitle(tab, path) {
            const shortPath = path.replace('/home/guest', '~');
            tab.innerHTML = `guest@hasankonya:${shortPath}$ <i class="fas fa-times terminal-tab-close"></i>`;
        }

        // Terminal header'ını güncelleme fonksiyonu
        function updateTerminalHeader(path) {
            const terminalTitle = document.querySelector('.terminal-title');
            if (terminalTitle) {
                const shortPath = path.replace('/home/guest', '~');
                terminalTitle.textContent = `guest@hasankonya:${shortPath}`;
            }
        }

        // Yeni sekme oluşturma fonksiyonunu güncelle
        document.querySelector('.new-tab-btn').addEventListener('click', () => {
            const tabId = `terminal-${this.tabCounter++}`;
            
            // Yeni sekme için veri oluştur
            this.terminalData.set(tabId, {
                commandHistory: [],
                historyIndex: -1,
                currentPath: '/home/guest'
            });

            const terminalTabs = document.querySelector('.terminal-tabs');
            const terminalContainer = document.querySelector('.terminal-container');
            
            // Mevcut tüm sekme ve içerikleri pasif yap
            document.querySelectorAll('.terminal-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.terminal-instance').forEach(instance => instance.classList.remove('active'));
            
            // Yeni sekme oluştur
            const newTab = document.createElement('div');
            newTab.className = 'terminal-tab active';
            newTab.dataset.tabId = tabId;
            updateTabTitle(newTab, this.terminalData.get(tabId).currentPath);
            
            // Yeni terminal içeriği oluştur
            const newTerminal = document.createElement('div');
            newTerminal.className = 'terminal-instance active';
            newTerminal.dataset.tabId = tabId;
            
            // Terminal içeriğini oluştur
            const terminalContent = document.createElement('div');
            terminalContent.className = 'terminal-content';
            
            // ASCII banner ve başlangıç mesajlarını ekle
            const banner = document.querySelector('.ascii-banner');
            const description = document.querySelector('.terminal-description');
            const navigation = document.querySelector('.terminal-navigation');
            const instructions = document.querySelector('.terminal-instructions');
            
            if (banner) terminalContent.appendChild(banner.cloneNode(true));
            if (description) terminalContent.appendChild(description.cloneNode(true));
            if (navigation) terminalContent.appendChild(navigation.cloneNode(true));
            if (instructions) terminalContent.appendChild(instructions.cloneNode(true));
            
            // Prompt'u ekle
            const prompt = document.createElement('div');
            prompt.className = 'terminal-prompt';
            prompt.innerHTML = `
                <span class="prompt">guest@hasankonya:~$</span>
                <div class="input-container">
                    <input type="text" class="terminal-input">
                    <span class="cursor"></span>
                </div>
            `;
            terminalContent.appendChild(prompt);
            
            newTerminal.appendChild(terminalContent);
            
            // Mevcut tüm sekme ve içerikleri pasif yap
            document.querySelectorAll('.terminal-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.terminal-instance').forEach(instance => instance.classList.remove('active'));
            
            // Yeni sekme ve içeriği ekle
            terminalTabs.appendChild(newTab);
            terminalContainer.appendChild(newTerminal);
            
            // Sekme barının görünürlüğünü güncelle
            updateTabBarVisibility();
            
            // Yeni terminal için event listener'ları ayarla
            const newInput = newTerminal.querySelector('.terminal-input');
            const newCursor = newTerminal.querySelector('.cursor');
            
            // Event'leri ayarla ve input'u focusla
            this.setupTerminalEvents(newTerminal, newInput, newCursor);
            
            // Sekme kapatma olayını ekle
            const closeBtn = newTab.querySelector('.terminal-tab-close');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = Array.from(terminalTabs.children).indexOf(newTab);
                
                // Sekme verilerini temizle
                this.terminalData.delete(tabId);
                
                newTab.remove();
                newTerminal.remove();
                
                // Eğer kapatılan sekme aktifse, önceki sekmeyi aktif yap
                if (newTab.classList.contains('active')) {
                    const prevTab = terminalTabs.children[Math.max(0, index - 1)];
                    const prevInstance = terminalContainer.children[Math.max(0, index - 1)];
                    if (prevTab && prevInstance) {
                        prevTab.classList.add('active');
                        prevInstance.classList.add('active');
                        const prevInput = prevInstance.querySelector('.terminal-input');
                        if (prevInput) {
                            prevInput.focus();
                            const prevCursor = prevInstance.querySelector('.cursor');
                            updateCursorPosition(prevInput, prevCursor);
                        }
                    }
                }
                
                // Sekme barının görünürlüğünü güncelle
                updateTabBarVisibility();
            });
            
            // Sekmeye tıklama olayını ekle
            newTab.addEventListener('click', () => {
                document.querySelectorAll('.terminal-tab').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.terminal-instance').forEach(instance => instance.classList.remove('active'));
                newTab.classList.add('active');
                newTerminal.classList.add('active');
                newInput.focus();
                updateCursorPosition(newInput, newCursor);
            });
        });

        // Mevcut sekmelere tıklama olayı ekle
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('.terminal-tab');
            if (tab) {
                const index = Array.from(tab.parentElement.children).indexOf(tab);
                const terminalContainer = document.querySelector('.terminal-container');
                const instance = terminalContainer.children[index];
                
                if (instance) {
                    // Tüm sekme ve içerikleri pasif yap
                    document.querySelectorAll('.terminal-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.terminal-instance').forEach(i => i.classList.remove('active'));
                    
                    // Seçilen sekme ve içeriği aktif yap
                    tab.classList.add('active');
                    instance.classList.add('active');

                    // Terminal header'ını güncelle
                    const tabId = tab.dataset.tabId;
                    const data = this.terminalData.get(tabId);
                    if (data) {
                        updateTerminalHeader(data.currentPath);
                    }
                    
                    // Input'u focusla ve cursor'ı güncelle
                    const input = instance.querySelector('.terminal-input');
                    const cursor = instance.querySelector('.cursor');
                    input.focus();
                    updateCursorPosition(input, cursor);
                }
            }
        });
    }
};