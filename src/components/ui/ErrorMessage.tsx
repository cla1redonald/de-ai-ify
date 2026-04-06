interface ErrorMessageProps {
  message: string;
  action?: { label: string; onClick: () => void };
}

export default function ErrorMessage({ message, action }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-2 text-score-red text-sm mt-2">
      <span aria-hidden="true" className="mt-0.5 flex-shrink-0">⚠</span>
      <span>
        {message}
        {action && (
          <button
            onClick={action.onClick}
            className="underline underline-offset-2 hover:no-underline ml-1"
          >
            {action.label}
          </button>
        )}
      </span>
    </div>
  );
}
