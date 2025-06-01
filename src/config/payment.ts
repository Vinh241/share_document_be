import dotenv from "dotenv";

dotenv.config();

export const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529",
  accessKey: process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j",
  secretKey: process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa",
  apiEndpoint:
    process.env.MOMO_API_ENDPOINT ||
    "https://test-payment.momo.vn/v2/gateway/api/create",
  returnUrl:
    process.env.MOMO_RETURN_URL || "http://localhost:5173/payment-result",
  notifyUrl:
    process.env.MOMO_NOTIFY_URL ||
    "http://localhost:3000/api/payments/momo/notify",
  ipnUrl:
    process.env.MOMO_IPN_URL || "http://localhost:3000/api/payments/momo/ipn",
};

export const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE || "CGXZLS0Z",
  hashSecret:
    process.env.VNPAY_HASH_SECRET || "XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN",
  version: "2.1.0",
  command: "pay",
  currCode: "VND",
  locale: "vn",
  apiUrl:
    process.env.VNPAY_URL ||
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl:
    process.env.VNPAY_RETURN_URL || "http://localhost:5173/payment-result",
  ipnUrl:
    process.env.VNPAY_IPN_URL || "http://localhost:3000/api/payments/vnpay/ipn",
};
