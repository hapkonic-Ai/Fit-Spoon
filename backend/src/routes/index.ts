import { Hono } from 'hono';
import authRouter from './auth.js';
import chatRouter from './chat.js';
import recipesRouter from './recipes.js';
import nutritionRouter from './nutrition.js';
import moodRouter from './mood.js';
import userRouter from './user.js';
import fridgeRouter from './fridge.js';

const api = new Hono();

api.route('/auth', authRouter);
api.route('/chat', chatRouter);
api.route('/recipes', recipesRouter);
api.route('/nutrition', nutritionRouter);
api.route('/mood', moodRouter);
api.route('/user', userRouter);
api.route('/fridge', fridgeRouter);

export default api;
