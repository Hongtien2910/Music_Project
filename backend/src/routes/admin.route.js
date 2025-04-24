import { Router } from 'express';
import { getAdmin } from '../controllers/admin.controller.js';  
import { protectRoute } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', protectRoute, requireAdmin, createSong);

export default router;