import { User } from '@monorepo/shared';
import {
  collection,
  db,
  doc,
  getDocs,
  updateDoc,
} from '../config/firebaseConfig';

const updateAllUsersWithRanking = async () => {
  console.log('🚀 Starting update of rankingScore for all users...');

  const usersCollection = collection(db, 'USERS');
  const usersSnapshot = await getDocs(usersCollection);

  if (usersSnapshot.empty) {
    console.log('❌ No users found in Firestore!');
    return;
  }

  usersSnapshot.forEach(async (userDoc) => {
    const user = userDoc.data() as User;

    if (
      typeof user.totalAverageWeightRatings !== 'number' ||
      typeof user.numberOfRents !== 'number' ||
      typeof user.recentlyActive !== 'number'
    ) {
      console.warn(`⚠️ Skipping user ${userDoc.id} due to invalid data.`);
      return;
    }

    const rankingScore =
      user.totalAverageWeightRatings * 100 +
      user.numberOfRents +
      user.recentlyActive / 100000000;

    await updateDoc(doc(db, 'USERS', userDoc.id), { rankingScore });
    console.log(
      `✅ Updated user ${userDoc.id} with rankingScore: ${rankingScore}`
    );
  });

  console.log('🔥 All users updated with rankingScore!');
};

updateAllUsersWithRanking()
  .then(() => console.log('✅ Script selesai!'))
  .catch((err) => console.error('❌ Error updating users:', err));
