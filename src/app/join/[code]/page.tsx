import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Metadata } from "next";
import JoinClient from "./JoinClient";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const normalizedCode = code ? code.trim().toUpperCase() : "";

  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const league = await convex.query(api.leagues.getByCode, { code: normalizedCode });
    if (league) {
      const title = `Únete a la liga ${league.name} — ParlAI Mundial 2026`;
      const description = `Te invitaron a la liga "${league.name}" en ParlAI Mundial. Únete a la liga creada por ${league.ownerName} y demuestra quién sabe más de fútbol.`;
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `/join/${normalizedCode}`,
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata for join page:", error);
  }

  return {
    title: "Invitación a Liga — ParlAI Mundial 2026",
    description: "Te invitaron a competir en una liga de ParlAI Mundial. Crea tus pronósticos y juega con tus amigos.",
  };
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params;
  const normalizedCode = code ? code.trim().toUpperCase() : "";

  let initialLeague = null;
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    initialLeague = await convex.query(api.leagues.getByCode, { code: normalizedCode });
  } catch (error) {
    console.error("Error pre-fetching league data:", error);
  }

  return <JoinClient code={normalizedCode} initialLeague={initialLeague} />;
}
