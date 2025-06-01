const crypto = require('crypto');

// Thông tin cấu hình VNPay
const config = {
    tmnCode: 'DEMOV210',
    hashSecret: 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ',
    version: '2.1.0',
    command: 'pay',
    currCode: 'VND',
    locale: 'vn',
    apiUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: 'http://localhost:5173/payment-result',
    ipnUrl: 'http://localhost:3000/api/payments/vnpay/ipn'
};

// Hàm thanh toán VNPay
function createVnpayPayment() {
    try {
        // Tạo ID duy nhất cho giao dịch
        const txnRef = `${Date.now()}_test`;
        const amount = 50000; // 50,000 VND
        const ipAddr = "127.0.0.1";

        // Create date format: yyyyMMddHHmmss
        const now = new Date();
        const createDate = now.toISOString()
            .replace(/[-T:]/g, "")
            .replace(/\.\d{3}Z$/, "")
            .substring(0, 14);

        // Set expire date (15 minutes from now)
        const expireDate = new Date(now.getTime() + 15 * 60 * 1000);
        const vnpExpireDate = expireDate.toISOString()
            .replace(/[-T:]/g, "")
            .replace(/\.\d{3}Z$/, "")
            .substring(0, 14);

        // Build VNPay parameters
        const vnpParams = {
            vnp_Version: config.version,
            vnp_Command: config.command,
            vnp_TmnCode: config.tmnCode,
            vnp_Amount: (amount * 100).toString(), // VNPay requires amount * 100
            vnp_CurrCode: config.currCode,
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: "Test payment from bookstore VNPay",
            vnp_OrderType: "other",
            vnp_Locale: config.locale,
            vnp_ReturnUrl: config.returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: vnpExpireDate
        };

        // Sort parameters for hash calculation
        const sortedParams = Object.keys(vnpParams)
            .sort()
            .reduce((result, key) => {
                result[key] = vnpParams[key];
                return result;
            }, {});

        // Create hash data string
        const hashData = Object.keys(sortedParams)
            .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
            .join('&');

        console.log("VNPay hash data:", hashData);

        // Generate secure hash
        const secureHash = crypto
            .createHmac("sha512", config.hashSecret)
            .update(hashData)
            .digest("hex");

        console.log("VNPay secure hash:", secureHash);

        // Add secure hash to parameters
        sortedParams.vnp_SecureHash = secureHash;

        // Build payment URL
        const queryString = Object.keys(sortedParams)
            .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
            .join('&');

        const paymentUrl = `${config.apiUrl}?${queryString}`;

        console.log("VNPay payment URL:", paymentUrl);
        console.log("\nSuccess! Copy and paste this URL into your browser to test VNPay payment:");
        console.log(paymentUrl);

        return {
            success: true,
            paymentUrl: paymentUrl,
            txnRef: txnRef
        };

    } catch (error) {
        console.error("Error:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Chạy thử nghiệm
console.log("=".repeat(80));
console.log("VNPAY PAYMENT TEST");
console.log("=".repeat(80));
createVnpayPayment(); 