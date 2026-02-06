const fs = require('fs');
const path = require('path');

// Path to package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
// Path to output .md file
const depsMdPath = path.join(__dirname, '..', 'DEPENDENCIES.md');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Function to generate markdown for dependencies
function generateDepsMarkdown(deps, title) {
  let md = `## ${title}\n\n`;
  md += '| Package | Version | Description |\n';
  md += '|---------|---------|-------------|\n';

  for (const [pkg, version] of Object.entries(deps)) {
    // Remove ^ or ~ from version for display
    const cleanVersion = version.replace(/[\^\~]/, '');
    md += `| ${pkg} | ${cleanVersion} | [Link](https://www.npmjs.com/package/${pkg}) |\n`;
  }

  md += '\n';
  return md;
}

// Generate content
let content = '# Dependencies\n\n';
content += 'This file is auto-generated. Run `npm run update-deps-md` to update.\n\n';
content += generateDepsMarkdown(packageJson.dependencies, 'Runtime Dependencies');
content += generateDepsMarkdown(packageJson.devDependencies, 'Development Dependencies');

// Write to file
fs.writeFileSync(depsMdPath, content, 'utf8');

console.log('DEPENDENCIES.md updated successfully!');