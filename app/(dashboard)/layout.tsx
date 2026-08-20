import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/layout/Nav";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middlewareで基本的にガードされるが、Server Component側でも二重チェック
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Nav />
      <main className="flex-1 pb-16 md:pb-0">
        <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
      </main>
      <MobileTabBar />
    </div>
  );
}
