// Snook recreational harvest season windows, per FWC's regional management
// regions. Dates are the same every year (FWC hasn't changed these windows
// in the current regional-management framework), so this can run forever
// without needing another manual update like the one that prompted this file.
//
// Source: FWC regional snook season releases (myfwc.com/news).
//   Atlantic (Northeast, Indian River Lagoon, Southeast):
//     Open Feb 1–May 31, and Sept 1–Dec 14.
//   Gulf — Panhandle, Big Bend, Tampa Bay, Sarasota Bay:
//     Open Mar 1–Apr 30, and Sept 1–Nov 30.
//   Gulf — Charlotte Harbor & Southwest (not currently shown in-app, listed
//     here for whenever a third region card gets added):
//     Open Mar 1–Apr 30, and Oct 1–Nov 30.

const REGIONS = {
  atlantic: {
    label: 'ATLANTIC COAST · INDIAN RIVER LAGOON',
    windows: [
      { startMonth: 2, startDay: 1, endMonth: 5, endDay: 31 },
      { startMonth: 9, startDay: 1, endMonth: 12, endDay: 14 },
    ],
  },
  gulf: {
    label: 'GULF COAST · SARASOTA BAY',
    windows: [
      { startMonth: 3, startDay: 1, endMonth: 4, endDay: 30 },
      { startMonth: 9, startDay: 1, endMonth: 11, endDay: 30 },
    ],
  },
  gulfSouthwest: {
    label: 'GULF COAST · CHARLOTTE HARBOR & SOUTHWEST',
    windows: [
      { startMonth: 3, startDay: 1, endMonth: 4, endDay: 30 },
      { startMonth: 10, startDay: 1, endMonth: 11, endDay: 30 },
    ],
  },
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmt(month, day) {
  return `${MONTH_NAMES[month - 1]} ${day}`
}

// Builds concrete Date objects for a window in a given year. Every window
// here starts and ends within the same calendar year (none of FWC's open
// windows cross a Dec→Jan boundary), so this stays simple.
function windowDates(win, year) {
  return {
    start: new Date(year, win.startMonth - 1, win.startDay),
    end: new Date(year, win.endMonth - 1, win.endDay, 23, 59, 59),
  }
}

/**
 * Returns { open, label } for a region, computed from `now` (defaults to
 * the actual current date). `label` is ready to render as-is, e.g.
 * "OPEN THRU NOV 30" or "CLOSED — REOPENS SEP 1".
 */
export function getSeasonStatus(regionKey, now = new Date()) {
  const region = REGIONS[regionKey]
  if (!region) throw new Error(`Unknown snook season region: ${regionKey}`)

  const year = now.getFullYear()
  // Check this year's windows, plus next year's first window in case we're
  // in a closed period that rolls into January (e.g. Atlantic closed
  // Dec 15–Jan 31 — reopening date needs to reference next year's Feb 1).
  const candidateWindows = [
    ...region.windows.map((w) => windowDates(w, year)),
    ...region.windows.map((w) => windowDates(w, year + 1)),
  ].sort((a, b) => a.start - b.start)

  const activeWindow = candidateWindows.find((w) => now >= w.start && now <= w.end)
  if (activeWindow) {
    return {
      open: true,
      label: `OPEN THRU ${fmt(activeWindow.end.getMonth() + 1, activeWindow.end.getDate())}`,
    }
  }

  const nextWindow = candidateWindows.find((w) => w.start > now)
  return {
    open: false,
    label: nextWindow
      ? `CLOSED — REOPENS ${fmt(nextWindow.start.getMonth() + 1, nextWindow.start.getDate())}`
      : 'CLOSED',
  }
}

export function getRegionLabel(regionKey) {
  return REGIONS[regionKey]?.label || regionKey
}
