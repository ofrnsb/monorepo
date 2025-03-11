import * as admin from 'firebase-admin';
import { adminDb } from '../config/firebaseConfig';

import { Request, Response } from 'express';

import {
  fetchTopUsers,
  fetchUserData,
  updateUserData,
  updateUserRanking,
} from '../repository/userRepository';

export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id, ...data } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await updateUserData(id, data);

    await updateUserRanking(id);

    return res
      .status(200)
      .json({ message: 'User updated successfully', updatedData: data });
  } catch (error) {
    console.error('🔥 Error updating user:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const fetchUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await fetchUserData(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('🔥 Error fetching user:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getTopUsers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const lastDocId = req.query.lastDocId as string | undefined;

    let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | undefined =
      undefined;

    if (lastDocId) {
      const lastDocQuery = await adminDb
        .collection('USERS')
        .where(admin.firestore.FieldPath.documentId(), '==', lastDocId)
        .limit(1)
        .get();

      if (!lastDocQuery.empty) {
        lastDoc = lastDocQuery.docs[0];
      }
    }

    const { users, lastDoc: newLastDoc } = await fetchTopUsers(limit, lastDoc);

    res.status(200).json({
      users,
      lastDocId: newLastDoc ? newLastDoc.id : null,
    });
  } catch (error) {
    console.error('🔥 Error fetching top users:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};
