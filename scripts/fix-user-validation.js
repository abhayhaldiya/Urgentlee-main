const fs = require('fs');

// Files that need user validation fixes
const filesToFix = [
  'apps/backend/src/routes/notification.routes.ts',
  'apps/backend/src/routes/support.routes.ts',
  'apps/backend/src/routes/websocket.routes.ts'
];

function addUserValidation(content) {
  // Add user validation after getting userId
  const userIdPattern = /const userId = req\.user\?\.userId;/g;
  
  return content.replace(userIdPattern, `const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required',
          retryable: false
        },
        timestamp: new Date().toISOString()
      });
    }`);
}

// Fix all files
filesToFix.forEach(filePath => {
  console.log(`Adding user validation to ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  content = addUserValidation(content);
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
});

console.log('User validation fixes applied!');