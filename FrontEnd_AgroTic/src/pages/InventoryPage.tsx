import React, { useState, useEffect } from 'react';
import CustomButton from '../components/atoms/Boton';
import Table from '../components/atoms/Table';
import MobileCard from '../components/atoms/MobileCard';
import type { CardField, CardAction } from '../types/MobileCard.types';
import InventoryModal from '../components/organisms/InventoryModal';
import { inventoryService } from '../services/inventoryService';
import type { LoteInventario } from '../services/inventoryService';
import InventoryDetailsModal from '../components/organisms/InventoryDetailsModal';
import { EyeIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

const InventoryPage: React.FC = () => {
  const debouncedSearch = '';
  const [results, setResults] = useState<LoteInventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LoteInventario | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const limit = 10; // Items per page
  const totalPages = Math.ceil(total / limit);

  // Fetch data based on debounced search
  useEffect(() => {
    if (debouncedSearch.trim()) {
      handleSearch(debouncedSearch);
    } else {
      fetchInventory(1);
      setCurrentPage(1);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (isSearchMode && debouncedSearch.trim()) {
      handleSearchWithPage(debouncedSearch, currentPage);
    } else if (!debouncedSearch.trim()) {
      fetchInventory(currentPage);
    }
  }, [currentPage, debouncedSearch, isSearchMode]);

  const fetchInventory = async (page: number) => {
    console.log('Fetching inventory for page:', page);
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getAll(page, limit);
      console.log('Inventory response:', response);
      setResults(response.items);
      setTotal(response.total);
      setIsSearchMode(false);
    } catch (err: unknown) {
      console.error('Error fetching inventory:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    console.log('Searching inventory with query:', query);
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.search(query, 1, limit);
      console.log('Search response:', response);
      setResults(response.items);
      setTotal(response.total);
      setCurrentPage(1);
      setIsSearchMode(true);
    } catch (err: unknown) {
      console.error('Error searching inventory:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al buscar inventario');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchWithPage = async (query: string, page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.search(query, page, limit);
      setResults(response.items);
      setTotal(response.total);
      setIsSearchMode(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al buscar inventario');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await inventoryService.delete(id);
        Swal.fire('Eliminado', 'El inventario ha sido eliminado.', 'success');
        fetchInventory(currentPage);
      } catch {
        Swal.fire('Error', 'No se pudo eliminar el inventario.', 'error');
      }
    }
  };

  const headers = ['Nombre', 'Stock Disponible', 'Precio Venta', 'SKU', 'Bodega', 'Ver más'];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-left whitespace-nowrap">Gestión de Inventario</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-start">
          <CustomButton onClick={() => setIsInventoryModalOpen(true)}>Registrar Inventario</CustomButton>
        </div>
      </div>

      {/* 
       <div className="mb-4">
        <InputSearch
          placeholder="Buscar por nombre..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>*/
      }
     

      {/* Desktop Table */}
      <div className="hidden md:block">
        {loading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : (
          <>
            <Table headers={headers}>
              {results.map((item, index) => (
                <tr key={item.id || index} className="border-b">
                  <td className="px-4 py-2">{item.producto.nombre}</td>
                  <td className="px-4 py-2">{item.cantidadDisponible}</td>
                  <td className="px-4 py-2">${item.producto.precioVenta}</td>
                  <td className="px-4 py-2">{item.producto.sku}</td>
                  <td className="px-4 py-2">{item.bodega?.nombre || '-'}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIsDetailsModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </Table>

            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {loading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No se encontraron resultados.</div>
        ) : (
          <>
            {results.map((item, index) => {
              const fields: CardField[] = [
                { label: 'Nombre', value: item.producto.nombre },
                { label: 'Stock Disponible', value: item.cantidadDisponible },
                { label: 'Precio Venta', value: `$${item.producto.precioVenta}` },
                { label: 'SKU', value: item.producto.sku },
                { label: 'Bodega', value: item.bodega?.nombre || '-' },
              ];

              const actions: CardAction[] = [
                {
                  label: 'Ver más',
                  onClick: () => {
                    setSelectedItem(item);
                    setIsDetailsModalOpen(true);
                  },
                  size: 'sm',
                },
              ];

              return <MobileCard key={item.id || index} fields={fields} actions={actions} />;
            })}

            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => {
          setIsInventoryModalOpen(false);
        }}
        onInventoryCreated={() => {
          fetchInventory(currentPage);
        }}
        editItem={null}
      />

      <InventoryDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        item={selectedItem}
        onEdit={() => {}} // Placeholder since edit is disabled
        onDelete={handleDelete}
      />
    </div>
  );
};

export default InventoryPage;