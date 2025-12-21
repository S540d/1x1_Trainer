const fs = require('fs');
const path = require('path');

// Copy PWA files to dist folder
const filesToCopy = [
  { src: 'public/.nojekyll', dest: 'dist/.nojekyll' },
  { src: 'public/manifest.json', dest: 'dist/manifest.json' },
  { src: 'public/service-worker.js', dest: 'dist/service-worker.js' },
  { src: 'public/icon-192.png', dest: 'dist/icon-192.png' },
  { src: 'public/icon-512.png', dest: 'dist/icon-512.png' },
  { src: 'public/favicon.ico', dest: 'dist/favicon.ico' },
  { src: 'public/.well-known/assetlinks.json', dest: 'dist/.well-known/assetlinks.json' }
];

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, '..', src);
  const destPath = path.join(__dirname, '..', dest);

  if (fs.existsSync(srcPath)) {
    // Create destination directory if it doesn't exist
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${src} to ${dest}`);
  } else {
    console.warn(`⚠ File not found: ${src}`);
  }
});

// Fix paths in index.html for GitHub Pages subpath deployment
const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Replace absolute paths with relative paths
  html = html.replace(/href="\//g, 'href="./');
  html = html.replace(/src="\//g, 'src="./');

  // Fix service worker registration path
  html = html.replace(/\.register\('\/service-worker\.js'\)/, ".register('./service-worker.js')");

  fs.writeFileSync(indexPath, html);
  console.log('✓ Fixed paths in index.html for subpath deployment');
}

console.log('✓ PWA files copied successfully!');
