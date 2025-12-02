import UserTable from "@/components/UserTable";

export default function UsersPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          User Management
        </h1>
        <p className="text-zinc-600 dark:text-zinc-300 mt-2">
          Manage access and roles for the Truth Engine.
        </p>
      </div>
      <UserTable />
    </div>
  );
}
