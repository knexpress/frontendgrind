import { useState, type FormEvent } from "react";
import type { ModelAlias, ModelOption, ResponseStyle } from "../../api/conversations";
import { MAX_CHAT_MESSAGE_CHARS } from "./useChatSession";

type Props = {
  disabled: boolean;
  modelOptions: ModelOption[];
  selectedModel: ModelAlias;
  onChangeModel: (model: ModelAlias) => void;
  selectedResponseStyle: ResponseStyle;
  onChangeResponseStyle: (style: ResponseStyle) => void;
  onSend: (text: string, model: ModelAlias, responseStyle: ResponseStyle) => void;
};

export function Composer({
  disabled,
  modelOptions,
  selectedModel,
  onChangeModel,
  selectedResponseStyle,
  onChangeResponseStyle,
  onSend,
}: Props) {
  const [value, setValue] = useState("");
  const charCount = value.length;

  function submit() {
    if (disabled || !value.trim()) return;
    onSend(value, selectedModel, selectedResponseStyle);
    setValue("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <div className="composer__controls">
        <div className="composer__control-group">
          <label className="composer__model-label" htmlFor="model-selector">
            Model
          </label>
          <select
            id="model-selector"
            className="composer__model-select"
            value={selectedModel}
            onChange={(e) => onChangeModel(e.target.value as ModelAlias)}
            disabled={disabled}
          >
            {modelOptions.map((m) => (
              <option key={m.alias} value={m.alias}>
                {m.alias}
              </option>
            ))}
          </select>
        </div>
        <div className="composer__control-group">
          <label className="composer__model-label" htmlFor="response-style-selector">
            Answer style
          </label>
          <select
            id="response-style-selector"
            className="composer__model-select"
            value={selectedResponseStyle}
            onChange={(e) => onChangeResponseStyle(e.target.value as ResponseStyle)}
            disabled={disabled}
          >
            <option value="auto">Auto</option>
            <option value="short">Short</option>
            <option value="bullet">Bullet points</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
      </div>
      <div className="composer__field">
        <textarea
          className="composer__input"
          rows={3}
          placeholder="Message GRIND…"
          value={value}
          maxLength={MAX_CHAT_MESSAGE_CHARS}
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
      <p className="composer__hint">
        Enter to send · Shift+Enter for new line · {charCount}/{MAX_CHAT_MESSAGE_CHARS}
      </p>
    </form>
  );
}
