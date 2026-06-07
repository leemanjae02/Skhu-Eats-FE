import { AuthGuard } from "@/components/auth/AuthGuard";

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
    </AuthGuard>
  );
}
