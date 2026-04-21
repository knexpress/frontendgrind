import { useEffect, useState, type FormEvent } from "react";
import type { ModelAlias, ModelOption, ResponseStyle } from "../../api/conversations";
import { MAX_CHAT_MESSAGE_CHARS } from "./useChatSession";

type Props = {
  disabled: boolean;
  modelOptions: ModelOption[];
  selectedModel: ModelAlias;
  onChangeModel: (model: ModelAlias) => void;
  selectedResponseStyle: ResponseStyle;
  onChangeResponseStyle: (style: ResponseStyle) => void;
  onSend: (text: string, model: ModelAlias, responseStyle: ResponseStyle, imageFile?: File | null) => void;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const charCount = value.length;

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  function submit() {
    if (disabled || (!value.trim() && !imageFile)) return;
    onSend(value, selectedModel, selectedResponseStyle, imageFile);
    setValue("");
    setImageFile(null);
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
        <div className="composer__input-wrap">
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
          {imagePreviewUrl ? (
            <div className="composer__image-preview">
              <img src={imagePreviewUrl} alt={imageFile?.name || "Attached image"} />
              <button
                type="button"
                className="composer__image-preview-remove"
                onClick={() => setImageFile(null)}
                disabled={disabled}
              >
                Remove
              </button>
            </div>
          ) : null}
          <label
            className={`composer__image-upload${imageFile ? " is-selected" : ""}`}
            title={imageFile ? `Change image: ${imageFile.name}` : "Attach image"}
          >
            <input
              type="file"
              accept="image/*"
              disabled={disabled}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
              }}
            />
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M8.7 7.4 5.9 10.2a4.2 4.2 0 1 0 6 6l6.6-6.6a3 3 0 0 0-4.2-4.2l-6.3 6.3a1.8 1.8 0 1 0 2.5 2.5l5.3-5.3" />
            </svg>
          </label>
        </div>
        <button
          type="submit"
          className="composer__submit"
          disabled={disabled || (!value.trim() && !imageFile)}
          aria-label="Send message"
        >
          <span className="composer__submit-label">Send</span>
          <span className="composer__submit-glow" aria-hidden="true" />
        </button>
      </div>
      <p className="composer__hint">
        Enter to send · Shift+Enter for new line · Optional image upload · {charCount}/{MAX_CHAT_MESSAGE_CHARS}
      </p>
    </form>
  );
}
