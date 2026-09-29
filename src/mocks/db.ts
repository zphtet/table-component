import { faker } from "@faker-js/faker";
import type {
    Attendee,
    BookingStatus,
    ClassStatus,
    FitnessClass,
    PaymentType,
} from "@/types/data.types";

/**
 * Generated data behind the mock API. Only the MSW handlers import this file, so faker stays in the
 * lazily loaded mocks chunk.
 *
 * A fixed seed and a fixed "now" give the same data on every reload, so sorting and pagination
 * results are repeatable. Handy fixtures:
 * - fc-001: a big class (60+ attendees), for paging through attendees
 * - fc-002: a small class (a few attendees)
 * - fc-003: a class with no attendees
 * - fc-006: a full class (every spot taken)
 */
faker.seed(20260929);

const NOW = new Date(2026, 8, 29, 12, 0);
const CLASS_COUNT = 60;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type Size = "large" | "small" | "full" | "empty";

// Out of every 10 classes: 1 large, 1 full, 2 with no one booked yet, the rest small
const sizeFor = (index: number): Size => {
    if (index % 10 === 0) return "large";
    if (index % 10 === 5) return "full";
    if (index % 5 === 2) return "empty";
    return "small";
};

const largeClasses = [
    { name: "Open Gym", room: "Main Hall" },
    { name: "Bootcamp in the Park", room: "Outdoor Field" },
    { name: "Community Zumba", room: "Main Hall" },
    { name: "Saturday Run Club", room: "Outdoor Field" },
];

const smallClasses = [
    { name: "Morning Yoga Flow", room: "Studio A" },
    { name: "Yin Yoga", room: "Studio A" },
    { name: "Power Yoga", room: "Studio A" },
    { name: "HIIT Blast", room: "Studio B" },
    { name: "Dance Cardio", room: "Studio B" },
    { name: "Spin Express", room: "Cycle Room" },
    { name: "Spin Endurance", room: "Cycle Room" },
    { name: "Reformer Pilates", room: "Reformer Studio" },
    { name: "Pilates Core", room: "Studio A" },
    { name: "Barre Sculpt", room: "Studio A" },
    { name: "Boxing Fundamentals", room: "Studio C" },
    { name: "Kettlebell Power", room: "Weight Room" },
    { name: "Strength & Conditioning", room: "Weight Room" },
    { name: "Aqua Fit", room: "Pool" },
];

// First + last only; `faker.person.fullName()` can add titles like "Dr." or "DDS"
const instructors = Array.from(
    { length: 8 },
    () => `${faker.person.firstName()} ${faker.person.lastName()}`,
);

const paymentTypes: { weight: number; value: PaymentType }[] = [
    { weight: 5, value: "Membership" },
    { weight: 3, value: "Package" },
    { weight: 2, value: "One-time" },
];

const bookingStatusFor = (
    classTime: Date,
    classCancelled: boolean,
    allowCancel: boolean,
): BookingStatus => {
    if (classCancelled) return "Cancelled";
    if (!allowCancel) return classTime < NOW ? "Checked-in" : "Booked";
    if (classTime < NOW) {
        return faker.helpers.weightedArrayElement([
            { weight: 8, value: "Checked-in" as const },
            { weight: 1, value: "No-show" as const },
            { weight: 1, value: "Cancelled" as const },
        ]);
    }
    return faker.helpers.weightedArrayElement([
        { weight: 9, value: "Booked" as const },
        { weight: 1, value: "Cancelled" as const },
    ]);
};

// Classes run from Mon Sep 21 for three weeks, 6am–8pm, on the quarter hour
const classTime = () =>
    new Date(
        2026,
        8,
        21 + faker.number.int({ min: 0, max: 20 }),
        faker.number.int({ min: 6, max: 20 }),
        faker.helpers.arrayElement([0, 15, 30, 45]),
    );

const createAttendee = (
    id: string,
    time: Date,
    classCancelled: boolean,
    allowCancel: boolean,
): Attendee => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    // Booked up to two weeks before the class, and never in the future
    const from = new Date(time.getTime() - 14 * DAY);
    const latest = Math.min(time.getTime() - HOUR, NOW.getTime());
    const to = new Date(Math.max(latest, from.getTime() + HOUR));
    return {
        id,
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName, provider: "example.com" }).toLowerCase(),
        paymentType: faker.helpers.weightedArrayElement(paymentTypes),
        bookingStatus: bookingStatusFor(time, classCancelled, allowCancel),
        bookedAt: faker.date.between({ from, to }),
    };
};

const classes: FitnessClass[] = [];
const attendeesByClassId = new Map<string, Attendee[]>();

for (let index = 0; index < CLASS_COUNT; index++) {
    const id = `fc-${String(index + 1).padStart(3, "0")}`;
    const size = sizeFor(index);
    const template = faker.helpers.arrayElement(size === "large" ? largeClasses : smallClasses);
    const time = classTime();
    const capacity =
        size === "large"
            ? faker.number.int({ min: 80, max: 150 })
            : size === "full"
              ? faker.number.int({ min: 4, max: 10 })
              : faker.number.int({ min: 6, max: 20 });
    // Only small classes get cancelled, so the big and empty fixtures stay predictable
    const cancelled = size === "small" && faker.number.int({ min: 1, max: 10 }) === 1;

    const bookingCount =
        size === "large"
            ? faker.number.int({ min: 60, max: capacity })
            : size === "full"
              ? capacity
              : size === "small"
                ? faker.number.int({ min: 1, max: Math.min(8, capacity) })
                : 0;

    const attendees = Array.from({ length: bookingCount }, (_, i) =>
        // Full classes keep every booking, so they stay at capacity
        createAttendee(
            `att-${id.slice(3)}-${String(i + 1).padStart(3, "0")}`,
            time,
            cancelled,
            size !== "full",
        ),
    );
    // Cancelled bookings don't take a spot
    const attendeeCount = attendees.filter((a) => a.bookingStatus !== "Cancelled").length;
    const status: ClassStatus = cancelled
        ? "Cancelled"
        : attendeeCount >= capacity
          ? "Full"
          : "Scheduled";

    classes.push({
        id,
        name: template.name,
        instructor: faker.helpers.arrayElement(instructors),
        room: template.room,
        time,
        capacity,
        attendeeCount,
        status,
    });
    attendeesByClassId.set(id, attendees);
}

export const db = { classes, attendeesByClassId };
