import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import {
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCheckCircle,
  FaInfoCircle,
  FaChartBar,
  FaRedo,
} from 'react-icons/fa';

const RiskAnalysis = ({ authToken, isLoggedIn }) => {
  const navigate = useNavigate();
  const [risks, setRisks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !authToken) {
      navigate('/login');
    }
  }, [navigate, isLoggedIn, authToken]);

  const getAuthHeaders = () => {
    if (!authToken) {
      navigate('/login');
      return null;
    }
    return { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' };
  };

  const handleRiskAnalysis = async () => {
    setLoading(true);
    setError('');
    setRisks(null);

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await api.get('/ai/risk-identification', { headers });
      setRisks(response.data);
      setHasAnalyzed(true);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        const errorMessage = err.response?.data?.detail || err.message || 'An error occurred while analyzing risks';
        setError(errorMessage);
        setHasAnalyzed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRiskSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRiskIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return <FaExclamationTriangle className="w-5 h-5 text-red-500" />;
      case 'medium': return <FaExclamationCircle className="w-5 h-5 text-yellow-500" />;
      case 'low': return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      default: return <FaInfoCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const groupRisksBySeverity = (risks) => {
    return risks.reduce((acc, risk) => {
      const severity = risk.severity || 'unknown';
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(risk);
      return acc;
    }, {});
  };

  // Show loading if not authenticated
  if (!isLoggedIn || !authToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sprint Risk Analysis</h1>
          <p className="text-gray-600 mb-4">AI-powered analysis of potential risks across all current sprint tasks</p>
        </div>

        {!hasAnalyzed && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 mb-8 border border-gray-200 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaExclamationTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Analyze Sprint Risks?</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our AI will scan all current sprint tasks across your projects to identify potential risks, 
                blockers, and areas that might need attention. This comprehensive analysis helps you 
                proactively manage your sprint and prevent issues before they impact your timeline.
              </p>
              <button onClick={handleRiskAnalysis} className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg">
                <div className="flex items-center gap-3">
                  <FaChartBar className="w-6 h-6" />
                  Analyze Risks Now
                </div>
              </button>
            </div>
          </div>
        )}

        {hasAnalyzed && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Risk Assessment</h2>
                <p className="text-gray-600">Analyzing all active sprint tasks for potential risks</p>
              </div>
              <button onClick={handleRiskAnalysis} disabled={loading} className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:scale-105 shadow-lg hover:shadow-xl'}`}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FaRedo className="w-5 h-5" />
                    Refresh Analysis
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 mb-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500"></div>
                <div className="animate-ping absolute top-0 left-0 rounded-full h-16 w-16 border-4 border-red-300 opacity-75"></div>
              </div>
              <p className="mt-6 text-lg font-medium text-gray-700">AI is scanning all sprint tasks for potential risks...</p>
              <p className="mt-2 text-sm text-gray-500">This analysis may take a few moments</p>
              <div className="mt-4 flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        {risks && !loading && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-2">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Risk Analysis Complete</h2>
                  <p className="text-red-100 mt-1">{risks.risks?.length || 0} risks identified</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {risks.risks && risks.risks.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupRisksBySeverity(risks.risks)).map(([severity, severityRisks]) => (
                    <div key={severity} className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-3">
                        {getRiskIcon(severity)}
                        {severity} Risk{severityRisks.length !== 1 ? 's' : ''} ({severityRisks.length})
                      </h3>
                      <div className="grid gap-4">
                        {severityRisks.map((risk, index) => (
                          <div key={index} className={`rounded-lg p-6 border-l-4 ${getRiskSeverityColor(risk.severity)} shadow-sm`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-lg mb-3 leading-relaxed">{risk.risk}</p>
                                {risk.impacted_person && risk.impacted_person.length > 0 && (
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-sm font-semibold">Impacted:</span>
                                    {risk.impacted_person.map((person, idx) => (
                                      <span key={idx} className="inline-flex items-center px-3 py-1 bg-white bg-opacity-70 rounded-full text-sm font-medium shadow-sm">
                                        👤 {person}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ml-6 ${getRiskSeverityColor(risk.severity)} shadow-sm`}>
                                {risk.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4"> No Risks Detected!</h3>
                  <p className="text-gray-600 text-lg">Your current sprint appears to be on track.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAnalysis;