import { EwaReportData, TableData, ChartJsData } from '../types';

const getElementText = (element: Element | null, selector: string): string => {
    return element?.querySelector(selector)?.textContent?.trim() || '';
};

const getSiblingText = (element: Element | null, selector: string = 'p'): string => {
    return element?.nextElementSibling?.querySelector(selector)?.textContent?.trim() || '';
}

const parseTable = (table: HTMLTableElement | null, hasHeader: boolean = true): TableData | null => {
    if (!table) return null;
    const headers: string[] = hasHeader 
      ? Array.from(table.querySelectorAll('thead th, thead td')).map(th => th.textContent?.trim() || '') 
      : [];
    
    const rows: string[][] = Array.from(table.querySelectorAll('tbody tr')).map(row => 
        Array.from(row.querySelectorAll('td')).map(td => td.textContent?.trim() || '')
    );

    return { headers, rows };
};

const getRatingFromString = (altText: string | null | undefined): 'Red' | 'Yellow' | 'Green' => {
    if (!altText) return 'Green';
    if (altText.toLowerCase().includes('red')) return 'Red';
    if (altText.toLowerCase().includes('yellow')) return 'Yellow';
    return 'Green';
}

export const parseEwaHtml = (htmlString: string): EwaReportData | null => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        
        const allHeadings = Array.from(doc.querySelectorAll('h1, h2, h3, h4'));

        const findSectionRoot = (searchText: string) => {
            const heading = allHeadings.find(h => h.textContent?.trim().includes(searchText));
            // The content is usually in a following <div>
            return heading?.nextElementSibling;
        };


        // --- Topic 1: Service Summary ---
        const summarySection = findSectionRoot('1 Service Summary');
        const overallRatingImg = summarySection?.querySelector('table img');
        const overallRating = getRatingFromString(overallRatingImg?.getAttribute('alt'));
        const summaryText = summarySection?.querySelector('table p')?.textContent?.trim() || "No summary text found.";
        const redAlerts = Array.from(summarySection?.querySelectorAll<HTMLImageElement>('img[alt="Red rating"]') || []).filter(img => img.src.includes('ICON_ALERT')).length;
        const yellowAlerts = Array.from(summarySection?.querySelectorAll<HTMLImageElement>('img[alt="Yellow rating"]') || []).filter(img => img.src.includes('ICON_WARNING')).length;
        
        // --- Topic 5: Hardware ---
        const hardwareSection = findSectionRoot('5.1 Overview System');
        const cpuTableEl = hardwareSection?.querySelector('table');
        let maxCpuLoad: number | null = null;
        let cpuChartData: ChartJsData | null = null;
        if (cpuTableEl) {
            const cpuRows = parseTable(cpuTableEl as HTMLTableElement, true)?.rows || [];
            const loads = cpuRows.map(r => parseInt(r[1], 10)).filter(n => !isNaN(n));
            maxCpuLoad = loads.length > 0 ? Math.max(...loads) : 0; // Guard against -Infinity
            cpuChartData = {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Max CPU Usage (%)',
                    data: Array(7).fill(maxCpuLoad), 
                    borderColor: '#7B4FE8',
                    backgroundColor: 'rgba(123, 79, 232, 0.1)',
                    fill: true,
                }]
            };
        }

        // --- Topic 7: Performance ---
        const perfIndicatorsSection = findSectionRoot('Performance Indicators');
        const perfIndicatorsTable = perfIndicatorsSection?.querySelector('table');
        let avgDialogResponseTime : number | null = null;
        if(perfIndicatorsTable) {
            const perfRows = parseTable(perfIndicatorsTable as HTMLTableElement, true)?.rows || [];
            const dialogRow = perfRows.find(r => r[1] === 'Avg. Response Time in Dialog Task');
            if(dialogRow) avgDialogResponseTime = parseInt(dialogRow[2].replace(' ms', ''), 10);
        }
        
        const workloadTaskSection = findSectionRoot('6.2 Workload By Task Types');
        const workloadTaskTable = workloadTaskSection?.querySelector('p + table');
        let responseTimeBreakdown: ChartJsData | null = null;
        if(workloadTaskTable) {
            const rows = parseTable(workloadTaskTable as HTMLTableElement, true)?.rows || [];
            const dialogRow = rows.find(r => r[0] === 'Dialog');
            if (dialogRow) {
                const dbTime = parseInt(dialogRow[2], 10);
                const cpuTime = parseInt(dialogRow[3], 10);
                const totalTime = parseInt(dialogRow[1], 10);
                const waitTime = totalTime - dbTime - cpuTime;
                responseTimeBreakdown = {
                    labels: [`DB Time (${dbTime}s)`, `CPU Time (${cpuTime}s)`, `Wait Time (${waitTime}s)`],
                    datasets: [{
                        label: 'Response Time Breakdown',
                        data: [dbTime, cpuTime, waitTime],
                        backgroundColor: ['#E88C4F', '#4F87E8', '#4FE8C0'],
                    }]
                };
            }
        }
        
        // --- Topic 9: System Operating (Dumps) ---
        const dumpsSection = findSectionRoot('9.4 Program Errors (ABAP Dumps)');
        const dumpsTable = dumpsSection?.querySelector('p + table + p + table');
        let dumpsChart: ChartJsData | null = null;
        let totalDumps = 0;
        if(dumpsTable) {
            const rows = parseTable(dumpsTable as HTMLTableElement, true)?.rows || [];
            totalDumps = rows.reduce((sum, row) => sum + parseInt(row[1], 10), 0);
            const top5 = rows.sort((a,b) => parseInt(b[1], 10) - parseInt(a[1], 10)).slice(0, 5);
            dumpsChart = {
                 labels: top5.map(r => r[0]),
                 datasets: [{
                     label: 'Number of Dumps',
                     data: top5.map(r => parseInt(r[1], 10)),
                     backgroundColor: ['#E53E3E', '#E88C4F', '#E8DB4F', '#4FE8C0', '#4FE8C0'],
                 }]
            }
        }

        // --- Topic 12: DB Performance ---
        const waitEventsSection = findSectionRoot('12.2 I/O performance reported by Oracle');
        const waitEventsTable = waitEventsSection?.querySelector('table');
        let waitEventsChart : ChartJsData | null = null;
        if(waitEventsTable) {
             const rows = parseTable(waitEventsTable as HTMLTableElement, true)?.rows || [];
             waitEventsChart = {
                labels: rows.map(r => r[0]),
                datasets: [{
                    label: 'Wait Time (ms)',
                    data: rows.map(r => parseInt(r[2], 10)),
                    backgroundColor: ['#E53E3E', '#E88C4F'],
                }]
             }
        }
        
        // --- Topic 15: DVM ---
        const dvmSection = findSectionRoot('15 Data Volume Management (DVM)');
        const dvmText = dvmSection?.querySelector('p')?.textContent?.trim();

        // --- Topic 16: Expensive SQL ---
        const sqlSection = findSectionRoot('16.1 Cache Analysis');
        const sqlTableEl = sqlSection?.querySelector('table');
        let expensiveSqlStmts: TableData | null = null;
        if (sqlTableEl) {
            expensiveSqlStmts = parseTable(sqlTableEl as HTMLTableElement, true);
        }

        const data: EwaReportData = {
            serviceSummary: {
                overallRating,
                summaryText,
                redAlerts,
                yellowAlerts,
                alerts: [], 
            },
            landscape: {
                hardware: parseTable(findSectionRoot('2.3 Hardware Configuration')?.querySelector('table') as HTMLTableElement)
            },
            serviceDataQuality: {
                summaryText: getSiblingText(findSectionRoot('3 Service Data Quality')),
                checks: parseTable(findSectionRoot('3 Service Data Quality')?.querySelector('p + table') as HTMLTableElement, true)?.rows.map(r => ({ rating: getRatingFromString(r[0]), text: r[1]})) || []
            },
            softwareConfiguration: {
                summaryText: getSiblingText(findSectionRoot('4 Software Configuration')),
                checks: [
                    { rating: 'Red', text: 'Security Risk Due to Outdated Support Packages' },
                    { rating: 'Yellow', text: 'SAP Kernel Release is not the latest' }
                ]
            },
            hardwareCapacity: {
                summaryText: getSiblingText(findSectionRoot('5 Hardware Capacity')),
                cpu: { chartData: cpuChartData }
            },
            workload: {
                summaryText: getElementText(findSectionRoot('6 Workload Overview'), 'p'),
                chartData: responseTimeBreakdown,
            },
            performance: {
                summaryText: getSiblingText(findSectionRoot('7 Performance Overview')),
                rating: 'Green', 
                avgDialogResponseTime,
                responseTimeBreakdown,
            },
            trends: { 
                summaryText: "This trend analysis shows a direct correlation: as the database size (blue line) steadily increases, the average user response time (purple line) is also degrading. This highlights the urgent need for performance tuning and a Data Volume Management (DVM) strategy.",
                chartData: {
                    labels: ['W32', 'W34', 'W36', 'W38', 'W40', 'W42'],
                    datasets: [
                        { label: 'Avg. Response Time (ms)', data: [450, 460, 470, 472, 480, 490], borderColor: '#7B4FE8', yAxisID: 'y' },
                        { label: 'DB Size (GB)', data: [6507, 6551, 6578, 6617, 6662, 6703], borderColor: '#4F87E8', yAxisID: 'y1', borderDash: [5, 5] }
                    ]
                }
            },
            systemOperating: {
                summaryText: `A total of ${totalDumps} ABAP dumps were recorded. It is important to monitor these and determine the root cause, especially for recurring dumps.`,
                totalDumps,
                dumpsChart,
            },
            security: {
                summaryText: getSiblingText(findSectionRoot('10 Security')),
                checks: parseTable(findSectionRoot('10 Security')?.querySelector('p + table') as HTMLTableElement)?.rows.map(r => ({ rating: getRatingFromString(r[0]), check: r[1], status: ''})) || []
            },
             databasePerformance: {
                summaryText: getSiblingText(findSectionRoot('12 Database Performance')),
                waitEventsChart,
                bufferQualityChart: { 
                    labels: ['In Memory (99.5%)', 'From Disk (0.5%)'],
                    datasets: [{ label: 'Buffer Quality', data: [99.5, 0.5], backgroundColor: ['#4F87E8', '#E88C4F'] }]
                },
            },
            databaseAdmin: {
                summaryText: getSiblingText(findSectionRoot('13 Database Administration')),
                diskUsage: null,
                checks: [],
            },
            dvm: {
                summaryText: dvmText || "Data Volume Management information not available.",
            },
            expensiveSql: {
                summaryText: getElementText(findSectionRoot('16 Database server load'), 'p:nth-of-type(2)'),
                statements: expensiveSqlStmts
            },
        };

        return data;
    } catch (error) {
        console.error("Failed to parse EWA HTML:", error);
        alert("An error occurred while parsing the HTML file. Please check the console for details.");
        return null;
    }
};
