import { RequestHandler } from 'express';
import { UserService } from '../services';

const getCurrentUser: RequestHandler = async (_req, res) => {
  // TODO: Change this to use req.user.id -> to get current user after user auth impl
  const userInfo = await UserService.fetchRandomUser();
  return res.json(userInfo);
};

const getUser: RequestHandler = async (req, res) => {
  const userInfo = await UserService.findById(req.params.userId);
  return res.json(userInfo);
};

// TODO: Add middlewares for policy guarding
export default {
  'get /user/get_current_user': [getCurrentUser],

  'get /user/:userId': [getUser],
};
