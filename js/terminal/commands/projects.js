import { i18n } from '../../i18n.js';

export function projects(params, targetContent, addOutput) {
    const projectsText = `
<span class="highlight">${i18n.t('projects.title')}</span>

<span class="command">1. Türksat Kablo Mobil</span>
  • ${i18n.t('projects.turksat_kablo_mobil.description')}
  • ${i18n.t('projects.active')} (${i18n.t('projects.august')} 2022 - ${i18n.t('projects.present')})
  • Flutter, Lua, PHP, Android, iOS, Firebase, CI/CD, Docker, Kubernetes

<span class="command">2. KODSIS CRM</span>
  • ${i18n.t('projects.kodsis_crm.description')}
  • ${i18n.t('projects.active')} (${i18n.t('projects.december')} 2021 - ${i18n.t('projects.present')})
  • PHP, .NET Core, React, Docker, Kubernetes, Redis

<span class="command">3. Tsunami Device Interaction Mapper</span>
  • ${i18n.t('projects.tsunami_mapper.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.december')} 2020 - ${i18n.t('projects.november')} 2021)
  • Angular, .NET Core, Docker

<span class="command">4. InTheCircle</span>
  • ${i18n.t('projects.inthecircle.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.november')} 2020 - ${i18n.t('projects.november')} 2020)
  • Unity, C#

<span class="command">5. Fly Away</span>
  • ${i18n.t('projects.fly_away.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.october')} 2020 - ${i18n.t('projects.october')} 2020)
  • Unity, C#

<span class="command">6. Tsunami CBS</span>
  • ${i18n.t('projects.tsunami_cbs.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.december')} 2018 - ${i18n.t('projects.august')} 2020)
  • Türksat, .NET

<span class="command">7. Tsunami Web - Mobil</span>
  • ${i18n.t('projects.tsunami_web_mobil.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.july')} 2018 - ${i18n.t('projects.december')} 2018)
  • Türksat, .NET

<span class="command">8. DOABIS Botaş CBS Uygulaması Revizyon</span>
  • ${i18n.t('projects.doabis_botas.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.february')} 2018 - ${i18n.t('projects.may')} 2018)
  • Basarsoft, .NET

<span class="command">9. TELCOBIS AlbTelecom CBS Uygulaması Revizyon</span>
  • ${i18n.t('projects.telcobis.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.january')} 2018 - ${i18n.t('projects.may')} 2018)
  • Basarsoft, .NET

<span class="command">10. DOABIS Kolin CBS Uygulaması</span>
  • ${i18n.t('projects.doabis_kolin.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.november')} 2017 - ${i18n.t('projects.january')} 2018)
  • Basarsoft, .NET, PL/SQL, DevExpress MVC

<span class="command">11. KampüsNavi</span>
  • ${i18n.t('projects.kampusnavi.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.march')} 2017 - ${i18n.t('projects.june')} 2017)
  • Fırat Üniversitesi, ASP.NET MVC

<span class="command">12. Language Town (Dil Kasabası)</span>
  • ${i18n.t('projects.language_town.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.february')} 2017 - ${i18n.t('projects.june')} 2017)
  • ASP.NET, Bootstrap

<span class="command">13. Esgaz UAVT Adres Sorgulama Sistemi</span>
  • ${i18n.t('projects.esgaz.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.november')} 2016 - ${i18n.t('projects.december')} 2016)
  • .NET

<span class="command">14. Maliye Bakanlığı Milli Emlak Saha Anket Uygulaması</span>
  • ${i18n.t('projects.maliye_bakanligi.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.october')} 2016 - ${i18n.t('projects.october')} 2016)
  • .NET

<span class="command">15. Kanal Elazığ</span>
  • ${i18n.t('projects.kanal_elazig.description')}
  • ${i18n.t('projects.completed')} (${i18n.t('projects.june')} 2016 - ${i18n.t('projects.june')} 2016)
  • Android, RSS

${i18n.t('projects.more')}:
<a href="https://github.com/hkonya" target="_blank">github.com/hkonya</a>
`;
    addOutput(projectsText, targetContent);
}
