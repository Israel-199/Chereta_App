import axiosClient from "./axiosClient";
import { useAuthStore } from "../store/auth";

export async function getAttachments() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.get("/user/attachments", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function uploadAttachment(uri: string, about: string, fileName: string, fileType: string) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const formData = new FormData();
  formData.append("file", {
    uri,
    type: fileType,
    name: fileName,
  } as any);
  if (about) {
    formData.append("about", about);
  }

  const res = await axiosClient.post("/user/attachments", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  await useAuthStore.getState().preloadData();

  return res.data;
}

export async function updateAttachment(
  id: string,
  about: string,
  uri?: string,
  fileName?: string,
  fileType?: string
) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  let res;
  if (uri) {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: fileType,
      name: fileName,
    } as any);
    if (about) {
      formData.append("about", about);
    }
    res = await axiosClient.patch(`/user/attachments/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  } else {
    res = await axiosClient.patch(`/user/attachments/${id}`, { about }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  await useAuthStore.getState().preloadData();
  return res.data;
}

export async function deleteAttachment(id: string) {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const res = await axiosClient.delete(`/user/attachments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  await useAuthStore.getState().preloadData();
  return res.data;
}

