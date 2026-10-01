import { http, HttpResponse } from "msw";
import type { Attendee, EcommerceStore, FitnessClass, Stock } from "@/types/data.types";
import { db } from "./db";
import { paginate, parseListQuery, shouldReturnEmpty, simulateNetwork, sortItems } from "./utils";

const classSortFields = [
    "id",
    "name",
    "instructor",
    "room",
    "time",
    "capacity",
    "attendeeCount",
    "status",
] as const satisfies readonly (keyof FitnessClass)[];

const attendeeSortFields = [
    "id",
    "name",
    "email",
    "paymentType",
    "bookingStatus",
    "bookedAt",
] as const satisfies readonly (keyof Attendee)[];

const storeSortFields = [
    "id",
    "name",
    "owner",
    "location",
    "category",
    "createdAt",
    "productCount",
    "totalStockValue",
    "status",
] as const satisfies readonly (keyof EcommerceStore)[];

const stockSortFields = [
    "id",
    "sku",
    "productName",
    "category",
    "price",
    "quantity",
    "status",
    "updatedAt",
] as const satisfies readonly (keyof Stock)[];

const badRequest = (message: string) => HttpResponse.json({ message }, { status: 400 });

export const handlers = [
    /**
     * GET /api/classes?page=1&size=10&sort=time:asc
     * Classes without their attendee lists; fetch those per class below.
     */
    http.get("/api/classes", async ({ request }) => {
        // Latency and simulated failures, set from the Network panel in the header
        const failure = await simulateNetwork("classes");
        if (failure) return failure;
        const query = parseListQuery(new URL(request.url), classSortFields);
        if ("error" in query) return badRequest(query.error);

        if (shouldReturnEmpty("classes"))
            return HttpResponse.json(paginate([], query.page, query.size));
        const sorted = sortItems(db.classes, query.sorts);
        return HttpResponse.json(paginate(sorted, query.page, query.size));
    }),

    /**
     * GET /api/classes/:classId/attendees?page=1&size=10&sort=name:asc
     * Try fc-001 (many attendees), fc-002 (a few), fc-003 (none) and fc-006 (full).
     */
    http.get("/api/classes/:classId/attendees", async ({ request, params }) => {
        const failure = await simulateNetwork("attendees");
        if (failure) return failure;
        const classId = String(params.classId);
        const attendees = db.attendeesByClassId.get(classId);
        if (!attendees) {
            return HttpResponse.json({ message: `Class "${classId}" not found` }, { status: 404 });
        }
        const query = parseListQuery(new URL(request.url), attendeeSortFields);
        if ("error" in query) return badRequest(query.error);

        if (shouldReturnEmpty("attendees")) {
            return HttpResponse.json(paginate([], query.page, query.size));
        }
        const sorted = sortItems(attendees, query.sorts);
        return HttpResponse.json(paginate(sorted, query.page, query.size));
    }),

    /**
     * GET /api/stores?page=1&size=10&sort=name:asc
     * Stores without their stock lists; fetch those per store below.
     */
    http.get("/api/stores", async ({ request }) => {
        const failure = await simulateNetwork("stores");
        if (failure) return failure;
        const query = parseListQuery(new URL(request.url), storeSortFields);
        if ("error" in query) return badRequest(query.error);

        if (shouldReturnEmpty("stores"))
            return HttpResponse.json(paginate([], query.page, query.size));
        const sorted = sortItems(db.stores, query.sorts);
        return HttpResponse.json(paginate(sorted, query.page, query.size));
    }),

    /**
     * GET /api/stores/:storeId/stocks?page=1&size=10&sort=quantity:desc
     * Try st-001 (many items), st-002 (a few) and st-003 (none).
     */
    http.get("/api/stores/:storeId/stocks", async ({ request, params }) => {
        const failure = await simulateNetwork("stocks");
        if (failure) return failure;
        const storeId = String(params.storeId);
        const stocks = db.stocksByStoreId.get(storeId);
        if (!stocks) {
            return HttpResponse.json({ message: `Store "${storeId}" not found` }, { status: 404 });
        }
        const query = parseListQuery(new URL(request.url), stockSortFields);
        if ("error" in query) return badRequest(query.error);

        if (shouldReturnEmpty("stocks")) {
            return HttpResponse.json(paginate([], query.page, query.size));
        }
        const sorted = sortItems(stocks, query.sorts);
        return HttpResponse.json(paginate(sorted, query.page, query.size));
    }),
];
