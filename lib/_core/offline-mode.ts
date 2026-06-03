/**
 * Offline Mode Service
 * Manages offline data storage and synchronization
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export type SyncStatus = "pending" | "syncing" | "synced" | "error";

export interface OfflineData {
  id: string;
  type: "meal" | "measurement" | "appointment" | "message" | "feedback";
  data: Record<string, any>;
  timestamp: number;
  syncStatus: SyncStatus;
  syncedAt?: number;
  error?: string;
}

export interface OfflineState {
  isOnline: boolean;
  pendingSync: number;
  lastSyncTime: number;
  dataCache: OfflineData[];
}

/**
 * Offline Mode Service
 */
export class OfflineModeService {
  private static instance: OfflineModeService;
  private offlineData: Map<string, OfflineData> = new Map();
  private isOnline: boolean = true;
  private lastSyncTime: number = Date.now();
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.initializeOfflineMode();
  }

  static getInstance(): OfflineModeService {
    if (!OfflineModeService.instance) {
      OfflineModeService.instance = new OfflineModeService();
    }
    return OfflineModeService.instance;
  }

  /**
   * Initialize offline mode
   */
  private async initializeOfflineMode(): Promise<void> {
    try {
      // Load cached data from AsyncStorage
      const cachedData = await AsyncStorage.getItem("offline_data");
      if (cachedData) {
        const data = JSON.parse(cachedData);
        data.forEach((item: OfflineData) => {
          this.offlineData.set(item.id, item);
        });
      }

      // Load last sync time
      const lastSync = await AsyncStorage.getItem("last_sync_time");
      if (lastSync) {
        this.lastSyncTime = parseInt(lastSync);
      }

      // Start sync interval
      this.startSyncInterval();
    } catch (error) {
      console.error("Error initializing offline mode:", error);
    }
  }

  /**
   * Save offline data
   */
  async saveOfflineData(
    type: "meal" | "measurement" | "appointment" | "message" | "feedback",
    data: Record<string, any>
  ): Promise<OfflineData> {
    const offlineData: OfflineData = {
      id: `offline-${Date.now()}`,
      type,
      data,
      timestamp: Date.now(),
      syncStatus: "pending",
    };

    this.offlineData.set(offlineData.id, offlineData);

    // Save to AsyncStorage
    await this.persistData();

    return offlineData;
  }

  /**
   * Get pending sync items
   */
  getPendingSyncItems(): OfflineData[] {
    return Array.from(this.offlineData.values()).filter((item) => item.syncStatus === "pending");
  }

  /**
   * Mark item as synced
   */
  async markAsSynced(id: string): Promise<void> {
    const item = this.offlineData.get(id);
    if (item) {
      item.syncStatus = "synced";
      item.syncedAt = Date.now();
      await this.persistData();
    }
  }

  /**
   * Mark item as sync error
   */
  async markAsSyncError(id: string, error: string): Promise<void> {
    const item = this.offlineData.get(id);
    if (item) {
      item.syncStatus = "error";
      item.error = error;
      await this.persistData();
    }
  }

  /**
   * Set online status
   */
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;

    if (isOnline) {
      // Trigger sync when coming online
      this.syncPendingData();
    }
  }

  /**
   * Get online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Sync pending data
   */
  async syncPendingData(): Promise<void> {
    if (!this.isOnline) {
      console.log("Offline: Cannot sync");
      return;
    }

    const pendingItems = this.getPendingSyncItems();

    for (const item of pendingItems) {
      try {
        item.syncStatus = "syncing";
        await this.persistData();

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        await this.markAsSynced(item.id);
        console.log(`Synced: ${item.id}`);
      } catch (error) {
        await this.markAsSyncError(item.id, String(error));
        console.error(`Sync error for ${item.id}:`, error);
      }
    }

    this.lastSyncTime = Date.now();
    await AsyncStorage.setItem("last_sync_time", this.lastSyncTime.toString());
  }

  /**
   * Start sync interval
   */
  private startSyncInterval(): void {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncPendingData();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop sync interval
   */
  stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Persist data to AsyncStorage
   */
  private async persistData(): Promise<void> {
    try {
      const data = Array.from(this.offlineData.values());
      await AsyncStorage.setItem("offline_data", JSON.stringify(data));
    } catch (error) {
      console.error("Error persisting offline data:", error);
    }
  }

  /**
   * Get offline state
   */
  getOfflineState(): OfflineState {
    const pendingSync = this.getPendingSyncItems().length;

    return {
      isOnline: this.isOnline,
      pendingSync,
      lastSyncTime: this.lastSyncTime,
      dataCache: Array.from(this.offlineData.values()),
    };
  }

  /**
   * Clear offline data
   */
  async clearOfflineData(): Promise<void> {
    this.offlineData.clear();
    await AsyncStorage.removeItem("offline_data");
  }

  /**
   * Get data by type
   */
  getDataByType(type: string): OfflineData[] {
    return Array.from(this.offlineData.values()).filter((item) => item.type === type);
  }

  /**
   * Get synced data
   */
  getSyncedData(): OfflineData[] {
    return Array.from(this.offlineData.values()).filter((item) => item.syncStatus === "synced");
  }

  /**
   * Get error data
   */
  getErrorData(): OfflineData[] {
    return Array.from(this.offlineData.values()).filter((item) => item.syncStatus === "error");
  }

  /**
   * Retry sync for error items
   */
  async retrySyncErrors(): Promise<void> {
    const errorItems = this.getErrorData();

    for (const item of errorItems) {
      item.syncStatus = "pending";
      item.error = undefined;
    }

    await this.persistData();
    await this.syncPendingData();
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalItems: number;
    pendingItems: number;
    syncedItems: number;
    errorItems: number;
  } {
    return {
      totalItems: this.offlineData.size,
      pendingItems: this.getPendingSyncItems().length,
      syncedItems: this.getSyncedData().length,
      errorItems: this.getErrorData().length,
    };
  }
}

export const offlineModeService = OfflineModeService.getInstance();
