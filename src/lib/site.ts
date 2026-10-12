export const SITE_NAME = "EpicStream";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export const FEEDBACK_WEBAPP_URL =
  process.env.NEXT_PUBLIC_FEEDBACK_WEBAPP_URL ||
  "https://script.google.com/macros/s/AKfycbwgBZRJYj9HuZIbOQMIFk8c5UdB04zjOB5FayzU2trT-1CSbkf6YAbw9k13QsZ0iIBUNw/exec";
