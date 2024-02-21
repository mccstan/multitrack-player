require('dotenv').config();


// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

const prefix = "records"
const delimiter= null
async function listFilesByPrefix() {

  const options = {
    prefix: prefix,
  };

  if (delimiter) {
    options.delimiter = delimiter;
  }

  // Lists files in the bucket, filtered by a prefix
  const [files] = await storage.bucket(process.env.BUCKET_NAME).getFiles(options);

  console.log('Files:');
  files.forEach(file => {
    console.log(file.name);
  });
}

listFilesByPrefix().catch(console.error);