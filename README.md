# Sando Website

A Vue.js frontend for displaying IDS (Intrusion Detection System) statistics.

## Prerequisites

- Node.js (latest LTS version recommended)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```
The application will be available at http://localhost:3030

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Selecting an unused host IP

In Edit Host, hosts without an IPv4 address show a Local Network selector below
the IP Address input (also available when the input is cleared). Choose a configured
IPv4 network, labeled with its firewall interface name and CIDR, then click
**AUTO-SELECT UNUSED IP** to populate the IP Address field.

This calls `GET /api/localhosts/available-ip?network=<CIDR>`. The lookup excludes
known hosts and configured routers, but does not reserve, probe, or save the address.
Click **Save Changes** to apply it. Exhausted networks and lookup failures are
shown as notifications. Configure networks in Local Networks Configuration.

## Technologies

- Vue 3
- TypeScript
- Socket.IO (for real-time updates)