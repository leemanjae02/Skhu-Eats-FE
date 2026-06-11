import { AuthGuard } from "@/components/auth/AuthGuard";
import { Toaster } from "@/components/ui/toaster";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard showLogo>
      <div className="flex flex-col h-full bg-white">
        {children}
      </div>
      <Toaster />
    </AuthGuard>
  );
}
