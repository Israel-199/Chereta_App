import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma/prisma";

export async function sendOtp(phoneNumber: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

  let user = await prisma.user.findUnique({ where: { phoneNumber } });

  if (user && user.status === "SUSPENDED") {
    throw new Error("accountSuspended");
  }
  if (user && user.verifiedAt) {
    const token = jwt.sign(
      { id: user.id, role: user.role, deviceId: "shortcut-session" },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );
    return { 
      token, 
      user, 
      messageKey: "welcomeBack", 
      phoneNumber, 
      needsProfileCompletion: !user.firstName 
    };
  }

  if (!user) {
    const userCode = await generateUniqueUserCode();
    user = await prisma.user.create({
      data: {
        phoneNumber,
        role: Role.MEMBER,
        status: "ACTIVE",
        userCode
      }
    });
  }

  await prisma.otpLog.create({
    data: {
      userId: user.id,
      phoneNumber,
      code,
      expiresAt,
      attempts: 0
    }
  });

  return { messageKey: "otpSent", phoneNumber, code };
}

export async function resendOtp(phoneNumber: string) {
  return sendOtp(phoneNumber);
}

export async function verifyOtp(phoneNumber: string, code: string, deviceId: string) {
  const otpRec = await prisma.otpLog.findFirst({ 
    where: { phoneNumber, code, expiresAt: { gte: new Date() } },
    orderBy: { createdAt: 'desc' }
  });

  if (!otpRec) {
    throw new Error("invalidOtp");
  }

  let user = await prisma.user.findUnique({ where: { phoneNumber } });

  if (!user) {
    throw new Error("userNotFound");
  }

  if (user.status === "SUSPENDED") {
    throw new Error("accountSuspended");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, deviceId },
    process.env.JWT_SECRET!,
    { expiresIn: "30d" }
  );

  if (!user.verifiedAt) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { verifiedAt: new Date() }
    });
  }

  // Non-blocking background tracking for ultra fast response
  prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "USER_LOGIN",
      ipAddress: "Mobile_Client",
      userAgent: deviceId || "Mobile App"
    }
  }).catch(() => {});

  return { 
    token, 
    user,
    needsProfileCompletion: !user.firstName 
  };
}

export async function logout(token: string) {
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (decoded && decoded.id) {
      await prisma.activityLog.create({
        data: {
          userId: decoded.id,
          action: "USER_LOGOUT",
          ipAddress: "Mobile_Client",
          userAgent: "Mobile App"
        }
      });
    }
  } catch (e) {
    // Ignore verification errors on logout
  }
  return { messageKey: "logoutSuccess" };
}

export async function loginAdmin(
  email: string, 
  password: string, 
  ipAddress?: string, 
  userAgent?: string
) {
  const admin = await prisma.user.findUnique({ where: { email } });
  const allowedRoles: Role[] = [Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE_ADMIN, Role.CUSTOMER_SERVICE_ADMIN];
  if (!admin || !allowedRoles.includes(admin.role)) throw new Error("invalidCredentials");

  const isMatch = await bcrypt.compare(password, admin.passwordHash!);
  if (!isMatch) throw new Error("invalidCredentials");

  const token = jwt.sign(
    { id: admin.id, role: admin.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" },
  );

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "ADMIN_LOGIN",
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown"
    }
  });

  const lastLogin = await prisma.activityLog.findFirst({
    where: { userId: admin.id, action: "ADMIN_LOGIN" },
    orderBy: { createdAt: "desc" },
    skip: 1
  });

  if (lastLogin && lastLogin.ipAddress !== ipAddress) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: `SUSPICIOUS_LOGIN: IP changed from ${lastLogin.ipAddress} to ${ipAddress}`,
        ipAddress: ipAddress || "unknown"
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "LOGIN_ADMIN",
      ipAddress: ipAddress || "unknown"
    }
  });

  return { token, messageKey: "welcomeAdmin", user: admin };
}

/**
 * Update Admin Security Details
 */
export async function updateAdminProfile(adminId: string, currentPassword: string, newEmail?: string, newPassword?: string) {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin) throw new Error("adminNotFound");

  const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash!);
  if (!isMatch) throw new Error("incorrectPassword");

  const updateData: any = {};
  if (newEmail) updateData.email = newEmail;
  if (newPassword) {
    updateData.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  return await prisma.user.update({
    where: { id: adminId },
    data: updateData
  });
}

async function generateUniqueUserCode(): Promise<string> {
  const lastUser = await prisma.user.findFirst({
    where: { userCode: { startsWith: "HQ" } },
    orderBy: { createdAt: "desc" }
  });

  let startingNumber = 1;
  if (lastUser && lastUser.userCode && lastUser.userCode.startsWith("HQ")) {
    const numericPart = parseInt(lastUser.userCode.substring(2), 10);
    if (!isNaN(numericPart)) {
      startingNumber = numericPart + 1;
    }
  }

  let attempt = startingNumber;
  while (attempt < 1000000) {
    const code = `HQ${attempt.toString().padStart(3, '0')}`;
    const exists = await prisma.user.findUnique({ where: { userCode: code } });
    if (!exists) return code;
    attempt++;
  }
  throw new Error("Failed to generate unique user code");
}
