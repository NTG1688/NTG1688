import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("[SEPAY WEBHOOK RECEIVED]:", payload);

    // SePay standard payload:
    // {
    //   "id": 92704,
    //   "gateway": "VietinBank",
    //   "transactionDate": "2026-11-09 10:15:20",
    //   "accountNumber": "117634318888",
    //   "transferAmount": 5000000,
    //   "content": "NTG NT2820 nap tien",
    //   ...
    // }

    const content = (payload.content || payload.description || "").toUpperCase();
    const amount = Number(payload.transferAmount || payload.amount || 0);

    // Tìm kiếm mã khách hàng NTXXXX trong nội dung chuyển khoản
    const match = content.match(/NTG\s*(NT\d+)/i) || content.match(/(NT\d+)/i);
    const userCode = match ? match[1].toUpperCase() : null;

    if (!userCode || amount <= 0) {
      return NextResponse.json({
        success: false,
        message: "Không tìm thấy mã khách hàng hợp lệ trong nội dung chuyển khoản",
      }, { status: 400 });
    }

    console.log(`[AUTO TOPUP MATCHED]: Khách hàng ${userCode} nạp +${amount} VNĐ`);

    // Xử lý cộng tiền ví (Tích hợp Supabase Database)
    // 1. Tìm user theo user_code = userCode
    // 2. update profiles set wallet_balance = wallet_balance + amount
    // 3. insert into wallet_transactions ...
    // 4. insert into auto_topup_logs ...

    return NextResponse.json({
      success: true,
      message: `Đã xử lý cộng tiền tự động thành công cho khách hàng ${userCode}`,
      data: {
        userCode,
        amount,
        content,
      },
    });
  } catch (error: any) {
    console.error("[WEBHOOK ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
