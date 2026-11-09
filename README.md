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

## Tests

```bash
npm test
```

Port validation and ignore-list request regression tests use Node's built-in test runner.

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

## Dashboard detections

The dashboard loads the full list from `GET /api/alerts/recent`, sorts it by
last seen, and filters and paginates it locally. The table defaults to 50 rows
per page, not 50 detections total. Time filters apply to the full loaded list.

## Allow-list ports

Allow-list actions preserve recorded port `0`, including ICMP and ICMPv6 flows.
Zero is a literal recorded port value, not a wildcard or an ICMP type/code filter.
Existing rule scopes and identifiers are unchanged; only an explicit any-port
action sends `"*"`.

The shared `POST /api/ignorelist` service validates destination ports (and source
ports when provided) and serializes decimal integer text as JSON numbers in the
range 0-65535. Missing, null, blank, and invalid ports are rejected before sending.
Backend validation errors are displayed without reporting success or refreshing
away the selected alert. Saved zero-port rules display `0` after reloading.
There is currently no manual allow-list rule form in this frontend.

## Technologies

- Vue 3
- TypeScript
- Socket.IO (for real-time updates)