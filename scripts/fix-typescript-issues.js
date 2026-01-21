const fs = require('fs');
const path = require('path');

// Files that need fixing
const filesToFix = [
  'apps/backend/src/routes/notification.routes.ts',
  'apps/backend/src/routes/support.routes.ts',
  'apps/backend/src/routes/websocket.routes.ts'
];

// Fix middleware usage and user property access
function fixFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix middleware usage
  content = content.replace(/authMiddleware,/g, 'authMiddleware.authenticate,');
  
  // Fix user property access
  content = content.replace(/req\.user\?\.id/g, 'req.user?.userId');
  
  // Fix UserType comparisons
  content = content.replace(/req\.user\?\.userType !== 'admin'/g, "req.user?.userType !== 'ADMIN'");
  content = content.replace(/userType !== 'admin'/g, "userType !== 'ADMIN'");
  content = content.replace(/userType === 'admin'/g, "userType === 'ADMIN'");
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

// Fix all files
filesToFix.forEach(fixFile);

console.log('All TypeScript issues fixed!');