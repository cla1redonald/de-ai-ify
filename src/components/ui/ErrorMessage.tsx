// TODO(@engineer): Implement <ErrorMessage />.
//
// Props:
//   message: string
//   action?: { label: string; onClick: () => void }
//
// Style: text-score-red text-sm. Optional action renders as a plain underline button.
// Used for URL scrape failures and inline validation errors.
//
// See docs/design.md §"<ErrorMessage />".

interface ErrorMessageProps {
  message: string;
  action?: { label: string; onClick: () => void };
}

export default function ErrorMessage({ message, action }: ErrorMessageProps) {
  // TODO: implement
  return (
    <p className="text-score-red text-sm">
      {message}
      {action && (
        <button onClick={action.onClick} className="ml-2 underline">
          {action.label}
        </button>
      )}
    </p>
  );
}
