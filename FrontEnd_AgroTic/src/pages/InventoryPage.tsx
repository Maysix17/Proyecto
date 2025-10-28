import React, { useState, useEffect } from 'react';
import CustomButton from '../components/atoms/Boton';
import Table from '../components/atoms/Table';
import MobileCard from '../components/atoms/MobileCard';
import type { CardField, CardAction } from '../types/MobileCard.types';
import UnifiedProductModal from '../components/organisms/UnifiedProductModal';
import BodegaModal from '../components/organisms/BodegaModal';
import CategoriaModal from '../components/organisms/CategoriaModal';
import { inventoryService } from '../services/inventoryService';
import type { LoteInventario } from '../services/inventoryService';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import InputSearch from '../components/atoms/buscador';
import Swal from 'sweetalert2';
import { Modal, ModalContent } from '@heroui/react';

const InventoryPage: React.FC = () => {
   const [searchInput, setSearchInput] = useState('');
   const [allItems, setAllItems] = useState<LoteInventario[]>([]);
   const [results, setResults] = useState<LoteInventario[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [isUnifiedProductModalOpen, setIsUnifiedProductModalOpen] = useState(false);
     const [isImageModalOpen, setIsImageModalOpen] = useState(false);
     const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
     const [selectedItem, setSelectedItem] = useState<LoteInventario | null>(null);
     const [editItem, setEditItem] = useState<LoteInventario | null>(null);
     const [isBodegaModalOpen, setIsBodegaModalOpen] = useState(false);
     const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);

  const limit = 10; // Items per page

  const totalPages = Math.ceil(total / limit);

  // Fetch all items on mount
  useEffect(() => {
    fetchAllInventory();
  }, []);

  // Filter items based on search input
  useEffect(() => {
    if (searchInput.trim()) {
      const filtered = allItems.filter(item =>
        item.producto.nombre.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.producto.sku.toLowerCase().includes(searchInput.toLowerCase())
      );
      setResults(filtered.slice((currentPage - 1) * limit, currentPage * limit));
      setTotal(filtered.length);
    } else {
      setResults(allItems.slice((currentPage - 1) * limit, currentPage * limit));
      setTotal(allItems.length);
    }
  }, [searchInput, allItems, currentPage]);

  const fetchAllInventory = async () => {
    console.log('Fetching all inventory');
    setLoading(true);
    setError(null);
    try {
      // Fetch all items by setting a high limit
      const response = await inventoryService.getAll(1, 10000);
      console.log('All inventory response:', response);
      setAllItems(response.items);
      setResults(response.items.slice(0, limit));
      setTotal(response.items.length);
    } catch (err: unknown) {
      console.error('Error fetching inventory:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async (page: number) => {
    console.log('Fetching inventory for page:', page);
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getAll(page, limit);
      console.log('Inventory response:', response);
      setResults(response.items);
      setTotal(response.total);
    } catch (err: unknown) {
      console.error('Error fetching inventory:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  const headers = ['Código', 'Producto', 'Categoría', 'Bodega', 'Stock', 'Cantidad Disponible Total', 'Disponible para Reservar', 'Reservado', 'Acciones'];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-left whitespace-nowrap">Gestión de Inventario</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-start">
          <CustomButton onClick={() => setIsUnifiedProductModalOpen(true)}>Registrar Producto</CustomButton>
          <CustomButton onClick={() => setIsBodegaModalOpen(true)} variant="bordered">Gestionar Bodegas</CustomButton>
          <CustomButton onClick={() => setIsCategoriaModalOpen(true)} variant="bordered">Gestionar Categorías</CustomButton>
        </div>
      </div>

      <div className="mb-4">
        <InputSearch
          placeholder="Buscar por nombre o código..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
     

      {/* Desktop Table */}
      <div className="hidden md:block">
        {loading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : (
          <>
            <Table headers={headers}>
              {results.map((item, index) => {
                return (
                  <tr key={item.id || index} className="border-b">
                    <td className="px-4 py-2">{item.producto.sku}</td>
                    <td className="px-4 py-2">{item.producto.nombre}</td>
                    <td className="px-4 py-2">{item.producto.categoria?.nombre || '-'}</td>
                    <td className="px-4 py-2">{item.bodega?.nombre || '-'}</td>
                    <td className="px-4 py-2">{item.stock || '0.00'}</td>
                    <td className="px-4 py-2">{item.stockTotal?.toFixed(2) || '0.00'} {item.unidadAbreviatura || ''}</td>
                    <td className="px-4 py-2">{item.cantidadDisponibleParaReservar?.toFixed(2) || '0.00'} {item.unidadAbreviatura || ''}</td>
                    <td className="px-4 py-2">{item.cantidadReservada?.toFixed(2) || '0.00'} {item.unidadAbreviatura || ''}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-green-500 hover:text-green-700"
                        title="Ver más"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditItem(item);
                          setIsUnifiedProductModalOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
                { label: 'Código', value: item.producto.sku },
                { label: 'Producto', value: item.producto.nombre },
                { label: 'Categoría', value: item.producto.categoria?.nombre || '-' },
                { label: 'Bodega', value: item.bodega?.nombre || '-' },
                { label: 'Stock', value: `${item.stock?.toFixed(2) || '0.00'} ${item.unidadAbreviatura || ''}` },
                { label: 'Cantidad Disponible Total', value: `${item.stockTotal?.toFixed(2) || '0.00'} ${item.unidadAbreviatura || ''}` },
                { label: 'Disponible para Reservar', value: `${item.cantidadDisponibleParaReservar?.toFixed(2) || '0.00'} ${item.unidadAbreviatura || ''}` },
                { label: 'Reservado', value: `${item.cantidadReservada?.toFixed(2) || '0.00'} ${item.unidadAbreviatura || ''}` },
              ];

              const actions: CardAction[] = [
                {
                  label: 'Ver más',
                  onClick: () => {
                    setSelectedItem(item);
                    setIsDetailsModalOpen(true);
                  },
                  size: 'sm' as const,
                },
                {
                  label: 'Editar',
                  onClick: () => {
                    setEditItem(item);
                    setIsUnifiedProductModalOpen(true);
                  },
                  size: 'sm',
                },
                {
                  label: 'Eliminar',
                  onClick: () => handleDelete(item.id),
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

      <UnifiedProductModal
        isOpen={isUnifiedProductModalOpen}
        onClose={() => {
          setIsUnifiedProductModalOpen(false);
          setEditItem(null);
        }}
        onProductCreated={() => {
          fetchAllInventory();
          setCurrentPage(1);
        }}
        editItem={editItem}
      />

      <BodegaModal
        isOpen={isBodegaModalOpen}
        onClose={() => setIsBodegaModalOpen(false)}
      />

      <CategoriaModal
        isOpen={isCategoriaModalOpen}
        onClose={() => setIsCategoriaModalOpen(false)}
      />

      <Modal isOpen={isImageModalOpen} onOpenChange={setIsImageModalOpen} size="2xl">
        <ModalContent className="bg-white p-6">
          <h2 className="text-xl font-bold mb-4">Imagen del Producto</h2>
          {selectedItem?.producto.imgUrl && (
            <img
              src={`${import.meta.env.VITE_API_URL}/uploads/${selectedItem.producto.imgUrl}`}
              alt={selectedItem.producto.nombre}
              className="w-full h-auto max-h-96 object-contain"
            />
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen} size="4xl">
        <ModalContent className="bg-white p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Detalles del Producto</h2>
          {selectedItem && (
            <div className="space-y-6">
              {/* Imagen del producto */}
              <div className="flex justify-center">
                {selectedItem.producto.imgUrl ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${selectedItem.producto.imgUrl}`}
                    alt={selectedItem.producto.nombre}
                    className="w-full max-w-md h-auto max-h-64 object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* Información detallada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Información del Producto</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Descripción:</span> {selectedItem.producto.descripcion || 'No disponible'}</p>
                    <p><span className="font-medium">Precio de Compra:</span> ${parseFloat(selectedItem.producto.precioCompra).toFixed(2)}</p>
                    <p><span className="font-medium">Capacidad de Presentación:</span> {selectedItem.producto.capacidadPresentacion || 'No especificada'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Información del Lote</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Fecha de Ingreso:</span> {new Date(selectedItem.fechaIngreso).toLocaleDateString()}</p>
                    <p><span className="font-medium">Fecha de Vencimiento:</span> {selectedItem.fechaVencimiento ? new Date(selectedItem.fechaVencimiento).toLocaleDateString() : 'No especificada'}</p>
                    <p><span className="font-medium">Nombre de Bodega:</span> {selectedItem.bodega.nombre}</p>
                    <p><span className="font-medium">Número de Bodega:</span> {selectedItem.bodega.numero || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              {/* Información de stock */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Información de Stock</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedItem.stock || '0.00'} </p>
                    <p className="text-sm text-gray-600">Stock</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedItem.stockTotal?.toFixed(2) || '0.00'} {selectedItem.unidadAbreviatura || ''}</p>
                    <p className="text-sm text-gray-600">Cantidad Disponible Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedItem.cantidadDisponibleParaReservar?.toFixed(2) || '0.00'} {selectedItem.unidadAbreviatura || ''}</p>
                    <p className="text-sm text-gray-600">Disponible para Reservar</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{selectedItem.cantidadReservada?.toFixed(2) || '0.00'} {selectedItem.unidadAbreviatura || ''}</p>
                    <p className="text-sm text-gray-600">Reservado</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default InventoryPage;