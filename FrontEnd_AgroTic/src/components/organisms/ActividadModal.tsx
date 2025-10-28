import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Input, Select, SelectItem, Button, Chip, Textarea } from '@heroui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import userSearchService from '../../services/userSearchService';
import zoneSearchService from '../../services/zoneSearchService';
import categoriaService from '../../services/categoriaService';
import apiClient from '../../lib/axios/axios';
import InputSearch from '../atoms/buscador';

interface Usuario {
  id: string;
  dni: number;
  nombres: string;
  apellidos: string;
}
/*no hay grandes cambios*/ 
interface Product {
  id: string;
  nombre: string;
  categoria?: { nombre: string };
  cantidadDisponible: number;
  cantidadReservada: number;
  cantidadParcial: number;
  stock_devuelto?: number;
  stock_parcial?: number;
  unidadMedida?: { abreviatura: string };
  reservas?: Array<{
    cantidadReservada: number;
    cantidadDevuelta: number;
    estado: { nombre: string };
  }>;
}

import type { CategoriaData } from '../../types/categoria.types';

// interface Categoria {
//   id: string;
//   nombre: string;
// }

interface Zona {
  id: string;
  nombre: string;
  zonaId?: string;
  cultivoId?: string;
  variedadNombre?: string;
}

interface ActividadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSave: (data: any) => void;
}

