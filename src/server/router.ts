import { Router } from 'express';
import UserService from './UserService';

const router = Router();

router.get('/user/:userId', async (req, res) => {
  const userInfo = await UserService.findById(req.params.userId);
  return res.json(userInfo);
});

module.exports = router;
