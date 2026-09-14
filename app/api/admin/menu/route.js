import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import { validateRequest } from "../../../../lib/auth";

const DATA_PATH = join(process.cwd(), "data", "menu.json");

export async function GET(request) {
  if (!validateRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    console.error("Failed to read menu:", err);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!validateRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();

    // Validate structure: array of [title, subtitle, items[]]
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid menu format" }, { status: 400 });
    }
    for (const section of data) {
      if (!Array.isArray(section) || section.length !== 3) {
        return NextResponse.json({ error: "Invalid section format" }, { status: 400 });
      }
      if (typeof section[0] !== "string" || typeof section[1] !== "string" || !Array.isArray(section[2])) {
        return NextResponse.json({ error: "Invalid section data types" }, { status: 400 });
      }
    }

    await writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save menu:", err);
    return NextResponse.json({ error: "Failed to save menu" }, { status: 500 });
  }
}
