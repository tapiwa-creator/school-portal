const fs = require('fs');
const path = require('path');

const map = {
  "📊": "BarChart", "🏆": "Trophy", "⚠️": "AlertTriangle", "📝": "FileText",
  "📋": "ClipboardList", "📈": "TrendingUp", "🎓": "GraduationCap", "💰": "DollarSign",
  "📅": "Calendar", "💳": "CreditCard", "📣": "Megaphone", "🔴": "Circle",
  "📗": "Book", "💻": "Laptop", "📍": "MapPin", "🔒": "Lock",
  "✅": "CheckCircle", "❌": "XCircle", "⏳": "Clock", "🔔": "Bell",
  "👨‍🏫": "UserCircle", "👩‍🏫": "UserCircle", "🏫": "School", "🏠": "Home",
  "⚙️": "Settings", "🔥": "Flame", "🚀": "Rocket", "🔑": "Key",
  "📖": "BookOpen", "📚": "Library", "✏️": "Edit2", "🔍": "Search",
  "💡": "Lightbulb", "👋": "Hand", "💬": "MessageSquare", "📧": "Mail",
  "📞": "Phone", "⭐": "Star", "🌟": "Star", "✨": "Sparkles",
  "❗": "AlertCircle", "❓": "HelpCircle", "ℹ️": "Info", "🎓": "GraduationCap"
};

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
  let imports = new Set();
  
  for (const [e, i] of Object.entries(map)) {
    // Exact match inside tags
    const regexTag = new RegExp(`>\\s*${e}\\s*<`, 'g');
    if (regexTag.test(c)) {
      c = c.replace(regexTag, `><${i} className="w-5 h-5 inline-block" /><`);
      imports.add(i);
    }
    
    // Matched inside quotes
    const regexStr = new RegExp(`(["'])${e}(["'])`, 'g');
    if (regexStr.test(c)) {
      c = c.replace(regexStr, `<${i} className="w-5 h-5" />`);
      imports.add(i);
    }

    // Naked emoji match anywhere else
    const regexNaked = new RegExp(`${e}`, 'g');
    if (regexNaked.test(c)) {
      c = c.replace(regexNaked, `<${i} className="w-5 h-5 inline-block mr-1" />`);
      imports.add(i);
    }
  }
  
  // Any remaining unmapped generic emojis
  const genericEmojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}\u{2B06}\u{2B07}\u{2B05}\u{27A1}\u{21A9}\u{21AA}\u{2934}\u{2935}]/gu;
  if (genericEmojiRegex.test(c)) {
     c = c.replace(genericEmojiRegex, "");
  }

  if (c !== orig && imports.size > 0) {
    const importStr = `import { ${Array.from(imports).join(', ')} } from "lucide-react";\n`;
    if (c.includes('import ')) {
       c = c.replace(/import .*\n/, match => match + importStr);
    } else {
       c = importStr + c;
    }
    fs.writeFileSync(p, c);
    console.log("Updated", p);
  } else if (c !== orig) {
    fs.writeFileSync(p, c);
    console.log("Updated", p);
  }
}

walk('src');
