import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, FileText } from 'lucide-react';
import { ChatMessage } from '../types';

export const InsuranceAIChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Greetings. I am AgriSentinel Insurance & Yield Copilot. Query satellite risk records, soil metrics, pest infestation indexes, or PM Fasal Bima Yojana policy claims.',
      citations: ['Sentinel-2 Radar Grid #402', 'PM Fasal Bima Risk Index 2026', 'ICAR Soil Telemetry Matrix'],
      time: '10:00 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Assess drought risk for my wheat crop this season",
    "What is the pest outbreak risk in Punjab grid #4?",
    "Calculate my PMFBY insurance claim coverage ratio for unseasonal rain damage"
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Simulated AI copilot response with source citations & claim calculations
    setTimeout(() => {
      let responseText = "Based on multi-spectral satellite telemetry and local weather sensors, your overall field risk rating is currently LOW (12/100).";
      let citations = ["AgriSentinel Microclimate Sensor Node #12", "National Crop Risk Matrix"];

      const qLower = query.toLowerCase();
      if (qLower.includes('drought') || qLower.includes('moisture')) {
        responseText = "Drought risk for your active Sharbati Wheat harvest stands at 8.4% (VERY LOW). Soil moisture levels at 30cm depth are holding steady at 34%. Rain precipitation predicted in 48 hours.";
        citations = ["Soil Telemetry Sensor #301", "Global Weather Model GFS 0.25°"];
      } else if (qLower.includes('pest') || qLower.includes('infestation')) {
        responseText = "Pest risk index is MODERATE for stem borer due to humidity spikes (58%). Recommended preventative biological spray within 3 days to preserve Grade A+ certification.";
        citations = ["Regional Entomology Survey v4", "NDVI Thermal Variance Chart"];
      } else if (qLower.includes('insurance') || qLower.includes('claim') || qLower.includes('pmfby') || qLower.includes('rain')) {
        responseText = "Your active Smart Insurance Policy #POL-8820 under PM Fasal Bima Yojana covers up to ₹4,50,000 for weather yield loss exceeding 15%. Automated escrow release triggers if NDVI drops below 0.65 due to unseasonal rain.";
        citations = ["Smart Insurance Contract #0x92a...b1", "Parametric Weather API v2", "PMFBY Threshold Guideline 2026"];
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: responseText,
        citations,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 600);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="border border-slate-300 bg-white flex flex-col h-[680px] max-w-4xl mx-auto font-mono">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white border-b border-slate-300 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500"></div>
          <span className="font-bold text-xs sm:text-sm uppercase">AGRISENTINEL AI INSURANCE & RISK COPILOT</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold border border-emerald-800 px-2 py-0.5 bg-emerald-950">[VERIFIED RAG CITATIONS]</span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-2xl border p-4 ${
              m.sender === 'user' 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-900 border-slate-300'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-200/20 pb-2 mb-2 text-[10px] text-slate-400">
                <span className="font-bold uppercase">{m.sender === 'user' ? 'FARM OPERATOR' : 'AGRISENTINEL AI'}</span>
                <span>{m.time}</span>
              </div>
              <p className="text-xs leading-relaxed">{m.text}</p>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  <span className="font-bold uppercase text-slate-700 block mb-1">CITATIONS & DATA SOURCES:</span>
                  <div className="flex flex-wrap gap-1">
                    {m.citations.map((c, i) => (
                      <span key={i} className="bg-slate-100 border border-slate-300 px-2 py-0.5 text-slate-800">
                        📄 {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap gap-2">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1 text-slate-800 text-left font-semibold transition-all"
          >
            ↳ {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-slate-300 flex space-x-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI Copilot regarding crop insurance, soil metrics or weather risk..."
          className="flex-1 border border-slate-300 p-3 text-xs font-mono focus:outline-none focus:border-slate-900"
        />
        <button 
          onClick={() => handleSend()}
          className="bg-[#064E3B] text-emerald-300 hover:bg-emerald-900 border border-emerald-700 px-6 font-bold text-xs uppercase flex items-center space-x-2"
        >
          <span>QUERY</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