const ActividadModal: React.FC<ActividadModalProps> = ({ isOpen, onClose, selectedDate, onSave }) => {
  const [categorias, setCategorias] = useState<CategoriaData[]>([]);

  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [loteSearch, setLoteSearch] = useState('');

  const [debouncedUsuarioSearch, setDebouncedUsuarioSearch] = useState('');
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('');
  const [debouncedLoteSearch, setDebouncedLoteSearch] = useState('');

  const [selectedUsuarios, setSelectedUsuarios] = useState<Usuario[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: { product: Product; qty: number; custom: boolean; isSurplus?: boolean } }>({});
  const [selectedLote, setSelectedLote] = useState<Zona | null>(null);

  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredZonas, setFilteredZonas] = useState<Zona[]>([]);

  /*cambios importantes */
  // Reset form when modal opens
  const resetForm = () => {
    setUsuarioSearch('');
    setProductSearch('');
    setLoteSearch('');
    setDebouncedUsuarioSearch('');
    setDebouncedProductSearch('');
    setDebouncedLoteSearch('');
    setSelectedUsuarios([]);
    setSelectedProducts({});
    setSelectedLote(null);
    setCategoria('');
    setDescripcion('');
    setFilteredUsuarios([]);
    setFilteredProducts([]);
    setFilteredZonas([]);
  };

  // Fetch categorias and reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategorias();
      resetForm();
    }
  }, [isOpen]);

  // Debounce usuario search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsuarioSearch(usuarioSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [usuarioSearch]);

  // Debounce product search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProductSearch(productSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  // Debounce lote search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLoteSearch(loteSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [loteSearch]);


  const fetchCategorias = async () => {
    try {
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  // Filter usuarios with search
  useEffect(() => {
    const fetchFilteredUsuarios = async () => {
      if (debouncedUsuarioSearch.trim()) {
        try {
          const data = await userSearchService.search(debouncedUsuarioSearch);
          setFilteredUsuarios(data.items);
        } catch (error) {
          console.error('Error searching usuarios:', error);
          setFilteredUsuarios([]);
        }
      } else {
        setFilteredUsuarios([]);
      }
    };
    fetchFilteredUsuarios();
  }, [debouncedUsuarioSearch]);

  // Filter products with search
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      if (debouncedProductSearch.trim()) {
        try {
          // Use the search endpoint which now considers availability
          const response = await apiClient.get(`/inventario/search/${encodeURIComponent(debouncedProductSearch)}`);
          const result = response.data;
          // Calculate available quantity for each product (considering active reservations)
          const productsWithAvailability = (result.items || []).map((product: Product) => {
            let cantidadReservadaActiva = 0;
            if (product.reservas) {
              for (const reserva of product.reservas) {
                if (reserva.estado && reserva.estado.nombre !== 'Confirmada') {
                  cantidadReservadaActiva += (reserva.cantidadReservada || 0) - (reserva.cantidadDevuelta || 0);
                }
              }
            }
            const cantidadDisponibleNum = Number(product.cantidadDisponible) || 0;
            const cantidadParcialNum = Number(product.cantidadParcial) || 0;
            const cantidadDisponibleReal = cantidadDisponibleNum + cantidadParcialNum - cantidadReservadaActiva;
            return {
              ...product,
              cantidadDisponibleReal: Math.max(0, cantidadDisponibleReal)
            };
          });
          setFilteredProducts(productsWithAvailability);
        } catch (error) {
          console.error('Error searching products:', error);
          setFilteredProducts([]);
        }
      } else {
        setFilteredProducts([]);
      }
    };
    fetchFilteredProducts();
  }, [debouncedProductSearch]);

  // Filter zonas with search
  useEffect(() => {
    const fetchFilteredZonas = async () => {
      if (debouncedLoteSearch.trim()) {
        try {
          const data = await zoneSearchService.search(debouncedLoteSearch);
          setFilteredZonas(data.items);
        } catch (error) {
          console.error('Error searching zonas:', error);
          setFilteredZonas([]);
        }
      } else {
        setFilteredZonas([]);
      }
    };
    fetchFilteredZonas();
  }, [debouncedLoteSearch]);

  const handleSelectUsuario = (usuario: Usuario) => {
    if (!selectedUsuarios.some(u => u.id === usuario.id)) {
      setSelectedUsuarios([...selectedUsuarios, usuario]);
      setUsuarioSearch('');
    }
  };

  const handleRemoveUsuario = (id: string) => {
    setSelectedUsuarios(selectedUsuarios.filter(u => u.id !== id));
  };

  const handleSelectProduct = (product: Product) => {
    if (selectedProducts[product.id]) {
      const newSelected = { ...selectedProducts };
      delete newSelected[product.id];
      setSelectedProducts(newSelected);
    } else {
      setSelectedProducts({
        ...selectedProducts,
        [product.id]: {
          product,
          qty: 0,
          custom: false,
          isSurplus: false
        }
      });
      setProductSearch('');
    }
  };

  const handleQtyChange = (id: string, qty: number) => {
    setSelectedProducts({
      ...selectedProducts,
      [id]: {
        ...selectedProducts[id],
        qty,
        custom: true
      }
    });
  };

  const handleSelectLote = (zona: Zona) => {
    setSelectedLote(zona);
    setLoteSearch('');
  };

  const handleRemoveLote = () => {
    setSelectedLote(null);
  };

  const handleUseSurplus = (id: string) => {
    const product = selectedProducts[id].product;
    const surplus = product.stock_parcial || 0;
    // Show confirmation dialog
    const confirmed = window.confirm(
      `¿Desea usar el parcial de ${surplus} unidades de ${product.nombre}? ` +
      `(Stock disponible: ${product.cantidadDisponible})`
    );
    if (confirmed) {
      setSelectedProducts({
        ...selectedProducts,
        [id]: {
          ...selectedProducts[id],
          qty: surplus,
          custom: false,
          isSurplus: true
        }
      });
    }
  };

  const handleSave = async () => {
    // Validate stock availability
    const validationPromises = Object.values(selectedProducts).map(async (prod) => {
      if (prod.isSurplus) {
        const surplusStock = prod.product.stock_parcial || 0;
        if (prod.qty > surplusStock) {
          return { valid: false, product: prod.product.nombre, requested: prod.qty, available: surplusStock, type: 'parcial' };
        }
      } else {
        // Calculate real available stock considering active reservations
        let cantidadReservadaActiva = 0;
        if (prod.product.reservas) {
          for (const reserva of prod.product.reservas) {
            if (reserva.estado && reserva.estado.nombre !== 'Confirmada') {
              cantidadReservadaActiva += (reserva.cantidadReservada || 0) - (reserva.cantidadDevuelta || 0);
            }
          }
        }
        const cantidadDisponibleNum = Number(prod.product.cantidadDisponible) || 0;
        const cantidadParcialNum = Number(prod.product.cantidadParcial) || 0;
        const availableStock = cantidadDisponibleNum + cantidadParcialNum - cantidadReservadaActiva;
        if (prod.qty > availableStock) {
          return { valid: false, product: prod.product.nombre, requested: prod.qty, available: availableStock, type: 'disponible' };
        }
      }
      return { valid: true };
    });

    const validationResults = await Promise.all(validationPromises);
    const invalidResults = validationResults.filter(result => !result.valid);

    if (invalidResults.length > 0) {
      const messages = invalidResults.map(result => {
        const stockType = result.type === 'parcial' ? 'parcial' : 'disponible';
        return `${result.product}: solicitado ${result.requested}, ${stockType} ${result.available}`;
      });
      alert(`No hay suficiente stock para:\n${messages.join('\n')}`);
      return;
    }

    const data = {
      fecha: selectedDate,
      usuarios: selectedUsuarios.map(u => u.id),
      materiales: Object.values(selectedProducts).map(prod => ({ id: prod.product.id, nombre: prod.product.nombre, qty: prod.qty, isSurplus: prod.isSurplus })),
      categoria,
      descripcion,
      lote: selectedLote?.id
    };
    onSave(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl">
      <ModalContent className="bg-white p-6">
        <ModalHeader>
          <h2 className="text-2xl font-semibold">Registrar nueva actividad</h2>
          <Button isIconOnly variant="light" onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </Button>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Panel: Usuarios */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium mb-2">Usuario Asignados</label>
                <InputSearch
                  placeholder="Buscar Documento..."
                  value={usuarioSearch}
                  onChange={(e) => setUsuarioSearch(e.target.value)}
                />
                <div className={`mt-2 overflow-auto border rounded p-2 bg-white transition-all duration-300 ease-in-out ${debouncedUsuarioSearch.trim() ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {debouncedUsuarioSearch.trim() && (
                    <>
                      {filteredUsuarios.length === 0 ? (
                        <div className="text-gray-500 text-sm p-2">No se encontraron usuarios</div>
                      ) : (
                        filteredUsuarios.slice(0, 10).map((usuario) => (
                          <button
                            key={usuario.id}
                            className="w-full text-left p-2 hover:bg-gray-100 rounded"
                            onClick={() => handleSelectUsuario(usuario)}
                          >
                            <div className="font-medium">{usuario.nombres} {usuario.apellidos}</div>
                            <div className="text-sm text-gray-600">DNI: {usuario.dni}</div>
                          </button>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Seleccionados</label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsuarios.map((usuario) => (
                    <Chip key={usuario.id} onClose={() => handleRemoveUsuario(usuario.id)} variant="flat">
                      {usuario.dni}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel: Productos */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium mb-2">Reservar productos</label>
                <InputSearch
                  placeholder="Buscar productos..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <div className={`mt-2 overflow-auto border rounded p-2 bg-white transition-all duration-300 ease-in-out ${debouncedProductSearch.trim() ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {debouncedProductSearch.trim() && (
                    <>
                      {filteredProducts.length === 0 ? (
                        <div className="text-gray-500 text-sm p-2">No se encontraron productos</div>
                      ) : (
                        filteredProducts.slice(0, 10).map((product) => (
                          <button
                            key={product.id}
                            className="w-full text-left p-2 hover:bg-gray-100 rounded"
                            onClick={() => handleSelectProduct(product)}
                          >
                            <div className="font-medium">{product.nombre}</div>
                            <div className="text-sm text-gray-600">
                              Disponible: {(product as any).cantidadDisponibleReal || product.cantidadDisponible} {product.unidadMedida?.abreviatura}
                            </div>
                          </button>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Seleccionados</label>
                <div className="space-y-2">
                  {Object.values(selectedProducts).map((prod) => {
                    const hasSurplus = (prod.product.stock_parcial || 0) > 0;
                    // Calculate real available stock considering active reservations
                    let cantidadReservadaActiva = 0;
                    if (prod.product.reservas) {
                      for (const reserva of prod.product.reservas) {
                        if (reserva.estado && reserva.estado.nombre !== 'Confirmada') {
                          cantidadReservadaActiva += (reserva.cantidadReservada || 0) - (reserva.cantidadDevuelta || 0);
                        }
                      }
                    }
                    const cantidadDisponibleNum = Number(prod.product.cantidadDisponible) || 0;
                    const cantidadParcialNum = Number(prod.product.cantidadParcial) || 0;
                    const availableStock = cantidadDisponibleNum + cantidadParcialNum - cantidadReservadaActiva;
                    const isOverLimit = prod.qty > availableStock;
                    const showSurplusButton = hasSurplus && !prod.isSurplus;
                    return (
                      <div key={prod.product.id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{prod.product.nombre}</div>
                          <div className="text-sm text-gray-600">
                            Disponible: {Math.max(0, availableStock)} {prod.product.unidadMedida?.abreviatura}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Cantidad a reservar..."
                              value={prod.qty.toString()}
                              onChange={(e) => handleQtyChange(prod.product.id, Number(e.target.value))}
                              size="sm"
                              className={`w-32 ${isOverLimit ? 'border-red-500' : ''}`}
                              min="0"
                              max={availableStock}
                            />
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              isIconOnly
                              onClick={() => handleSelectProduct(prod.product)}
                              className="hover:bg-red-100"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </Button>
                          </div>
                          {prod.qty > 0 && (
                            <div className="text-xs text-green-600">
                              Reservado: {prod.qty} {prod.product.unidadMedida?.abreviatura}
                            </div>
                          )}
                          {isOverLimit && (
                            <span className="text-red-500 text-sm">Excede stock disponible</span>
                          )}
                          {showSurplusButton && (
                            <Button size="sm" variant="ghost" onClick={() => handleUseSurplus(prod.product.id)}>
                              Usar Parcial
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <Select
                label="Seleccione categoría"
                selectedKeys={categoria ? [categoria] : []}
                onSelectionChange={(keys) => setCategoria(Array.from(keys)[0] as string)}
              >
                {Array.isArray(categorias) ? categorias.map((cat) => (
                  <SelectItem key={cat.id}>
                    {cat.nombre}
                  </SelectItem>
                )) : []}
              </Select>
              <Textarea
                label="Descripción"
                placeholder="Escriba..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium mb-2">Seleccione un lote</label>
                <InputSearch
                  placeholder="Buscar lote a seleccionar..."
                  value={loteSearch}
                  onChange={(e) => setLoteSearch(e.target.value)}
                />
                <div className={`overflow-auto border rounded p-2 bg-white transition-all duration-300 ease-in-out ${debouncedLoteSearch.trim() ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {debouncedLoteSearch.trim() && (
                    <>
                      {filteredZonas.length === 0 ? (
                        <div className="text-gray-500 text-sm p-2">No se encontraron lotes</div>
                      ) : (
                        filteredZonas.map((zona) => (
                          <button
                            key={zona.id}
                            className="w-full text-left p-2 hover:bg-gray-100 rounded"
                            onClick={() => handleSelectLote(zona)}
                          >
                            {zona.nombre}
                          </button>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Seleccionado</label>
                <div className="flex flex-wrap gap-2">
                  {selectedLote && (
                    <Chip key={selectedLote.id} onClose={handleRemoveLote} variant="flat">
                      {selectedLote.nombre}
                    </Chip>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="light" onClick={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onClick={handleSave}>
                  Guardar actividad
                </Button>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ActividadModal;