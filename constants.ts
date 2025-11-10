export const PROMPTS = {
  EXECUTIVE_SUMMARY: `
    You are an expert SAP Basis consultant. Based on the following key findings from an EWA report, write a concise, professional executive summary (2-3 paragraphs) for a technical manager. 
    Highlight the most critical risks and their recommended actions.
    Key Findings:
  `,
  SERVICE_SUMMARY: `
    You are an expert SAP Basis consultant. The service summary shows the following alerts. Briefly explain the potential business impact of the top 2-3 most severe alerts.
    Alerts:
  `,
  LANDSCAPE: `
    You are an expert SAP Basis consultant. Review the following hardware landscape. Point out any potential risks, such as outdated hardware, low memory for database servers, or inconsistencies.
    Landscape Data:
  `,
  SERVICE_DATA_QUALITY: `
    You are an expert SAP Basis consultant. The Service Data Quality section has the following status. Explain in simple terms what this means for the reliability of the EWA report itself and what actions should be taken if the status is not green.
    Data Quality Status:
  `,
  SOFTWARE_CONFIGURATION: `
    You are an expert SAP Basis consultant. The software configuration check found these issues. Explain the risk of the red-rated item and recommend a course of action.
    Configuration Issues:
  `,
  HARDWARE_CAPACITY: `
    You are an expert SAP Basis consultant. The hardware capacity check shows the following CPU utilization. Analyze this data and state whether it indicates a CPU bottleneck. What should be monitored?
    CPU Data:
  `,
  WORKLOAD_OVERVIEW: `
    You are an expert SAP Basis consultant. Given the following system workload profile, describe the typical usage pattern of this SAP system (e.g., is it dialog-heavy, batch-intensive?). What does this imply for performance tuning priorities?
    Workload Data:
  `,
  PERFORMANCE_OVERVIEW: `
    You are an expert SAP performance analyst. The average dialog response time is nearing a critical threshold, and the breakdown shows a clear bottleneck. Identify the main contributor to the response time and suggest the next two sections of the EWA report to investigate for the root cause.
    Performance Data:
  `,
  SYSTEM_OPERATING: `
    You are an expert SAP ABAP and Basis consultant. The system has a high volume of specific ABAP dumps. For the top dump ('{{TOP_DUMP}}'), explain what it means in simple terms and suggest the first two steps to investigate its root cause, mentioning relevant transaction codes.
    Dump Data:
  `,
  SECURITY: `
    You are an expert SAP Security consultant. An EWA report found several security issues. For the top red-rated issue, explain the business risk in one sentence and provide a critical, step-by-step action plan to remediate it.
    Security Issues:
  `,
  DATABASE_PERFORMANCE: `
    You are an expert SAP Database Administrator. Based on the top database wait events and buffer quality, diagnose the primary database bottleneck. Is the issue related to I/O, memory, or inefficient queries? What should be the primary focus for optimization?
    DB Performance Data:
  `,
  DATABASE_ADMIN: `
    You are an expert SAP Database Administrator. A critical administrative issue has been found regarding tablespace utilization. Explain the immediate risk this poses to the system and outline the urgent actions required to prevent a system outage.
    DB Admin Data:
  `,
  DVM: `
    You are an expert in SAP Data Volume Management (DVM). The EWA report indicates that DVM analysis is not active, but data growth is a concern. Explain the importance of activating DVM and list the first three tables that are typically the best candidates for an archiving project in an ERP system.
    DVM Status:
  `,
  EXPENSIVE_SQL: `
    You are an expert SAP ABAP and performance consultant. An expensive SQL statement from a custom program is causing high database load. The top wait event is 'db file sequential read'. Provide a concise, actionable, step-by-step plan for a developer to analyze and fix this specific statement.
    SQL Data:
  `,
  TREND_ANALYSIS: `
    You are a senior IT strategist. The long-term trend analysis shows a direct correlation between growing database size and degrading user response time. Formulate a strategic recommendation for management, highlighting the urgent need for both short-term performance tuning and a long-term Data Volume Management (DVM) project to ensure system scalability.
    Trend Data:
  `
};

export const getPrompt = (key: keyof typeof PROMPTS, context: any): string => {
  let prompt = PROMPTS[key] || "Analyze the following data:";
  if (context) {
    if (key === 'SYSTEM_OPERATING' && context.dumpsChart?.labels[0]) {
      const topDump = Array.isArray(context.dumpsChart.labels[0]) ? context.dumpsChart.labels[0].join(' ') : context.dumpsChart.labels[0];
      prompt = prompt.replace('{{TOP_DUMP}}', topDump);
    }
    prompt += '\n' + JSON.stringify(context, null, 2);
  }
  return prompt;
};
