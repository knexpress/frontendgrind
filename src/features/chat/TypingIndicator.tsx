export function TypingIndicator() {
  return (
    <li className="message message--assistant message--typing" aria-live="polite" aria-label="GRIND is typing">
      <span className="message__label">GRIND</span>
      <div className="typing">
        <span className="typing__text">GRIND is typing</span>
        <span className="typing__dots" aria-hidden="true">
          <span className="typing__dot" />
          <span className="typing__dot" />
          <span className="typing__dot" />
        </span>
      </div>
    </li>
  );
}
