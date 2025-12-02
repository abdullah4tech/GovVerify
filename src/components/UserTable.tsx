"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { useState } from "react";

const columns = [
  { name: "NAME", uid: "name" },
  { name: "ROLE", uid: "role" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

const initialUsers = [
  {
    id: 1,
    name: "Tony Reichert",
    email: "tony.reichert@example.com",
    role: "Admin",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    id: 2,
    name: "Zoey Lang",
    email: "zoey.lang@example.com",
    role: "Editor",
    status: "paused",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    id: 3,
    name: "Jane Fisher",
    email: "jane.fisher@example.com",
    role: "Viewer",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  },
  {
    id: 4,
    name: "William Howard",
    email: "william.howard@example.com",
    role: "Editor",
    status: "vacation",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026024d",
  },
];

export default function UserTable() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState(initialUsers);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    onOpen();
  };

  const statusColorMap: Record<string, "success" | "warning" | "danger"> = {
    active: "success",
    paused: "danger",
    vacation: "warning",
  };

  return (
    <>
      <Table aria-label="Example table with custom cells">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={users}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>
                <User
                  avatarProps={{ radius: "lg", src: item.avatar }}
                  description={item.email}
                  name={item.name}
                  classNames={{
                    name: "text-zinc-900 dark:text-white font-semibold",
                    description: "text-zinc-700 dark:text-zinc-300",
                  }}
                >
                  {item.email}
                </User>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <p className="text-bold text-sm capitalize text-zinc-700 dark:text-zinc-200">
                    {item.role}
                  </p>
                </div>
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
              <TableCell>
                <div className="relative flex items-center gap-2">
                  <Tooltip
                    content="Edit user"
                    classNames={{
                      content: "bg-zinc-800 text-white font-medium",
                    }}
                  >
                    <span
                      className="text-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer active:opacity-50 transition-colors"
                      onClick={() => handleEdit(item)}
                    >
                      <span className="material-icons-outlined">edit</span>
                    </span>
                  </Tooltip>
                  <Tooltip
                    color="danger"
                    content="Delete user"
                    classNames={{
                      content: "bg-red-600 text-white font-medium",
                    }}
                  >
                    <span className="text-lg text-danger cursor-pointer hover:text-red-700 active:opacity-50 transition-colors">
                      <span className="material-icons-outlined">delete</span>
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-zinc-900 dark:text-white text-xl font-bold">
                Edit User
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Email"
                  placeholder="Enter your email"
                  variant="bordered"
                  defaultValue={selectedUser?.email}
                  classNames={{
                    label: "text-zinc-900 dark:text-white font-semibold",
                    input: "text-zinc-900 dark:text-white",
                  }}
                />
                <Select
                  label="Role"
                  placeholder="Select a role"
                  defaultSelectedKeys={selectedUser ? [selectedUser.role] : []}
                  variant="bordered"
                  classNames={{
                    label: "text-zinc-900 dark:text-white font-semibold",
                  }}
                >
                  <SelectItem
                    key="Admin"
                    classNames={{
                      title: "text-zinc-800 dark:text-zinc-100 font-medium",
                    }}
                  >
                    Admin
                  </SelectItem>
                  <SelectItem
                    key="Editor"
                    classNames={{
                      title: "text-zinc-800 dark:text-zinc-100 font-medium",
                    }}
                  >
                    Editor
                  </SelectItem>
                  <SelectItem
                    key="Viewer"
                    classNames={{
                      title: "text-zinc-800 dark:text-zinc-100 font-medium",
                    }}
                  >
                    Viewer
                  </SelectItem>
                </Select>
                <Select
                  label="Status"
                  placeholder="Select status"
                  defaultSelectedKeys={
                    selectedUser ? [selectedUser.status] : []
                  }
                  variant="bordered"
                  classNames={{
                    label: "text-zinc-900 dark:text-white font-semibold",
                  }}
                >
                  <SelectItem
                    key="active"
                    classNames={{
                      title: "text-zinc-800 dark:text-zinc-100 font-medium",
                    }}
                  >
                    Active
                  </SelectItem>
                  <SelectItem
                    key="paused"
                    classNames={{
                      title: "text-zinc-800 dark:text-zinc-100 font-medium",
                    }}
                  >
                    Paused
                  </SelectItem>
                  <SelectItem
                    key="vacation"
                    classNames={{
                      title: "text-zinc-800 dark:text-zinc-100 font-medium",
                    }}
                  >
                    Vacation
                  </SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
