// Primary navigation, shared by the desktop header button row (AppHeader) and the
// mobile/tablet slide-out drawer (AppLayout) so both stay in sync.
export interface NavItem {
  title: string;
  icon: string;
  routeName: string;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", icon: "mdi-view-dashboard", routeName: "dashboard" },
  { title: "Flow Explorer", icon: "mdi-page-layout-header", routeName: "explore" },
  { title: "Documentation", icon: "mdi-book-open-page-variant", routeName: "documentation" },
  { title: "Settings", icon: "mdi-cog-outline", routeName: "settings" },
];

// External "Requests & Roadmap" link shown alongside the nav items.
export const githubLink = {
  title: "Requests & Roadmap",
  icon: "mdi-github",
  href: "https://github.com/mayberryjp/sando/issues",
};
