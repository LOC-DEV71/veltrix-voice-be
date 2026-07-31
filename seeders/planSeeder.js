require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Plan = require('../models/planModel');

const PLANS = [
    {
        name: 'Miễn phí',
        nameEn: 'Free',
        code: 'FREE',
        monthlyPrice: 0,
        yearlyPrice: 0,
        monthlyPriceVND: 0,
        yearlyPriceVND: 0,
        tokenText: '2K token/ngày (Reset 00:00)',
        tokenTextEn: '2K tokens/day (Reset 00:00)',
        tokensPerMonth: 2000, 
        maxCharsPerRequest: 1000,
        features: [
            '2K token/ngày (Reset 00:00)',
            'Tất cả giọng đọc',
            'Đa ngôn ngữ',
            'Tải MP3',
            'API access'
        ],
        featuresEn: [
            '2K tokens/day (Reset 00:00)',
            'All voices',
            'Multi-language',
            'Download MP3',
            'API access'
        ],
        isFeatured: true,
        isPopular: false,
        priority: 0,
        status: 'ACTIVE'
    },
    {
        name: 'Basic',
        nameEn: 'Basic',
        code: 'BASIC',
        monthlyPrice: 7.9,
        yearlyPrice: 66,
        monthlyPriceVND: 190000,
        yearlyPriceVND: 408000,
        tokenText: '200K token/tháng',
        tokenTextEn: '200K tokens/month',
        tokensPerMonth: 200000,
        maxCharsPerRequest: 5000,
        features: [
            '200K token/tháng',
            'Tất cả giọng đọc',
            'Đa ngôn ngữ',
            'Tải MP3 + ZIP',
            'API access'
        ],
        featuresEn: [
            '200K tokens/month',
            'All voices',
            'Multi-language',
            'Download MP3 + ZIP',
            'API access'
        ],
        isFeatured: false,
        isPopular: false,
        priority: 10,
        status: 'ACTIVE'
    },
    {
        name: 'Creator',
        nameEn: 'Creator',
        code: 'CREATOR',
        monthlyPrice: 14.9,
        yearlyPrice: 158.4,
        monthlyPriceVND: 350000,
        yearlyPriceVND: 708000,
        tokenText: '600K token/tháng',
        tokenTextEn: '600K tokens/month',
        tokensPerMonth: 600000,
        maxCharsPerRequest: 10000,
        features: [
            '600K token/tháng',
            'Tất cả giọng đọc',
            'Đa ngôn ngữ',
            'Tải MP3 + ZIP',
            'Hỗ trợ ưu tiên',
            'API access'
        ],
        featuresEn: [
            '600K tokens/month',
            'All voices',
            'Multi-language',
            'Download MP3 + ZIP',
            'Priority support',
            'API access'
        ],
        isFeatured: true,
        isPopular: true,
        priority: 20,
        status: 'ACTIVE'
    },
    {
        name: 'Pro',
        nameEn: 'Pro',
        code: 'PRO',
        monthlyPrice: 39,
        yearlyPrice: 408,
        monthlyPriceVND: 950000,
        yearlyPriceVND: 2148000,
        tokenText: '2M token/tháng',
        tokenTextEn: '2M tokens/month',
        tokensPerMonth: 2000000,
        maxCharsPerRequest: 20000,
        features: [
            '2M token/tháng',
            'Tất cả giọng đọc',
            'Đa ngôn ngữ',
            'Voice Clone AI',
            'Tải MP3 + ZIP',
            'Hỗ trợ ưu tiên',
            'API access'
        ],
        featuresEn: [
            '2M tokens/month',
            'All voices',
            'Multi-language',
            'Voice Clone AI',
            'Download MP3 + ZIP',
            'Priority support',
            'API access'
        ],
        isFeatured: false,
        isPopular: false,
        priority: 30,
        status: 'ACTIVE'
    },
    {
        name: 'Custom',
        nameEn: 'Custom',
        code: 'CUSTOM',
        monthlyPrice: 0,
        yearlyPrice: 0,
        monthlyPriceVND: 0,
        yearlyPriceVND: 0,
        tokenText: 'Số lượng token tùy chỉnh',
        tokenTextEn: 'Custom token amount',
        tokensPerMonth: 99999999, 
        maxCharsPerRequest: 999999,
        features: [
            'Số lượng token tùy chỉnh',
            'Hỗ trợ 24/7',
            'API access riêng',
            'Custom voice riêng'
        ],
        featuresEn: [
            'Custom token amount',
            '24/7 support',
            'Dedicated API access',
            'Custom voice'
        ],
        isFeatured: true,
        isPopular: false,
        priority: 99,
        status: 'ACTIVE'
    }
];

async function seedPlans() {
    try {
        console.log('\n🌱 === PLAN SEEDER BẮT ĐẦU ===\n');

        await mongoose.connect(process.env.MONGO_URI);
        console.log('🍃 Kết nối MongoDB Atlas thành công!\n');

        for (const planData of PLANS) {
            const existingPlan = await Plan.findOne({ code: planData.code });
            if (existingPlan) {
                console.log(`   ⏭️  Gói ${planData.name} (${planData.code}) đã tồn tại - cập nhật...`);
                await Plan.updateOne({ code: planData.code }, { $set: planData });
            } else {
                await Plan.create(planData);
                console.log(`   ✅ Tạo thành công gói: ${planData.name} (${planData.code})`);
            }
        }

        console.log('\n🌱 === PLAN SEEDER HOÀN TẤT ===\n');

    } catch (err) {
        console.error('❌ Plan Seeder lỗi:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedPlans();
