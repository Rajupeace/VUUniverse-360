const { MongoMemoryServer } = require('mongodb-memory-server');

async function download() {
  console.log('Downloading MongoDB binary for Render...');
  try {
    const mongod = await MongoMemoryServer.create();
    console.log('✅ MongoDB binary downloaded successfully!');
    await mongod.stop();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to download MongoDB binary:', error);
    process.exit(1);
  }
}

download();
