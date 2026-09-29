interface ReflowCharacterProps {
  className?: string;
  size?: "small" | "large";
  variant?: "logo" | "hero" | "card" | "session";
}

const sources = {
  logo: "/assets/reflow-logo.png",
  hero: "/assets/reflow-character-hero.png",
  card: "/assets/reflow-character-card.png",
  session: "/assets/character.png",
};

export function ReflowCharacter({
  className = "",
  size = "large",
  variant = size === "small" ? "logo" : "hero",
}: ReflowCharacterProps) {
  const dimensions = size === "large" ? "h-36 w-36" : "h-12 w-12";
  return (
    <img
      className={`${dimensions} object-contain ${className}`}
      src={sources[variant]}
      alt="Reflow character"
    />
  );
}
