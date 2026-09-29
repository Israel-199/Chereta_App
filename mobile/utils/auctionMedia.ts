import { ImageSource } from "expo-image";

const LOCAL_IMAGES: Record<string, ImageSource> = {
  dubia: require("../assets/images/dubia/dubia.jpg"),
  dubia1: require("../assets/images/dubia/dubia1.jpg"),
  dubia2: require("../assets/images/dubia/dubia2.jpeg"),
  dubia3: require("../assets/images/dubia/dubia3.jpeg"),
  dubia4: require("../assets/images/dubia/dubia4.jpeg"),
  dubia5: require("../assets/images/dubia/dubia5.jpg"),
  sofa: require("../assets/images/sofa/sofa.png"),
  sofa2: require("../assets/images/sofa/sofa_2.png"),
  sofa3: require("../assets/images/sofa/sofa_3.png"),
  washing: require("../assets/images/washing/washing.png"),
};

export function resolveAuctionImage(uri: string): ImageSource {
  if (!uri) return LOCAL_IMAGES.laptop;
  if (uri.startsWith("local:")) {
    const key = uri.replace("local:", "");
    return LOCAL_IMAGES[key] || LOCAL_IMAGES.laptop;
  }
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return { uri };
  }
  return LOCAL_IMAGES[uri] || { uri };
}

export function resolveAuctionImages(images: string[] = []): ImageSource[] {
  if (!images.length) return [LOCAL_IMAGES.laptop];
  return images.map(resolveAuctionImage);
}
