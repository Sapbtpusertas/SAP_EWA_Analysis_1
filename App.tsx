import React, { useState, useCallback, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Chat } from "@google/genai";
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import Section from './components/Section';
import AiModal from './components/AiModal';
import ChatButton from './components/ChatButton';
import ChatModal from './components/ChatModal';
import { generateContent, ai } from './services/geminiService'; // Import the shared ai instance
import { getPrompt, PROMPTS } from './constants';
import type { ModalState, EwaReportData, ChatMessage } from './types';
import { parseEwaHtml } from './utils/ewaParser';

// Chart components
import DiskUsageChart from './components/charts/DiskUsageChart';
import DbCpuChart from './components/charts/DbCpuChart';
import WorkloadChart from './components/charts/WorkloadChart';
import ResponseBreakdownChart from './components/charts/ResponseBreakdownChart';
import WaitEventsChart from './components/charts/WaitEventsChart';
import BufferQualityChart from './components/charts/BufferQualityChart';
import LargestTablesChart from './components/charts/LargestTablesChart';
import GrowingTablesChart from './components/charts/GrowingTablesChart';
import DumpsChart from './components/charts/DumpsChart';
import TrendChart from './components/charts/TrendChart';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement, Filler
);
ChartJS.defaults.font.family = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"";
ChartJS.defaults.color = '#6B7281';
ChartJS.defaults.maintainAspectRatio = false;
ChartJS.defaults.responsive = true;

const UploadPrompt: React.FC<{ onUpload: () => void }> = ({ onUpload }) => (
  <div className="text-center max-w-2xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold text-ewa-purple mb-4">SAP EWA Infographic Analyser</h2>
    <p className="text-text-light mb-6">To begin, please upload your SAP EarlyWatch Alert report in HTML format.</p>
    <button onClick={onUpload} className="bg-ewa-purple text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-transform hover:scale-105">
      Upload HTML Report
    </button>
  </div>
);

