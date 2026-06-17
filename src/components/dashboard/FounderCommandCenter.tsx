import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Activity, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export function FounderCommandCenter() {
  const [isInvestorMode, setIsInvestorMode] = useState(false);
  const [metrics, setMetrics] = useState({
    mrr: 0,
    mrrGrowth: "+0%",
    activationRate: 0,
    highRiskWorkspaces: 0,
    expansionLeads: 0,
    ltv: 0,
    cac: 0,
    nrr: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/v1/analytics/founder', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('nexus_token')}`
          }
        });
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
        if (data.chartData) setChartData(data.chartData);
      } catch (e) {
        console.error('Failed to fetch founder analytics', e);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Founder Command Center</h1>
            <p className="text-zinc-400 mt-1">Live Revenue & Growth Telemetry</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsInvestorMode(!isInvestorMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${isInvestorMode ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
            >
              {isInvestorMode ? 'Investor Mode Active' : 'Toggle Investor Mode'}
            </button>
            {isInvestorMode && (
              <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Download className="w-4 h-4 mr-2" /> Export PDF
              </button>
            )}
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-zinc-400 font-medium">Live MRR</h3>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold mt-4">${metrics.mrr.toLocaleString()}</p>
            <p className="text-emerald-400 text-sm mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" /> {metrics.mrrGrowth} from last month
            </p>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-zinc-400 font-medium">Activation Rate</h3>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-4xl font-bold mt-4">{metrics.activationRate}%</p>
            <p className="text-zinc-500 text-sm mt-2">Target: &gt;60%</p>
          </motion.div>

          {isInvestorMode ? (
            <>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-zinc-400 font-medium">LTV : CAC</h3>
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-4xl font-bold mt-4">{(metrics.ltv / metrics.cac).toFixed(1)}x</p>
                <p className="text-zinc-500 text-sm mt-2">Highly efficient acquisition</p>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-zinc-400 font-medium">Net Revenue Retention</h3>
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-4xl font-bold mt-4">{metrics.nrr}%</p>
                <p className="text-emerald-400 text-sm mt-2">Negative churn achieved</p>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-zinc-400 font-medium">High Risk Workspaces</h3>
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-4xl font-bold mt-4">{metrics.highRiskWorkspaces}</p>
                <p className="text-rose-400 text-sm mt-2">Customer Success engaged</p>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-zinc-400 font-medium">Expansion Ops</h3>
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-4xl font-bold mt-4">{metrics.expansionLeads}</p>
                <p className="text-amber-400 text-sm mt-2">Nearing usage limits</p>
              </motion.div>
            </>
          )}
        </div>

        {/* MRR Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-[400px]">
          <h3 className="text-lg font-bold mb-6">MRR Growth Trajectory</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#52525b" />
              <YAxis stroke="#52525b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                itemStyle={{ color: '#34d399' }}
              />
              <Line type="monotone" dataKey="mrr" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
