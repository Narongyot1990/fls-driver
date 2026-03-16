const { MongoClient, ObjectId } = require('mongodb');

async function debug() {
  const uri = "mongodb+srv://Vercel-Admin-driver_request:2Cqr22ZxLPigEdjL@driver-request.w11djig.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    
    console.log('--- SEARCHING FOR USER: ณรงค์ยศ ---');
    const users = await db.collection('users').find({ $or: [{ name: /ณรงค์ยศ/ }, { lineDisplayName: /ณรงค์ยศ/ }] }).toArray();
    users.forEach(u => {
      console.log(`User: ${u.name || u.lineDisplayName}, _id: ${u._id} (Type: ${typeof u._id}), lineUserId: ${u.lineUserId}`);
    });

    const leaders = await db.collection('leaders').find({ name: /ณรงค์ยศ/ }).toArray();
    leaders.forEach(l => {
      console.log(`Leader: ${l.name}, _id: ${l._id} (Type: ${typeof l._id}), email: ${l.email}`);
    });

    console.log('\n--- SEARCHING ATTENDANCE FOR NAME: ณรงค์ยศ ---');
    const attendance = await db.collection('attendances').find({ userName: /ณรงค์ยศ/ }).sort({ timestamp: -1 }).limit(5).toArray();
    attendance.forEach(a => {
      console.log(`Rec: ${a.userName}, userId (Type: ${typeof a.userId}): ${a.userId}, timestamp: ${a.timestamp}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

debug();
