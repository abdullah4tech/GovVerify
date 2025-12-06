"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { 
  ExclamationTriangleIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon, 
  CircleStackIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

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

export default function EscalationPage() {
  const [data, setData] = useState<EscalationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGap, setSelectedGap] = useState<DataGap | null>(null);
  const [broadcasting, setBroadcasting] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <ArrowPathIcon className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
            <p className="mt-4 text-zinc-900 dark:text-zinc-100">Loading escalation data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="border-red-500">
          <CardHeader>
            <h3 className="text-xl font-semibold text-red-600">Error</h3>
          </CardHeader>
          <CardBody>
            <p className="text-zinc-900 dark:text-zinc-100">{error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const statusColorMap: Record<string, "success" | "warning" | "danger" | "default"> = {
    CRITICAL: "danger",
    HIGH: "warning",
    URGENT: "danger",
    PENDING: "warning",
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Escalation Dashboard
          </h1>
          <p className="text-zinc-900 dark:text-zinc-100 mt-2">
            Monitor urgent items requiring immediate attention
          </p>
        </div>
        <Button
          color="primary"
          variant="solid"
          startContent={<ArrowPathIcon className="h-5 w-5" />}
          onPress={fetchEscalationData}
        >
          Refresh
        </Button>
      </div>

      {/* System Health Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-white dark:bg-zinc-900">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">Pending Verifications</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
                  {data?.systemHealth.pending_items.verifications || 0}
                </p>
              </div>
              <ClockIcon className="h-10 w-10 text-blue-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">Urgent Threats</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {data?.systemHealth.pending_items.urgent_threats || 0}
                </p>
              </div>
              <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">Total Requiring Attention</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
                  {data?.systemHealth.pending_items.total_requiring_attention || 0}
                </p>
              </div>
              <CircleStackIcon className="h-10 w-10 text-blue-600" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs
        aria-label="Escalation Categories"
        color="primary"
        variant="underlined"
        classNames={{
          tabList: "bg-white dark:bg-zinc-900 p-4 rounded-t-lg",
          cursor: "bg-blue-600",
          tab: "text-zinc-600 dark:text-zinc-400",
          tabContent: "group-data-[selected=true]:text-blue-600",
        }}
      >
        <Tab
          key="threats"
          title={
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>Urgent Threats</span>
            </div>
          }
        >
          <Card className="bg-white dark:bg-zinc-900">
            <CardHeader>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Urgent Threats
              </h3>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                Threats requiring immediate attention
              </p>
            </CardHeader>
            <CardBody>
              {data?.urgentThreats.length === 0 ? (
                <p className="text-zinc-900 dark:text-zinc-100 py-8 text-center">
                  No urgent threats at this time.
                </p>
              ) : (
                <Table aria-label="Urgent threats table">
                  <TableHeader>
                    <TableColumn>TITLE</TableColumn>
                    <TableColumn>DESCRIPTION</TableColumn>
                    <TableColumn>SEVERITY</TableColumn>
                    <TableColumn>DATE</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {(data?.urgentThreats || []).map((threat) => (
                      <TableRow key={threat._id}>
                        <TableCell className="font-semibold text-zinc-900 dark:text-white">{threat.title}</TableCell>
                        <TableCell className="text-zinc-900 dark:text-white">{threat.description}</TableCell>
                        <TableCell>
                          <Chip color={statusColorMap[threat.severity] || "default"} variant="flat">
                            {threat.severity}
                          </Chip>
                        </TableCell>
                        <TableCell className="text-zinc-900 dark:text-white">
                          {new Date(threat.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="queries"
          title={
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <span>Unanswered Queries</span>
            </div>
          }
        >
          <Card className="bg-white dark:bg-zinc-900">
            <CardHeader>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Unanswered Queries
              </h3>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                Verification and information requests awaiting response
              </p>
            </CardHeader>
            <CardBody>
              {data?.unansweredQueries.length === 0 ? (
                <p className="text-zinc-900 dark:text-zinc-100 py-8 text-center">
                  All queries have been answered.
                </p>
              ) : (
                <Table aria-label="Unanswered queries table">
                  <TableHeader>
                    <TableColumn>QUERY</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>DATE</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {(data?.unansweredQueries || []).map((query) => (
                      <TableRow key={query._id}>
                        <TableCell className="text-zinc-900 dark:text-white">{query.query}</TableCell>
                        <TableCell>
                          <Chip variant="bordered">{query.type}</Chip>
                        </TableCell>
                        <TableCell className="text-zinc-900 dark:text-white">
                          {new Date(query.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="verifications"
          title={
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              <span>Pending Verifications</span>
            </div>
          }
        >
          <Card className="bg-white dark:bg-zinc-900">
            <CardHeader>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Pending Verifications
              </h3>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                Content awaiting verification review
              </p>
            </CardHeader>
            <CardBody>
              {data?.pendingVerifications.length === 0 ? (
                <p className="text-zinc-900 dark:text-zinc-100 py-8 text-center">
                  No pending verifications.
                </p>
              ) : (
                <Table aria-label="Pending verifications table">
                  <TableHeader>
                    <TableColumn>CONTENT HASH</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>SUBMITTED</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {(data?.pendingVerifications || []).map((verification) => (
                      <TableRow key={verification._id}>
                        <TableCell className="font-mono text-sm text-zinc-900 dark:text-white">
                          {verification.contentHash}
                        </TableCell>
                        <TableCell>
                          <Chip color={statusColorMap[verification.status] || "default"} variant="flat">
                            {verification.status}
                          </Chip>
                        </TableCell>
                        <TableCell className="text-zinc-900 dark:text-white">
                          {new Date(verification.submittedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="gaps"
          title={
            <div className="flex items-center gap-2">
              <CircleStackIcon className="h-5 w-5" />
              <span>Data Gaps</span>
            </div>
          }
        >
          <Card className="bg-white dark:bg-zinc-900">
            <CardHeader>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Critical Data Gaps
              </h3>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                High-priority information gaps requiring attention
              </p>
            </CardHeader>
            <CardBody>
              {data?.dataGaps.length === 0 ? (
                <p className="text-zinc-900 dark:text-zinc-100 py-8 text-center">
                  No critical data gaps identified.
                </p>
              ) : (
                <Table 
                  aria-label="Data gaps table"
                >
                  <TableHeader>
                    <TableColumn>TOPIC</TableColumn>
                    <TableColumn>CATEGORY</TableColumn>
                    <TableColumn>PRIORITY</TableColumn>
                    <TableColumn>REQUESTS</TableColumn>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {(data?.dataGaps || []).map((gap) => (
                      <TableRow key={gap.id}>
                        <TableCell 
                          className="font-semibold text-zinc-900 dark:text-white cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSelectedGap(gap);
                            onOpen();
                          }}
                        >
                          {gap.topic}
                        </TableCell>
                        <TableCell className="text-zinc-900 dark:text-white">{gap.category}</TableCell>
                        <TableCell>
                          <Chip color={statusColorMap[gap.priority] || "default"} variant="flat">
                            {gap.priority}
                          </Chip>
                        </TableCell>
                        <TableCell className="text-zinc-900 dark:text-white">{gap.requestCount}</TableCell>
                        <TableCell className="text-zinc-900 dark:text-white">
                          {new Date(gap.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            startContent={<PaperAirplaneIcon className="h-4 w-4" />}
                            onPress={() => handleBroadcast(gap)}
                            isLoading={broadcasting === gap.id}
                            isDisabled={!gap.requesterPhone}
                          >
                            Broadcast
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Data Gap Details Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Data Gap Details</h2>
              </ModalHeader>
              <ModalBody>
                {selectedGap && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-zinc-900 dark:text-white">Topic</label>
                      <p className="mt-1 text-zinc-900 dark:text-zinc-100">{selectedGap.topic}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-zinc-900 dark:text-white">Category</label>
                        <p className="mt-1">
                          <Chip variant="flat" color="primary">{selectedGap.category}</Chip>
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-zinc-900 dark:text-white">Priority</label>
                        <p className="mt-1">
                          <Chip 
                            color={statusColorMap[selectedGap.priority] || "default"} 
                            variant="flat"
                          >
                            {selectedGap.priority}
                          </Chip>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-zinc-900 dark:text-white">Request Count</label>
                        <p className="mt-1 text-zinc-900 dark:text-zinc-100 text-lg font-bold">
                          {selectedGap.requestCount}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-zinc-900 dark:text-white">ID</label>
                        <p className="mt-1 text-zinc-900 dark:text-zinc-100">#{selectedGap.id}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-zinc-900 dark:text-white">Requester Phone</label>
                      <p className="mt-1 text-zinc-900 dark:text-zinc-100 font-mono">
                        {selectedGap.requesterPhone}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-zinc-900 dark:text-white">Requested At</label>
                      <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                        {new Date(selectedGap.requestedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                {selectedGap && (
                  <Button 
                    color="primary" 
                    startContent={<PaperAirplaneIcon className="h-5 w-5" />}
                    onPress={() => handleBroadcast(selectedGap)}
                    isLoading={broadcasting === selectedGap.id}
                    isDisabled={!selectedGap.requesterPhone}
                  >
                    Broadcast Message
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
