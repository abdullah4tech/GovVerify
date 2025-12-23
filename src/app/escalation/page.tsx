"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface UrgentThreat {
  _id: string;
  title: string;
  description: string;
  severity: string;
  createdAt: string;
}

interface UnansweredQuery {
  _id: string;
  query: string;
  type: string;
  createdAt: string;
}

interface PendingVerification {
  _id: string;
  contentHash: string;
  status: string;
  submittedAt: string;
  claim?: string;
  [key: string]: unknown;
}

interface DataGap {
  id: number;
  topic: string;
  category: string;
  requestCount: number;
  priority: string;
  requestedAt: string;
  requesterPhone: string;
}

interface SystemHealth {
  pending_items: {
    verifications: number;
    urgent_threats: number;
    total_requiring_attention: number;
  };
}

interface EscalationData {
  urgentThreats: UrgentThreat[];
  unansweredQueries: UnansweredQuery[];
  pendingVerifications: PendingVerification[];
  dataGaps: DataGap[];
  systemHealth: SystemHealth;
}

// Helper function to safely format dates
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "N/A";
  }
};

// Helper function to truncate long text
const truncateText = (
  text: string | undefined | null,
  maxLength: number = 50
): string => {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export default function EscalationPage() {
  const [data, setData] = useState<EscalationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGap, setSelectedGap] = useState<DataGap | null>(null);
  const [selectedVerification, setSelectedVerification] =
    useState<PendingVerification | null>(null);
  const [broadcasting, setBroadcasting] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<
    "threats" | "queries" | "verifications" | "gaps"
  >("threats");

  // Modal states
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  useEffect(() => {
    fetchEscalationData();
  }, []);

  const fetchEscalationData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/escalation");

      if (!response.ok) {
        throw new Error("Failed to fetch escalation data");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (gap: DataGap) => {
    if (!gap.requesterPhone) {
      alert("No phone number available for this request");
      return;
    }

    try {
      setBroadcasting(gap.id);

      // Call your broadcast API
      const response = await fetch("/api/whatsapp/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: gap.requesterPhone,
          message: `Hello! We have information regarding your query about: "${gap.topic}". We are working on providing the information you requested about ${gap.category}. Thank you for your patience.`,
          dataGapId: gap.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send broadcast message");
      }

      alert(`Message successfully sent to ${gap.requesterPhone}!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setBroadcasting(null);
    }
  };

  const statusColorMap: Record<
    string,
    { bg: string; text: string; icon: string }
  > = {
    CRITICAL: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      icon: "lucide:alert-octagon",
    },
    HIGH: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-400",
      icon: "lucide:alert-triangle",
    },
    URGENT: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      icon: "lucide:siren",
    },
    PENDING: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-400",
      icon: "lucide:clock",
    },
    verified: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
      icon: "lucide:check-circle-2",
    },
    rejected: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      icon: "lucide:x-circle",
    },
  };

  const getStatusBadge = (status: string) => {
    const style = statusColorMap[status] || {
      bg: "bg-zinc-100 dark:bg-zinc-800",
      text: "text-zinc-600 dark:text-zinc-400",
      icon: "lucide:help-circle",
    };
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-transparent",
          style.bg,
          style.text
        )}
      >
        <Icon icon={style.icon} className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Icon
            icon="lucide:loader-2"
            className="animate-spin h-10 w-10 text-primary"
          />
          <p className="text-zinc-500 dark:text-zinc-400 animate-pulse">
            Loading escalation data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
            <Icon
              icon="lucide:alert-triangle"
              className="w-6 h-6 text-red-600 dark:text-red-400"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
              Error Loading Data
            </h3>
            <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Escalation Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
            Monitor urgent items requiring immediate attention and action.
          </p>
        </div>
        <button
          onClick={fetchEscalationData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* System Health Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon icon="lucide:clock" className="w-24 h-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Pending Verifications
            </p>
            <p className="text-4xl font-bold text-zinc-900 dark:text-white mt-3 tracking-tight">
              {data?.systemHealth.pending_items.verifications || 0}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 w-fit px-2 py-1 rounded-md">
              <Icon icon="lucide:activity" className="w-3 h-3" />
              Awaiting Review
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon
              icon="lucide:alert-triangle"
              className="w-24 h-24 text-red-600"
            />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Urgent Threats
            </p>
            <p className="text-4xl font-bold text-red-600 dark:text-red-500 mt-3 tracking-tight">
              {data?.systemHealth.pending_items.urgent_threats || 0}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 w-fit px-2 py-1 rounded-md">
              <Icon icon="lucide:siren" className="w-3 h-3" />
              Critical Attention
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon icon="lucide:layers" className="w-24 h-24 text-purple-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Action Items
            </p>
            <p className="text-4xl font-bold text-zinc-900 dark:text-white mt-3 tracking-tight">
              {data?.systemHealth.pending_items.total_requiring_attention || 0}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 w-fit px-2 py-1 rounded-md">
              <Icon icon="lucide:list-todo" className="w-3 h-3" />
              Total Queue
            </div>
          </div>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
          {[
            {
              id: "threats",
              label: "Urgent Threats",
              icon: "lucide:alert-triangle",
            },
            {
              id: "queries",
              label: "Unanswered Queries",
              icon: "lucide:message-circle-question",
            },
            {
              id: "verifications",
              label: "Pending Verifications",
              icon: "lucide:clock",
            },
            { id: "gaps", label: "Data Gaps", icon: "lucide:database" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
              )}
            >
              <Icon icon={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px]">
          {/* Threats Tab */}
          {activeTab === "threats" && (
            <div className="p-0">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Urgent Threats
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Threats requiring immediate attention
                </p>
              </div>
              {data?.urgentThreats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                  <Icon
                    icon="lucide:shield-check"
                    className="w-12 h-12 text-green-500 mb-3"
                  />
                  <p>No urgent threats at this time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Title
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Description
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Severity
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data?.urgentThreats.map((threat) => (
                        <tr
                          key={threat._id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          <td className="py-4 px-6 font-medium text-zinc-900 dark:text-white">
                            {threat.title}
                          </td>
                          <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400 max-w-md truncate">
                            {threat.description}
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(threat.severity)}
                          </td>
                          <td className="py-4 px-6 text-zinc-500 text-sm">
                            {formatDate(threat.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Queries Tab */}
          {activeTab === "queries" && (
            <div className="p-0">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Unanswered Queries
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Verification and information requests awaiting response
                </p>
              </div>
              {data?.unansweredQueries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                  <Icon
                    icon="lucide:check-check"
                    className="w-12 h-12 text-green-500 mb-3"
                  />
                  <p>All queries have been answered.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Query
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Type
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data?.unansweredQueries.map((query) => (
                        <tr
                          key={query._id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          <td className="py-4 px-6 text-zinc-900 dark:text-white max-w-lg truncate">
                            {query.query}
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium border border-zinc-200 dark:border-zinc-700">
                              {query.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-zinc-500 text-sm">
                            {formatDate(query.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Verifications Tab */}
          {activeTab === "verifications" && (
            <div className="p-0">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Pending Verifications
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Content awaiting verification review
                </p>
              </div>
              {data?.pendingVerifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                  <Icon
                    icon="lucide:clipboard-check"
                    className="w-12 h-12 text-green-500 mb-3"
                  />
                  <p>No pending verifications.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Content Hash
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Claim
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Status
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data?.pendingVerifications.map((verification) => (
                        <tr
                          key={verification._id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedVerification(verification);
                            setIsVerificationModalOpen(true);
                          }}
                        >
                          <td className="py-4 px-6 font-mono text-xs text-zinc-500">
                            {truncateText(verification.contentHash, 20)}
                          </td>
                          <td className="py-4 px-6 text-zinc-900 dark:text-white max-w-md truncate">
                            {truncateText(verification.claim, 50)}
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(verification.status)}
                          </td>
                          <td className="py-4 px-6 text-zinc-500 text-sm">
                            {formatDate(verification.submittedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Gaps Tab */}
          {activeTab === "gaps" && (
            <div className="p-0">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Critical Data Gaps
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  High-priority information gaps requiring attention
                </p>
              </div>
              {data?.dataGaps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                  <Icon
                    icon="lucide:database"
                    className="w-12 h-12 text-green-500 mb-3"
                  />
                  <p>No critical data gaps identified.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Topic
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Category
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Priority
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Requests
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Date
                        </th>
                        <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data?.dataGaps.map((gap) => (
                        <tr
                          key={gap.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          <td
                            className="py-4 px-6 font-medium text-primary cursor-pointer hover:underline"
                            onClick={() => {
                              setSelectedGap(gap);
                              setIsGapModalOpen(true);
                            }}
                          >
                            {gap.topic}
                          </td>
                          <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">
                            {gap.category}
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(gap.priority)}
                          </td>
                          <td className="py-4 px-6 text-zinc-900 dark:text-white font-medium">
                            {gap.requestCount}
                          </td>
                          <td className="py-4 px-6 text-zinc-500 text-sm">
                            {formatDate(gap.requestedAt)}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleBroadcast(gap)}
                              disabled={
                                broadcasting === gap.id || !gap.requesterPhone
                              }
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                broadcasting === gap.id || !gap.requesterPhone
                                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                  : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                              )}
                            >
                              {broadcasting === gap.id ? (
                                <Icon
                                  icon="lucide:loader-2"
                                  className="w-3.5 h-3.5 animate-spin"
                                />
                              ) : (
                                <Icon
                                  icon="lucide:send"
                                  className="w-3.5 h-3.5"
                                />
                              )}
                              Broadcast
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Data Gap Details Modal */}
      {isGapModalOpen && selectedGap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Data Gap Details
              </h2>
              <button
                onClick={() => setIsGapModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Topic
                </label>
                <p className="mt-1 text-zinc-900 dark:text-zinc-100 text-lg">
                  {selectedGap.topic}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Category
                  </label>
                  <div className="mt-1">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
                      {selectedGap.category}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Priority
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedGap.priority)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Request Count
                  </label>
                  <p className="mt-1 text-zinc-900 dark:text-zinc-100 text-2xl font-bold">
                    {selectedGap.requestCount}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    ID
                  </label>
                  <p className="mt-1 text-zinc-500 font-mono">
                    #{selectedGap.id}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Requester Phone
                </label>
                <p className="mt-1 text-zinc-900 dark:text-zinc-100 font-mono flex items-center gap-2">
                  <Icon icon="lucide:phone" className="w-4 h-4 text-zinc-400" />
                  {selectedGap.requesterPhone}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Requested At
                </label>
                <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                  {formatDate(selectedGap.requestedAt)}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-3">
              <button
                onClick={() => setIsGapModalOpen(false)}
                className="px-4 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-sm"
              >
                Close
              </button>
              <button
                onClick={() => handleBroadcast(selectedGap)}
                disabled={
                  broadcasting === selectedGap.id || !selectedGap.requesterPhone
                }
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition-all shadow-md shadow-primary/20",
                  broadcasting === selectedGap.id || !selectedGap.requesterPhone
                    ? "bg-zinc-300 cursor-not-allowed shadow-none"
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                {broadcasting === selectedGap.id ? (
                  <Icon
                    icon="lucide:loader-2"
                    className="w-4 h-4 animate-spin"
                  />
                ) : (
                  <Icon icon="lucide:send" className="w-4 h-4" />
                )}
                Broadcast Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Details Modal */}
      {isVerificationModalOpen && selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-3xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Verification Details
              </h2>
              <button
                onClick={() => setIsVerificationModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Content Hash
                </label>
                <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-600 dark:text-zinc-300 font-mono text-xs break-all">
                    {selectedVerification.contentHash}
                  </p>
                </div>
              </div>

              {selectedVerification.claim && (
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Claim
                  </label>
                  <div className="mt-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed">
                      {selectedVerification.claim}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedVerification.status)}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Submitted At
                  </label>
                  <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                    {formatDate(selectedVerification.submittedAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
              <button
                onClick={() => setIsVerificationModalOpen(false)}
                className="px-4 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
