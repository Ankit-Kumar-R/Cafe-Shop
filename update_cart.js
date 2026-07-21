const fs = require('fs');
const content = fs.readFileSync('src/context/CartContext.tsx', 'utf8');
const newContent = content.replace(
  /return \[\.\.\.prev, itemToAdd\];\s*\}\);\s*\};/g,
  `return [...prev, itemToAdd];\n    });\n    addToast(\`Added \${itemToAdd.name} to cart\`, 'success');\n    if (navigator.vibrate) navigator.vibrate(50);\n  };`
);
fs.writeFileSync('src/context/CartContext.tsx', newContent);
