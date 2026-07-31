const express = require('express');
const router = express.Router();
const VoiceAdminController = require('../../controllers/admin/voiceAdminController');
const { requirePermission } = require('../../middlewares/adminMiddleware');

router.get('/', requirePermission('voices_view'), VoiceAdminController.getVoices);
router.post('/', requirePermission('voices_create'), VoiceAdminController.createVoice);
router.post('/generate-sample', VoiceAdminController.generateSampleAudio);
router.put('/:id', requirePermission('voices_edit'), VoiceAdminController.updateVoice);
router.delete('/:id', requirePermission('voices_delete'), VoiceAdminController.deleteVoice);

module.exports = router;
