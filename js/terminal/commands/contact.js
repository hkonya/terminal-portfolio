import { i18n } from '../../i18n.js';

export function contact(params, targetContent, addOutput) {
    const contactText = `
<span class="highlight">${i18n.t('contact.title')}</span>

📧 Email: <a href="mailto:hsnkny43@gmail.com">hsnkny43@gmail.com</a>  
🌐 Website: <a href="https://hkonya.me" target="_blank">hkonya.me</a>  
📱 LinkedIn: <a href="https://linkedin.com/in/hasankny" target="_blank">linkedin.com/in/hasankny</a>  

<span class="command">social</span> ${i18n.t('contact.socialCommand')}
`;
    addOutput(contactText, targetContent);
}
