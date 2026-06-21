// Primary navigation, shared by the desktop header button row (AppHeader) and the
// mobile/tablet slide-out drawer (AppLayout) so both stay in sync.
export interface NavItem {
  title: string;
  icon: string;
  routeName?: string;
  href?: string;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", icon: "mdi-view-dashboard", routeName: "dashboard" },
  { title: "Flow Explorer", icon: "mdi-page-layout-header", routeName: "explore" },
  { title: "Documentation", icon: "mdi-book-open-page-variant", href: "https://github.com/mayberryjp/sando" },
  { title: "Settings", icon: "mdi-cog-outline", routeName: "settings" },
];

// External "Requests & Roadmap" link shown alongside the nav items.
export const githubLink = {
  title: "Requests & Roadmap",
  icon: "mdi-github",
  href: "https://github.com/mayberryjp/sando/issues",
};

// Social links shown on Settings → Collaboration.
export interface SocialLink {
  title: string;
  icon: string;
  href: string;
  color: string;
}

export const socialLinks: SocialLink[] = [
  {
    // /channel/<id>?sub_confirmation=1 opens the subscribe dialog (needs the
    // channel-ID URL, not /@handle). ID is for @SandoSecurityAndDhcp.
    title: "Subscribe on YouTube",
    icon: "mdi-youtube",
    href: "https://www.youtube.com/channel/UCSyhluScZC073sZgIXrqH9w?sub_confirmation=1",
    color: "#ff0000",
  },
  {
    title: "Join us on Reddit",
    icon: "mdi-reddit",
    href: "https://www.reddit.com/r/SandoSecurityAndDhcp/",
    color: "#ff4500",
  },
  {
    title: "Star us on GitHub",
    icon: "mdi-github",
    href: "https://github.com/mayberryjp/sando",
    color: "#24292e",
  },
];
