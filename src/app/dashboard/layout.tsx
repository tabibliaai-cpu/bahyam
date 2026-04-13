import DashboardSidebar from '@/components/dashboard/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <DashboardSidebar />
      {/* Main content area: offset by sidebar width on desktop, full width on mobile */}
      <main
        className="min-h-screen pb-20 md:pb-0"
        style={{
          marginLeft: 0,
        }}
      >
        <div className="md:ml-[240px] min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
