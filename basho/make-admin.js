const mongoose = require('mongoose');
require('dotenv').config();

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Found users:', users.length);

    if (users.length > 0) {
      // Make the first user an admin
      await mongoose.connection.db.collection('users').updateOne(
        { _id: users[0]._id },
        { $set: { isAdmin: true } }
      );
      console.log('Made user', users[0].email, 'an admin');
    } else {
      console.log('No users found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

makeAdmin();