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
    process.env.MOMO_RETURN_URL || "http://localhost:5173/payment/momo-return",
  notifyUrl:
    process.env.MOMO_NOTIFY_URL ||
    "http://localhost:3000/api/payments/momo/notify",
  ipnUrl:
    process.env.MOMO_IPN_URL || "http://localhost:3000/api/payments/momo/ipn",
};
