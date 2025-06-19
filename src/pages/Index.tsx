
import { useState, useMemo } from "react";
import { ClientsTable } from "@/components/ClientsTable";
import { ClientFilter } from "@/components/ClientFilter";
import { ClientDialog } from "@/components/ClientDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { mockClients, Client } from "@/data/mockClients";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Index = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    company: "",
  });

  const itemsPerPage = 10;

  // Filter clients based on current filters
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        client.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || filters.status === "all" || client.status === filters.status;
      const matchesCompany =
        !filters.company ||
        client.company.toLowerCase().includes(filters.company.toLowerCase());

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [clients, filters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsClientDialogOpen(true);
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsClientDialogOpen(true);
  };

  const handleSaveClient = (clientData: Omit<Client, "id">) => {
    if (selectedClient) {
      // Update existing client
      setClients((prev) =>
        prev.map((client) =>
          client.id === selectedClient.id
            ? { ...clientData, id: selectedClient.id }
            : client
        )
      );
    } else {
      // Add new client
      const newClient: Client = {
        ...clientData,
        id: Math.max(...clients.map((c) => c.id)) + 1,
      };
      setClients((prev) => [...prev, newClient]);
    }
    setIsClientDialogOpen(false);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      setClients((prev) => prev.filter((client) => client.id !== clientToDelete.id));
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600 mt-1">Manage your client relationships</p>
            </div>
            <Button onClick={handleAddClient} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </div>

          <ClientFilter filters={filters} onFiltersChange={setFilters} />
        </div>

        <ClientsTable
          clients={paginatedClients}
          onClientClick={handleClientClick}
          onDeleteClick={handleDeleteClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalClients={filteredClients.length}
        />

        <ClientDialog
          client={selectedClient}
          isOpen={isClientDialogOpen}
          onOpenChange={setIsClientDialogOpen}
          onSave={handleSaveClient}
        />

        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          clientName={clientToDelete?.name || ""}
        />
      </div>
    </div>
  );
};

export default Index;
