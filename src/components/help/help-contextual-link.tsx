import { CircleHelp } from "lucide-react";
import { Link } from "react-router";
import { trackHelpEvent } from "./help-analytics";
export function HelpContextualLink({ href, children }: { href: string; children: React.ReactNode }) { return <Link to={href} onClick={() => trackHelpEvent("help_contextual_link_clicked", { href })} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-text-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><CircleHelp size={15} aria-hidden="true" />{children}</Link>; }
