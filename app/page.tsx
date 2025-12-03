import { cookies } from "next/headers";
import { ChatDashboard } from "@/components/chat-dashboard";
import { LoginScreen } from "@/components/login-screen";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("dashboard_auth")?.value === "1";

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <ChatDashboard />;
}
