import { i18n } from '../../i18n.js';

export function coffee(params, targetContent, addOutput) {
    const coffeeArt = `
        ( (
         ) )
     .........
     |       |]
     \\       /
      \`---'
      
${i18n.t('system.coffee')}`;
    addOutput(coffeeArt, targetContent);
} 