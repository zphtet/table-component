import { delay, http, HttpResponse } from "msw";
import type { Attendee, FitnessClass } from "@/types/data.types";
import { db } from "./db";
import { paginate, parseListQuery, sortItems } from "./utils";

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

const badRequest = (message: string) => HttpResponse.json({ message }, { status: 400 });

export const handlers = [
    /**
     * GET /api/classes?page=1&size=10&sort=time:asc
     * Classes without their attendee lists; fetch those per class below.
     */
    http.get("/api/classes", async ({ request }) => {
        // Realistic network latency (100–400ms), so loading states are visible
        await delay();
        const query = parseListQuery(new URL(request.url), classSortFields);
        if ("error" in query) return badRequest(query.error);

        const sorted = sortItems(db.classes, query.sorts);
        return HttpResponse.json(paginate(sorted, query.page, query.size));
    }),

    /**
     * GET /api/classes/:classId/attendees?page=1&size=10&sort=name:asc
     * Try fc-001 (many attendees), fc-002 (a few), fc-003 (none) and fc-006 (full).
     */
    http.get("/api/classes/:classId/attendees", async ({ request, params }) => {
        await delay();
        const classId = String(params.classId);
        const attendees = db.attendeesByClassId.get(classId);
        if (!attendees) {
            return HttpResponse.json({ message: `Class "${classId}" not found` }, { status: 404 });
        }
        const query = parseListQuery(new URL(request.url), attendeeSortFields);
        if ("error" in query) return badRequest(query.error);

        const sorted = sortItems(attendees, query.sorts);
        return HttpResponse.json(paginate(sorted, query.page, query.size));
    }),
];
