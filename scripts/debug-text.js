const fs = require('fs');
const c = fs.readFileSync('C:\\Users\\HP\\Desktop\\PetAdopt-main\\app\\(app)\\general-chat.tsx','utf8');

const textOpen = (c.match(/<Text/g)||[]).length;
const textClose = (c.match(/<\/Text>/g)||[]).length;
console.log('<Text opens: ' + textOpen + ', </Text> closes: ' + textClose);

const lines = c.split('\n');
lines.forEach((l, i) => {
  // Find text nodes between > and </ that are not inside <Text>
  const m = l.match(/>([^<>"]{3,})<\//);
  if (m) {
    const t = m[1].trim();
    if (t && !l.includes('<Text') && !l.includes('Text>')) {
      console.log('L' + (i+1) + ': potential bare text "' + t + '"');
    }
  }
});

// Also check for self-closing or chidren patterns
lines.forEach((l, i) => {
  const m = l.match(/>([^<>]{2,})<\//);
  if (m && !m[1].match(/^[\s]*$/)) {
    const t = m[1].trim();
    if (t && !l.includes('<Text') && !l.includes('Text>')) {
      console.log('L' + (i+1) + ': bare text "' + t + '" in: ' + l.trim());
    }
  }
});
