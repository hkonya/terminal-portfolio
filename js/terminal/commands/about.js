import { i18n } from '../../i18n.js';

export function about(params, targetContent, addOutput) {
    const aboutText = `
<span class="highlight">${i18n.t('about.title')} 👋</span>

${i18n.t('about.description')}

🚀 <span class="highlight">${i18n.t('about.techStack')}</span>  
- **Backend:** .NET, Node.js, Python (FastAPI, Flask), Lua  
- **Frontend:** React, Angular  
- **Database:** PostgreSQL, MongoDB, Redis, Firestore, SQLite (Embedded DB)  
- **DevOps & Tools:** Docker, Kubernetes, ArgoCD, GitLab CI/CD, RabbitMQ  

📌 <span class="highlight">${i18n.t('about.whatIDo')}</span>  
- ${i18n.t('about.highPerformanceBackend')}  
- ${i18n.t('about.modernFrontend')}  
- ${i18n.t('about.devopsAutomation')}  
- ${i18n.t('about.scalableArchitectures')}  

🛠 <span class="highlight">${i18n.t('about.professionalExperience')}</span>  
${i18n.t('about.professionalDescription')}

✍️ <span class="highlight">${i18n.t('about.blogLearningNotes')}</span>  
${i18n.t('about.blogDescription')}  

🎯 <span class="highlight">${i18n.t('about.currentlyExploring')}</span>  
- ${i18n.t('about.aiCodeOptimization')}  
- ${i18n.t('about.cloudNativeMicroservices')}  

💡 <span class="highlight">${i18n.t('about.beyondCoding')}</span>  
${i18n.t('about.personalInterests')}  

⚡ <span class="highlight">${i18n.t('about.letsConnect')}</span> 🚀  
`;
    addOutput(aboutText, targetContent);
}
