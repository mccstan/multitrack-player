require('dotenv').config();

let { listProjectFolders, listFilesWithSignedUrls } = require('./gcs.js');

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


// Lists projects within a specific prefix
app.get('/api/list-projects', async (req, res) => {
  try {
    const projects = await listProjectFolders();
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Lists files with signed URLs for a given project
app.get('/api/list-project-files/:projectName', async (req, res) => {
  const projectName = req.params.projectName;
  try {
    const filesWithUrls = await listFilesWithSignedUrls(decodeURIComponent(projectName));
    res.json(filesWithUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
