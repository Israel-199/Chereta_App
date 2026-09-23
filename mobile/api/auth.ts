import axiosClient from "./axiosClient";
import { useAuthStore } from "../store/auth";
import { queryClient } from "../app/_layout";
import { clearAllStores } from "../utils/storeUtils";

export async function requestOtp(phoneNumber: string) {
  const res = await axiosClient.post("/auth/request-otp", { phoneNumber });
  if (res.data?.token) {
    queryClient.clear(); 
    clearAllStores();    
    useAuthStore.getState().setToken(res.data.token);
    await useAuthStore.getState().preloadData();
  }
  return res.data;
}

export async function resendOtp(phoneNumber: string) {
  const res = await axiosClient.post("/auth/resend-otp", { phoneNumber });
  return res.data;
}

export async function verifyOtp(
  phoneNumber: string,
  code: string,
  deviceId: string,
) {
  const res = await axiosClient.post("/auth/verify-otp", {
    phoneNumber,
    code,
    deviceId,
  });
  if (res.data?.token) {
    queryClient.clear(); 
    clearAllStores();    
    useAuthStore.getState().setToken(res.data.token);
    await useAuthStore.getState().preloadData();
  }
  return res.data;
}

export async function completeProfile(data: {
  firstName: string;
  lastName: string;
  gender: string;
  address: string;
  photo?: string;
}) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.post("/user/complete-profile", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  queryClient.clear();
  await useAuthStore.getState().preloadData();

  return res.data;
}

export async function getProfile() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/user/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function logout() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.post(
    "/auth/logout",
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  queryClient.clear(); 
  clearAllStores();    
  useAuthStore.getState().clearToken();
  return res.data;
}

export async function uploadProfilePhoto(uri: string) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const formData = new FormData();
  formData.append("photo", {
    uri,
    type: "image/jpeg",
    name: "profile.jpg",
  } as any);

  const res = await axiosClient.post("/user/complete-profile", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  await useAuthStore.getState().preloadData();

  return res.data;
}
