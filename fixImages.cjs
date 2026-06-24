const fs = require('fs');
let content = fs.readFileSync('src/data/sampleProducts.js', 'utf8');
const defaultUrl = 'https://images.unsplash.com/photo-1578985545062-69928b1ea236?q=80&w=600&auto=format&fit=crop';
content = content.replace(/images:\s*\[\s*\]/g, "images: ['" + defaultUrl + "']");
fs.writeFileSync('src/data/sampleProducts.js', content);
console.log('Images added!');
