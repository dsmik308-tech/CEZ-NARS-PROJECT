import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { MASTER_CATALOG, PROVINCE_CATALOG, REGION_CATALOG } from "../src/lib/nars-master-catalog";

type PropertyKind = "LAND" | "BUILDING" | "SPECIALIZED";

const prisma = new PrismaClient();

function codeOf(name: string) {
  return name.toUpperCase().replaceAll(" ", "_").replaceAll("–", "").replaceAll("-", "_");
}

async function main() {
  for (const region of REGION_CATALOG) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: { name: region.name },
      create: region,
    });
  }

  for (const [regionCode, provinces] of Object.entries(PROVINCE_CATALOG)) {
    const region = await prisma.region.findUniqueOrThrow({ where: { code: regionCode } });
    const allowed = new Set(provinces);
    for (const provinceName of provinces) {
      await prisma.province.upsert({
        where: {
          code_regionId: {
            code: codeOf(provinceName),
            regionId: region.id,
          },
        },
        update: { name: provinceName },
        create: {
          code: codeOf(provinceName),
          name: provinceName,
          regionId: region.id,
        },
      });
    }

    const extras = await prisma.province.findMany({
      where: { regionId: region.id },
      include: { _count: { select: { properties: true } } },
    });
    for (const extra of extras) {
      if (!allowed.has(extra.name) && extra._count.properties === 0) {
        await prisma.province.delete({ where: { id: extra.id } });
      }
    }
  }

  await prisma.masterOption.deleteMany();
  for (const [category, values] of Object.entries(MASTER_CATALOG)) {
    await prisma.masterOption.createMany({
      data: values.map((item, i) => ({
        category,
        label: item.label,
        code: item.code || item.label,
        metadata: item.metadata ? JSON.stringify(item.metadata) : null,
        sortOrder: i,
        active: true,
      })),
    });
  }

  const region = await prisma.region.findUniqueOrThrow({ where: { code: "REGION_IVA" } });
  const cavite = await prisma.province.findFirstOrThrow({
    where: { regionId: region.id, name: "Cavite" },
  });
  const ncr = await prisma.region.findUniqueOrThrow({ where: { code: "NCR" } });
  const metro = await prisma.province.findFirstOrThrow({
    where: { regionId: ncr.id, name: "Metro Manila" },
  });

  const existingProperties = await prisma.property.count();
  if (existingProperties > 0) {
    await seedUsers();
    return;
  }

  const demo: Array<{
    propertyKind: PropertyKind;
    assetType: string;
    accountCode: string;
    assetName: string;
    assetDescription: string;
    regionId: string;
    provinceId: string;
    cityMunicipality: string;
    barangay: string;
    latitude: number;
    longitude: number;
    cezPhase: string;
    cezBlock: string;
    cezLot?: string;
    owner: string;
    modeOfAcquisitionConveyance: string;
    acquisitionCost: number;
    accumulatedDepreciation: number;
    netBookValue: number;
    soundMarketValueAmount: number;
    appraisedValueAmount: number;
    assessedValueAmount: number;
    replacementValueAmount: number;
    improvementValueAmount: number;
    floorLotAreaSqm: number;
    landClassification?: string;
    structureMaterial?: string;
    assetCondition: string;
    securityType: string;
    floodDefence?: string;
    isInsured?: boolean;
    policyType?: string;
    insurerName?: string;
    remarks: string;
  }> = [
    {
      propertyKind: "LAND",
      assetType: "Land",
      accountCode: "10601010-00 Land",
      assetName: "CEZ Main Lot – Phase 1",
      assetDescription: "Registered PEZA industrial land parcel within Cavite Economic Zone Phase 1.",
      regionId: region.id,
      provinceId: cavite.id,
      cityMunicipality: "General Trias / Rosario",
      barangay: "Bacao",
      latitude: 1420,
      longitude: 780,
      cezPhase: "Phase 1",
      cezBlock: "Block 1",
      cezLot: "Lot 01",
      owner: "PEZA",
      modeOfAcquisitionConveyance: "Transfer",
      acquisitionCost: 250000000,
      accumulatedDepreciation: 0,
      netBookValue: 250000000,
      soundMarketValueAmount: 312500000,
      appraisedValueAmount: 310000000,
      assessedValueAmount: 187500000,
      replacementValueAmount: 312500000,
      improvementValueAmount: 0,
      floorLotAreaSqm: 185000,
      landClassification: "Industrial Land",
      assetCondition: "Good",
      securityType: "Gated with Security Personnel",
      floodDefence: "Drainage System",
      remarks: "Seed land record linked to the CEZ Master Plan. Illustrative NARS values for demonstration.",
    },
    {
      propertyKind: "BUILDING",
      assetType: "Buildings",
      accountCode: "10604010-00 Buildings",
      assetName: "PEZA Administration Building",
      assetDescription: "Main administrative building serving Cavite Economic Zone operations.",
      regionId: region.id,
      provinceId: cavite.id,
      cityMunicipality: "Rosario",
      barangay: "Bacao",
      latitude: 980,
      longitude: 1120,
      cezPhase: "Phase 4",
      cezBlock: "Block 16",
      owner: "PEZA",
      modeOfAcquisitionConveyance: "Transfer",
      acquisitionCost: 85000000,
      accumulatedDepreciation: 12500000,
      netBookValue: 72500000,
      soundMarketValueAmount: 98000000,
      appraisedValueAmount: 96000000,
      assessedValueAmount: 64000000,
      replacementValueAmount: 120000000,
      improvementValueAmount: 4500000,
      floorLotAreaSqm: 2500,
      structureMaterial: "Concrete Moment Frames",
      assetCondition: "Good",
      securityType: "Gated with Security Personnel",
      floodDefence: "Elevated Structure",
      isInsured: true,
      policyType: "Fire Insurance",
      insurerName: "GSIS",
      remarks: "Seed building record linked to the CEZ Master Plan. Illustrative NARS values for demonstration.",
    },
    {
      propertyKind: "LAND",
      assetType: "Land",
      accountCode: "10601010-00 Land",
      assetName: "CEZ Phase 3 Industrial Parcel",
      assetDescription: "PEZA-owned industrial land within CEZ Phase 3, Rosario, Cavite.",
      regionId: region.id,
      provinceId: cavite.id,
      cityMunicipality: "Rosario",
      barangay: "Ligtong",
      latitude: 430,
      longitude: 820,
      cezPhase: "Phase 3",
      cezBlock: "Block 5",
      cezLot: "Lot 12",
      owner: "PEZA",
      modeOfAcquisitionConveyance: "Purchased",
      acquisitionCost: 128000000,
      accumulatedDepreciation: 0,
      netBookValue: 128000000,
      soundMarketValueAmount: 164000000,
      appraisedValueAmount: 160000000,
      assessedValueAmount: 96000000,
      replacementValueAmount: 164000000,
      improvementValueAmount: 0,
      floorLotAreaSqm: 92000,
      landClassification: "Industrial Land",
      assetCondition: "Good",
      securityType: "Perimeter Fence",
      floodDefence: "Drainage System",
      remarks: "Phase 3 parcel used as a GIS-linked demonstration record.",
    },
    {
      propertyKind: "LAND",
      assetType: "Land",
      accountCode: "10601010-00 Land",
      assetName: "CEZ Phase 2 Expansion Parcel",
      assetDescription: "Industrial landholding in CEZ Phase 2, General Trias side of the zone.",
      regionId: region.id,
      provinceId: cavite.id,
      cityMunicipality: "General Trias",
      barangay: "Javalera",
      latitude: 1080,
      longitude: 1760,
      cezPhase: "Phase 2",
      cezBlock: "Block 15A",
      owner: "PEZA",
      modeOfAcquisitionConveyance: "Transfer",
      acquisitionCost: 176000000,
      accumulatedDepreciation: 0,
      netBookValue: 176000000,
      soundMarketValueAmount: 210000000,
      appraisedValueAmount: 205000000,
      assessedValueAmount: 132000000,
      replacementValueAmount: 210000000,
      improvementValueAmount: 0,
      floorLotAreaSqm: 64000,
      landClassification: "Industrial Land",
      assetCondition: "Good",
      securityType: "Gated with Security Personnel",
      remarks: "GIS pin placed on Phase 2 of the CEZ Master Plan.",
    },
    {
      propertyKind: "BUILDING",
      assetType: "Buildings",
      accountCode: "10604010-00 Buildings",
      assetName: "CEZ Customs and One-Stop Shop Building",
      assetDescription: "Zone customs facilitation and PEZA one-stop shop facility.",
      regionId: region.id,
      provinceId: cavite.id,
      cityMunicipality: "Rosario",
      barangay: "Bacao",
      latitude: 1160,
      longitude: 1320,
      cezPhase: "Phase 4",
      cezBlock: "Block 20",
      owner: "PEZA",
      modeOfAcquisitionConveyance: "Purchased",
      acquisitionCost: 42000000,
      accumulatedDepreciation: 8400000,
      netBookValue: 33600000,
      soundMarketValueAmount: 48000000,
      appraisedValueAmount: 47000000,
      assessedValueAmount: 31500000,
      replacementValueAmount: 58000000,
      improvementValueAmount: 2100000,
      floorLotAreaSqm: 1800,
      structureMaterial: "Steel Frames",
      assetCondition: "Fair",
      securityType: "Access Control",
      floodDefence: "Perimeter Wall",
      isInsured: true,
      policyType: "Property Insurance",
      insurerName: "GSIS",
      remarks: "Building asset linked to Phase 4 of the CEZ Master Plan.",
    },
    {
      propertyKind: "LAND",
      assetType: "Land",
      accountCode: "10601010-00 Land",
      assetName: "CEZ Greenbelt / Open Space",
      assetDescription: "Retained PEZA open space and greenbelt within the economic zone.",
      regionId: region.id,
      provinceId: cavite.id,
      cityMunicipality: "Rosario",
      barangay: "Bacao",
      latitude: 780,
      longitude: 680,
      cezPhase: "Phase 1",
      cezBlock: "Green Area",
      owner: "PEZA",
      modeOfAcquisitionConveyance: "Transfer",
      acquisitionCost: 18000000,
      accumulatedDepreciation: 0,
      netBookValue: 18000000,
      soundMarketValueAmount: 24000000,
      appraisedValueAmount: 22000000,
      assessedValueAmount: 9000000,
      replacementValueAmount: 24000000,
      improvementValueAmount: 1500000,
      floorLotAreaSqm: 21000,
      landClassification: "Others",
      assetCondition: "Good",
      securityType: "Perimeter Fence",
      remarks: "Open space retained for zone amenities and environmental buffer.",
    },
    {
      propertyKind: "SPECIALIZED",
      assetType: "Specialized Assets",
      accountCode: "10698990-00 Other PPE",
      assetName: "CEZ Electrical Substation and Distribution Yard",
      assetDescription: "Specialized power distribution asset supporting zone operations.",
      regionId: region.id,
      provinceId: cavite.id,
      cityMunicipality: "Rosario",
      barangay: "Ligtong",
      latitude: 900,
      longitude: 430,
      cezPhase: "Phase 1",
      cezBlock: "Block 6",
      owner: "PEZA",
      modeOfAcquisitionConveyance: "Purchased",
      acquisitionCost: 36500000,
      accumulatedDepreciation: 10950000,
      netBookValue: 25550000,
      soundMarketValueAmount: 30000000,
      appraisedValueAmount: 29000000,
      assessedValueAmount: 18250000,
      replacementValueAmount: 48000000,
      improvementValueAmount: 3200000,
      floorLotAreaSqm: 2400,
      structureMaterial: "Steel Frames",
      assetCondition: "Fair",
      securityType: "CCTV",
      floodDefence: "Elevated Structure",
      isInsured: true,
      policyType: "Property Insurance",
      insurerName: "GSIS",
      remarks: "Specialized PPE recorded for NARS summary demonstration.",
    },
    {
      propertyKind: "LAND",
      assetType: "Land",
      accountCode: "10601010-00 Land",
      assetName: "CEZ Annex 1 Parcel",
      assetDescription: "Annex landholding on the General Trias side of Cavite Economic Zone.",
      regionId: region.id,
      provinceId: cavite.id,
      cityMunicipality: "General Trias",
      barangay: "Javalera",
      latitude: 860,
      longitude: 2080,
      cezPhase: "CEZ I Annex",
      cezBlock: "Annex 1",
      owner: "PEZA",
      modeOfAcquisitionConveyance: "Donation",
      acquisitionCost: 54000000,
      accumulatedDepreciation: 0,
      netBookValue: 54000000,
      soundMarketValueAmount: 72000000,
      appraisedValueAmount: 70000000,
      assessedValueAmount: 40500000,
      replacementValueAmount: 72000000,
      improvementValueAmount: 0,
      floorLotAreaSqm: 28000,
      landClassification: "Industrial Land",
      assetCondition: "Good",
      securityType: "Perimeter Fence",
      remarks: "Annex parcel plotted on the CEZ Master Plan.",
    },
    {
      propertyKind: "BUILDING",
      assetType: "Buildings",
      accountCode: "10604010-00 Buildings",
      assetName: "PEZA Head Office Building",
      assetDescription: "PEZA national head office building recorded for NCR NARS summary coverage.",
      regionId: ncr.id,
      provinceId: metro.id,
      cityMunicipality: "Taguig",
      barangay: "Fort Bonifacio",
      latitude: 0,
      longitude: 0,
      cezPhase: "",
      cezBlock: "",
      owner: "PEZA",
      modeOfAcquisitionConveyance: "Purchased",
      acquisitionCost: 2100000000,
      accumulatedDepreciation: 168000000,
      netBookValue: 1932000000,
      soundMarketValueAmount: 2450000000,
      appraisedValueAmount: 2400000000,
      assessedValueAmount: 1575000000,
      replacementValueAmount: 2800000000,
      improvementValueAmount: 25000000,
      floorLotAreaSqm: 18500,
      structureMaterial: "Concrete Moment Frames",
      assetCondition: "Good",
      securityType: "Gated with Security Personnel",
      floodDefence: "Elevated Structure",
      isInsured: true,
      policyType: "Fire Insurance",
      insurerName: "GSIS",
      remarks: "National head office – not plotted on the CEZ map. Illustrative values only.",
    },
  ];

  await prisma.property.createMany({
    data: demo.map((item) => ({
      organizationCode: "350460000000",
      currency: "PHP",
      ...item,
      latitude: item.latitude || null,
      longitude: item.longitude || null,
      cezPhase: item.cezPhase || null,
      cezBlock: item.cezBlock || null,
    })),
  });

  await seedUsers();
}

