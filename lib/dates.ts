import { toISO } from "@/lib/applications";

export const today = new Date();

export const offset = (days: number) =>
  toISO(new Date(today.getTime() + days * 86400000));

export const daysTo = (date: string) =>
  Math.ceil(
    (new Date(date).getTime() - new Date(toISO(today)).getTime()) / 86400000,
  );
