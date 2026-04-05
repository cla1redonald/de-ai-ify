// TODO(@engineer): Implement <VerdictCopy />.
//
// Props:
//   text: string   (1–2 editorial sentences from scoring engine)
//
// Style: text-base text-text-primary font-medium
//   with a subtle left border accent: border-l-2 border-accent pl-3
//
// See docs/design.md §"Verdict copy".

interface VerdictCopyProps {
  text: string;
}

export default function VerdictCopy({ text }: VerdictCopyProps) {
  return (
    <p className="text-base text-text-primary font-medium border-l-2 border-accent pl-3">
      {text}
    </p>
  );
}