async function seedUsers() {
  const accounts = [
    {
      username: "admin",
      email: "admin.nars@peza.gov.ph",
      fullName: "Maria Cristina Dela Cruz",
      role: "ADMIN",
      office: "PEZA Head Office – ICT / Asset Registry",
      password: "PEZA-Admin-2026",
    },
    {
      username: "encoder",
      email: "encoder.cez@peza.gov.ph",
      fullName: "Jose Miguel Santos",
      role: "ENCODER",
      office: "Cavite Economic Zone",
      password: "PEZA-Encoder-2026",
    },
    {
      username: "reviewer",
      email: "reviewer.ams@peza.gov.ph",
      fullName: "Anna Lorraine Reyes",
      role: "REVIEWER",
      office: "Asset Management Service",
      password: "PEZA-Reviewer-2026",
    },
    {
      username: "approver",
      email: "approver.nars@peza.gov.ph",
      fullName: "Roberto Villanueva",
      role: "APPROVER",
      office: "PEZA Head Office",
      password: "PEZA-Approver-2026",
    },
    {
      username: "auditor",
      email: "auditor.ias@peza.gov.ph",
      fullName: "Patricia Gomez",
      role: "AUDITOR",
      office: "Internal Audit Service",
      password: "PEZA-Auditor-2026",
    },
  ];

  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    await prisma.user.upsert({
      where: { username: account.username },
      update: {
        email: account.email,
        fullName: account.fullName,
        role: account.role,
        office: account.office,
        active: true,
        passwordHash,
      },
      create: {
        username: account.username,
        email: account.email,
        fullName: account.fullName,
        role: account.role,
        office: account.office,
        passwordHash,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
