import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove dark: classes
    content = content.replace(/dark:[^\s"'}]+/g, '');
    
    // Replace glass classes with flat styles
    content = content.replace(/\bglass-card\b/g, 'focus-container');
    content = content.replace(/\bglass\b/g, 'bg-surface-container-lowest border border-outline-variant shadow-sm');
    
    // Replace bg-gradient-primary with bg-primary
    content = content.replace(/\bbg-gradient-primary\b/g, 'bg-primary hover:bg-primary-container');
    
    // Fix multiple spaces left behind by removals
    content = content.replace(/\s+(?=["'])/g, ''); // Fix spaces right before closing quote
    content = content.replace(/(?<=["'])\s+/g, ''); // Fix spaces right after opening quote
    content = content.replace(/\s{2,}/g, ' '); // Collapse multiple spaces

    // Some specific Navbar edits since we don't need dark mode
    if (filePath.includes('Navbar.jsx')) {
      content = content.replace(/const \[darkMode.*?\}, \[darkMode\]\);/s, '');
      content = content.replace(/\{\/\* Dark Mode toggle \*\/.*?<\/button>/s, '');
      content = content.replace(/<button[^>]*setDarkMode.*?<\/button>/s, ''); // Mobile toggle
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
