import { Link, useLocation } from 'react-router-dom';

export function PlaceholderPage() {
  const location = useLocation();
  const title = location.pathname === '/session/setup' ? 'Prepare your focus session' : 'Coming into focus';
  return <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-8 text-center"><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#4d8ac5]">Reflow</p><h1 className="text-3xl font-semibold tracking-tight text-[#17365d]">{title}</h1><p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">This space is reserved for the next increment. Your dashboard is ready when you are.</p><Link to="/dashboard" className="mt-7 rounded-xl bg-[#17365d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#204974]">Back to dashboard</Link></div>;
}
