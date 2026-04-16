const fs = require('fs');
const path = require('path');

const lucideComponents = [
  "BarChart", "Trophy", "AlertTriangle", "FileText", "ClipboardList",
  "TrendingUp", "GraduationCap", "DollarSign", "Calendar", "CreditCard",
  "Megaphone", "Circle", "Book", "Laptop", "MapPin", "Lock", "CheckCircle",
  "XCircle", "Clock", "Bell", "UserCircle", "School", "Home", "Settings",
  "Flame", "Rocket", "Key", "BookOpen", "Library", "Edit2", "Search",
  "Lightbulb", "Hand", "MessageSquare", "Mail", "Phone", "Star", "Sparkles",
  "AlertCircle", "HelpCircle", "Info"
];

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.js') || p.endsWith('.jsx')) processFile(p);
  }
}

function processFile(p) {
  let c = fs.readFileSync(p, 'utf8');
  let orig = c;

  let found = new Set();
  for (const comp of lucideComponents) {
    if (c.includes(`<${comp}`) || c.includes(`${comp}>`)) {
      found.add(comp);
    }
  }

  if (found.size > 0 && !c.includes('lucide-react')) {
    const importStr = `import { ${Array.from(found).join(', ')} } from "lucide-react";\n`;
    
    // Insert after the last import
    const lastImportIndex = c.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = c.indexOf('\n', lastImportIndex);
      const insertPos = endOfLine !== -1 ? endOfLine + 1 : c.length;
      c = c.slice(0, insertPos) + importStr + c.slice(insertPos);
    } else {
      c = importStr + c;
    }
    
    fs.writeFileSync(p, c);
    console.log("Fixed imports in", p);
  }
}

walk('src');
