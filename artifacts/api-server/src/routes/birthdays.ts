import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

const reminderDaysSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(7)]);
const birthdaySchema = z.object({
  id: z.string(),
  name: z.string(),
  nickname: z.string().optional(),
  dateOfBirth: z.string(),
  birthYearKnown: z.boolean(),
  phone: z.string().optional(),
  email: z.string().optional(),
  relationship: z.string().optional(),
  notes: z.string().optional(),
  reminderEnabled: z.boolean(),
  reminderDaysBefore: reminderDaysSchema,
  reminderTime: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
});

const createBirthdaySchema = birthdaySchema.omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });

type BirthdayRecord = z.infer<typeof birthdaySchema>;

const records: BirthdayRecord[] = [];

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

router.get("/birthdays", (req, res) => {
  const includeDeleted = req.query.includeDeleted === "true";
  res.json(records.filter((record) => includeDeleted || !record.deletedAt));
});

router.get("/birthdays/summary", (_req, res) => {
  const active = records.filter((record) => !record.deletedAt);
  const monthCounts = Array.from({ length: 12 }, (_, month) => active.filter((record) => {
    const parsed = new Date(record.dateOfBirth);
    return parsed.getMonth() === month;
  }).length);
  res.json({ total: active.length, monthCounts, storage: process.env.MONGODB_URI ? "mongodb-configured" : "memory-development" });
});

router.get("/birthdays/:id", (req, res) => {
  const record = records.find((item) => item.id === req.params.id && !item.deletedAt);
  if (!record) {
    res.status(404).json({ message: "Birthday not found" });
    return;
  }
  res.json(record);
});

router.post("/birthdays", (req, res) => {
  const parsed = createBirthdaySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid birthday", issues: parsed.error.issues });
    return;
  }
  const now = new Date().toISOString();
  const record: BirthdayRecord = { ...parsed.data, id: makeId(), createdAt: now, updatedAt: now };
  records.push(record);
  res.status(201).json(record);
});

router.patch("/birthdays/:id", (req, res) => {
  const index = records.findIndex((item) => item.id === req.params.id && !item.deletedAt);
  if (index < 0) {
    res.status(404).json({ message: "Birthday not found" });
    return;
  }
  const parsed = createBirthdaySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid birthday", issues: parsed.error.issues });
    return;
  }
  records[index] = { ...records[index], ...parsed.data, updatedAt: new Date().toISOString() };
  res.json(records[index]);
});

router.delete("/birthdays/:id", (req, res) => {
  const record = records.find((item) => item.id === req.params.id && !item.deletedAt);
  if (!record) {
    res.status(404).json({ message: "Birthday not found" });
    return;
  }
  record.deletedAt = new Date().toISOString();
  record.updatedAt = new Date().toISOString();
  res.status(204).send();
});

export default router;