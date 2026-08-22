import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl shadow-md p-8 sm:p-10 flex items-center justify-between border border-slate-800">
          <div className="text-white">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || 'Admin'}
            </h2>
            <p className="mt-2 text-blue-100 text-sm sm:text-base max-w-xl leading-relaxed">
              Your secure workspace is ready. The Area 5 module will inject your storage analytics, recent uploads, and encrypted file metrics into this dashboard.
            </p>
          </div>
          <div className="hidden sm:block">
            {/* Decorative Security Icon */}
            <div className="h-16 w-16 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center border border-white/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Scaffolding grid for Area 5's Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Wider - For File Lists or Upload Component) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border-2 border-zinc-200 border-dashed p-6 min-h-[350px] flex flex-col items-center justify-center bg-zinc-50/50 transition-colors hover:bg-zinc-50">
              <span className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                [Area 5 Drop Zone]
              </span>
              <p className="text-zinc-500 text-sm">File Upload & Document List Component goes here</p>
            </div>
          </div>

          {/* Right Column (Narrower - For Stat Cards or Storage Usage) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border-2 border-zinc-200 border-dashed p-6 min-h-[163px] flex flex-col items-center justify-center bg-zinc-50/50 transition-colors hover:bg-zinc-50">
              <span className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-1 text-center">
                [Area 5 Drop Zone]
              </span>
              <p className="text-zinc-500 text-sm text-center">Storage Analytics Widget</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border-2 border-zinc-200 border-dashed p-6 min-h-[163px] flex flex-col items-center justify-center bg-zinc-50/50 transition-colors hover:bg-zinc-50">
              <span className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-1 text-center">
                [Area 5 Drop Zone]
              </span>
              <p className="text-zinc-500 text-sm text-center">Security Reports Widget</p>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}