/**
 * Dịch vụ tạo mã VietQR Chuẩn EMVCo (NAPAS 24/7)
 * Tự động gắn Mã Khách Hàng (UserCode) vào nội dung để đối soát và cộng tiền ví 100% tự động
 */

export interface VietQRParams {
  bankBin: string; // VD: 970415 (VietinBank), 970422 (MBBank)
  accountNumber: string; // VD: 117634318888
  accountName: string;
  amount?: number;
  memo: string; // VD: NTG NT2820
}

export function generateVietQRUrl(params: VietQRParams): string {
  const { bankBin, accountNumber, amount, memo } = params;
  const encodedMemo = encodeURIComponent(memo.trim());
  const amountStr = amount && amount > 0 ? `&amount=${Math.round(amount)}` : "";
  
  // Sử dụng chuẩn API mở vietqr.io / quicklink
  return `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png?addInfo=${encodedMemo}${amountStr}&accountName=${encodeURIComponent(params.accountName)}`;
}
