import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/** The MSW worker. Started in main.tsx before render when VITE_MOCK is on. */
export const worker = setupWorker(...handlers);
