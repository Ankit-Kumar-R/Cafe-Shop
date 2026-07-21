import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

if (!content.includes('TodaySpecials')) {
    content = content.replace(/import \{ Link \} from 'react-router';/, "import { Link } from 'react-router';\nimport { TodaySpecials } from '../components/TodaySpecials.tsx';");
}

if (!content.includes('<TodaySpecials />')) {
    content = content.replace(/<\/section>\n\n\s*\{\/\* Featured Categories/g, "</section>\n\n      <TodaySpecials />\n\n      {/* Featured Categories");
}

fs.writeFileSync('src/pages/Home.tsx', content);
