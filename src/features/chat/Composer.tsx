import { useState, type FormEvent } from "react";

type Props = {
  disabled: boolean;
  onSend: (text: string) => void;
};

export function Composer({ disabled, onSend }: Props) {
  const [value, setValue] = useState("");

  function submit() {
    if (disabled || !value.trim()) return;
    onSend(value);
    setValue("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <div className="composer__field">
        <textarea
          className="composer__input"
          rows={3}
          placeholder="Message GRIND…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          type="submit"
          className="composer__submit"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <span className="composer__submit-label">Send</span>
          <span className="composer__submit-glow" aria-hidden="true" />
        </button>
      </div>
      <p className="composer__hint">Enter to send · Shift+Enter for new line</p>
    </form>
  );
}
