import type {
    Attendee,
    BookingStatus,
    ClassStatus,
    FitnessClass,
    PaymentType,
} from "@/types/data.types";

/**
 * Large generated datasets for stress-testing the client-side table.
 *
 * No faker here: this file ships in the main chunk, and a tiny seeded PRNG is much faster at 100k rows.
 * Each class is seeded by its index, so class N is the same whatever the dataset size, and every
 * reload gives the same data.
 *
 * Attendees are built only when a row is expanded (and cached), instead of ~500k objects up front.
 */

const SEED = 20260929;
const NOW = new Date(2026, 8, 29, 12, 0);
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** mulberry32: small, fast, seedable */
const createRandom = (seed: number) => {
    let state = seed >>> 0;
    const next = () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
    const pick = <V>(items: readonly V[]) => items[Math.floor(next() * items.length)];
    return { next, int, pick };
};

// Different salts, so a class and its attendees don't share a random stream
const classSeed = (index: number) => SEED ^ Math.imul(index + 1, 0x9e3779b1);
const attendeeSeed = (index: number) => (SEED + 1) ^ Math.imul(index + 1, 0x85ebca6b);

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

const instructors = [
    "Maya Chen",
    "Jordan Reyes",
    "Priya Nair",
    "Elena Rossi",
    "Marcus Lee",
    "Sofia Alvarez",
    "Daniel Okafor",
    "Hana Suzuki",
];

// prettier-ignore
const firstNames = [
    "Ava", "Liam", "Noah", "Emma", "Oliver", "Mia", "Lucas", "Isabella", "Ethan", "Charlotte",
    "James", "Amelia", "Benjamin", "Harper", "Henry", "Evelyn", "Alexander", "Abigail", "Daniel",
    "Emily", "Matthew", "Ella", "Samuel", "Scarlett", "David", "Grace", "Joseph", "Chloe", "Aiden",
    "Zoe", "Kai", "Layla", "Mateo", "Nora", "Leo", "Aria", "Ezra", "Luna", "Omar", "Yuki",
];

// prettier-ignore
const lastNames = [
    "Thompson", "Patel", "Kim", "Garcia", "Brown", "Wilson", "Martin", "Davis", "Moore", "Taylor",
    "Anderson", "Thomas", "Jackson", "White", "Harris", "Clark", "Lewis", "Walker", "Hall", "Young",
    "Allen", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson", "Nguyen", "Lopez",
    "Silva", "Cohen", "Ivanov", "Tanaka", "Mensah", "Haddad", "Kowalski", "Murphy", "Rossi", "Singh",
];

// Weighted 5 : 3 : 2, like the mock API data
const paymentTypes: PaymentType[] = [
    ...Array<PaymentType>(5).fill("Membership"),
    ...Array<PaymentType>(3).fill("Package"),
    ...Array<PaymentType>(2).fill("One-time"),
];

const ID_PREFIX = "lg-";

/** Total bookings per class, cancelled ones included. `attendeeCount` only has the active ones. */
const bookingCounts = new Map<string, number>();

const createClass = (index: number): FitnessClass => {
    const random = createRandom(classSeed(index));
    const id = `${ID_PREFIX}${String(index + 1).padStart(6, "0")}`;
    const isLarge = random.next() < 0.03;
    const template = random.pick(isLarge ? largeClasses : smallClasses);
    // About 12 weeks from Mon Sep 21, 6am–8pm, on the quarter hour
    const time = new Date(
        2026,
        8,
        21 + random.int(0, 83),
        random.int(6, 20),
        random.pick([0, 15, 30, 45]),
    );
    const capacity = isLarge ? random.int(80, 150) : random.int(4, 30);
    // Only small classes get cancelled
    const cancelled = !isLarge && random.next() < 0.08;

    const roll = random.next();
    const activeBookings = isLarge
        ? random.int(Math.floor(capacity / 2), capacity)
        : roll < 0.15
          ? 0
          : roll < 0.3
            ? capacity
            : random.int(1, capacity);
    // A few people cancel; in a cancelled class, everyone's booking is cancelled
    const cancelledBookings = activeBookings === 0 ? 0 : random.int(0, 2);
    const bookingCount = cancelled ? activeBookings : activeBookings + cancelledBookings;
    const attendeeCount = cancelled ? 0 : activeBookings;

    const status: ClassStatus = cancelled
        ? "Cancelled"
        : attendeeCount >= capacity
          ? "Full"
          : "Scheduled";

    bookingCounts.set(id, bookingCount);
    return {
        id,
        name: template.name,
        instructor: random.pick(instructors),
        room: template.room,
        time,
        capacity,
        attendeeCount,
        status,
    };
};

/** `ms` is how long building the rows took, to compare dataset sizes */
export const generateFitnessClasses = (count: number) => {
    const start = performance.now();
    const classes = Array.from({ length: count }, (_, index) => createClass(index));
    return { classes, ms: performance.now() - start };
};

const attendeesByClassId = new Map<string, Attendee[]>();

/** The attendees of a generated class, built on first use. Cancelled ones line up with `attendeeCount`. */
export const getAttendees = (cls: FitnessClass): Attendee[] => {
    const cached = attendeesByClassId.get(cls.id);
    if (cached) return cached;

    const bookingCount = bookingCounts.get(cls.id);
    // Not a generated class (e.g. a hand-written one without attendees)
    if (bookingCount == null) return [];

    const index = Number(cls.id.slice(ID_PREFIX.length)) - 1;
    const random = createRandom(attendeeSeed(index));
    const classCancelled = cls.status === "Cancelled";
    const isPast = cls.time < NOW;

    const statuses: BookingStatus[] = Array.from({ length: bookingCount }, (_, i) => {
        if (classCancelled || i >= cls.attendeeCount) return "Cancelled";
        if (!isPast) return "Booked";
        return random.next() < 0.9 ? "Checked-in" : "No-show";
    });
    // Shuffle, so the cancelled ones aren't all at the end
    for (let i = statuses.length - 1; i > 0; i--) {
        const j = random.int(0, i);
        [statuses[i], statuses[j]] = [statuses[j], statuses[i]];
    }

    // Booked up to two weeks before the class, and never in the future
    const from = cls.time.getTime() - 14 * DAY;
    const latest = Math.min(cls.time.getTime() - HOUR, NOW.getTime());
    const to = Math.max(latest, from + HOUR);

    const attendees = statuses.map((bookingStatus, i): Attendee => {
        const firstName = random.pick(firstNames);
        const lastName = random.pick(lastNames);
        return {
            id: `att-${cls.id.slice(ID_PREFIX.length)}-${String(i + 1).padStart(3, "0")}`,
            name: `${firstName} ${lastName}`,
            email: `${firstName}.${lastName}${random.int(1, 99)}@example.com`.toLowerCase(),
            paymentType: random.pick(paymentTypes),
            bookingStatus,
            bookedAt: new Date(from + random.next() * (to - from)),
        };
    });

    attendeesByClassId.set(cls.id, attendees);
    return attendees;
};
