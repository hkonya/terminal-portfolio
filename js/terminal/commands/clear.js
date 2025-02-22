export function clear(params, targetContent) {
    const prompt = targetContent.querySelector('.terminal-prompt');
    const banner = document.querySelector('.ascii-banner');
    const description = document.querySelector('.terminal-description');
    const navigation = document.querySelector('.terminal-navigation');
    const instructions = document.querySelector('.terminal-instructions');

    // Tüm terminal içeriğini temizle
    targetContent.innerHTML = '';

    // Başlangıç mesajlarını geri ekle
    if (banner) targetContent.appendChild(banner.cloneNode(true));
    if (description) targetContent.appendChild(description.cloneNode(true));
    if (navigation) targetContent.appendChild(navigation.cloneNode(true));
    if (instructions) targetContent.appendChild(instructions.cloneNode(true));

    // Prompt'u geri ekle
    targetContent.appendChild(prompt);
} 