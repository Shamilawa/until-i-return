import { describe, expect, it } from "vitest";
import {
  fromZonedInput,
  nextFreeSlot,
  nextUnlockSlot,
  separationProgress,
  splitDuration,
  toZonedInput,
  unlockSlotsBetween,
} from "./time";

const sunday8 = { weekday: 0, time: "08:00", timezone: "Asia/Colombo" };

describe("nextUnlockSlot", () => {
  it("finds the coming Sunday 08:00 in Sri Lanka", () => {
    // Friday 9 Oct 2026, noon UTC -> Sunday 11 Oct 08:00 +05:30 = 02:30 UTC
    const slot = nextUnlockSlot(new Date("2026-10-09T12:00:00Z"), sunday8);
    expect(slot.toISOString()).toBe("2026-10-11T02:30:00.000Z");
  });

  it("uses her Sunday, not UTC's: late Saturday UTC is already Sunday in Colombo", () => {
    // Sat 10 Oct 20:00 UTC = Sun 11 Oct 01:30 Colombo, before 08:00
    const slot = nextUnlockSlot(new Date("2026-10-10T20:00:00Z"), sunday8);
    expect(slot.toISOString()).toBe("2026-10-11T02:30:00.000Z");
  });

  it("rolls to next week once this Sunday's time has passed, or is exactly now", () => {
    expect(nextUnlockSlot(new Date("2026-10-11T02:30:00Z"), sunday8).toISOString()).toBe("2026-10-18T02:30:00.000Z");
    expect(nextUnlockSlot(new Date("2026-10-11T09:00:00Z"), sunday8).toISOString()).toBe("2026-10-18T02:30:00.000Z");
  });

  it("crosses month and year boundaries", () => {
    expect(nextUnlockSlot(new Date("2026-12-28T00:00:00Z"), sunday8).toISOString()).toBe("2027-01-03T02:30:00.000Z");
  });
});

describe("nextFreeSlot", () => {
  it("skips Sundays that already have a letter", () => {
    const taken = [new Date("2026-10-11T02:30:00Z"), new Date("2026-10-18T02:30:00Z")];
    const slot = nextFreeSlot(taken, sunday8, new Date("2026-10-09T12:00:00Z"));
    expect(slot.toISOString()).toBe("2026-10-25T02:30:00.000Z");
  });
});

describe("unlockSlotsBetween", () => {
  it("lists every Sunday from the leave date to the reunion", () => {
    const slots = unlockSlotsBetween(new Date("2026-10-08T18:30:00Z"), new Date("2027-04-08T18:30:00Z"), sunday8);
    expect(slots).toHaveLength(26);
    expect(slots[0].toISOString()).toBe("2026-10-11T02:30:00.000Z");
    expect(slots[25].toISOString()).toBe("2027-04-04T02:30:00.000Z");
  });

  it("is empty when the reunion comes before the next letter day", () => {
    expect(unlockSlotsBetween(new Date("2027-04-05T00:00:00Z"), new Date("2027-04-08T18:30:00Z"), sunday8)).toEqual([]);
  });
});

describe("separationProgress", () => {
  const leave = new Date("2026-10-08T18:30:00Z");
  const reunion = new Date("2027-04-08T18:30:00Z");

  it("is zero before leaving and full after the reunion", () => {
    expect(separationProgress(leave, reunion, new Date("2026-10-01T00:00:00Z")).fraction).toBe(0);
    expect(separationProgress(leave, reunion, new Date("2027-05-01T00:00:00Z"))).toMatchObject({
      fraction: 1,
      daysToGo: 0,
      daysDown: 182,
    });
  });

  it("counts days down and to go", () => {
    const p = separationProgress(leave, reunion, new Date("2026-10-18T18:30:00Z"));
    expect(p.daysDown).toBe(10);
    expect(p.daysToGo).toBe(172);
    expect(p.fraction).toBeCloseTo(10 / 182);
  });
});

describe("helpers", () => {
  it("splits a duration", () => {
    expect(splitDuration(((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5 });
    expect(splitDuration(-5)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it("round-trips datetime-local values in Sri Lanka time", () => {
    const date = fromZonedInput("2026-10-11T08:00", "Asia/Colombo");
    expect(date.toISOString()).toBe("2026-10-11T02:30:00.000Z");
    expect(toZonedInput(date, "Asia/Colombo")).toBe("2026-10-11T08:00");
  });
});
