const LOGO_URL = `${import.meta.env.BASE_URL}algolympus.jpg`;

const EXAMPLES = [
  "Two Sum (LeetCode #1)",
  "Valid Parentheses (LeetCode #20)",
  "Merge Sort visualization",
  "Binary Search step-by-step",
];

interface WelcomeScreenProps {
  onSelectExample: (prompt: string) => void;
}

export function WelcomeScreen({ onSelectExample }: WelcomeScreenProps) {
  return (
    <section className="welcome-shell">
      <div className="welcome-card">
        <p className="eyebrow">Algolympus</p>
        <img src={LOGO_URL} alt="" className="welcome-logo" />
        <h1>From brute force to optimal.</h1>
        <p>
          Drop any coding problem. Get layered solutions, trade-offs, and interactive visualizations.
        </p>
        <div className="example-grid">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" className="example-chip" onClick={() => onSelectExample(example)}>
              {example}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
