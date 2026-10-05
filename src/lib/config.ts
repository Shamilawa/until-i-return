/** The two people this little world belongs to, and the defaults "Wipe everything" restores. */
export const PEOPLE = {
  author: { name: "Shamila", city: "Abu Dhabi", timeZone: "Asia/Dubai" },
  reader: { name: "Thamasha", nickname: "Baby Girl", city: "Sri Lanka", timeZone: "Asia/Colombo" },
} as const;

export type Role = keyof typeof PEOPLE;

export const DEFAULT_SETTINGS = {
  metOn: "2026-09-23",
  // Midnight in Sri Lanka (UTC+5:30) on the day, stored as UTC instants.
  leaveAt: new Date("2026-10-08T18:30:00.000Z"),
  reunionAt: new Date("2027-04-08T18:30:00.000Z"),
  letterWeekday: 0, // Sunday
  letterTime: "08:00",
  timezone: "Asia/Colombo",
  sweetMessages: [
    "Every sunrise is one less without you.",
    "Same moon, same sky, same us.",
    "Distance is just a test of how far love can travel.",
    "I'm saving all my hugs for you.",
    "You're my favourite notification.",
    "One day closer to home, and home is you.",
  ],
};

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
