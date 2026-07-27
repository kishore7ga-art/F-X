"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { CollegeStatus } from "@/generated/prisma";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const schema = z.object({
  collegeId: z.string().min(1),
  publish: z.boolean(),
});

/** Draft <-> Published. Only the signed-in owner of the college may flip it. */
export async function setPublishStatus(input: z.infer<typeof schema>) {
  const { collegeId, publish } = schema.parse(input);

  const session = await getSession();
  if (!session || session.collegeId !== collegeId) {
    throw new Error("Not authorised to publish this site");
  }

  const college = await prisma.college.update({
    where: { id: collegeId },
    data: {
      status: publish ? CollegeStatus.PUBLISHED : CollegeStatus.DRAFT,
    },
  });

  revalidatePath(`/editor/${college.subdomain}`);
  revalidatePath(`/site/${college.subdomain}`);
}
