import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://flcqouvjmuhfuemybokk.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY3FvdXZqbXVoZnVlbXlib2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTQ0MzIsImV4cCI6MjEwOTczMDQzMn0.dcbkiDMt04w4M_e1Jplzz7lS_VqJsgfz9200AG2MpgM",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const demoRoleCookie = request.cookies.get("ntg_role")?.value;

  // Các route công khai không cần đăng nhập
  const publicPaths = ["/", "/login", "/register", "/forgot-password"];
  const isPublicPath = publicPaths.includes(pathname);
  const isApiPath = pathname.startsWith("/api/");

  const isAuthenticated = !!user || !!demoRoleCookie;

  // Nếu chưa đăng nhập và truy cập route cần auth → redirect về /login
  if (!isAuthenticated && !isPublicPath && !isApiPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Nếu đã đăng nhập và truy cập login/register → redirect về dashboard thích hợp
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    if (demoRoleCookie === "admin") {
      url.pathname = "/admin/dashboard";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  // Admin routes: kiểm tra quyền admin/staff
  if (pathname.startsWith("/admin")) {
    if (demoRoleCookie === "admin") {
      return supabaseResponse;
    }

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
