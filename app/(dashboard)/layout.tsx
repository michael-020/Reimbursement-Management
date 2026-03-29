import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";

const role = "manager";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar role={role} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar role={role} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}