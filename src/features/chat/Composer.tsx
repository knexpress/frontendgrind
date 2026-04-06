import { useState, type FormEvent } from "react";
import type { ModelAlias, ModelOption } from "../../api/conversations";

type Props = {
  disabled: boolean;
  modelOptions: ModelOption[];
  selectedModel: ModelAlias;
  onChangeModel: (model: ModelAlias) => void;
  onSend: (text: string, model: ModelAlias) => void;
};

export function Composer({ disabled, modelOptions, selectedModel, onChangeModel, onSend }: Props) {
  const [value, setValue] = useState("");

  function submit() {
    if (disabled || !value.trim()) return;
    onSend(value, selectedModel);
    setValue("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <div className="composer__controls">
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
