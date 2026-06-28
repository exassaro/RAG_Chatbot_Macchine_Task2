import ChatWindow from "./components/ChatWindow";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 md:p-6 lg:p-10 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full h-full md:h-[90vh] max-h-[1000px] md:rounded-[24px] bg-white flex overflow-hidden md:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] md:ring-1 md:ring-gray-200 relative">
        <ChatWindow />
      </div>
    </div>
  );
}
