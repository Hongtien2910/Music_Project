import { Router } from 'express';
import { authCallback, checkAuthStatus } from '../controllers/auth.controller.js';

import { protectRoute } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protectRoute);

router.post('/callback', authCallback);
router.get('/status', checkAuthStatus);

export default router;