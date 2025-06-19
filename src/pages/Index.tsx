import { useState, useMemo } from "react";
import { ClientsTable } from "@/components/ClientsTable";
import { ClientFilter } from "@/components/ClientFilter";
import { ClientDialog } from "@/components/ClientDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { mockClients, Client } from "@/data/mockClients";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type SortField = 'name' | 'company' | 'email' | 'status' | 'value' | 'lastContact';
type SortDirection = 'asc' | 'desc';

const Index = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    company: "",
  });

  const itemsPerPage = 10;

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        client.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || filters.status === "all" || client.status === filters.status;
      const matchesCompany =
        !filters.company ||
        client.company.toLowerCase().includes(filters.company.toLowerCase());

      return matchesSearch && matchesStatus && matchesCompany;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        if (sortField === 'value') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        } else if (sortField === 'lastContact') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }

        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [clients, filters, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredAndSortedClients.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsClientDialogOpen(true);
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsClientDialogOpen(true);
  };

  const handleNavigateRecord = (direction: 'prev' | 'next') => {
    if (!selectedClient) return;

    const currentIndex = filteredAndSortedClients.findIndex(
      (client) => client.id === selectedClient.id
    );

    if (direction === 'prev' && currentIndex > 0) {
      setSelectedClient(filteredAndSortedClients[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < filteredAndSortedClients.length - 1) {
      setSelectedClient(filteredAndSortedClients[currentIndex + 1]);
    }
  };

  const getNavigationState = () => {
    if (!selectedClient) return { canNavigatePrev: false, canNavigateNext: false };

    const currentIndex = filteredAndSortedClients.findIndex(
      (client) => client.id === selectedClient.id
    );

    return {
      canNavigatePrev: currentIndex > 0,
      canNavigateNext: currentIndex < filteredAndSortedClients.length - 1,
    };
  };

  const handleSaveClient = (clientData: Omit<Client, "id">) => {
    if (selectedClient) {
      setClients((prev) =>
        prev.map((client) =>
          client.id === selectedClient.id
            ? { ...clientData, id: selectedClient.id }
            : client
        )
      );
    } else {
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

  const { canNavigatePrev, canNavigateNext } = getNavigationState();

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
          totalClients={filteredAndSortedClients.length}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        <ClientDialog
          client={selectedClient}
          isOpen={isClientDialogOpen}
          onOpenChange={setIsClientDialogOpen}
          onSave={handleSaveClient}
          onNavigate={handleNavigateRecord}
          canNavigatePrev={canNavigatePrev}
          canNavigateNext={canNavigateNext}
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
