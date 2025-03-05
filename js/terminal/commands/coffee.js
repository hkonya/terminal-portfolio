import { i18n } from '../../i18n.js';

export function coffee(params, targetContent, commandHistory, currentPath, setPath, utils) {
    const coffeeArt = `
        ( (
         ) )
     .........
     |       |]
     \\       /
      \`---'
      
${i18n.t('system.coffee')}`;
    utils.addOutput(coffeeArt, targetContent);
} 