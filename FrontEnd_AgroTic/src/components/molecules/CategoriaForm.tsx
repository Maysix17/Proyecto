import React, { useState, useEffect } from 'react';
import CustomButton from '../atoms/Boton';
import type { CategoriaData } from '../../types/categoria.types';
import { registerCategoria, updateCategoria, getCategorias } from '../../services/categoriaService';

interface CategoriaFormProps {
  editId?: string | null;
  onSuccess?: () => void;
}

const CategoriaForm: React.FC<CategoriaFormProps> = ({ editId, onSuccess }) => {
  const [categoriaData, setCategoriaData] = useState<CategoriaData>({
    nombre: '',
    descripcion: '',
    esDivisible: false,
  });
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (editId) {
      // Fetch the existing data for editing
      const fetchCategoria = async () => {
        try {
          const categorias = await getCategorias();
          const categoria = categorias.find((c: any) => c.id === editId);
          if (categoria) {
            setCategoriaData({
              nombre: categoria.nombre,
              descripcion: categoria.descripcion || '',
              esDivisible: categoria.esDivisible || false
            });
          }
        } catch (error) {
          setMessage('Error al cargar datos para editar');
        }
      };
      fetchCategoria();
    } else {
      setCategoriaData({ nombre: '', descripcion: '', esDivisible: false });
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateCategoria(editId, categoriaData);
        setMessage('Actualizado con éxito');
      } else {
        await registerCategoria(categoriaData);
        setMessage('Registro exitoso');
      }
      setCategoriaData({ nombre: '', descripcion: '', esDivisible: false });
      onSuccess?.();
    } catch (error: any) {
      setMessage(error.message || 'Error en la operación');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={categoriaData.nombre}
          onChange={(e) =>
            setCategoriaData({ ...categoriaData, nombre: e.target.value })
          }
          placeholder="Ingrese el nombre de la categoría"
          className="w-full border border-gray-300 rounded-lg p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={categoriaData.descripcion}
          onChange={(e) =>
            setCategoriaData({ ...categoriaData, descripcion: e.target.value })
          }
          placeholder="Ingrese una descripción opcional de la categoría"
          className="w-full border border-gray-300 rounded-lg p-2"
          rows={3}
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={categoriaData.esDivisible}
            onChange={(e) =>
              setCategoriaData({ ...categoriaData, esDivisible: e.target.checked })
            }
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">¿Es consumible?</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Marque esta opción si los productos de esta categoría son consumibles (ej: semillas, abono, fertilizantes, fungicidas).
          Deje sin marcar si no son consumibles (ej: herramientas, bolsas, martillo).
        </p>
      </div>

      {message && <p className="text-center text-green-600">{message}</p>}

      <CustomButton
        type="submit"
        text={editId ? 'Actualizar Categoría' : 'Registrar Categoría'}
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 w-full"
      />
    </form>
  );
};

export default CategoriaForm;