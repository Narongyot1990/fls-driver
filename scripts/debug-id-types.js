const { MongoClient } = require('mongodb');

async function debug() {
  const uri = "mongodb+srv://Vercel-Admin-driver_request:2Cqr22ZxLPigEdjL@driver-request.w11djig.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    
    console.log('--- LEADERS ---');
    const leaders = await db.collection('leaders').find().toArray();
    leaders.forEach(l => {
      console.log(`Leader: ${l.name}, _id (Type: ${typeof l._id}): ${l._id}, email: ${l.email}`);
    });

    console.log('\n--- ATTENDANCE SAMPLES ---');
    const attendance = await db.collection('attendances').find().sort({ timestamp: -1 }).limit(10).toArray();
    attendance.forEach(a => {
      console.log(`Rec: ${a.userName}, userId (Type: ${typeof a.userId}): ${a.userId}, type: ${a.type}, branch: ${a.branch}`);
    });

    console.log('\n--- USERS (DRIVERS) ---');
    const users = await db.collection('users').find({ role: 'leader' }).toArray();
    users.forEach(u => {
      console.log(`User-Leader: ${u.lineDisplayName}, _id (Type: ${typeof u._id}): ${u._id}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

debug();
