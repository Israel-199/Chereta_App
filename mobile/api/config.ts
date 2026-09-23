import axiosClient from "./axiosClient";

export async function getAppStatus() {
  const res = await axiosClient.get("/config/app-status");
  return res.data;
}
