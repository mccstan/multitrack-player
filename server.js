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


// Proxy endpoint for streaming GCS files
app.get('/api/proxy-gcs/:filePath', async (req, res) => {
  // Construct the direct GCS file URL
  const filePath = req.params.filePath;
  const fileUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${filePath}`;

  try {
    const gcsRes = await fetch(fileUrl);

    if (!gcsRes.ok) {
      // Forward the HTTP status code from GCS to the client
      return res.status(gcsRes.status).send('Error retrieving file from GCS');
    }

    // Forward the Content-Type
    res.setHeader('Content-Type', gcsRes.headers.get('Content-Type'));

    // Stream the file content from GCS to the client
    gcsRes.body.pipe(res);
  } catch (error) {
    console.error('Failed to stream file from GCS:', error);
    res.status(500).send('Internal server error');
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
