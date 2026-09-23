import axiosClient from "./axiosClient";
import { useAuthStore } from "@/store/auth";

export async function createSupportTicket(subject: string, message: string) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.post("/support", { subject, message }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

export async function getMySupportTickets() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/support/my", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

export async function deleteSupportTicket(id: string) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.delete(`/support/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}
