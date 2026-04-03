import { Routes, Route } from "react-router-dom";
import { HomePage } from "./features/home/HomePage";
import { ChatView } from "./features/chat/ChatView";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatView />} />
    </Routes>
  );
}
