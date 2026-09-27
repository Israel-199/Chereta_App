import prisma from "../../utils/prisma/prisma";
import { UpdateProfileInput } from "./user.validation";

export async function completeProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    address?: string;
    photo?: string;
  },
) {
  const parseResult = UpdateProfileInput.safeParse({
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    address: data.address,
  });
  if (!parseResult.success) {
    const errorKey = parseResult.error.issues[0].message;
    throw new Error(errorKey);
  }

  const validatedData = parseResult.data;
  const updateData: any = { ...validatedData };
  if (data.photo) {
    updateData.photo = data.photo;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return { messageKey: "profileCompleted", user };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bids: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { auctionItem: true },
      },
      lotterySpins: { include: { round: true } },
      attachments: true,
    },
  });

  if (!user) {
    throw new Error("userNotFound");
  }

  return user;
}

export async function getAttachments(userId: string) {
  return await prisma.attachment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAttachment(data: {
  userId: string;
  fileUrl: string;
  publicId?: string;
  fileName?: string;
  fileType?: string;
  about?: string;
}) {
  console.log(`Creating/Updating attachment for user ${data.userId}, type: ${data.about}`);
  if (data.about === "ID_FRONT" || data.about === "ID_BACK") {
    const existing = await prisma.attachment.findFirst({
      where: { userId: data.userId, about: data.about }
    });

    if (existing) {
      console.log(`Found existing attachment ${existing.id}, updating...`);
      return await prisma.attachment.update({
        where: { id: existing.id },
        data: {
          fileUrl: data.fileUrl,
          publicId: data.publicId,
          fileName: data.fileName,
          fileType: data.fileType,
          about: data.about 
        }
      });
    }
  }

  const newAttachment = await prisma.attachment.create({
    data,
  });
  console.log(`New attachment created: ${newAttachment.id}`);
  return newAttachment;
}

export async function updateAttachment(
  userId: string,
  attachmentId: string,
  data: { 
    about?: string;
    fileUrl?: string;
    publicId?: string;
    fileName?: string;
    fileType?: string;
  },
) {
  const attachment = await prisma.attachment.findFirst({
    where: { id: attachmentId, userId },
  });

  if (!attachment) {
    throw new Error("attachmentNotFound");
  }

  return await prisma.attachment.update({
    where: { id: attachmentId },
    data,
  });
}

export async function deleteAttachment(userId: string, attachmentId: string) {
  const attachment = await prisma.attachment.findFirst({
    where: { id: attachmentId, userId },
  });

  if (!attachment) {
    throw new Error("attachmentNotFound");
  }

  await prisma.attachment.delete({
    where: { id: attachmentId },
  });

  return attachment;
}

export async function submitKyc(
  userId: string,
  data: { 
    idType: string; 
    idNumber: string;
  }
) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      idType: data.idType,
      idNumber: data.idNumber,
      idStatus: "PENDING",
    },
  });
}

