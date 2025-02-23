import { tr } from '../locales/tr.js';
import { en } from '../locales/en.js';

export const i18n = {
    currentLocale: 'tr',
    translations: {
        tr: {
            ...tr,
            dialog: {
                folderName: 'Klasör adı',
                fileName: 'Dosya adı',
                newFolder: 'Yeni Klasör',
                newTextFile: 'Yeni Metin Belgesi.txt',
                ok: 'Tamam',
                cancel: 'İptal'
            }
        },
        en: {
            ...en,
            dialog: {
                folderName: 'Folder name',
                fileName: 'File name',
                newFolder: 'New Folder',
                newTextFile: 'New Text Document.txt',
                ok: 'OK',
                cancel: 'Cancel'
            }
        }
    },
    getCurrentLocale() {
        return this.currentLocale;
    },
    setLocale(locale) {
        if (this.translations[locale]) {
            this.currentLocale = locale;
        }
    },
    t(key) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLocale];
        
        for (const k of keys) {
            translation = translation[k];
            if (!translation) break;
        }
        
        return translation || key;
    },
    updatePageContent() {
        // Üst bar güncellemeleri
        document.querySelector('.top-bar-left span').textContent = this.t('topBar.title');
        
        // Bildirim metni güncelleme
        const notificationText = document.querySelector('.notification-text');
        if (notificationText) {
            notificationText.textContent = this.t('topBar.notifications.none');
        }

        // Ayarlar menüsü güncellemeleri
        const volumeText = document.querySelector('.system-volume-slider');
        if (volumeText) {
            const volumeLabel = volumeText.querySelector('label');
            if (volumeLabel) {
                volumeLabel.textContent = this.t('settings.volume');
            }
        }

        // Sistem butonları güncellemeleri
        this.updateSystemButtons();

        // Terminal içeriği güncellemeleri
        this.updateTerminalContent();

        // Popup içeriklerini güncelle
        this.updatePopups();

        // Tarih formatını güncelle
        this.updateDateTime();
    },
    updateSystemButtons() {
        const systemButtons = document.querySelectorAll('.system-button');
        systemButtons.forEach(button => {
            const buttonText = button.textContent.trim().split(' ')[0];
            switch(buttonText) {
                case 'Wireless':
                case 'Kablosuz':
                    button.innerHTML = `<i class="fas fa-wifi"></i>${this.t('settings.wireless')}`;
                    break;
                case 'Battery':
                case 'Pil':
                    const percentage = button.textContent.match(/\d+%/)[0];
                    button.innerHTML = `<i class="fas fa-battery-full"></i>${this.t('settings.battery')} ${percentage}`;
                    break;
                case 'Dark':
                case 'Koyu':
                    button.innerHTML = `<i class="fas fa-moon"></i>${this.t('settings.darkMode')}`;
                    break;
                case 'Lock':
                case 'Kilitle':
                    button.innerHTML = `<i class="fas fa-lock"></i>${this.t('settings.lock')}`;
                    break;
            }
        });
    },
    updateTerminalContent() {
        const terminalContent = document.querySelector('.terminal-content');
        if (terminalContent) {
            // Hoş geldiniz mesajı güncelleme
            const welcomeMessage = terminalContent.querySelector('.terminal-description');
            if (welcomeMessage) {
                welcomeMessage.textContent = this.t('system.welcome');
            }

            // Komut açıklamalarını güncelle
            const commandItems = terminalContent.querySelectorAll('.commands p');
            commandItems.forEach(item => {
                const commandSpan = item.querySelector('.command');
                if (commandSpan) {
                    const command = commandSpan.textContent.trim();
                    const description = this.t(`commandDescriptions.${command}`);
                    item.innerHTML = item.innerHTML.replace(/]:(.*?)$/, `]: ${description}`);
                }
            });
        }
    },
    updatePopups() {
        // Datetime popup güncelleme
        const datetimePopup = document.querySelector('.datetime-popup');
        if (datetimePopup) {
            // Bildirim alanı güncelleme
            const notificationText = datetimePopup.querySelector('.notification-text');
            if (notificationText) {
                notificationText.textContent = this.t('topBar.notifications.none');
            }

            // Gün ve ay isimleri güncelleme
            const dayElement = datetimePopup.querySelector('.day');
            const dateElement = datetimePopup.querySelector('.date');
            if (dayElement && dateElement) {
                const now = new Date();
                const day = this.t('days')[now.getDay()];
                const month = this.t('months')[now.getMonth()];
                dayElement.textContent = day;
                dateElement.textContent = `${now.getDate()} ${month} ${now.getFullYear()}`;
            }

            // Takvim başlıkları güncelleme
            const calendarHeader = datetimePopup.querySelector('.calendar-header');
            if (calendarHeader) {
                const shortDays = this.t('shortDays');
                Array.from(calendarHeader.children).forEach((div, index) => {
                    div.textContent = shortDays[index];
                });
            }

            // Ay navigasyonu güncelleme
            const currentMonth = datetimePopup.querySelector('.current-month');
            if (currentMonth) {
                const [month, year] = currentMonth.textContent.split(' ');
                const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
                currentMonth.textContent = `${this.t('months')[monthIndex]} ${year}`;
            }
        }

        // System popup güncelleme
        const systemPopup = document.querySelector('.system-popup');
        if (systemPopup) {
            // Ses ayarı etiketi
            const volumeSlider = systemPopup.querySelector('.system-volume-slider');
            if (volumeSlider) {
                const label = volumeSlider.querySelector('label');
                if (label) {
                    label.textContent = this.t('settings.volume');
                }
            }

            // Sistem butonları
            const buttons = systemPopup.querySelectorAll('.system-button');
            buttons.forEach(button => {
                const buttonText = button.textContent.trim().split(' ')[0];
                switch(buttonText) {
                    case 'Wireless':
                    case 'Kablosuz':
                        button.innerHTML = `<i class="fas fa-wifi"></i>${this.t('settings.wireless')}`;
                        break;
                    case 'Battery':
                    case 'Pil':
                        const percentage = button.textContent.match(/\d+%/)[0];
                        button.innerHTML = `<i class="fas fa-battery-full"></i>${this.t('settings.battery')} ${percentage}`;
                        break;
                    case 'Dark':
                    case 'Koyu':
                        button.innerHTML = `<i class="fas fa-moon"></i>${this.t('settings.darkMode')}`;
                        break;
                    case 'Lock':
                    case 'Kilitle':
                        button.innerHTML = `<i class="fas fa-lock"></i>${this.t('settings.lock')}`;
                        break;
                }
            });
        }
    },
    updateDateTime() {
        const dateTimeElement = document.querySelector('.top-bar-center');
        if (dateTimeElement) {
            const now = new Date();
            const options = { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
            };
            dateTimeElement.textContent = now.toLocaleString(this.currentLocale === 'tr' ? 'tr-TR' : 'en-US', options);
        }
    }
}; 