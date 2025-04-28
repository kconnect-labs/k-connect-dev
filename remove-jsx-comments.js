const fs = require('fs');
const path = require('path');

// Function to remove only JSX comments
function removeJsxComments(content) {
  // Remove only JSX comments ({/* ... */})
  return content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
}

// Process a file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath).toLowerCase();
    
    // Only process JS and JSX files for JSX comments
    if (['.js', '.jsx'].includes(ext)) {
      const newContent = removeJsxComments(content);
      
      // Only write if content has changed
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Processed: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

// Walk through directory recursively
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath); // Recursively process subdirectories
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.js', '.jsx'].includes(ext)) {
        processFile(filePath);
      }
    }
  });
}

// Main execution
const sourcePath = path.resolve('/var/www/k-connect/frontend/src');
console.log(`Removing only JSX comments from files in: ${sourcePath}`);
walkDir(sourcePath);
console.log('JSX comments removal complete!'); 