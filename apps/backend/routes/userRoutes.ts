import express from 'express';
import {
  fetchUser,
  updateUser,
  getTopUsers,
} from '../controllers/userController';

const router = express.Router();

router.get('/fetch-user-data/:id', fetchUser);
router.put('/update-user-data', updateUser);

router.get('/top-users', getTopUsers);

export default router;
