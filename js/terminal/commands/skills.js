import { i18n } from '../../i18n.js';

export function skills(params, targetContent, commandHistory, currentPath, setPath, utils) {
    const skillsText = `
<span class="highlight">${i18n.t('skills.title')}</span>

🚀 <span class="highlight">${i18n.t('skills.frontend')}</span>
 • React.js, Angular, Next.js  
 • HTML5, CSS3, JavaScript (ES6+), TypeScript  
 • Responsive Design, SASS/SCSS, TailwindCSS  

🛠 <span class="highlight">${i18n.t('skills.backend')}</span>
 • .NET, Node.js (Express.js, NestJS)  
 • Python (Flask), Lua 
 • RESTful APIs  

🗄 <span class="highlight">${i18n.t('skills.database')}</span>
 • PostgreSQL, MongoDB, Firestore  
 • Redis, SQLite (Embedded DB)  

⚙️ <span class="highlight">${i18n.t('skills.devops')}</span>
 • Docker, Kubernetes, ArgoCD  
 • CI/CD (GitLab CI/CD, Jenkins)  
 • Google Cloud  
 • RabbitMQ, Kafka  

${i18n.t('skills.footer')}
`;
    utils.addOutput(skillsText, targetContent);
}
