import { describe, expect, it } from "vitest";
import { chapterLabel, withChapters } from "./timeline";

const LEAVE = "2026-10-09";

describe("chapterLabel", () => {
  it("uses the calendar month before the leave date", () => {
    expect(chapterLabel("2026-09-23", LEAVE)).toBe("September 2026");
    expect(chapterLabel("2026-10-08", LEAVE)).toBe("October 2026");
  });

  it("counts months apart from the leave date", () => {
    expect(chapterLabel("2026-10-09", LEAVE)).toBe("Month 1 apart ✨");
    expect(chapterLabel("2026-11-08", LEAVE)).toBe("Month 1 apart ✨");
    expect(chapterLabel("2026-11-09", LEAVE)).toBe("Month 2 apart ✨");
    expect(chapterLabel("2027-04-08", LEAVE)).toBe("Month 6 apart ✨");
  });
});

describe("withChapters", () => {
  it("marks only the first entry of each chapter", () => {
    const entries = ["2026-09-23", "2026-09-30", "2026-10-12", "2026-10-20", "2026-11-15"].map((happenedOn) => ({ happenedOn }));
    expect(withChapters(entries, LEAVE).map((e) => e.chapter)).toEqual([
      "September 2026",
      null,
      "Month 1 apart ✨",
      null,
      "Month 2 apart ✨",
    ]);
  });
});
