import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Trash2,
  AlertTriangle,
  Bot,
  User,
  Sparkles,
} from 'lucide-react';
import { Report, ChatMessage } from '../types';

interface AIAssistantViewProps {
  reports: Report[];
  initialSelectedReportId?: string | null;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  reports,
  initialSelectedReportId,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(
    initialSelectedReportId || (reports[0]?.id || 'all')
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'MediScan AI Consultation Assistant ready. Grounded exclusively in your uploaded laboratory reports. Ask about biomarker definitions, printed reference comparisons, or prepare questions for your physician.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const suggestedQuestions = [
    'Explain my fasting glucose result and reference range.',
    'What questions should I ask my doctor regarding liver enzymes?',
    'What is the clinical definition of eGFR?',
    'Are any biomarkers outside standard laboratory limits?',
  ];

  const getRelevantContext = () => {
    if (selectedReportId === 'all') {
      return reports.map((r) => ({
        date: r.report_date,
        laboratory: r.laboratory_name,
        summary: r.analysis?.summary,
        results: r.results?.map((res) => ({
          test: res.test_name,
          value: res.measured_value,
          unit: res.unit,
          ref: res.laboratory_reference_text,
          status: res.comparison_status,
        })),
      }));
    }

    const single = reports.find((r) => r.id === selectedReportId);
    if (!single) return {};

    return {
      date: single.report_date,
      laboratory: single.laboratory_name,
      patient_age: single.patient_age,
      patient_gender: single.patient_gender,
      summary: single.analysis?.summary,
      results: single.results?.map((res) => ({
        test: res.test_name,
        value: res.measured_value,
        unit: res.unit,
        ref: res.laboratory_reference_text,
        status: res.comparison_status,
      })),
      doctor_questions: single.analysis?.doctor_questions,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || loading) return;

    setErrorMessage(null);
    setInputPrompt('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          reportContext: getRelevantContext(),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to communicate with assistant.');
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: resData.reply || 'I could not generate an answer at this time.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat failure:', err);
      setErrorMessage(
        err.message || 'Unable to generate assistant response. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Session reset. What questions can I assist with regarding your reports?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in flex flex-col h-[calc(100vh-140px)] text-[#0A0F1D]">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-slate-200 shrink-0">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
            Grounded Consultation Assistant
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0F1D] font-editorial mt-0.5">
            Report Assistant
          </h1>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase">Context:</span>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900 max-w-[220px] truncate uppercase"
            >
              <option value="all">ALL SPECIMENS ({reports.length})</option>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.report_date} - {r.original_filename.replace('.pdf', '')}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Reset conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="shrink-0 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-400 shrink-0 uppercase text-[10px]">Queries:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 transition-colors whitespace-nowrap shrink-0 text-[11px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-4 border ${
              m.role === 'user'
                ? 'bg-slate-50 border-slate-300 ml-8 sm:ml-16'
                : 'bg-white border-slate-900 mr-8 sm:mr-16 shadow-[4px_4px_0px_0px_#0A0F1D]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-2 font-mono text-[10px]">
              <span className={`font-bold uppercase tracking-wider ${m.role === 'user' ? 'text-slate-500' : 'text-blue-600'}`}>
                {m.role === 'user' ? 'OPERATOR INQUIRY' : 'MEDISCAN CLINICAL RESPONSE'}
              </span>
              <span className="text-slate-400 tabular-nums">{m.timestamp}</span>
            </div>

            <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-800 font-sans">
              {m.content}
            </p>
          </div>
        ))}

        {loading && (
          <div className="p-4 bg-white border border-slate-900 shadow-[4px_4px_0px_0px_#0A0F1D] flex items-center gap-3 text-xs font-mono text-slate-600 mr-16">
            <div className="w-3 h-3 bg-blue-600 animate-pulse" />
            <span>SYNTHESIZING VERIFIED CLINICAL SPECIMEN CONTEXT...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border-l-4 border-red-600 text-xs font-mono text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="shrink-0 space-y-2 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Type your inquiry regarding this laboratory report..."
            className="w-full pl-4 pr-12 py-3 bg-white border-2 border-slate-900 focus:border-blue-600 rounded-none text-xs sm:text-sm font-sans focus:outline-none shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className="absolute right-2 p-2 text-white bg-[#0A0F1D] hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 font-mono uppercase tracking-wider">
          Grounded solely in verified report data · Non-diagnostic boundary enforced
        </p>
      </div>
    </div>
  );
};
