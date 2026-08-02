const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      filelist = walkSync(filePath, filelist);
    } else if (filePath.endsWith('.jsx')) {
      filelist.push(filePath);
    }
  });
  return filelist;
};

const map = {
  'rgba(255,255,255,0.05)': 'var(--white-05)',
  'rgba(255,255,255,0.06)': 'var(--white-06)',
  'rgba(255,255,255,0.07)': 'var(--white-07)',
  'rgba(255,255,255,0.08)': 'var(--white-08)',
  'rgba(255,255,255,0.1)': 'var(--white-10)',
  'rgba(255,255,255,0.12)': 'var(--white-12)',
  'rgba(255,255,255,0.15)': 'var(--white-15)',
  'rgba(255,255,255,0.2)': 'var(--white-20)',
  'rgba(255,255,255,0.3)': 'var(--white-30)'
};

const files = walkSync(path.join(__dirname, 'src'));
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  Object.keys(map).forEach(k => {
    if (content.includes(k)) {
      content = content.replace(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), map[k]);
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(f, content);
    console.log(`Updated ${f}`);
  }
});
