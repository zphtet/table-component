import { http, HttpResponse } from "msw";
import { fitnessClassesData } from "@/mocks/data";

export const handlers = [
    // Dates in the mock data are sent as ISO strings, like a real JSON API would
    http.get("/api/classes", () => HttpResponse.json(fitnessClassesData)),
];
