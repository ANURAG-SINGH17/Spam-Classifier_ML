import React, { useState } from "react";
import axios from "axios";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Send, 
  Loader2, 
  X, 
  Trash2, 
  History, 
  FileText 
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HomePage = () => {
  const [message, setMessage] = useState("");
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const handlePredict = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${API_BASE_URL}/predict`, {
        message: message.trim(),
      });

      const resPrediction = response.data.prediction;
      setPrediction(resPrediction);

      // History log update
      const newEntry = {
        id: Date.now(),
        text: message.trim(),
        result: resPrediction,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setHistory((prev) => [newEntry, ...prev]);

      // Clear input
      setMessage("");
    } catch (err) {
      console.error("API Call Failed:", err);
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-mono text-sm tracking-widest text-slate-300 uppercase">
            Spam Detection Engine
          </span>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Column: Input Control Panel */}
        <section className="lg:col-span-7 p-6 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Analyze Content
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Enter message body below to perform real-time text classification.
              </p>
            </div>

            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste email content, SMS body, or URL references here..."
                disabled={loading}
                className="w-full h-64 lg:h-80 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-slate-600 transition resize-none disabled:opacity-50 font-mono"
              />

              {message && !loading && (
                <button
                  onClick={() => setMessage("")}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
                  title="Clear text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-400 text-xs">
                {error}
              </div>
            )}
          </div>

          <div className="pt-6">
            <button
              onClick={handlePredict}
              disabled={loading || !message.trim()}
              className="w-full lg:w-auto px-8 py-3.5 rounded-lg font-medium text-slate-950 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Run Analysis</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Column: Output & Live History Panel */}
        <section className="lg:col-span-5 bg-slate-900/30 p-6 lg:p-12 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Latest Result Banner */}
            <div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">
                Latest Output
              </h2>

              {prediction ? (
                <div
                  className={`p-6 rounded-xl border flex items-center justify-between ${
                    prediction.toLowerCase() === "spam"
                      ? "bg-rose-950/20 border-rose-900/50 text-rose-400"
                      : "bg-emerald-950/20 border-emerald-900/50 text-emerald-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {prediction.toLowerCase() === "spam" ? (
                      <ShieldAlert className="w-6 h-6 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                        Classification
                      </div>
                      <div className="text-xl font-bold font-mono">
                        {prediction.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center text-slate-600 text-xs font-mono">
                  No prediction generated yet.
                </div>
              )}
            </div>

            {/* History Feed */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-500">
                  <History className="w-3.5 h-3.5" />
                  <span>Session History</span>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 lg:max-h-80 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-600 font-mono italic">
                    History log empty.
                  </p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-900/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2 overflow-hidden">
                        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <p className="text-slate-300 truncate max-w-[180px] sm:max-w-[240px]">
                          {item.text}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono">
                        <span
                          className={`font-semibold ${
                            item.result.toLowerCase() === "spam"
                              ? "text-rose-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {item.result.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          <footer className="pt-6 border-t border-slate-800/60 text-[11px] font-mono text-slate-600">
            Status: Active API Endpoint
          </footer>
        </section>

      </main>
    </div>
  );
};

export default HomePage;