/** The two people this little world belongs to, and the defaults "Wipe everything" restores. */
export const PEOPLE = {
  author: { name: "Shamila", city: "Abu Dhabi", timeZone: "Asia/Dubai" },
  reader: { name: "Thamasha", nickname: "Baby Girl", city: "Sri Lanka", timeZone: "Asia/Colombo" },
} as const;

export type Role = keyof typeof PEOPLE;

/** What she sees before the journey starts. */
export const WAITING_MESSAGE = {
  title: "Something is waiting for you",
  intro: "I made a little world just for you. It stays closed while I'm still beside you.",
  instruction: "Refresh this page as soon as I leave the ground.",
  insideTitle: "What's waiting inside",
  inside: [
    { emoji: "⏳", text: "A countdown to the day I'm home" },
    { emoji: "💌", text: "A letter from me every Sunday morning" },
    { emoji: "✨", text: "A little note from me every time you open it" },
  ],
};

export const DEFAULT_SETTINGS = {
  metOn: "2026-09-23",
  // Midnight in Sri Lanka (UTC+5:30) on the day, stored as UTC instants.
  leaveAt: new Date("2026-10-08T18:30:00.000Z"),
  reunionAt: new Date("2027-04-08T18:30:00.000Z"),
  letterWeekday: 0, // Sunday
  letterTime: "08:00",
  timezone: "Asia/Colombo",
  journeyStartedAt: null as Date | null,
  sweetMessages: [
    "Every sunrise is one less without you. 🌅",
    "Same moon, same sky, same us. 🌙",
    "Distance is just a test of how far love can travel. ✈️",
    "I'm saving all my hugs for you. 🤗",
    "You're my favourite notification. 📱",
    "One day closer to home, and home is you. 🏡",
    "Miles apart, but you're the first thing on my mind. 💭",
    "Every goodnight brings me one sleep closer to you. 😴",
    "You're worth every mile and every minute. 💛",
    "My favourite place is still next to you. 🥰",
    "Counting days is easy when you're the reason. 🗓️",
    "Look up tonight. I'm under the same stars. ✨",
    "I carry you with me everywhere I go. 💞",
    "The best part of my day is hearing about yours. ☎️",
    "Two time zones, one heartbeat. 💓",
    "Soon this countdown will be a hug. ⏳",
    "I fall for you a little more with every call. 📞",
    "No distance is big enough to make me miss you less. 🌍",
    "Somewhere between your morning and my night, I'm thinking of you. 🌤️",
    "Every Sunday, a little piece of me arrives in your letterbox. 💌",
    "You make waiting feel like something beautiful. 🌸",
    "Hold on, my love. I'm on my way back to you. 🛫",
    "Being yours is my favourite thing to be. 💖",
    "When this ends, I'm never letting go of your hand. 🤝",
    "You're the calm at the end of every long day. 🌊",
    "I miss you in small ways all day long. 🥺",
    "Your smile is my favourite view, even on a screen. 😊",
    "Good morning from me, wherever the sun finds you first. ☀️",
    "I'd cross every ocean twice to see you once. 🌏",
    "You're the wish I keep making. 🌠",
    "My heart never left. It's right there with you. ❤️",
    "One less sleep, one more reason to smile. 😌",
    "I love you more than yesterday and less than tomorrow. 💗",
    "This is just the long way round to forever. ♾️",
    "Thank you for waiting for me. 🙏",
    "You are my today and all of my tomorrows. 🌈",
    "Close your eyes. That warmth is me thinking of you. 🔥",
    "The airport hug is going to be legendary. 🫂",
    "Even my dreams know the way to you. 💫",
    "Loving you is the easiest thing I've ever done. 💘",
    "Every plane I see, I wish it were mine going home to you. 🛩️",
    "We're not apart. We're just early for our reunion. ⏰",
    "Save me a seat next to you. I'm coming. 💺",
    "Out of everyone in the world, I'd still choose you. 💍",
  ],
};

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
