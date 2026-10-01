import { faker } from "@faker-js/faker";
import type {
    Attendee,
    BookingStatus,
    ClassStatus,
    EcommerceStore,
    FitnessClass,
    PaymentType,
    Stock,
    StockStatus,
    StoreStatus,
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
 * - st-001: a big store (60+ stock items), for paging through stock
 * - st-002: a small store (a few items)
 * - st-003: an inactive store with no stock
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

// Stores come after the classes, so adding them doesn't change the classes' random values
const STORE_COUNT = 100;
const LOW_STOCK_LEVEL = 10;

type StoreSize = "large" | "small" | "empty";

// st-001 large, st-002 small, st-003 empty; after that 1 in 10 large, 1 in 10 empty
const storeSizeFor = (index: number): StoreSize => {
    if (index === 0 || index % 10 === 7) return "large";
    if (index === 2 || index % 10 === 9) return "empty";
    return "small";
};

const storeCategories = [
    "Electronics",
    "Fashion",
    "Home & Living",
    "Beauty",
    "Sports",
    "Grocery",
    "Toys",
    "Books",
];

const storeStatuses: { weight: number; value: StoreStatus }[] = [
    { weight: 8, value: "Active" },
    { weight: 2, value: "Inactive" },
    { weight: 1, value: "Suspended" },
];

const stockStatusFor = (quantity: number): StockStatus => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= LOW_STOCK_LEVEL) return "Low Stock";
    return "In Stock";
};

const createStock = (id: string, storeCreatedAt: Date): Stock => {
    const discontinued = faker.number.int({ min: 1, max: 20 }) === 1;
    // Roughly 1 in 8 out of stock, 1 in 4 running low, the rest well stocked
    const quantity = discontinued
        ? 0
        : faker.helpers.weightedArrayElement([
              { weight: 1, value: 0 },
              { weight: 2, value: faker.number.int({ min: 1, max: LOW_STOCK_LEVEL }) },
              { weight: 5, value: faker.number.int({ min: LOW_STOCK_LEVEL + 1, max: 500 }) },
          ]);
    return {
        id,
        sku: faker.string.alphanumeric({ length: 8, casing: "upper" }),
        productName: faker.commerce.productName(),
        category: faker.commerce.department(),
        price: Number(faker.commerce.price({ min: 1, max: 999 })),
        quantity,
        status: discontinued ? "Discontinued" : stockStatusFor(quantity),
        updatedAt: faker.date.between({ from: storeCreatedAt, to: NOW }),
    };
};

const stores: EcommerceStore[] = [];
const stocksByStoreId = new Map<string, Stock[]>();

for (let index = 0; index < STORE_COUNT; index++) {
    const id = `st-${String(index + 1).padStart(3, "0")}`;
    const size = storeSizeFor(index);
    const createdAt = faker.date.between({ from: new Date(2022, 0, 1), to: NOW });

    const stockCount =
        size === "large"
            ? faker.number.int({ min: 60, max: 120 })
            : size === "small"
              ? faker.number.int({ min: 3, max: 15 })
              : 0;
    const stocks = Array.from({ length: stockCount }, (_, i) =>
        createStock(`stk-${id.slice(3)}-${String(i + 1).padStart(3, "0")}`, createdAt),
    );
    // Rounded to cents, so float sums don't show up as long decimals
    const totalStockValue =
        Math.round(stocks.reduce((sum, stock) => sum + stock.price * stock.quantity, 0) * 100) /
        100;

    stores.push({
        id,
        name: faker.company.name(),
        owner: `${faker.person.firstName()} ${faker.person.lastName()}`,
        location: faker.location.city(),
        category: faker.helpers.arrayElement(storeCategories),
        createdAt,
        productCount: stocks.length,
        totalStockValue,
        // A store with nothing to sell isn't open yet
        status: size === "empty" ? "Inactive" : faker.helpers.weightedArrayElement(storeStatuses),
    });
    stocksByStoreId.set(id, stocks);
}

export const db = { classes, attendeesByClassId, stores, stocksByStoreId };
