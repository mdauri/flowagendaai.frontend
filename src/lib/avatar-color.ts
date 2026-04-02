/**
 * Get a consistent avatar color based on professional ID
 */
export function getAvatarColor(professionalId: string): string {
  const colors = [
    "#FFB38F", // Pastel Orange
    "#FFD98B", // Pastel Yellow
    "#A8E6CF", // Pastel Green
    "#AED9E9", // Pastel Blue
    "#D4A5E9", // Pastel Purple
    "#FFB3D9", // Pastel Pink
    "#C9D4D9", // Pastel Gray
    "#FF9B8F", // Pastel Coral
  ];

  const hash = professionalId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  const parts = name.split(" ").filter((part) => part.length > 0);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "";
}