const App: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, title: '', content: '', isLoading: false });
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [ewaData, setEwaData] = useState<EwaReportData | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  const handleAiRequest = useCallback(async (title: string, promptKey: keyof typeof PROMPTS, context: any) => {
    setModalState({ isOpen: true, title, content: '', isLoading: true });
    try {
      const prompt = getPrompt(promptKey, context);
      const responseText = await generateContent(prompt);
      setModalState({ isOpen: true, title, content: responseText, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setModalState({
        isOpen: true, title,
        content: `**Error:** Failed to get a response from the AI. Please check the console for details.\n\n${errorMessage}`,
        isLoading: false,
      });
    }
  }, []);

  const closeModal = () => setModalState({ isOpen: false, title: '', content: '', isLoading: false });

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleAnalyse = () => {
    if (fileContent) {
      const data = parseEwaHtml(fileContent);
      if (data) {
        setEwaData(data);
        setIsAnalyzed(true);

        // Initialize Chat Session using the shared AI instance
        const systemInstruction = `You are an expert SAP Basis consultant. Your role is to analyze and answer questions about the following SAP EarlyWatch Alert (EWA) report. Provide concise, actionable insights and recommendations. The full HTML content of the report is provided below for your context.\n\n--- REPORT START ---\n${fileContent}\n--- REPORT END ---`;
        const newChat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: { systemInstruction },
        });
        setChatSession(newChat);
        setChatHistory([{
            role: 'model',
            parts: [{ text: "Hello! I am your AI assistant. I have analyzed the EWA report. How can I help you?" }]
        }]);

      } else {
        alert("Failed to parse the EWA report. Please ensure it's a valid HTML file.");
      }
    }
  };

  const handleSendMessage = async (message: string) => {
      if (!chatSession) return;

      const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
      setChatHistory(prev => [...prev, newUserMessage]);
      setIsChatLoading(true);

      try {
          const stream = await chatSession.sendMessageStream({ message });
          let accumulatedText = '';
          // Add a placeholder for the model's response to be updated by the stream
          setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

          for await (const chunk of stream) {
              accumulatedText += chunk.text;
              setChatHistory(prev => {
                  const newHistory = [...prev];
                  newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: accumulatedText }] };
                  return newHistory;
              });
          }
      } catch (error) {
          console.error("Chat error:", error);
          const errorMessage: ChatMessage = { role: 'model', parts: [{ text: 'Sorry, I encountered an error. Please try again.' }] };
          setChatHistory(prev => [...prev, errorMessage]);
      } finally {
          setIsChatLoading(false);
      }
  };

  const handleReset = () => {
    setFileContent(null);
    setEwaData(null);
    setIsAnalyzed(false);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Reset chat state
    setChatSession(null);
    setChatHistory([]);
    setIsChatOpen(false);
  };

  const handleDownload = () => {
    if (!fileContent || !fileName) return;
    const blob = new Blob([fileContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const ratingToColor = (rating: string) => {
      switch (rating?.toLowerCase()) {
          case 'red': return 'text-ewa-red';
          case 'yellow': return 'text-ewa-orange';
          case 'green': return 'text-ewa-green';
          default: return 'text-text-dark';
      }
  };

  const ratingToIcon = (rating: string) => {
      switch (rating?.toLowerCase()) {
          case 'red': return '🔴';
          case 'yellow': return '🟡';
          case 'green': return '✅';
          default: return 'ℹ️';
      }
  }

  return (
    <div className="min-h-screen bg-bg-light">
      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} className="hidden" accept=".html,.htm" />
      <Header
        onUpload={() => fileInputRef.current?.click()}
        onAnalyse={handleAnalyse}
        onDownload={handleDownload}
        onReset={handleReset}
        onGenerateSummary={() => handleAiRequest("AI Executive Summary", 'EXECUTIVE_SUMMARY', ewaData?.serviceSummary)}
        isFileLoaded={!!fileContent}
        isAnalyzed={isAnalyzed}
        overallStatus={ewaData?.serviceSummary.overallRating}
      />

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {!isAnalyzed ? <UploadPrompt onUpload={() => fileInputRef.current?.click()} /> : (
          ewaData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <Section className="md:col-span-3" title="1. Service Summary">
                <p className="text-sm mb-6 text-text-light">{ewaData.serviceSummary.summaryText}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <KpiCard title="Overall Rating" value={ewaData.serviceSummary.overallRating} icon={ratingToIcon(ewaData.serviceSummary.overallRating)} valueColor={ratingToColor(ewaData.serviceSummary.overallRating)} />
                  <KpiCard title="Critical Alerts" value={ewaData.serviceSummary.redAlerts.toString()} icon="🔴" valueColor="text-ewa-red" />
                  <KpiCard title="High-Priority Alerts" value={ewaData.serviceSummary.yellowAlerts.toString()} icon="🟠" valueColor="text-ewa-orange" />
                </div>
                <button onClick={() => handleAiRequest("AI Analysis: Service Summary", 'SERVICE_SUMMARY', ewaData.serviceSummary)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>

              <Section className="md:col-span-3" title="2. Landscape">
                 <p className="text-sm mb-4 text-text-light">This section details the core components of the system landscape and their hardware configuration.</p>
                 {ewaData.landscape.hardware ? (
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50">{ewaData.landscape.hardware.headers.map(h => <th key={h} className="text-left font-semibold p-3 text-text-light">{h}</th>)}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{ewaData.landscape.hardware.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="p-3">{cell}</td>)}</tr>)}</tbody></table></div>
                 ) : <p className="text-text-light">Hardware configuration data not found.</p>}
                 <button onClick={() => handleAiRequest("AI Analysis: Landscape", 'LANDSCAPE', ewaData.landscape)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>
              
              <Section className="md:col-span-3" title="3. Service Data Quality and Service Readiness">
                <p className="text-sm mb-4 text-text-light">{ewaData.serviceDataQuality.summaryText}</p>
                {ewaData.serviceDataQuality.checks ? (
                    <ul className="space-y-2 text-sm">{ewaData.serviceDataQuality.checks.map((c, i) => <li key={i} className="flex items-center"><span className="text-xl mr-2">{ratingToIcon(c.rating)}</span><span>{c.text}</span></li>)}</ul>
                ) : <p className="text-text-light">Service readiness checks not found.</p>}
                <button onClick={() => handleAiRequest("AI Analysis: Service Data Quality", 'SERVICE_DATA_QUALITY', ewaData.serviceDataQuality)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>

              <Section className="md:col-span-3" title="4. Software Configuration">
                <p className="text-sm mb-4 text-text-light">{ewaData.softwareConfiguration.summaryText}</p>
                {ewaData.softwareConfiguration.checks ? (
                    <ul className="space-y-2 text-sm">{ewaData.softwareConfiguration.checks.map((c, i) => <li key={i} className="flex items-center"><span className="text-xl mr-2">{ratingToIcon(c.rating)}</span><span>{c.text}</span></li>)}</ul>
                ) : <p className="text-text-light">Software configuration checks not found.</p>}
                 <button onClick={() => handleAiRequest("AI Analysis: Software Configuration", 'SOFTWARE_CONFIGURATION', ewaData.softwareConfiguration)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>

              <Section className="md:col-span-2" title="5. Hardware Capacity: CPU">
                <p className="text-sm mb-4 text-text-light">{ewaData.hardwareCapacity.summaryText}</p>
                {ewaData.hardwareCapacity.cpu.chartData ? <div className="h-96 chart-container"><DbCpuChart data={ewaData.hardwareCapacity.cpu.chartData} /></div> : <p className="text-text-light">CPU data not available.</p>}
                <button onClick={() => handleAiRequest("AI Analysis: Hardware Capacity", 'HARDWARE_CAPACITY', ewaData.hardwareCapacity)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>

              <Section className="md:col-span-1" title="5. Hardware Capacity: DB Disk">
                 <p className="text-sm mb-4 text-text-light">Database disk usage is a critical metric. Monitoring free space helps prevent outages.</p>
                 {ewaData.databaseAdmin.diskUsage ? <div className="h-96 chart-container"><DiskUsageChart data={ewaData.databaseAdmin.diskUsage} /></div> : <p className="text-text-light mt-4">Disk usage data not available in this report. This metric is often derived from filesystem checks within the EWA.</p>}
              </Section>

              <Section className="md:col-span-3" title="6. Workload Overview">
                <p className="text-sm mb-4 text-text-light">{ewaData.workload.summaryText}</p>
                {ewaData.workload.chartData ? <div className="h-96 chart-container"><WorkloadChart data={ewaData.workload.chartData} /></div> : <p className="text-text-light">Workload chart data not available.</p>}
                <button onClick={() => handleAiRequest("AI Analysis: Workload Overview", 'WORKLOAD_OVERVIEW', ewaData.workload)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>

              <Section className="md:col-span-1 flex flex-col justify-between" title="7. Performance Overview">
                 <div><p className="text-sm mb-6 text-text-light">{ewaData.performance.summaryText}</p></div>
                 <KpiCard title="Avg. Dialog Response Time" value={ewaData.performance.avgDialogResponseTime ? `${ewaData.performance.avgDialogResponseTime} ms` : 'N/A'} valueColor={ratingToColor(ewaData.performance.rating)} />
                 <button onClick={() => handleAiRequest("AI Analysis: Performance Overview", 'PERFORMANCE_OVERVIEW', ewaData.performance)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>

              <Section className="md:col-span-2" title="7. Response Time Breakdown">
                <p className="text-sm mb-4 text-text-light">A breakdown of the average response time helps identify the primary bottlenecks in the system.</p>
                {ewaData.performance.responseTimeBreakdown ? <div className="h-96 chart-container"><ResponseBreakdownChart data={ewaData.performance.responseTimeBreakdown} /></div> : <p className="text-text-light">Response time breakdown not available.</p>}
              </Section>

              <Section className="md:col-span-3" title="8 & 17. Long-Term Trend Analysis">
                <p className="text-sm mb-4 text-text-light">{ewaData.trends.summaryText}</p>
                {ewaData.trends.chartData ? <div className="h-96 chart-container"><TrendChart data={ewaData.trends.chartData}/></div> : <p>Trend data not available.</p>}
                <button onClick={() => handleAiRequest("AI Analysis: Trend Analysis", 'TREND_ANALYSIS', ewaData.trends)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>
              
              <Section className="md:col-span-2" title="9. SAP System Operating: ABAP Dumps">
                <p className="text-sm mb-4 text-text-light">{ewaData.systemOperating.summaryText}</p>
                {ewaData.systemOperating.dumpsChart ? <div className="h-96 chart-container"><DumpsChart data={ewaData.systemOperating.dumpsChart}/></div> : <p className="text-text-light">ABAP Dump data not available.</p>}
                <button onClick={() => handleAiRequest("AI Analysis: ABAP Dumps", 'SYSTEM_OPERATING', ewaData.systemOperating)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>

              <Section className="md:col-span-1" title="13. Database Administration">
                <p className="text-sm mb-4 text-text-light">{ewaData.databaseAdmin.summaryText}</p>
                 {ewaData.databaseAdmin.checks.length > 0 ? <ul className="space-y-3 mt-4 text-sm">{ewaData.databaseAdmin.checks.map((c, i) => <li key={i} className="flex items-start"><span className="text-xl mr-2 mt-1">{ratingToIcon(c.rating)}</span><div><span className="font-bold">{c.check}:</span> <span className={ratingToColor(c.rating)}>{c.status}</span></div></li>)}</ul> : <p className="text-text-light">No specific admin checks found.</p>}
                 <button onClick={() => handleAiRequest("AI Analysis: DB Administration", 'DATABASE_ADMIN', ewaData.databaseAdmin)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>

              <Section className="md:col-span-3" title="10. Security">
                <p className="text-sm mb-4 text-text-light">{ewaData.security.summaryText}</p>
                <ul className="space-y-3 mt-4 text-sm">{ewaData.security.checks.map((c, i) => <li key={i} className="flex items-start"><span className="text-xl mr-2 mt-1">{ratingToIcon(c.rating)}</span><div><span className="font-bold">{c.check}:</span> <span className={ratingToColor(c.rating)}>{c.status}</span></div></li>)}</ul>
                <button onClick={() => handleAiRequest("AI Analysis: Security", 'SECURITY', ewaData.security)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>
              
              <Section className="md:col-span-2" title="12. Database Performance: Top Wait Events">
                 <p className="text-sm mb-4 text-text-light">{ewaData.databasePerformance.summaryText}</p>
                 {ewaData.databasePerformance.waitEventsChart ? <div className="h-96 chart-container"><WaitEventsChart data={ewaData.databasePerformance.waitEventsChart} /></div> : <p className="text-text-light">Wait event data not available in a parsable format in this report.</p>}
                 <button onClick={() => handleAiRequest("AI Analysis: DB Performance", 'DATABASE_PERFORMANCE', ewaData.databasePerformance)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>
              
               <Section className="md:col-span-1" title="12. Database Performance: Buffer Quality">
                 <p className="text-sm mb-4 text-text-light">Database buffer quality indicates how much data is read from fast memory versus slow disk.</p>
                 {ewaData.databasePerformance.bufferQualityChart ? <div className="h-96 chart-container"><BufferQualityChart data={ewaData.databasePerformance.bufferQualityChart} /></div> : <p className="text-text-light">Buffer quality data not available.</p>}
              </Section>

               <Section className="md:col-span-3" title="15. Data Volume Management (DVM)">
                <p className="text-sm mb-4 text-text-light">{ewaData.dvm.summaryText}</p>
                 <button onClick={() => handleAiRequest("AI Analysis: Data Volume Management", 'DVM', ewaData.dvm)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>

              <Section className="md:col-span-3" title="16. Expensive SQL Statements">
                 <p className="text-sm mb-4 text-text-light">{ewaData.expensiveSql.summaryText}</p>
                 {ewaData.expensiveSql.statements ? (
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50">{ewaData.expensiveSql.statements.headers.map(h => <th key={h} className="text-left font-semibold p-3 text-text-light">{h}</th>)}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{ewaData.expensiveSql.statements.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="p-3">{cell}</td>)}</tr>)}</tbody></table></div>
                 ) : <p className="text-text-light">Expensive SQL statement data not found.</p>}
                 <button onClick={() => handleAiRequest("AI Analysis: Expensive SQL", 'EXPENSIVE_SQL', ewaData.expensiveSql)} className="ai-btn-small mt-4 no-print">✨ Get AI Recommendation</button>
              </Section>

            </div>
          )
        )}
      </main>

      {isAnalyzed && (
        <footer className="text-center py-8 mt-8 border-t border-gray-200 no-print">
          <p className="text-sm text-text-light">Generated by Canvas Infographics | End of Report</p>
        </footer>
      )}
      
      <AiModal 
        isOpen={modalState.isOpen}
        title={modalState.title}
        content={modalState.content}
        isLoading={modalState.isLoading}
        onClose={closeModal}
      />
      
      {isAnalyzed && <ChatButton onClick={() => setIsChatOpen(true)} />}

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        history={chatHistory}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
      />
    </div>
  );
};

export default App;
