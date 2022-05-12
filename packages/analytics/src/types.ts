import { createAnalyticsLayer } from "./createAnalyticsLayer";

export type AnalyticsLayer = Awaited<ReturnType<typeof createAnalyticsLayer>>;
