import express from 'express'
import { clerkWebHooks } from '../controllers/UserController.js'

const userRouter = express.Router();

userRouter.get('/webhooks',clerkWebHooks);

export default userRouter;