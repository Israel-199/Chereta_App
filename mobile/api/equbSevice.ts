import axiosClient from "./axiosClient";
import { useAuthStore } from "@/store/auth";

export async function getHouseEqubs() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.filter((equb: any) => equb.type === "HOUSE");
}

export async function getMonthlyEqubs() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.filter((equb: any) => equb.type === "MONTHLY");
}

export async function getDailyEqubs() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.filter((equb: any) => equb.type === "DAILY");
}

export async function getPhoneEqubs() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.filter((equb: any) => equb.type === "PHONE");
}

export async function getRefrigeratorEqubs() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.filter((equb: any) => equb.type === "REFRIGERATOR");
}

export async function getTvEqubs() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.filter((equb: any) => equb.type === "TV");
}

export async function getSofaEqubs() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.filter((equb: any) => equb.type === "SOFA");
}

export async function getVehicleEqubs() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.filter((equb: any) => equb.type === "VEHICLE");
}

export async function getWeeklyEqubs() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.filter((equb: any) => equb.type === "WEEKLY");
}

export async function getAvailableEqubTypes(): Promise<string[]> {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs/types", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

export async function joinEqub(equbId: string) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.post(
    `/equbs/${equbId}/join`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return res.data;
}

export async function getMyEqubs() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs/my", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

export async function leaveEqub(equbId: string) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.post(
    `/equbs/${equbId}/leave`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return res.data;
}

export async function getEqubById(equbId: string) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get(`/equbs/${equbId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

export async function getEqubHistory() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs/history", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

export async function getCompletedEqubs() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/equbs/completed", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

// ---- Equb Marketplace ----

export async function getEqubListings(equbId: string) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get(`/equbs/${equbId}/listings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

export async function getMyListings() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  // Reusing /equbs prefix since route is registered there
  const res = await axiosClient.get("/equbs/listings/my", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

export async function createEqubListing(equbId: string, sellingPrice: number) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.post(
    `/equbs/${equbId}/listings`,
    { sellingPrice },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
}

export async function buyEqubListing(equbId: string, listingId: string) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.post(
    `/equbs/${equbId}/listings/${listingId}/buy`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
}

export async function cancelEqubListing(equbId: string, listingId: string) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.delete(
    `/equbs/${equbId}/listings/${listingId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
}

