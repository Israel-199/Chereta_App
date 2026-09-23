import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as userService from "./user.service";
import { UpdateProfileInput } from "./user.validation";
import cloudinary from "../../lib/cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

export async function completeProfile(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ errorKey: "noToken" });

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id || decoded.userId;

    const input: any = {};
    if (req.body.firstName) input.firstName = req.body.firstName;
    if (req.body.lastName) input.lastName = req.body.lastName;
    if (req.body.gender) input.gender = req.body.gender;
    if (req.body.address) input.address = req.body.address;

    const parseResult = UpdateProfileInput.safeParse(input);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0].message;
      return res.status(400).json({ error: firstError });
    }

    let photoUrl: string | undefined;
    const file = req.file as Express.Multer.File | undefined;
    if (file) {
      const uploadResult: UploadApiResponse = await new Promise(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "profiles" },
            (
              error: UploadApiErrorResponse | undefined,
              result: UploadApiResponse | undefined,
            ) => {
              if (error) return reject(error);
              if (!result)
                return reject(new Error("No result from Cloudinary"));
              resolve(result);
            },
          );
          stream.end(file.buffer);
        },
      );
      photoUrl = uploadResult.secure_url;
    }

    const result = await userService.completeProfile(userId, {
      ...parseResult.data,
      photo: photoUrl,
    });

    res.status(200).json(result);
  } catch (err: any) {
    console.error("CompleteProfile error:", err);
    res.status(500).json({ errorKey: err.message });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(400).json({ errorKey: "noToken" });

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id || decoded.userId;

    const user = await userService.getMe(userId);

    res.status(200).json(user);
  } catch (err: any) {
    console.error("GetMe error:", err);
    res.status(401).json({ errorKey: err.message });
  }
}

export async function getNotifications(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const userId = user.id || user.userId;
    
    // Using inline import/prisma since it's already available globally in the project
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    
    const logs = await db.notificationLog.findMany({
      where: { 
        userId,
        title: { not: null, notIn: [''] },
        message: { not: null, notIn: [''] }
      },
      orderBy: { createdAt: "desc" }
    });
    
    res.status(200).json(logs);
  } catch (err: any) {
    console.error("GetNotifications error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getAttachments(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const userId = user.id || user.userId;
    const attachments = await userService.getAttachments(userId);
    res.status(200).json(attachments);
  } catch (err: any) {
    console.error("GetAttachments error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function uploadAttachment(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const userId = user.id || user.userId;
    const { about } = req.body;
    const file = req.file as Express.Multer.File | undefined;

    if (!about || about.trim() === "") {
      return res.status(400).json({ error: "About section is needed" });
    }

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadResult: UploadApiResponse = await new Promise(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `attachments/${userId}`, resource_type: "auto" },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("No result from Cloudinary"));
            resolve(result);
          },
        );
        stream.end(file.buffer);
      },
    );

    const attachment = await userService.createAttachment({
      userId,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileName: file.originalname,
      fileType: file.mimetype,
      about,
    });

    res.status(201).json(attachment);
  } catch (err: any) {
    console.error("UploadAttachment error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function updateAttachment(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const userId = user.id || user.userId;
    const id = req.params.id as string;
    const { about } = req.body;
    const file = req.file as Express.Multer.File | undefined;

    if (!about || about.trim() === "") {
      return res.status(400).json({ error: "about section is needed" });
    }

    const existing = await userService.getAttachments(userId);
    const attachmentToUpdate = existing.find(a => a.id === id);
    if (!attachmentToUpdate) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    const updateData: any = { about };

    if (file) {
      const uploadResult: UploadApiResponse = await new Promise(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "attachments", resource_type: "auto" },
            (
              error: UploadApiErrorResponse | undefined,
              result: UploadApiResponse | undefined,
            ) => {
              if (error) return reject(error);
              if (!result) return reject(new Error("No result from Cloudinary"));
              resolve(result);
            },
          );
          stream.end(file.buffer);
        },
      );

      updateData.fileUrl = uploadResult.secure_url;
      updateData.publicId = uploadResult.public_id;
      updateData.fileName = file.originalname;
      updateData.fileType = file.mimetype;

      if ((attachmentToUpdate as any).publicId) {
        await cloudinary.uploader.destroy((attachmentToUpdate as any).publicId);
      }
    }

    const attachment = await userService.updateAttachment(userId, id, updateData);
    res.status(200).json(attachment);
  } catch (err: any) {
    console.error("UpdateAttachment error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAttachment(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const userId = user.id || user.userId;
    const id = req.params.id as string;

    const attachment: any = await userService.deleteAttachment(userId, id);

    if (attachment.publicId) {
      await cloudinary.uploader.destroy(attachment.publicId);
    }

    res.status(200).json({ message: "Attachment deleted" });
  } catch (err: any) {
    console.error("DeleteAttachment error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function submitKyc(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const userId = user.id || user.userId;
    const { idType, idNumber } = req.body;

    if (!idType || !idNumber) {
      return res.status(400).json({ error: "ID type and ID number are required" });
    }

    const updatedUser = await userService.submitKyc(userId, { idType, idNumber });
    res.status(200).json({ message: "KYC submitted", user: updatedUser });
  } catch (err: any) {
    console.error("SubmitKyc error:", err);
    res.status(500).json({ error: err.message });
  }
}
export async function submitKycWithFiles(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const userId = user.id || user.userId;
    const { idType, idNumber } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!idType || !idNumber) {
      return res.status(400).json({ error: "ID type and ID number are required" });
    }

    if (!files || !files['frontImage']) {
      return res.status(400).json({ error: "Front ID image is required" });
    }

    console.log("Starting unified KYC submission for user:", userId);

    await userService.submitKyc(userId, { idType, idNumber });
    console.log("Basic KYC info updated");

    const uploadTasks = [];

    const frontFile = files['frontImage'][0];
    console.log("Uploading front image...");
    uploadTasks.push((async () => {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `attachments/${userId}`, resource_type: "auto" },
          (error, result) => error ? reject(error) : resolve(result!)
        );
        stream.end(frontFile.buffer);
      });
      console.log("Front image uploaded to Cloudinary:", result.secure_url);
      return userService.createAttachment({
        userId,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileName: frontFile.originalname,
        fileType: frontFile.mimetype,
        about: "ID_FRONT"
      });
    })());

    if (files['backImage'] && files['backImage'][0]) {
      const backFile = files['backImage'][0];
      console.log("Uploading back image...");
      uploadTasks.push((async () => {
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `attachments/${userId}`, resource_type: "auto" },
            (error, result) => error ? reject(error) : resolve(result!)
          );
          stream.end(backFile.buffer);
        });
        console.log("Back image uploaded to Cloudinary:", result.secure_url);
        return userService.createAttachment({
          userId,
          fileUrl: result.secure_url,
          publicId: result.public_id,
          fileName: backFile.originalname,
          fileType: backFile.mimetype,
          about: "ID_BACK"
        });
      })());
    }

    await Promise.all(uploadTasks);
    console.log("All upload tasks completed successfully");

    const updatedUser = await userService.getMe(userId);
    res.status(200).json({ message: "KYC submitted successfully", user: updatedUser });
  } catch (err: any) {
    console.error("SubmitKycWithFiles error:", err);
    res.status(500).json({ error: err.message });
  }
}
