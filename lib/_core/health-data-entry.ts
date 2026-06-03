import AsyncStorage from "@react-native-async-storage/async-storage";

export interface HealthDataEntry {
  id: string;
  clientId: string;
  enteredBy: string; // dietitian email
  enteredByName: string;
  dataType: "weight" | "bloodPressure" | "bloodSugar" | "cholesterol" | "bmi" | "notes";
  value: string | number;
  unit: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface ClientHealthProfile {
  clientId: string;
  clientName: string;
  dietitianId: string;
  entries: HealthDataEntry[];
  lastUpdated: string;
}

// Mock health data entries
const mockHealthDataEntries: Record<string, HealthDataEntry[]> = {
  "client@test.com": [
    {
      id: "entry_1",
      clientId: "client@test.com",
      enteredBy: "dietitian@test.com",
      enteredByName: "Dr. Ayşe Yılmaz",
      dataType: "weight",
      value: 78,
      unit: "kg",
      date: new Date().toISOString(),
      notes: "Hafif düşüş, iyi gidiyor",
      createdAt: new Date().toISOString(),
    },
    {
      id: "entry_2",
      clientId: "client@test.com",
      enteredBy: "dietitian@test.com",
      enteredByName: "Dr. Ayşe Yılmaz",
      dataType: "bloodPressure",
      value: "120/80",
      unit: "mmHg",
      date: new Date().toISOString(),
      notes: "Normal",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "entry_3",
      clientId: "client@test.com",
      enteredBy: "dietitian@test.com",
      enteredByName: "Dr. Ayşe Yılmaz",
      dataType: "bmi",
      value: 24.5,
      unit: "kg/m²",
      date: new Date().toISOString(),
      notes: "Normal aralıkta",
      createdAt: new Date().toISOString(),
    },
  ],
  "demo@test.com": [
    {
      id: "entry_4",
      clientId: "demo@test.com",
      enteredBy: "dietitian@test.com",
      enteredByName: "Dr. Ayşe Yılmaz",
      dataType: "weight",
      value: 65,
      unit: "kg",
      date: new Date().toISOString(),
      notes: "Başlangıç ölçümü",
      createdAt: new Date().toISOString(),
    },
  ],
};

/**
 * Diyetisyenin danışan sağlık bilgisi girmesi
 */
export async function addHealthDataEntry(
  clientId: string,
  dietitianId: string,
  dietitianName: string,
  dataType: HealthDataEntry["dataType"],
  value: string | number,
  unit: string,
  date: string,
  notes?: string
): Promise<HealthDataEntry> {
  try {
    const entry: HealthDataEntry = {
      id: `entry_${Date.now()}`,
      clientId,
      enteredBy: dietitianId,
      enteredByName: dietitianName,
      dataType,
      value,
      unit,
      date,
      notes,
      createdAt: new Date().toISOString(),
    };

    if (!mockHealthDataEntries[clientId]) {
      mockHealthDataEntries[clientId] = [];
    }

    mockHealthDataEntries[clientId].push(entry);
    return entry;
  } catch (error) {
    console.error("Failed to add health data entry:", error);
    throw error;
  }
}

/**
 * Danışanın sağlık verilerini görmesi
 */
export async function getClientHealthData(clientId: string): Promise<HealthDataEntry[]> {
  try {
    return mockHealthDataEntries[clientId] || [];
  } catch (error) {
    console.error("Failed to get health data:", error);
    return [];
  }
}

/**
 * Belirli bir sağlık verisi türünü alma
 */
export async function getHealthDataByType(
  clientId: string,
  dataType: HealthDataEntry["dataType"]
): Promise<HealthDataEntry[]> {
  try {
    const entries = mockHealthDataEntries[clientId] || [];
    return entries.filter((e) => e.dataType === dataType).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error("Failed to get health data by type:", error);
    return [];
  }
}

/**
 * Sağlık verisi güncelleme
 */
export async function updateHealthDataEntry(
  clientId: string,
  entryId: string,
  updates: Partial<HealthDataEntry>
): Promise<HealthDataEntry | null> {
  try {
    const entries = mockHealthDataEntries[clientId] || [];
    const index = entries.findIndex((e) => e.id === entryId);

    if (index >= 0) {
      entries[index] = {
        ...entries[index],
        ...updates,
      };
      mockHealthDataEntries[clientId] = entries;
      return entries[index];
    }

    return null;
  } catch (error) {
    console.error("Failed to update health data entry:", error);
    return null;
  }
}

/**
 * Sağlık verisi silme
 */
export async function deleteHealthDataEntry(
  clientId: string,
  entryId: string
): Promise<void> {
  try {
    const entries = mockHealthDataEntries[clientId] || [];
    mockHealthDataEntries[clientId] = entries.filter((e) => e.id !== entryId);
  } catch (error) {
    console.error("Failed to delete health data entry:", error);
  }
}

/**
 * Danışanın sağlık profili
 */
export async function getClientHealthProfile(
  clientId: string,
  clientName: string,
  dietitianId: string
): Promise<ClientHealthProfile> {
  try {
    const entries = mockHealthDataEntries[clientId] || [];
    return {
      clientId,
      clientName,
      dietitianId,
      entries,
      lastUpdated: entries.length > 0 ? entries[entries.length - 1].createdAt : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to get health profile:", error);
    return {
      clientId,
      clientName,
      dietitianId,
      entries: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Sağlık verisi trendini hesaplama (örn: kilo değişimi)
 */
export async function calculateHealthTrend(
  clientId: string,
  dataType: HealthDataEntry["dataType"],
  days: number = 30
): Promise<{
  trend: "up" | "down" | "stable";
  change: number;
  percentageChange: number;
  entries: HealthDataEntry[];
}> {
  try {
    const entries = await getHealthDataByType(clientId, dataType);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const relevantEntries = entries.filter(
      (e) => new Date(e.date) >= cutoffDate
    );

    if (relevantEntries.length < 2) {
      return {
        trend: "stable",
        change: 0,
        percentageChange: 0,
        entries: relevantEntries,
      };
    }

    const oldest = relevantEntries[relevantEntries.length - 1];
    const newest = relevantEntries[0];

    const oldValue = typeof oldest.value === "string" ? parseFloat(oldest.value) : oldest.value;
    const newValue = typeof newest.value === "string" ? parseFloat(newest.value) : newest.value;

    const change = newValue - oldValue;
    const percentageChange = (change / oldValue) * 100;

    let trend: "up" | "down" | "stable" = "stable";
    if (change > 0.5) trend = "up";
    if (change < -0.5) trend = "down";

    return {
      trend,
      change,
      percentageChange,
      entries: relevantEntries,
    };
  } catch (error) {
    console.error("Failed to calculate trend:", error);
    return {
      trend: "stable",
      change: 0,
      percentageChange: 0,
      entries: [],
    };
  }
}
