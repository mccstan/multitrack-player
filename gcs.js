const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const bucketName = process.env.BUCKET_NAME;
const projectsPrefix = process.env.PROJECTS_PREFIX;

async function listProjectFolders() {
  const [files] = await storage.bucket(bucketName).getFiles({
    prefix: projectsPrefix,
  });

  const projectNames = new Set();
  files.forEach(file => {
    const match = file.name.match(new RegExp(`^${projectsPrefix}([^/]+)/`));
    if (match) {
      projectNames.add(match[1]);
    }
  });

  // URL-encode project names
  return Array.from(projectNames).map(name => encodeURIComponent(name));
}


async function listFilesWithSignedUrls(projectName) {
  const prefix = `${projectsPrefix}${projectName}/`;

  const [files] = await storage.bucket(bucketName).getFiles({ prefix });

  const filesWithUrls = await Promise.all(files.map(async (file) => {
    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 15 minutes
    };

    try {
      const [url] = await file.getSignedUrl(options);
      // Return the original file name and the signed URL
      return { name: file.name, url };
    } catch (error) {
      console.error(`Failed to generate signed URL for ${file.name}:`, error);
      return { name: file.name, url: null };
    }
  }));

  return filesWithUrls.map(file => ({
    ...file,
    name: encodeURIComponent(file.name) // URL-encode file names in the response
  }));
}


module.exports = {
  listProjectFolders,
  listFilesWithSignedUrls
};

