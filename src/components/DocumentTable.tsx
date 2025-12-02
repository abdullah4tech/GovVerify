"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Select,
  SelectItem,
  Pagination,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

interface Document {
  _id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  uploaderId: string;
}

export default function DocumentTable({
  documents,
}: {
  documents: Document[];
}) {
  const router = useRouter();
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredDocuments = [...documents];

    if (hasSearchFilter) {
      filteredDocuments = filteredDocuments.filter((doc) =>
        doc.title.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (statusFilter !== "all" && Array.from(statusFilter).length !== 0) {
      filteredDocuments = filteredDocuments.filter((doc) =>
        Array.from(statusFilter).includes(doc.status)
      );
    }

    return filteredDocuments;
  }, [documents, filterValue, statusFilter, hasSearchFilter]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const statusColorMap: Record<
    string,
    "success" | "warning" | "danger" | "default"
  > = {
    verified: "success",
    pending: "warning",
    rejected: "danger",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Search by title..."
          startContent={
            <span className="material-icons-outlined text-zinc-600 dark:text-zinc-400">
              search
            </span>
          }
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={setFilterValue}
          variant="bordered"
          classNames={{
            input: "text-zinc-900 dark:text-white",
            inputWrapper: "bg-white dark:bg-zinc-900",
          }}
        />
        <div className="flex gap-3">
          <Select
            className="w-40"
            placeholder="Status"
            selectedKeys={statusFilter === "all" ? [] : [statusFilter]}
            onChange={(e) => setStatusFilter(e.target.value || "all")}
            variant="bordered"
            classNames={{
              trigger: "bg-white dark:bg-zinc-900",
            }}
          >
            <SelectItem
              key="all"
              classNames={{
                title: "text-zinc-800 dark:text-zinc-100 font-medium",
              }}
            >
              All Status
            </SelectItem>
            <SelectItem
              key="verified"
              classNames={{
                title: "text-zinc-800 dark:text-zinc-100 font-medium",
              }}
            >
              Verified
            </SelectItem>
            <SelectItem
              key="pending"
              classNames={{
                title: "text-zinc-800 dark:text-zinc-100 font-medium",
              }}
            >
              Pending
            </SelectItem>
            <SelectItem
              key="rejected"
              classNames={{
                title: "text-zinc-800 dark:text-zinc-100 font-medium",
              }}
            >
              Rejected
            </SelectItem>
          </Select>
        </div>
      </div>

      <Table
        aria-label="Documents table"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={Math.ceil(filteredItems.length / rowsPerPage)}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper:
            "bg-white dark:bg-zinc-900 shadow-none border border-zinc-200 dark:border-zinc-800",
          th: "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold",
        }}
        selectionMode="single"
        onRowAction={(key) => router.push(`/documents/${key}`)}
      >
        <TableHeader>
          <TableColumn>TITLE</TableColumn>
          <TableColumn>CATEGORY</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>DATE</TableColumn>
        </TableHeader>
        <TableBody items={items} emptyContent={"No documents found"}>
          {(item) => (
            <TableRow
              key={item._id}
              className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                {item.title}
              </TableCell>
              <TableCell className="capitalize text-zinc-700 dark:text-zinc-300">
                {item.category}
              </TableCell>
              <TableCell>
                <Chip
                  className="capitalize"
                  color={statusColorMap[item.status]}
                  size="sm"
                  variant="flat"
                >
                  {item.status}
                </Chip>
              </TableCell>
              <TableCell className="text-zinc-700 dark:text-zinc-300">
                {new Date(item.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
