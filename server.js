const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// Your express stuff here...

app.listen(port, () => {
  console.log(`Server is live on port ${port}`);
});

// 👇 Add this line
require('./bot.js');
