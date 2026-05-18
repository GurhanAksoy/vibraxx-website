import { redirect } from "next/navigation";

export default async function sitemap() {
  redirect("https://www.vibraxx.com/sitemap_index.xml");
}