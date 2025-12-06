import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3800/api";

export async function GET() {
  try {
    console.log("=== Escalation API: Starting data fetch ===");
    console.log("API Base URL:", API_BASE_URL);
    
    const endpoints = {
      urgentThreats: `${API_BASE_URL}/analytics/threats/urgent`,
      unansweredQueries: `${API_BASE_URL}/citizen-stats/unanswered-queries`,
      pendingVerifications: `${API_BASE_URL}/feeds/verifications?status=PENDING`,
      dataGaps: `${API_BASE_URL}/analytics/data-gaps?limit=50`,
    };
    
    console.log("Fetching from endpoints:", endpoints);
    
    // Fetch all data in parallel
    const [
      urgentThreatsRes,
      unansweredQueriesRes,
      pendingVerificationsRes,
      dataGapsRes,
    ] = await Promise.all([
      fetch(endpoints.urgentThreats),
      fetch(endpoints.unansweredQueries),
      fetch(endpoints.pendingVerifications),
      fetch(endpoints.dataGaps),
    ]);
    
    console.log("Response statuses:", {
      urgentThreats: urgentThreatsRes.status,
      unansweredQueries: unansweredQueriesRes.status,
      pendingVerifications: pendingVerificationsRes.status,
      dataGaps: dataGapsRes.status,
    });

    // Parse responses
    const urgentThreats = urgentThreatsRes.ok ? await urgentThreatsRes.json() : [];
    const unansweredQueries = unansweredQueriesRes.ok ? await unansweredQueriesRes.json() : [];
    const pendingVerifications = pendingVerificationsRes.ok ? await pendingVerificationsRes.json() : [];
    const dataGaps = dataGapsRes.ok ? await dataGapsRes.json() : [];

    console.log("Raw responses:", {
      urgentThreats: urgentThreats,
      unansweredQueries: unansweredQueries,
      pendingVerifications: pendingVerifications,
      dataGaps: dataGaps,
    });

    // Calculate system health from the fetched data
    const systemHealth = {
      pending_items: {
        verifications: Array.isArray(pendingVerifications) ? pendingVerifications.length : (pendingVerifications.data?.length || 0),
        urgent_threats: Array.isArray(urgentThreats) ? urgentThreats.length : (urgentThreats.data?.length || 0),
        total_requiring_attention: 0, // Will be calculated below
      },
    };

    // Extract data arrays from responses (handle both array and object formats)
    const threatsArray = Array.isArray(urgentThreats) ? urgentThreats : urgentThreats.data || [];
    const queriesArray = Array.isArray(unansweredQueries) ? unansweredQueries : unansweredQueries.data || [];
    const verificationsArray = Array.isArray(pendingVerifications) ? pendingVerifications : pendingVerifications.data || [];
    const gapsArray = Array.isArray(dataGaps) ? dataGaps : dataGaps.data || [];

    // Calculate total items requiring attention
    systemHealth.pending_items.total_requiring_attention = 
      threatsArray.length + queriesArray.length + verificationsArray.length + gapsArray.length;

    console.log("Processed data counts:", {
      threats: threatsArray.length,
      queries: queriesArray.length,
      verifications: verificationsArray.length,
      gaps: gapsArray.length,
      total: systemHealth.pending_items.total_requiring_attention,
    });

    // Aggregate the data
    const escalationData = {
      urgentThreats: threatsArray,
      unansweredQueries: queriesArray,
      pendingVerifications: verificationsArray,
      dataGaps: gapsArray,
      systemHealth: systemHealth,
      lastUpdated: new Date().toISOString(),
    };

    console.log("=== Escalation API: Data aggregation complete ===");
    return NextResponse.json(escalationData);
  } catch (error) {
    console.error("=== Escalation API: Error occurred ===");
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "N/A");
    return NextResponse.json(
      { error: "Failed to fetch escalation data" },
      { status: 500 }
    );
  }
}
