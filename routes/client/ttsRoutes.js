const express = require('express');
const router = express.Router();
const ClientTtsController = require('../../controllers/client/ttsController');
const { authenticateToken } = require('../../middlewares/authMiddleware');
const { checkTtsAttributes } = require('../../middlewares/rbacMiddleware');
const { checkVoiceAccess } = require('../../middlewares/tierMiddleware');
const { validatePreviewInput, validateGenerateInput } = require('../../validators/ttsValidator');

// Preview: Auth → Validate Input → Stream Audio
router.post('/preview', authenticateToken, validatePreviewInput, ClientTtsController.preview);

// Generate: Auth → Validate Input → Check Tier → Check Token/Limit → Generate
router.post('/generate', authenticateToken, validateGenerateInput, checkVoiceAccess, checkTtsAttributes, ClientTtsController.generate);

// History
router.get('/history', authenticateToken, ClientTtsController.getHistory);
router.get('/history/stream/:id', ClientTtsController.streamHistoryAudio);
router.patch('/history/:id/folder', authenticateToken, ClientTtsController.updateAudioFolder);
router.post('/history/:id/folder', authenticateToken, ClientTtsController.updateAudioFolder);
router.put('/history/:id/folder', authenticateToken, ClientTtsController.updateAudioFolder);
router.patch('/history/:id/title', authenticateToken, ClientTtsController.updateAudioTitle);
router.post('/history/:id/title', authenticateToken, ClientTtsController.updateAudioTitle);
router.put('/history/:id/title', authenticateToken, ClientTtsController.updateAudioTitle);
router.delete('/history/:id', authenticateToken, ClientTtsController.deleteHistory);

// Folders
router.get('/folders', authenticateToken, ClientTtsController.getFolders);
router.post('/folders', authenticateToken, ClientTtsController.createFolder);
router.delete('/folders/:id', authenticateToken, ClientTtsController.deleteFolder);

module.exports = router;
