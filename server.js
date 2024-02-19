const express = require('express');
const path = require('path');
const app = express();

// Serve static files. Adjust the path according to where your files are located.
app.use('/multitrack-player', express.static(path.join(__dirname, 'front', 'dist')));

// For any paths that don't match a static file, serve the main index.html file
// as required by Vue Router in history mode.
app.get('/multitrack-player/*', function(request, response) {
  response.sendFile(path.join(__dirname, 'front', 'dist', 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
