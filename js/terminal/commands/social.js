import { i18n } from '../../i18n.js';

export function social(params, targetContent, commandHistory, currentPath, setPath, utils) {
    const socialText = `
<span class="highlight">${i18n.t('social.title')}</span>

• GitHub: <a href="https://github.com/hkonya" target="_blank">github.com/hkonya</a>  
• LinkedIn: <a href="https://linkedin.com/in/hasankny" target="_blank">linkedin.com/in/hasankny</a>  
• Dev.to: <a href="https://dev.to/hkonya" target="_blank">dev.to/hkonya</a>  
• Medium: <a href="https://medium.com/@hasankny" target="_blank">medium.com/@hasankny</a>  
• Instagram: <a href="https://www.instagram.com/hasankny/" target="_blank">instagram.com/hasankny</a>  
`;
    utils.addOutput(socialText, targetContent);
}
