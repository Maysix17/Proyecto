import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, Button } from '@heroui/react';
import CustomButton from '../atoms/Boton';
import ImageUpload from '../atoms/ImagenUpload';
import Swal from 'sweetalert2';
import { inventoryService } from '../../services/inventoryService';
import type { Categoria, Bodega, InventoryItem } from '../../services/inventoryService';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInventoryCreated: () => void;
  editItem?: InventoryItem | null;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onInventoryCreated, editItem }) => {
  const isEdit = !!editItem;
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    stock: '',
    precio: '',
    capacidadUnidad: '',
    fechaVencimiento: '',
    fkCategoriaId: '',
    fkBodegaId: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchCategorias();
      fetchBodegas();
      if (editItem) {
        setFormData({
          nombre: editItem.nombre,
          descripcion: editItem.descripcion || '',
          stock: editItem.stock.toString(),
          precio: editItem.precio.toString(),
          capacidadUnidad: editItem.capacidadUnidad?.toString() || '',
          fechaVencimiento: editItem.fechaVencimiento || '',
          fkCategoriaId: editItem.fkCategoriaId,
          fkBodegaId: editItem.fkBodegaId,
        });
      } else {
        setFormData({
          nombre: '',
          descripcion: '',
          stock: '',
          precio: '',
          capacidadUnidad: '',
          fechaVencimiento: '',
          fkCategoriaId: '',
          fkBodegaId: '',
        });
        setSelectedFile(null);
      }
    }
  }, [isOpen, editItem]);

  const fetchCategorias = async () => {
    try {
      const data = await inventoryService.getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const fetchBodegas = async () => {
    try {
      const data = await inventoryService.getBodegas();
      setBodegas(data);
    } catch (error) {
      console.error('Error fetching bodegas:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const data = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        stock: parseInt(formData.stock),
        precio: parseFloat(formData.precio),
        capacidadUnidad: formData.capacidadUnidad ? parseFloat(formData.capacidadUnidad) : undefined,
        fechaVencimiento: formData.fechaVencimiento || undefined,
        fkCategoriaId: formData.fkCategoriaId,
        fkBodegaId: formData.fkBodegaId,
        imgUrl: selectedFile || undefined,
      };

      if (isEdit && editItem) {
        await inventoryService.update(editItem.id, data);
        Swal.fire({
          icon: 'success',
          title: 'Inventario actualizado',
          text: 'El inventario ha sido actualizado exitosamente.',
          confirmButtonText: 'Aceptar',
        });
      } else {
        await inventoryService.create(data);
        Swal.fire({
          icon: 'success',
          title: 'Inventario creado',
          text: 'El inventario ha sido registrado exitosamente.',
          confirmButtonText: 'Aceptar',
        });
      }
      onInventoryCreated();
      onClose();
      setFormData({
        nombre: '',
        descripcion: '',
        stock: '',
        precio: '',
        capacidadUnidad: '',
        fechaVencimiento: '',
        fkCategoriaId: '',
        fkBodegaId: '',
      });
      setSelectedFile(null);
    } catch (error: any) {
      if (error.response?.data?.message) {
        const messages = Array.isArray(error.response.data.message)
          ? error.response.data.message
          : [error.response.data.message];
        const newErrors: Record<string, string> = {};
        messages.forEach((msg: string) => {
          if (msg.toLowerCase().includes('nombre')) newErrors.nombre = msg;
          else if (msg.toLowerCase().includes('stock')) newErrors.stock = msg;
          else if (msg.toLowerCase().includes('precio')) newErrors.precio = msg;
          else if (msg.toLowerCase().includes('categoria')) newErrors.fkCategoriaId = msg;
          else if (msg.toLowerCase().includes('bodega')) newErrors.fkBodegaId = msg;
          else newErrors.general = msg;
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: 'Error al crear el inventario.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
      <ModalContent className="bg-white p-6">
        <h2 className="text-2xl font-bold mb-4">{isEdit ? 'Editar Inventario' : 'Registrar Nuevo Inventario'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad Unidad (opcional)</label>
              <input
                type="number"
                step="0.01"
                name="capacidadUnidad"
                value={formData.capacidadUnidad}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento (opcional)</label>
            <input
              type="date"
              name="fechaVencimiento"
              value={formData.fechaVencimiento}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                name="fkCategoriaId"
                value={formData.fkCategoriaId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                ))}
              </select>
              {errors.fkCategoriaId && <p className="text-red-500 text-sm mt-1">{errors.fkCategoriaId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bodega</label>
              <select
                name="fkBodegaId"
                value={formData.fkBodegaId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar bodega</option>
                {bodegas.map(bodega => (
                  <option key={bodega.id} value={bodega.id}>{bodega.nombre}</option>
                ))}
              </select>
              {errors.fkBodegaId && <p className="text-red-500 text-sm mt-1">{errors.fkBodegaId}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (opcional)</label>
            <ImageUpload onFileSelect={handleFileSelect} />
          </div>
          {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} variant="light">Cancelar</Button>
            <CustomButton
              text={isLoading ? (isEdit ? 'Actualizando...' : 'Creando...') : (isEdit ? 'Actualizar Inventario' : 'Crear Inventario')}
              type="submit"
              disabled={isLoading}
            />
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default InventoryModal;