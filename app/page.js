import { readFile } from "fs/promises";
import { join } from "path";
import MenuClient from "./menu-client";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const sections = JSON.parse(await readFile(join(process.cwd(), "data", "menu.json"), "utf8"));
  return <MenuClient initialSections={sections} />;
}
