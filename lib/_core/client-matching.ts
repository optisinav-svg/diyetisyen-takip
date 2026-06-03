import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ClientMatch {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  dietitianId: string;
  dietitianName: string;
  dietitianEmail: string;
  status: "pending" | "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface ClientRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  dietitianId: string;
  dietitianName: string;
  dietitianEmail: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

const MATCHES_KEY = "client_matches";
const REQUESTS_KEY = "client_requests";

/**
 * Diyetisyen-danışan eşleştirmesi oluştur
 */
export async function createClientMatch(match: Omit<ClientMatch, "id" | "createdAt" | "updatedAt">): Promise<ClientMatch> {
  try {
    const matches = await getClientMatches();
    const newMatch: ClientMatch = {
      ...match,
      id: `match_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    matches.push(newMatch);
    await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    return newMatch;
  } catch (error) {
    console.error("Failed to create client match:", error);
    throw error;
  }
}

/**
 * Tüm eşleştirmeleri al
 */
export async function getClientMatches(): Promise<ClientMatch[]> {
  try {
    const data = await AsyncStorage.getItem(MATCHES_KEY);
    if (!data) return [];
    return JSON.parse(data) as ClientMatch[];
  } catch (error) {
    console.error("Failed to get client matches:", error);
    return [];
  }
}

/**
 * Belirli bir diyetisyenin danışanlarını al
 */
export async function getDietitianClients(dietitianId: string): Promise<ClientMatch[]> {
  try {
    const matches = await getClientMatches();
    return matches.filter((m) => m.dietitianId === dietitianId && m.status === "active");
  } catch (error) {
    console.error("Failed to get dietitian clients:", error);
    return [];
  }
}

/**
 * Belirli bir danışanın diyetisyenlerini al
 */
export async function getClientDietitians(clientId: string): Promise<ClientMatch[]> {
  try {
    const matches = await getClientMatches();
    return matches.filter((m) => m.clientId === clientId && m.status === "active");
  } catch (error) {
    console.error("Failed to get client dietitians:", error);
    return [];
  }
}

/**
 * Eşleştirme durumunu güncelle
 */
export async function updateMatchStatus(
  matchId: string,
  status: "pending" | "active" | "inactive"
): Promise<ClientMatch | null> {
  try {
    const matches = await getClientMatches();
    const match = matches.find((m) => m.id === matchId);
    if (!match) return null;

    match.status = status;
    match.updatedAt = new Date().toISOString();
    await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    return match;
  } catch (error) {
    console.error("Failed to update match status:", error);
    throw error;
  }
}

/**
 * Eşleştirmeyi sil
 */
export async function deleteClientMatch(matchId: string): Promise<void> {
  try {
    const matches = await getClientMatches();
    const filtered = matches.filter((m) => m.id !== matchId);
    await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete client match:", error);
    throw error;
  }
}

/**
 * Danışan isteği oluştur
 */
export async function createClientRequest(request: Omit<ClientRequest, "id" | "createdAt">): Promise<ClientRequest> {
  try {
    const requests = await getClientRequests();
    const newRequest: ClientRequest = {
      ...request,
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    await AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    return newRequest;
  } catch (error) {
    console.error("Failed to create client request:", error);
    throw error;
  }
}

/**
 * Tüm danışan isteklerini al
 */
export async function getClientRequests(): Promise<ClientRequest[]> {
  try {
    const data = await AsyncStorage.getItem(REQUESTS_KEY);
    if (!data) return [];
    return JSON.parse(data) as ClientRequest[];
  } catch (error) {
    console.error("Failed to get client requests:", error);
    return [];
  }
}

/**
 * Beklemede olan istekleri al
 */
export async function getPendingRequests(dietitianId: string): Promise<ClientRequest[]> {
  try {
    const requests = await getClientRequests();
    return requests.filter((r) => r.dietitianId === dietitianId && r.status === "pending");
  } catch (error) {
    console.error("Failed to get pending requests:", error);
    return [];
  }
}

/**
 * İsteği kabul et
 */
export async function acceptClientRequest(requestId: string): Promise<ClientMatch | null> {
  try {
    const requests = await getClientRequests();
    const request = requests.find((r) => r.id === requestId);
    if (!request) return null;

    // İsteği güncelle
    request.status = "accepted";
    await AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));

    // Eşleştirme oluştur
    const match = await createClientMatch({
      clientId: request.clientId,
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      dietitianId: request.dietitianId,
      dietitianName: request.dietitianName,
      dietitianEmail: request.dietitianEmail,
      status: "active",
    });

    return match;
  } catch (error) {
    console.error("Failed to accept client request:", error);
    throw error;
  }
}

/**
 * İsteği reddet
 */
export async function rejectClientRequest(requestId: string): Promise<void> {
  try {
    const requests = await getClientRequests();
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      request.status = "rejected";
      await AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    }
  } catch (error) {
    console.error("Failed to reject client request:", error);
    throw error;
  }
}
