import { User } from '@monorepo/shared';
import { adminDb } from '../config/firebaseConfig';

export const fetchUserData = async (id: string): Promise<User | null> => {
  console.log(`📌 Fetching user with ID: ${id}`);

  if (!id) {
    console.error('❌ Error: User ID is undefined!');
    throw new Error('User ID is required');
  }

  const doc = await adminDb.collection('USERS').doc(id).get();
  if (!doc.exists) {
    console.log(`❌ User with ID ${id} not found`);
    return null;
  }

  return doc.data() as User;
};

export const updateUserData = async (
  id: string,
  data: Partial<User>
): Promise<void> => {
  await adminDb.collection('USERS').doc(id).update(data);
};

export const updateUserRanking = async (id: string) => {
  const docRef = adminDb.collection('USERS').doc(id);
  const doc = await docRef.get();

  if (!doc.exists) return;

  const user = doc.data() as User;

  if (
    typeof user.totalAverageWeightRatings !== 'number' ||
    typeof user.numberOfRents !== 'number' ||
    typeof user.recentlyActive !== 'number'
  ) {
    console.warn(`⚠️ User ${id} has invalid data, skipping ranking update.`);
    return;
  }

  const rankingScore =
    user.totalAverageWeightRatings * 100 +
    user.numberOfRents * 1 +
    user.recentlyActive / 100000000;

  await docRef.update({ rankingScore });
  console.log(`✅ Updated rankingScore for user ${id}: ${rankingScore}`);
};

export const fetchTopUsers = async (
  limit: number,
  lastDoc?: FirebaseFirestore.QueryDocumentSnapshot
) => {
  let query = adminDb
    .collection('USERS')
    .orderBy('rankingScore', 'desc')
    .limit(limit);

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();
  const users = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    users,
    lastDoc:
      snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1]
        : undefined,
  };
};
