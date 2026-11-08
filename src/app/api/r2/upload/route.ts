import { NextRequest, NextResponse } from "next/server";
import { createPresignedUploadUrl } from "@/lib/cloudflare-r2";

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType, folder } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Thiếu tên file hoặc kiểu nội dung (contentType)" },
        { status: 400 }
      );
    }

    const { uploadUrl, publicUrl, key } = await createPresignedUploadUrl(
      filename,
      contentType,
      folder || "orders"
    );

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error: any) {
    console.error("[CLOUDFLARE R2 UPLOAD ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi tạo URL upload Cloudflare R2" },
      { status: 500 }
    );
  }
}
