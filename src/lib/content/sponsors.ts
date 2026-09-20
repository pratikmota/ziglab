import fs from "node:fs";
import path from "node:path";

export type PartnerSponsor = {
  name: string;
  url: string;
  logo: string;
  blurb: string;
};

export type GoldSponsor = {
  name: string;
  url: string;
  logo: string;
};

export type CommunitySponsor = {
  name: string;
  url: string;
};

export type SponsorsFile = {
  partners: PartnerSponsor[];
  gold: GoldSponsor[];
  community: CommunitySponsor[];
};

const emptySponsors: SponsorsFile = {
  partners: [],
  gold: [],
  community: [],
};

export function getSponsors(): SponsorsFile {
  const filePath = path.join(process.cwd(), "content/sponsors.json");
  if (!fs.existsSync(filePath)) {
    return emptySponsors;
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as Partial<SponsorsFile>;

  return {
    partners: Array.isArray(parsed.partners) ? parsed.partners : [],
    gold: Array.isArray(parsed.gold) ? parsed.gold : [],
    community: Array.isArray(parsed.community) ? parsed.community : [],
  };
}

export function hasAnySponsors(sponsors: SponsorsFile): boolean {
  return (
    sponsors.partners.length > 0 ||
    sponsors.gold.length > 0 ||
    sponsors.community.length > 0
  );
}
