import { i18n } from '../../i18n.js';

export function help(params, targetContent, addOutput) {
    const helpText = `
<span class="highlight">${i18n.t('commandDescriptions.help')}</span>

${i18n.t('commandCategories.portfolio')}:
 <span class="command">about</span>      - ${i18n.t('commandDescriptions.about')}
 <span class="command">skills</span>     - ${i18n.t('commandDescriptions.skills')}
 <span class="command">projects</span>   - ${i18n.t('commandDescriptions.projects')}
 <span class="command">experience</span> - ${i18n.t('commandDescriptions.experience')}
 <span class="command">contact</span>    - ${i18n.t('commandDescriptions.contact')}
 <span class="command">social</span>     - ${i18n.t('commandDescriptions.social')}

${i18n.t('commandCategories.basic')}:
 <span class="command">help</span>      - ${i18n.t('commandDescriptions.help')}
 <span class="command">clear</span>     - ${i18n.t('commandDescriptions.clear')}
 <span class="command">ls</span>        - ${i18n.t('commandDescriptions.ls')}
 <span class="command">pwd</span>       - ${i18n.t('commandDescriptions.pwd')}
 <span class="command">cd</span>        - ${i18n.t('commandDescriptions.cd')}
 <span class="command">tree</span>      - ${i18n.t('commandDescriptions.tree')}

${i18n.t('commandCategories.system')}:
 <span class="command">neofetch</span>  - ${i18n.t('commandDescriptions.neofetch')}
 <span class="command">date</span>      - ${i18n.t('commandDescriptions.date')}
 <span class="command">whoami</span>    - ${i18n.t('commandDescriptions.whoami')}
 <span class="command">history</span>   - ${i18n.t('commandDescriptions.history')}

${i18n.t('commandCategories.fun')}:
 <span class="command">matrix</span>    - ${i18n.t('commandDescriptions.matrix')}
 <span class="command">coffee</span>    - ${i18n.t('commandDescriptions.coffee')}
 <span class="command">sudo</span>      - ${i18n.t('commandDescriptions.sudo')}
 <span class="command">exit</span>      - ${i18n.t('commandDescriptions.exit')}

${i18n.t('tips.title')}:
• ${i18n.t('tips.history')}
• ${i18n.t('tips.cd')}
• ${i18n.t('tips.ls')}
• ${i18n.t('tips.neofetch')}
`;
    addOutput(helpText, targetContent);
} 