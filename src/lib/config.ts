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
    "Miles apart, but you're the first thing on my mind.",
    "Every goodnight brings me one sleep closer to you.",
    "You're worth every mile and every minute.",
    "My favourite place is still next to you.",
    "Counting days is easy when you're the reason.",
    "Look up tonight. I'm under the same stars.",
    "I carry you with me everywhere I go.",
    "The best part of my day is hearing about yours.",
    "Two time zones, one heartbeat.",
    "Soon this countdown will be a hug.",
    "I fall for you a little more with every call.",
    "No distance is big enough to make me miss you less.",
    "Somewhere between your morning and my night, I'm thinking of you.",
    "Every Sunday, a little piece of me arrives in your letterbox.",
    "You make waiting feel like something beautiful.",
    "Hold on, my love. I'm on my way back to you.",
    "Being yours is my favourite thing to be.",
    "When this ends, I'm never letting go of your hand.",
  ],
};

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
