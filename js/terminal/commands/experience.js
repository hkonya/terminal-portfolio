import { i18n } from '../../i18n.js';

export function experience(params, targetContent, commandHistory, currentPath, setPath, utils) {
    const experienceText = `
<span class="highlight">${i18n.t('experience.title')}</span>

<span class="command">${i18n.t('experience.turksat.title')}</span> | ${i18n.t('projects.july')} 2018 - ${i18n.t('projects.present')}

<span class="command">${i18n.t('experience.basarsoft.title')}</span> | ${i18n.t('projects.june')} 2017 - ${i18n.t('projects.june')} 2018

<span class="command">${i18n.t('experience.basarsoft_intern.title')}</span> | ${i18n.t('projects.july')} 2016 - ${i18n.t('projects.december')} 2016

<span class="command">${i18n.t('experience.netix_intern.title')}</span> | ${i18n.t('projects.may')} 2016 - ${i18n.t('projects.june')} 2016
`;
    utils.addOutput(experienceText, targetContent);
}
