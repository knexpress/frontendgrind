import type { ConversationMessage } from "../../api/conversations";
import { TypingIndicator } from "./TypingIndicator";

type Props = {
  messages: ConversationMessage[];
  showTyping: boolean;
  sessionLoading: boolean;
};

export function MessageList({ messages, showTyping, sessionLoading }: Props) {
  const showEmptyHint =
    messages.length === 0 && !sessionLoading && !showTyping;

  return (
    <ul className="message-list">
      {sessionLoading && messages.length === 0 && (
        <li className="message message--assistant message--skeleton" aria-busy="true">
          <span className="message__label">GRIND</span>
          <div className="skeleton-lines">
            <span className="skeleton-line skeleton-line--long" />
            <span className="skeleton-line skeleton-line--medium" />
            <span className="skeleton-line skeleton-line--short" />
          </div>
        </li>
      )}
      {showEmptyHint && (
        <li className="message message--empty message--enter">
          <p>
            Tell GRIND what you sell, where you are, and what you want to achieve. Share rough
            numbers when you can so the plan stays realistic.
          </p>
        </li>
      )}
      {messages.map((m, i) => (
        <li
          key={`${i}-${m.role}-${m.content.slice(0, 24)}`}
          className={`message message--${m.role} message--enter`}
          style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
        >
          <span className="message__label">{m.role === "user" ? "You" : "GRIND"}</span>
          <p className="message__text">{m.content}</p>
        </li>
      ))}
      {showTyping && <TypingIndicator />}
    </ul>
  );
}
