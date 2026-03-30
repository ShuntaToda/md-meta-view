import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const next =
    theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const icon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "💻";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(next)}
      title={`Theme: ${theme}`}
    >
      {icon}
    </Button>
  );
}
