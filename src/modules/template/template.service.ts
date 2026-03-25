import { redis } from "../../config/redis";
import { prisma } from "../../lib/prisma";
import { ITemplateDataPayload } from "./template.interface";

//  Create a new template
// Simple insert + clear list cache so fresh data shows next time
const createTemplate = async (templateData: ITemplateDataPayload) => {
  const newTemplate = await prisma.template.create({
    data: templateData,
  });

  // cache clean (important after write)
  await redis.del("templates-list");

  return newTemplate;
};

//  Get all templates
// First try Redis → if not found → DB → then cache it
const allTemplatesList = async () => {
  const redisKey = "templates-list";

  // check cache first (fast 🚀)
  const cached = await redis.get(redisKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // fallback to DB
  const allTemplates = await prisma.template.findMany({
    orderBy: { createdAt: "desc" },
  });

  // store in cache (10 min)
  await redis.set(redisKey, JSON.stringify(allTemplates), "EX", 600);

  return allTemplates;
};

//  Get single template details
// includes resume relation
const getTemplateById = async (id: string) => {
  const redisKey = `template-detail-${id}`;

  // try cache first
  const cached = await redis.get(redisKey);
  // if (cached) {
  //   return JSON.parse(cached);
  // }

  // fetch from DB
  const templateDetails = await prisma.template.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!templateDetails) {
    throw new Error("Template not found");
  }

  // cache it for next time
  await redis.set(redisKey, JSON.stringify(templateDetails), "EX", 600);

  return templateDetails;
};

//  Update template
// only update what is passed
const updateTemplate = async (
  id: string,
  payload: Partial<ITemplateDataPayload>
) => {
  // check exists first (avoid silent fail)
  const existing = await prisma.template.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Template not found");
  }

  const updatedTemplate = await prisma.template.update({
    where: { id },
    data: payload,
  });

  // clean related cache (very important ⚠️)
  await redis.del("templates-list");
  await redis.del(`template-detail-${id}`);

  return updatedTemplate;
};

//  Delete template
// remove from DB + clean cache
const deleteTemplate = async (id: string) => {
  const existing = await prisma.template.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Template not found");
  }

  await prisma.template.delete({
    where: { id },
  });

  // clear caches
  await redis.del("templates-list");
  await redis.del(`template-detail-${id}`);

  return { message: "Template deleted successfully" };
};

export const templateServices = {
  createTemplate,
  allTemplatesList,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};