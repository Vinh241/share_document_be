const axios = require('axios');
const crypto = require('crypto');

// Thông tin cấu hình MoMo
const config = {
    partnerCode: 'MOMOBKUN20180529',
    accessKey: 'klm05TvNBzhg7h7j',
    secretKey: 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa',
    apiEndpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    returnUrl: 'http://localhost:5173/payment/momo-return',
    ipnUrl: 'http://localhost:3000/api/payments/momo/ipn'
};

// Hàm thanh toán MoMo
async function createMomoPayment() {
    try {
        // Tạo ID duy nhất cho giao dịch
        const requestId = `${Date.now()}_test`;
        const orderId = requestId;

        // Data thanh toán
        const rawData = {
            partnerCode: config.partnerCode,
            accessKey: config.accessKey,
            requestId: requestId,
            amount: "30000",
            orderId: orderId,
            orderInfo: "Test payment from bookstore",
            redirectUrl: config.returnUrl,
            ipnUrl: config.ipnUrl,
            extraData: Buffer.from(JSON.stringify({ orderId: 123 })).toString('base64'),
            requestType: "payWithATM",
            lang: "vi"
        };

        // Tạo signature
        const rawSignature =
            `accessKey=${rawData.accessKey}` +
            `&amount=${rawData.amount}` +
            `&extraData=${rawData.extraData}` +
            `&ipnUrl=${rawData.ipnUrl}` +
            `&orderId=${rawData.orderId}` +
            `&orderInfo=${rawData.orderInfo}` +
            `&partnerCode=${rawData.partnerCode}` +
            `&redirectUrl=${rawData.redirectUrl}` +
            `&requestId=${rawData.requestId}` +
            `&requestType=${rawData.requestType}`;

        console.log("Raw signature:", rawSignature);

        const signature = crypto
            .createHmac("sha256", config.secretKey)
            .update(rawSignature)
            .digest("hex");

        console.log("Generated signature:", signature);

        // Dữ liệu cuối cùng gửi đi
        const requestData = {
            ...rawData,
            signature
        };

        console.log("Sending request to MoMo:", JSON.stringify(requestData, null, 2));

        // Gửi yêu cầu đến MoMo
        const response = await axios.post(config.apiEndpoint, requestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("MoMo response:", JSON.stringify(response.data, null, 2));

        if (response.data.resultCode === 0) {
            console.log("Success! Payment URL:", response.data.payUrl);
        } else {
            console.error("Error:", response.data.message);
        }

        return response.data;
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

// Chạy thử nghiệm
createMomoPayment(); 