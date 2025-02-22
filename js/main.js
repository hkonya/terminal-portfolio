import { i18n } from './i18n.js';
import { Terminal } from './terminal/terminal.js';
import { updateTabTitle, updateCursorPosition } from './terminal/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Terminal'i başlat
    Terminal.init();
    
    // Saat ve tarih güncelleme fonksiyonu
    function updateDateTime() {
        const now = new Date();
        const options = { 
            day: 'numeric', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false
        };
        const dateTimeStr = now.toLocaleString(i18n.getCurrentLocale() === 'tr' ? 'tr-TR' : 'en-US', options);
        const terminalCenter = document.querySelector('.top-bar-center');
        if (terminalCenter) {
            terminalCenter.textContent = dateTimeStr;
            terminalCenter.style.cursor = 'pointer';
        }
    }

    // Config yönetimi için fonksiyonlar
    function getConfig() {
        const defaultConfig = {
            volume: 75,
            darkTheme: false
        };
        
        const storedConfig = localStorage.getItem('config');
        return storedConfig ? JSON.parse(storedConfig) : defaultConfig;
    }

    function updateConfig(updates) {
        const currentConfig = getConfig();
        const newConfig = { ...currentConfig, ...updates };
        localStorage.setItem('config', JSON.stringify(newConfig));
        return newConfig;
    }

    // Ses seviyesini güncelleme fonksiyonu
    function updateVolumeIcon(value) {
        const headerVolumeIcon = document.querySelector('.top-bar-right i:nth-child(2)');
        if (headerVolumeIcon) {
            if (value === 0) {
                headerVolumeIcon.className = 'fas fa-volume-mute';
            } else if (value <= 25) {
                headerVolumeIcon.className = 'fas fa-volume-off';
            } else if (value <= 50) {
                headerVolumeIcon.className = 'fas fa-volume-down';
            } else {
                headerVolumeIcon.className = 'fas fa-volume-up';
            }
        }
        
        // Config'i güncelle
        updateConfig({ volume: value });
    }

    // Tema değiştirme fonksiyonu
    function toggleDarkTheme(isDark) {
        // Config'i güncelle
        updateConfig({ darkTheme: isDark });

        // Body arka plan resmini güncelle
        document.body.style.backgroundImage = isDark ? "url(./img/bg_dark.png)" : "url(./img/bg.png)";

        // Mevcut popup'ları güncelle
        const existingPopups = document.querySelectorAll('.system-popup, .datetime-popup');
        existingPopups.forEach(popup => {
            popup.style.backgroundColor = isDark ? '#202020' : '#fafbfa';
            popup.style.color = isDark ? '#fafbfa' : '#202020';

            // Slider'ın arka plan rengini güncelle
            const volumeSlider = popup.querySelector('.system-volume-slider input[type="range"]');
            if (volumeSlider) {
                const value = volumeSlider.value;
                const percentage = value + '%';
                volumeSlider.style.background = `linear-gradient(to right, #d13d01 ${percentage}, ${isDark ? '#393839' : '#e6e7e6'} ${percentage})`;
            }

            // Butonların renklerini güncelle
            const buttons = popup.querySelectorAll('.system-button');
            buttons.forEach(button => {
                const isActive = button.classList.contains('active');
                if (isActive && !button.textContent.trim().includes('Kablosuz')) {
                    button.style.backgroundColor = '#d13d01';
                    button.style.color = '#fafbfa';
                } else if (!isActive) {
                    button.style.backgroundColor = isDark ? '#393839' : '#e6e7e6';
                    button.style.color = isDark ? '#fafbfa' : '#202020';
                }
            });

            // İkonların renklerini güncelle
            const icons = popup.querySelectorAll('.system-button i, .system-volume-slider i');
            icons.forEach(icon => {
                if (!icon.closest('.system-button.active')) {
                    icon.style.color = isDark ? '#fafbfa' : '#202020';
                }
            });
        });
    }

    // Sayfa yüklendiğinde config'den ayarları uygula
    const config = getConfig();
    updateVolumeIcon(config.volume);
    if (config.darkTheme) {
        document.body.style.backgroundImage = "url(./img/bg_dark.png)";
        toggleDarkTheme(true);
    } else {
        document.body.style.backgroundImage = "url(./img/bg.png)";
    }

    // Popup oluşturma ve gösterme fonksiyonu
    function showDateTimePopup(e) {
        // Varsa eski popup'ı kaldır
        const oldPopup = document.querySelector('.datetime-popup');
        if (oldPopup) oldPopup.remove();

        const popup = document.createElement('div');
        popup.className = 'datetime-popup';
        const currentTheme = getConfig().darkTheme;
        popup.style.backgroundColor = currentTheme ? '#202020' : '#fafbfa';
        popup.style.color = currentTheme ? '#fafbfa' : '#202020';

        // Sol taraf - Bildirim alanı
        const leftSide = document.createElement('div');
        leftSide.className = 'datetime-popup-left';
        
        // Bildirim ikonu
        const notificationIcon = document.createElement('div');
        notificationIcon.className = 'notification-icon';
        notificationIcon.innerHTML = '<i class="fas fa-bell"></i>';
        
        // Bildirim metni
        const notificationText = document.createElement('div');
        notificationText.className = 'notification-text';
        notificationText.textContent = i18n.t('topBar.notifications.none');
        
        leftSide.appendChild(notificationIcon);
        leftSide.appendChild(notificationText);

        // Sağ taraf - Takvim
        const rightSide = document.createElement('div');
        rightSide.className = 'datetime-popup-right';

        // Takvim başlığı
        const now = new Date();
        const header = document.createElement('div');
        header.className = 'datetime-popup-header';
        header.innerHTML = `
            <div class="day">${now.toLocaleDateString(i18n.t('topBar.dateFormat'), { weekday: 'long' })}</div>
            <div class="date">${now.getDate()} ${i18n.t('months')[now.getMonth()]} ${now.getFullYear()}</div>
        `;
        rightSide.appendChild(header);

        // Ay navigasyonu
        const monthNav = document.createElement('div');
        monthNav.className = 'month-navigation';
        monthNav.innerHTML = `
            <button class="prev-month"><i class="fas fa-chevron-left"></i></button>
            <span class="current-month">${i18n.t('months')[now.getMonth()]} ${now.getFullYear()}</span>
            <button class="next-month"><i class="fas fa-chevron-right"></i></button>
        `;
        rightSide.appendChild(monthNav);

        // Takvim başlıkları
        const calendarHeader = document.createElement('div');
        calendarHeader.className = 'calendar-header';
        i18n.t('shortDays').forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.textContent = day;
            calendarHeader.appendChild(dayEl);
        });
        rightSide.appendChild(calendarHeader);

        // Takvim günleri
        const calendar = document.createElement('div');
        calendar.className = 'calendar-grid';

        function updateCalendar(year, month) {
            calendar.innerHTML = '';
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            
            // Önceki ayın günlerini ekle
            const prevMonthDays = firstDay === 0 ? 6 : firstDay - 1;
            for (let i = prevMonthDays - 1; i >= 0; i--) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day other-month';
                dayEl.textContent = daysInPrevMonth - i;
                calendar.appendChild(dayEl);
            }
            
            // Bu ayın günlerini ekle
            for (let i = 1; i <= daysInMonth; i++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day';
                dayEl.textContent = i;
                
                // Bugünün tarihini kontrol et
                if (i === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
                    dayEl.classList.add('today');
                }
                
                // Seçili günü kontrol et
                if (i === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
                    dayEl.classList.add('active');
                }
                
                calendar.appendChild(dayEl);
            }
            
            // Sonraki ayın günlerini ekle
            const totalDays = calendar.children.length;
            let nextMonthDay = 1;
            while (totalDays + nextMonthDay <= 42) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day other-month';
                dayEl.textContent = nextMonthDay++;
                calendar.appendChild(dayEl);
            }
        }

        rightSide.appendChild(calendar);

        // Sol ve sağ tarafları popup'a ekle
        popup.appendChild(leftSide);
        popup.appendChild(rightSide);

        // Popup'ı konumlandır
        const rect = e.target.getBoundingClientRect();
        popup.style.position = 'fixed';
        popup.style.top = rect.bottom + 10 + 'px';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.zIndex = '1000';
        popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        popup.style.borderRadius = '8px';

        document.body.appendChild(popup);

        // İlk takvimi göster
        updateCalendar(now.getFullYear(), now.getMonth());

        // Popup dışına tıklandığında kapat
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target) && e.target !== document.querySelector('.top-bar-center')) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });

        // Ay navigasyon butonlarına tıklama olayları
        const prevMonthBtn = popup.querySelector('.prev-month');
        const nextMonthBtn = popup.querySelector('.next-month');
        const currentMonthSpan = popup.querySelector('.current-month');

        let displayedMonth = now.getMonth();
        let displayedYear = now.getFullYear();

        prevMonthBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            displayedMonth--;
            if (displayedMonth < 0) {
                displayedMonth = 11;
                displayedYear--;
            }
            currentMonthSpan.textContent = `${i18n.t('months')[displayedMonth]} ${displayedYear}`;
            updateCalendar(displayedYear, displayedMonth);
        });

        nextMonthBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            displayedMonth++;
            if (displayedMonth > 11) {
                displayedMonth = 0;
                displayedYear++;
            }
            currentMonthSpan.textContent = `${i18n.t('months')[displayedMonth]} ${displayedYear}`;
            updateCalendar(displayedYear, displayedMonth);
        });

        // Tema kontrolü
        if (currentTheme) {
            popup.style.backgroundColor = '#202020';
        }
    }

    // Üst bar ikonları için popup fonksiyonu
    function showSystemPopup(e) {
        // Varsa eski popup'ı kaldır
        const oldPopup = document.querySelector('.system-popup');
        if (oldPopup) oldPopup.remove();

        const popup = document.createElement('div');
        popup.className = 'system-popup';

        // Tema kontrolü ve config değerlerini al
        const config = getConfig();
        const currentTheme = config.darkTheme;
        if (currentTheme) {
            popup.style.backgroundColor = '#202020';
            popup.style.color = '#fafbfa';
        }

        popup.innerHTML = `
            <div class="system-volume-slider">
                <i class="fas fa-volume-up"></i>
                <input type="range" min="0" max="100" value="${config.volume}">
            </div>
            <div class="system-buttons">
                <button class="system-button active" style="background-color: #d13d01; color: #fafbfa;">
                    <i class="fas fa-wifi" style="color: #fafbfa;"></i>
                    ${i18n.t('settings.wireless')}
                </button>
                <button class="system-button">
                    <i class="fas fa-battery-full"></i>
                    ${i18n.t('settings.battery')} 100%
                </button>
                <button class="system-button ${currentTheme ? 'active' : ''}">
                    <i class="fas fa-moon"></i>
                    ${i18n.t('settings.darkMode')}
                </button>
                <button class="system-button">
                    <i class="fas fa-lock"></i>
                    ${i18n.t('settings.lock')}
                </button>
            </div>
        `;

        // Popup'ı konumlandır
        const rect = e.target.getBoundingClientRect();
        popup.style.top = rect.bottom + 10 + 'px';
        popup.style.right = '10px';

        document.body.appendChild(popup);

        // Ses ayarı için event listener
        const volumeSlider = popup.querySelector('input[type="range"]');
        const volumeIcon = popup.querySelector('.system-volume-slider i');
        
        volumeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            
            // Popup içindeki ikonu güncelle
            if (value === 0) {
                volumeIcon.className = 'fas fa-volume-mute';
            } else if (value <= 25) {
                volumeIcon.className = 'fas fa-volume-off';
            } else if (value <= 50) {
                volumeIcon.className = 'fas fa-volume-down';
            } else if (value <= 75) {
                volumeIcon.className = 'fas fa-volume-up';
            } else {
                volumeIcon.className = 'fas fa-volume-up';
                volumeIcon.style.color = '#d13d01';
            }
            
            // Header'daki ses ikonunu ve config'i güncelle
            updateVolumeIcon(value);
            
            // Slider rengi ayarla
            const percentage = value + '%';
            volumeSlider.style.background = `linear-gradient(to right, #d13d01 ${percentage}, ${currentTheme ? '#393839' : '#e6e7e6'} ${percentage})`;
        });

        // Butonlara tıklama olayları ekle
        const buttons = popup.querySelectorAll('.system-button');
        buttons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const icon = button.querySelector('i');
                const buttonText = button.textContent.trim();

                // Kablosuz butonu için
                if (buttonText.includes(i18n.t('settings.wireless'))) {
                    button.classList.toggle('active');
                    if (button.classList.contains('active')) {
                        button.style.backgroundColor = '#d13d01';
                        button.style.color = '#fafbfa';
                        icon.style.color = '#fafbfa';
                    } else {
                        button.style.backgroundColor = currentTheme ? '#393839' : '#e6e7e6';
                        button.style.color = currentTheme ? '#fafbfa' : '#202020';
                        icon.style.color = currentTheme ? '#fafbfa' : '#202020';
                    }
                }
                // Koyu mod butonu için
                else if (buttonText.includes(i18n.t('settings.darkMode'))) {
                    button.classList.toggle('active');
                    const newTheme = button.classList.contains('active');
                    toggleDarkTheme(newTheme);
                    
                    if (button.classList.contains('active')) {
                        button.style.backgroundColor = '#d13d01';
                        button.style.color = '#fafbfa';
                        icon.style.color = '#fafbfa';
                    } else {
                        button.style.backgroundColor = currentTheme ? '#393839' : '#e6e7e6';
                        button.style.color = currentTheme ? '#fafbfa' : '#202020';
                        icon.style.color = currentTheme ? '#fafbfa' : '#202020';
                    }
                }
                // Kilitle butonu için
                else if (buttonText.includes(i18n.t('settings.lock'))) {
                    document.body.style.opacity = '0.5';
                    setTimeout(() => {
                        document.body.style.opacity = '1';
                    }, 500);
                }
            });

            // Başlangıç durumunda aktif butonların stillerini ayarla
            if (button.classList.contains('active')) {
                button.style.backgroundColor = '#d13d01';
                button.style.color = '#fafbfa';
                const icon = button.querySelector('i');
                if (icon) icon.style.color = '#fafbfa';
            } else {
                button.style.backgroundColor = currentTheme ? '#393839' : '#e6e7e6';
                button.style.color = currentTheme ? '#fafbfa' : '#202020';
                const icon = button.querySelector('i');
                if (icon) icon.style.color = currentTheme ? '#fafbfa' : '#202020';
            }
        });

        // Popup dışına tıklandığında kapat
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target) && !e.target.closest('.top-bar-right i')) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });

        // Başlangıç slider değerini ayarla
        volumeSlider.dispatchEvent(new Event('input'));
    }

    // Üst bar ikonlarına tıklama olayları ekle
    const topBarIcons = document.querySelectorAll('.top-bar-right i');
    topBarIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            showSystemPopup(e);
        });
    });

    // Saat ve tarih güncelleme işlemini başlat
    updateDateTime();
    setInterval(updateDateTime, 1000); // Her saniye güncelle

    // Header'a tıklama olayı ekle
    const terminalCenter = document.querySelector('.top-bar-center');
    if (terminalCenter) {
        terminalCenter.addEventListener('click', showDateTimePopup);
    }

    // Terminal kontrollerini ayarla
    const minimizeBtn = document.querySelector('.header-button.minimize');
    const fullscreenBtn = document.querySelector('.header-button.fullscreen');
    const closeBtn = document.querySelector('.header-button.close');
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            const terminal = document.querySelector('.terminal');
            const terminalIcon = document.querySelector('.app-icon.active');
            
            // Terminal'i minimize et
            terminal.classList.add('minimized');
            
            // Active sınıfını kaldır ve minimized ekle
            terminalIcon.classList.remove('active');
            terminalIcon.classList.add('minimized');
            
            // Notification dot ekle
            let notificationDot = terminalIcon.querySelector('.notification-dot');
            if (!notificationDot) {
                notificationDot = document.createElement('div');
                notificationDot.className = 'notification-dot';
                terminalIcon.appendChild(notificationDot);
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const terminal = document.querySelector('.terminal');
            const terminalIcon = document.querySelector('.app-icon.active');
            const terminalTabs = document.querySelector('.terminal-tabs');
            const terminalInstances = document.querySelectorAll('.terminal-instance');
            
            // Terminal'i gizle
            terminal.style.display = 'none';
            
            // Active sınıfını kaldır
            terminalIcon.classList.remove('active');
            
            // Tüm sekmeleri ve verilerini temizle
            terminalTabs.innerHTML = '';
            Terminal.terminalData.clear();
            
            // Terminal içeriğini temizle
            terminalInstances.forEach(instance => instance.remove());
            
            // Notification dot ekle
            let notificationDot = terminalIcon.querySelector('.notification-dot');
            if (!notificationDot) {
                notificationDot = document.createElement('div');
                notificationDot.className = 'notification-dot';
                terminalIcon.appendChild(notificationDot);
            }
        });
    }

    // Tam ekran kontrolü
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const terminal = document.querySelector('.terminal');
            const icon = fullscreenBtn.querySelector('i');

            if (!terminal.classList.contains('fullscreen')) {
                // Tam ekrana geç
                terminal.classList.add('fullscreen');
                icon.className = 'far fa-compress-arrows-alt';
            } else {
                // Tam ekrandan çık
                terminal.classList.remove('fullscreen');
                icon.className = 'far fa-square';
            }
        });
    }

    // Terminal ikonuna tıklama olayı ekle
    const terminalIcon = document.querySelector('.app-icon');
    if (terminalIcon) {
        // İlk yüklemede notification dot'u ekle
        let notificationDot = document.createElement('div');
        notificationDot.className = 'notification-dot';
        terminalIcon.appendChild(notificationDot);

        terminalIcon.addEventListener('click', () => {
            const terminal = document.querySelector('.terminal');
            
            if (terminalIcon.classList.contains('minimized')) {
                // Terminal'i geri getir
                terminal.classList.remove('minimized');
                terminal.style.display = 'flex';
                
                // Terminal ikonunun minimized sınıfını kaldır ve active ekle
                terminalIcon.classList.remove('minimized');
                terminalIcon.classList.add('active');
                
                // Input'u focusla
                const activeInput = document.querySelector('.terminal-instance.active .terminal-input');
                if (activeInput) activeInput.focus();
            } else if (!terminalIcon.classList.contains('active')) {
                // Terminal kapalıysa yeni bir terminal başlat
                terminal.classList.remove('minimized');
                terminal.style.display = 'flex';
                terminalIcon.classList.add('active');
                
                // Notification dot'u kaldır
                const notificationDot = terminalIcon.querySelector('.notification-dot');
                if (notificationDot) {
                    notificationDot.remove();
                }
                
                // Yeni bir sekme oluştur
                const tabId = `terminal-${Terminal.tabCounter++}`;
                Terminal.terminalData.set(tabId, {
                    commandHistory: [],
                    historyIndex: -1,
                    currentPath: '/home/guest/portfolio'
                });
                
                const terminalTabs = document.querySelector('.terminal-tabs');
                const terminalContainer = document.querySelector('.terminal-container');
                
                // Yeni sekme oluştur
                const newTab = document.createElement('div');
                newTab.className = 'terminal-tab active';
                newTab.dataset.tabId = tabId;
                updateTabTitle(newTab, Terminal.terminalData.get(tabId).currentPath);
                
                // Yeni terminal instance oluştur
                const newTerminal = document.createElement('div');
                newTerminal.className = 'terminal-instance active';
                newTerminal.dataset.tabId = tabId;
                
                // Terminal içeriğini oluştur
                const terminalContent = Terminal.createTerminalContent();
                newTerminal.appendChild(terminalContent);
                
                // Yeni sekme ve içeriği ekle
                terminalTabs.appendChild(newTab);
                terminalContainer.appendChild(newTerminal);
                
                // Event listener'ları ayarla
                const newInput = newTerminal.querySelector('.terminal-input');
                const newCursor = newTerminal.querySelector('.cursor');
                Terminal.setupTerminalEvents(newTerminal, newInput, newCursor);
                
                // Input'u focusla
                if (newInput) {
                    newInput.focus();
                    updateCursorPosition(newInput, newCursor);
                }
            }
        });
    }

    // Terminal sürükleme işlevselliği
    const terminal = document.querySelector('.terminal');
    const terminalHeader = document.querySelector('.terminal-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    terminalHeader.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (!terminal.classList.contains('fullscreen') && e.target.closest('.terminal-header')) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, terminal);
        }
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
});
