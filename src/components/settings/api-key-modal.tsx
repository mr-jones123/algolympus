import { useCallback, useEffect, useState, type ComponentProps } from "react";
import { KEY_PLACEHOLDER } from "@/types";

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0];

interface ApiKeyModalProps {
  isOpen: boolean;
  initialValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
  onRemove: () => void;
  validate: (value: string) => boolean;
}

export function ApiKeyModal({
  isOpen,
  initialValue,
  onSave,
  onClose,
  onRemove,
  validate,
}: ApiKeyModalProps) {
  const [draft, setDraft] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(initialValue);
      setError(null);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = useCallback(
    (event: FormSubmitEvent) => {
      event.preventDefault();
      const trimmed = draft.trim();
      if (!validate(trimmed)) {
        setError("Gemini keys should start with AIza and be at least 20 characters.");
        return;
      }

      onSave(trimmed);
      onClose();
    },
    [draft, onClose, onSave, validate],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="API key settings">
        <div className="modal-header">
          <h2>API key</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close settings">
            <span>+</span>
          </button>
        </div>

        <p className="modal-copy">
          Your key is stored locally in this browser and only sent directly to Google.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <label htmlFor="api-key-input">Gemini API key</label>
          <input
            id="api-key-input"
            type="password"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={KEY_PLACEHOLDER}
            autoComplete="off"
            spellCheck={false}
          />

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-subtle"
              onClick={() => {
                onRemove();
                setDraft("");
                setError(null);
              }}
            >
              Remove key
            </button>
            <button type="submit" className="btn-primary">
              Save key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
