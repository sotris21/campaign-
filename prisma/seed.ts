// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert default campaign
  const campaign = await prisma.campaign.upsert({
    where: { id: "default-campaign" },
    update: {},
    create: {
      id: "default-campaign",
      candidateName: "Andreas Karagiannopoulos",
      partyName: "Reform UK",
      ward: "Bromford & Hodge Hill",
      council: "Birmingham City Council",
      electionDate: new Date("2026-05-07"),
      facebookPageUrl: "https://www.facebook.com/share/1BL6Z3vujf/",
      brandPrimary: "#f5c518",
      brandSecondary: "#000000",
    },
  });

  console.log(`✅ Campaign created: ${campaign.candidateName}`);

  // Default hashtags
  const defaultHashtags = [
    { tag: "#BromfordAndHodgeHill", platforms: "all" },
    { tag: "#ReformUK", platforms: "all" },
    { tag: "#VoteAndreas", platforms: "all" },
    { tag: "#GetStarmerOut", platforms: "all" },
    { tag: "#VoteReform", platforms: "all" },
    { tag: "#BrumPolitics", platforms: "all" },
    { tag: "#LocalElections2026", platforms: "all" },
    { tag: "#Birmingham", platforms: "instagram,tiktok" },
    { tag: "#Bromford", platforms: "instagram,tiktok" },
    { tag: "#HodgeHill", platforms: "instagram,tiktok" },
    { tag: "#VoteLocal", platforms: "all" },
    { tag: "#MakeYourVoteCount", platforms: "facebook,instagram" },
    { tag: "#CommunityFirst", platforms: "facebook,instagram" },
    { tag: "#BrumCommunity", platforms: "all" },
    { tag: "#May7th", platforms: "all" },
  ];

  for (const ht of defaultHashtags) {
    await prisma.hashtag.upsert({
      where: {
        id: `default-${ht.tag.replace("#", "")}`,
      },
      update: {},
      create: {
        id: `default-${ht.tag.replace("#", "")}`,
        campaignId: campaign.id,
        tag: ht.tag,
        platforms: ht.platforms,
        group: "default",
      },
    });
  }

  console.log(`✅ ${defaultHashtags.length} default hashtags seeded`);

  // Default app settings
  await prisma.appSetting.upsert({
    where: { key: "defaultCampaignId" },
    update: { value: campaign.id },
    create: { key: "defaultCampaignId", value: campaign.id },
  });

  console.log("✅ App settings seeded");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
