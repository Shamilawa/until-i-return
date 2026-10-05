import { z } from "zod";
import { getPhoto, readerCanSeePhoto } from "@/server/letters";
import { getRole } from "@/server/session";
import { readPhoto } from "@/server/storage";

const notFound = () => new Response(null, { status: 404 });

// The only way a photo reaches the browser. A locked letter's photo answers
// 404 for the reader, exactly like a photo that does not exist.
export async function GET(_request: Request, ctx: RouteContext<"/api/photos/[id]">) {
  const role = await getRole();
  if (!role) return new Response(null, { status: 401 });

  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success) return notFound();
  if (role === "reader" && !(await readerCanSeePhoto(id))) return notFound();

  const photo = await getPhoto(id);
  const data = photo && (await readPhoto(photo.blobUrl));
  if (!photo || !data) return notFound();

  return new Response(data, {
    headers: { "Content-Type": photo.contentType, "Cache-Control": "private, max-age=3600" },
  });
}
