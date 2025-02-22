export function tree(params, targetContent, addOutput) {
    const tree = `
📁 terminal-portfolio/
├── 📁 css/
│   └── 📄 style.css
├── 📁 js/
│   └── 📄 main.js
├── 📁 img/
│   ├── 📄 terminal.png
│   ├── 📄 github.png
│   ├── 📄 linkedin.png
│   ├── 📄 dev.png
│   ├── 📄 medium.png
│   └── 📄 instagram.png
├── 📄 index.html
└── 📄 README.md

3 directories, 9 files
`;
    addOutput(tree, targetContent);
} 