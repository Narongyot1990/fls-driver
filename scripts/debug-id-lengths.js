const { MongoClient } = require('mongodb');

async function debug() {
  const uri = "mongodb+srv://Vercel-Admin-driver_request:2Cqr22ZxLPigEdjL@driver-request.w11djig.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    
    const sample = await db.collection('attendances').find().sort({ timestamp: -1 }).limit(1).toArray();
    if (sample.length > 0) {
      const rec = sample[0];
      console.log('--- ATTENDANCE RECORD ---');
      console.log('userName:', rec.userName);
      console.log('userId:', rec.userId);
      console.log('userId Type:', typeof rec.userId);
      console.log('userId Length:', rec.userId ? rec.userId.length : 'N/A');
    }

    const user = await db.collection('users').findOne({ name: /ณรงค์ยศ/ });
    if (user) {
      console.log('\n--- USER RECORD ---');
      console.log('Name:', user.name || user.lineDisplayName);
      console.log('_id:', user._id);
      console.log('_id Type:', typeof user._id);
      const idStr = user._id.toString();
      console.log('_id String:', idStr);
      console.log('_id String Length:', idStr.length);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

debug();
