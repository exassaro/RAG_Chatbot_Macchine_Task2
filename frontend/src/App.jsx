import ChatWindow from "./components/ChatWindow";

export default function App() {
  return (
    <div className="h-screen w-full bg-[#C1C2C1] flex items-center justify-center p-2 sm:p-4 lg:p-6 font-sans selection:bg-[#DBE5DD] selection:text-[#1A1A1A]">
      <div className="w-full h-full max-w-[1600px] bg-[#FAFAFA] rounded-xl sm:rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.10)] flex relative">
        <ChatWindow />
      </div>
    </div>
  );
}
