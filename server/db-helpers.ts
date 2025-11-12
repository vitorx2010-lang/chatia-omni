/**
 * Database helper functions for Chatia-Omni
 */

import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  conversations,
  messages,
  files,
  voices,
  jobs,
  providers,
  auditLogs,
  InsertConversation,
  InsertMessage,
  InsertFile,
  InsertVoice,
  InsertJob,
  InsertAuditLog,
} from "../drizzle/schema";

// ===== Conversations =====

export async function createConversation(data: InsertConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(conversations).values(data);
}

export async function getConversation(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

export async function updateConversation(
  id: number,
  data: Partial<InsertConversation>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(conversations).set(data).where(eq(conversations.id, id));
}

export async function deleteConversation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete messages first
  await db.delete(messages).where(eq(messages.conversationId, id));
  
  // Delete conversation
  await db.delete(conversations).where(eq(conversations.id, id));
}

// ===== Messages =====

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(messages).values(data);
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

// ===== Files =====

export async function createFile(data: InsertFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(files).values(data);
}

export async function getFile(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(files)
    .where(eq(files.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getUserFiles(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(files)
    .where(eq(files.userId, userId))
    .orderBy(desc(files.createdAt));
}

export async function deleteFile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(files).where(eq(files.id, id));
}

// ===== Voices =====

export async function createVoice(data: InsertVoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(voices).values(data);
}

export async function getVoice(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(voices)
    .where(eq(voices.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getUserVoices(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(voices)
    .where(eq(voices.userId, userId))
    .orderBy(desc(voices.createdAt));
}

export async function updateVoice(id: number, data: Partial<InsertVoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(voices).set(data).where(eq(voices.id, id));
}

// ===== Jobs =====

export async function createJob(data: InsertJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(jobs).values(data);
}

export async function getJob(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1);

  return result[0] || null;
}

export async function updateJob(id: number, data: Partial<InsertJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(jobs).set(data).where(eq(jobs.id, id));
}

export async function getUserJobs(userId: number, jobType?: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(desc(jobs.createdAt));
}

// ===== Audit Logs =====

export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(auditLogs).values(data);
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export async function getAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
