const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const rename = promisify(fs.rename);

const SRC_DIR = path.join(__dirname, 'src');
const renamedFiles = new Map(); // Track renamed files and their new paths

async function hasReactImport(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    return content.includes('import React') || 
           content.includes('from \'react\'') ||
           content.includes('from "react"') ||
           content.includes('React.') ||
           content.includes('useState') ||
           content.includes('useEffect') ||
           content.includes('useContext');
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return false;
  }
}

async function updateImportsInFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf8');
    let updated = false;

    // Update imports based on renamed files
    for (const [oldPath, newPath] of renamedFiles.entries()) {
      const oldName = path.basename(oldPath, '.js');
      const oldDir = path.dirname(oldPath);
      
      // Create various possible import path formats
      const importPatterns = [
        `'${oldPath}'`,
        `"${oldPath}"`,
        `'${oldDir}/${oldName}'`,
        `"${oldDir}/${oldName}"`,
        `'./${oldName}'`,
        `"./${oldName}"`,
        `'../${oldName}'`,
        `"../${oldName}"`,
        // Add more relative path variations
        ...Array.from({ length: 5 }, (_, i) => i + 1).map(i => 
          [`'${'../'.repeat(i)}${oldName}'`, `"${'../'.repeat(i)}${oldName}"`]
        ).flat()
      ];

      for (const pattern of importPatterns) {
        if (content.includes(pattern)) {
          const newImportPath = pattern.charAt(0) + newPath + pattern.charAt(pattern.length - 1);
          content = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImportPath);
          updated = true;
        }
      }
    }

    if (updated) {
      await writeFile(filePath, content, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    }
  } catch (err) {
    console.error(`Error updating imports in ${filePath}:`, err);
  }
}

async function walkDir(dir, updateImports = false) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await walkDir(filePath, updateImports);
      continue;
    }
    
    if (updateImports) {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        await updateImportsInFile(filePath);
      }
    } else if (file.endsWith('.js') && await hasReactImport(filePath)) {
      // Special handling for index.js files
      const newPath = file === 'index.js' 
        ? path.join(path.dirname(filePath), 'index.jsx')
        : filePath.replace('.js', '.jsx');
        
      console.log(`Renaming ${filePath} to ${newPath}`);
      
      try {
        await rename(filePath, newPath);
        // Store the renamed file info for updating imports later
        const relativePath = path.relative(SRC_DIR, filePath);
        const newRelativePath = path.relative(SRC_DIR, newPath);
        renamedFiles.set(
          relativePath.replace(/\\/g, '/'),
          newRelativePath.replace(/\\/g, '/')
        );
      } catch (err) {
        console.error(`Error renaming ${filePath}:`, err);
      }
    }
  }
}

// Start the renaming process
console.log('Starting to rename React component files...');
walkDir(SRC_DIR)
  .then(() => {
    console.log('Finished renaming files. Updating imports...');
    return walkDir(SRC_DIR, true);
  })
  .then(() => console.log('Finished updating imports'))
  .catch(err => console.error('Error:', err)); 