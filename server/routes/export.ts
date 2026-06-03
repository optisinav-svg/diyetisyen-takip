import { Request, Response } from "express";
import * as exportService from "../export";

/**
 * Export client meal report
 * GET /api/export/meals?clientId=1&startDate=2026-04-01&endDate=2026-04-30&format=csv
 */
export async function exportMealReport(req: Request, res: Response) {
  try {
    const { clientId, startDate, endDate, format } = req.query;

    if (!clientId || !startDate || !endDate) {
      return res.status(400).json({
        error: "Missing required parameters: clientId, startDate, endDate",
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const fileFormat = (format as string) || "csv";

    if (fileFormat !== "csv" && fileFormat !== "json") {
      return res.status(400).json({ error: "Invalid format. Use 'csv' or 'json'" });
    }

    const result = await exportService.generateClientMealReport(
      parseInt(clientId as string),
      start,
      end,
      fileFormat as "csv" | "json"
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    const filename = `meal-report-${clientId}-${startDate}.${fileFormat === "csv" ? "csv" : "json"}`;
    res.setHeader("Content-Type", fileFormat === "csv" ? "text/csv" : "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(result.data);
  } catch (error) {
    console.error("Export meal report error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Export failed",
    });
  }
}

/**
 * Export client measurements report
 * GET /api/export/measurements?clientId=1&startDate=2026-04-01&endDate=2026-04-30&format=csv
 */
export async function exportMeasurementsReport(req: Request, res: Response) {
  try {
    const { clientId, startDate, endDate, format } = req.query;

    if (!clientId || !startDate || !endDate) {
      return res.status(400).json({
        error: "Missing required parameters: clientId, startDate, endDate",
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const fileFormat = (format as string) || "csv";

    if (fileFormat !== "csv" && fileFormat !== "json") {
      return res.status(400).json({ error: "Invalid format. Use 'csv' or 'json'" });
    }

    const result = await exportService.generateClientMeasurementsReport(
      parseInt(clientId as string),
      start,
      end,
      fileFormat as "csv" | "json"
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    const filename = `measurements-report-${clientId}-${startDate}.${fileFormat === "csv" ? "csv" : "json"}`;
    res.setHeader("Content-Type", fileFormat === "csv" ? "text/csv" : "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(result.data);
  } catch (error) {
    console.error("Export measurements report error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Export failed",
    });
  }
}

/**
 * Export dietitian income report
 * GET /api/export/income?dietitianId=1&month=2026-04&format=csv
 */
export async function exportIncomeReport(req: Request, res: Response) {
  try {
    const { dietitianId, month, format } = req.query;

    if (!dietitianId || !month) {
      return res.status(400).json({
        error: "Missing required parameters: dietitianId, month (YYYY-MM format)",
      });
    }

    const monthDate = new Date(`${month}-01`);
    const fileFormat = (format as string) || "csv";

    if (fileFormat !== "csv" && fileFormat !== "json") {
      return res.status(400).json({ error: "Invalid format. Use 'csv' or 'json'" });
    }

    const result = await exportService.generateDietitianIncomeReport(
      parseInt(dietitianId as string),
      monthDate,
      fileFormat as "csv" | "json"
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    const filename = `income-report-${dietitianId}-${month}.${fileFormat === "csv" ? "csv" : "json"}`;
    res.setHeader("Content-Type", fileFormat === "csv" ? "text/csv" : "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(result.data);
  } catch (error) {
    console.error("Export income report error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Export failed",
    });
  }
}

/**
 * Export client performance report
 * GET /api/export/performance?clientId=1&month=2026-04&format=csv
 */
export async function exportPerformanceReport(req: Request, res: Response) {
  try {
    const { clientId, month, format } = req.query;

    if (!clientId || !month) {
      return res.status(400).json({
        error: "Missing required parameters: clientId, month (YYYY-MM format)",
      });
    }

    const monthDate = new Date(`${month}-01`);
    const fileFormat = (format as string) || "csv";

    if (fileFormat !== "csv" && fileFormat !== "json") {
      return res.status(400).json({ error: "Invalid format. Use 'csv' or 'json'" });
    }

    const result = await exportService.generateClientPerformanceReport(
      parseInt(clientId as string),
      monthDate,
      fileFormat as "csv" | "json"
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    const filename = `performance-report-${clientId}-${month}.${fileFormat === "csv" ? "csv" : "json"}`;
    res.setHeader("Content-Type", fileFormat === "csv" ? "text/csv" : "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(result.data);
  } catch (error) {
    console.error("Export performance report error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Export failed",
    });
  }
}

/**
 * Export all user data (GDPR compliance)
 * GET /api/export/user-data?format=json
 */
export async function exportUserData(req: Request, res: Response) {
  try {
    const { format } = req.query;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const fileFormat = (format as string) || "json";

    if (fileFormat !== "csv" && fileFormat !== "json") {
      return res.status(400).json({ error: "Invalid format. Use 'csv' or 'json'" });
    }

    const result = await exportService.exportAllUserData(userId, fileFormat as "csv" | "json");

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    const filename = `user-data-${userId}-${new Date().toISOString().split("T")[0]}.${fileFormat === "csv" ? "csv" : "json"}`;
    res.setHeader("Content-Type", fileFormat === "csv" ? "text/csv" : "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(result.data);
  } catch (error) {
    console.error("Export user data error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Export failed",
    });
  }
}
