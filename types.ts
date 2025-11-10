
import { Part } from "@google/genai";

export interface ModalState {
  isOpen: boolean;
  title: string;
  content: string;
  isLoading: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Part[];
}

export interface TableData {
    headers: string[];
    rows: string[][];
}

export interface ChartJsData {
    labels: (string | string[])[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string;
        borderWidth?: number;
        hoverOffset?: number;
        fill?: boolean;
        tension?: number;
        pointBackgroundColor?: string;
        pointRadius?: number;
        yAxisID?: string;
        borderDash?: number[];
    }[];
}

export interface EwaReportData {
    serviceSummary: {
        overallRating: 'Green' | 'Yellow' | 'Red';
        summaryText: string;
        redAlerts: number;
        yellowAlerts: number;
        alerts: { rating: 'Red' | 'Yellow', text: string }[];
    };
    landscape: {
        hardware: TableData | null;
    };
    serviceDataQuality: {
        summaryText: string;
        checks: { rating: string, text: string }[];
    };
    softwareConfiguration: {
        summaryText: string;
        checks: { rating: string, text: string }[];
    };
    hardwareCapacity: {
        summaryText: string;
        cpu: {
            chartData: ChartJsData | null;
        };
    };
    workload: {
        summaryText: string;
        chartData: ChartJsData | null;
    };
    performance: {
        summaryText: string;
        rating: 'Green' | 'Yellow' | 'Red';
        avgDialogResponseTime: number | null;
        responseTimeBreakdown: ChartJsData | null;
    };
    trends: {
        summaryText: string;
        chartData: ChartJsData | null;
    };
    systemOperating: {
        summaryText: string;
        totalDumps: number;
        dumpsChart: ChartJsData | null;
    };
    security: {
        summaryText: string;
        checks: { rating: string, check: string; status: string; }[];
    };
    softwareChangeManagement: {
        summaryText: string;
        checks: { rating: string; text: string }[];
    };
    databasePerformance: {
        summaryText: string;
        waitEventsChart: ChartJsData | null;
        bufferQualityChart: ChartJsData | null;
    };
    databaseAdmin: {
        summaryText: string;
        diskUsage: ChartJsData | null;
        checks: { rating: string; check: string; status: string }[];
    };
    financialDataQuality: {
        summaryText: string;
    };
    dvm: {
        summaryText: string;
    };
    expensiveSql: {
        summaryText: string;
        statements: TableData | null;
    };
}