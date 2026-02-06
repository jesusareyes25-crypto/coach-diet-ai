import DashboardClient from "@/components/DashboardClient";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-bg">
      <DashboardClient />
    </main>
  );
}
