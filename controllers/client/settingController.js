const Setting = require('../../models/settingModel');

class SettingController {
    // Lấy thông tin cài đặt công khai cho Client (Donate, SiteName, Google ClientID...)
    static async getPublicSettings(req, res) {
        try {
            let setting = await Setting.findOne();
            if (!setting) {
                setting = await Setting.create({
                    donateBankId: 'MB',
                    donateAccountNo: '0912572421202',
                    donateAccountName: 'LÂM CHÍ LỘC'
                });
            }

            // Chỉ trả về các thông tin công khai an toàn (KHÔNG trả về Secret Key)
            return res.json({
                donateBankId: setting.donateBankId || 'MB',
                donateAccountNo: setting.donateAccountNo || '0912572421202',
                donateAccountName: setting.donateAccountName || 'LÂM CHÍ LỘC',
                googleClientId: setting.googleClientId || '',
                siteName: setting.siteName || 'Veltrix Voice',
                contactEmail: setting.contactEmail || 'support@veltrix.ai',
                maintenanceMode: setting.maintenanceMode || false
            });
        } catch (err) {
            return res.status(500).json({ error: 'Lỗi lấy thông tin cài đặt: ' + err.message });
        }
    }
}

module.exports = SettingController;
