import { Link } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";

import { site } from "@/config/site";
import { trackBookClick } from "@/lib/analytics";

/**
 * "Book tint online" — sits next to the "Get a quote" buttons. Renders nothing
 * when online booking is switched off (site.booking.enabled), so every
 * placement disappears with one flag.
 */
export function BookButton({
  location,
  className = "btn btn-ghost btn-lg",
  label = "Book Tint Online",
  onClick,
}: {
  location: string;
  className?: string;
  label?: string;
  onClick?: () => void;
}) {
  if (!site.booking.enabled) return null;
  return (
    <Link
      to="/book"
      onClick={() => {
        trackBookClick(location, "Window Tint");
        onClick?.();
      }}
      className={className}
    >
      <CalendarCheck className="h-4 w-4" />
      {label}
    </Link>
  );
}
