-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Province" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    CONSTRAINT "Province_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MasterOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "code" TEXT,
    "label" TEXT NOT NULL,
    "metadata" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationCode" TEXT NOT NULL DEFAULT '350460000000',
    "propertyKind" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "accountCode" TEXT,
    "assetName" TEXT NOT NULL,
    "assetDescription" TEXT,
    "regionId" TEXT,
    "provinceId" TEXT,
    "cityMunicipality" TEXT,
    "barangay" TEXT,
    "streetName" TEXT,
    "subdivisionPurok" TEXT,
    "houseLotBlockNo" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "gisGeometryType" TEXT NOT NULL DEFAULT 'POINT',
    "gisGeometry" TEXT,
    "cezPhase" TEXT,
    "cezBlock" TEXT,
    "cezLot" TEXT,
    "owner" TEXT,
    "withImpediments" BOOLEAN,
    "impedimentDetails" TEXT,
    "modeOfAcquisitionConveyance" TEXT,
    "acquisitionConveyanceInfo" TEXT,
    "dateOfAcquisition" DATETIME,
    "donorSellerTransferor" TEXT,
    "doneeBuyerTransferee" TEXT,
    "structureLandOwnedByAgency" BOOLEAN,
    "landTctTdAvailable" BOOLEAN,
    "tctTdNumber" TEXT,
    "currency" TEXT DEFAULT 'PHP',
    "acquisitionCost" REAL DEFAULT 0,
    "accumulatedDepreciation" REAL DEFAULT 0,
    "netBookValue" REAL DEFAULT 0,
    "assetLifeYears" INTEGER,
    "numberOfYearsUsed" INTEGER,
    "soundMarketValueCurrency" TEXT DEFAULT 'PHP',
    "soundMarketValueAmount" REAL DEFAULT 0,
    "dateOfValuation" DATETIME,
    "improvementValueCurrency" TEXT DEFAULT 'PHP',
    "improvementValueAmount" REAL DEFAULT 0,
    "latestImprovementDate" DATETIME,
    "appraisedValueCurrency" TEXT DEFAULT 'PHP',
    "appraisedValueAmount" REAL DEFAULT 0,
    "dateOfAppraisal" DATETIME,
    "assessedValueCurrency" TEXT DEFAULT 'PHP',
    "assessedValueAmount" REAL DEFAULT 0,
    "dateOfAssessment" DATETIME,
    "replacementValueCurrency" TEXT DEFAULT 'PHP',
    "replacementValueAmount" REAL DEFAULT 0,
    "modeOfDisposal" TEXT,
    "disposalInfo" TEXT,
    "dateOfDisposal" DATETIME,
    "disposalValue" REAL DEFAULT 0,
    "isInsured" BOOLEAN,
    "policyType" TEXT,
    "policyTypeOther" TEXT,
    "totalCoverageCurrency" TEXT DEFAULT 'PHP',
    "totalCoverageAmount" REAL DEFAULT 0,
    "totalPremiumCurrency" TEXT DEFAULT 'PHP',
    "totalPremiumAmount" REAL DEFAULT 0,
    "periodFrom" DATETIME,
    "periodTo" DATETIME,
    "insurerName" TEXT,
    "issuingBranch" TEXT,
    "insuredName" TEXT,
    "policyNumber" TEXT,
    "nonInsurableCurrency" TEXT DEFAULT 'PHP',
    "nonInsurableValue" REAL DEFAULT 0,
    "assetCondition" TEXT,
    "agencyAssetClassification" TEXT,
    "annualAverageOccupants" INTEGER,
    "structureMaterial" TEXT,
    "structureMaterialOther" TEXT,
    "numberOfFireExtinguishers" INTEGER,
    "numberOfSprinklers" INTEGER,
    "numberOfFireHose" INTEGER,
    "floodDefence" TEXT,
    "floodDefenceOther" TEXT,
    "floorLotAreaSqm" REAL,
    "landClassification" TEXT,
    "landClassificationOther" TEXT,
    "securityType" TEXT,
    "securityTypeOther" TEXT,
    "remarks" TEXT,
    "generalInfoJson" TEXT,
    "locationInfoJson" TEXT,
    "legalInfoJson" TEXT,
    "financialInfoJson" TEXT,
    "insuranceInfoJson" TEXT,
    "technicalInfoJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Property_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Property_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Province_code_regionId_key" ON "Province"("code", "regionId");

-- CreateIndex
CREATE INDEX "MasterOption_category_idx" ON "MasterOption"("category");

-- CreateIndex
CREATE INDEX "MasterOption_label_idx" ON "MasterOption"("label");

-- CreateIndex
CREATE INDEX "Property_propertyKind_idx" ON "Property"("propertyKind");

-- CreateIndex
CREATE INDEX "Property_assetName_idx" ON "Property"("assetName");

-- CreateIndex
CREATE INDEX "Property_organizationCode_idx" ON "Property"("organizationCode");

-- CreateIndex
CREATE INDEX "Property_regionId_idx" ON "Property"("regionId");

-- CreateIndex
CREATE INDEX "Property_provinceId_idx" ON "Property"("provinceId");
