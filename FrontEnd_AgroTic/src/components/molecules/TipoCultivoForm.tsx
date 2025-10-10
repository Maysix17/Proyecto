import React, { useState, useEffect } from 'react';
import CustomButton from '../atoms/Boton';
import type { TipoCultivoData } from '../../types/tipoCultivo.types';
import { registerTipoCultivo, updateTipoCultivo, getTipoCultivos } from '../../services/tipoCultivo';

interface TipoCultivoFormProps {
  editId?: string | null;
  onSuccess?: () => void;
}

const TipoCultivoForm: React.FC<TipoCultivoFormProps> = ({ editId, onSuccess }) => {
  const [tipoCultivoData, setTipoCultivoData] = useState<TipoCultivoData>({
    nombre: '',
  });
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (editId) {
      // Fetch the existing data for editing
      const fetchTipoCultivo = async () => {
        try {
          const tipos = await getTipoCultivos();
          const tipo = tipos.find(t => t.id === editId);
          if (tipo) {
            setTipoCultivoData({ nombre: tipo.nombre });
          }
        } catch (error) {
          setMessage('Error al cargar datos para editar');
        }
      };
      fetchTipoCultivo();
    } else {
      setTipoCultivoData({ nombre: '' });
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateTipoCultivo(editId, tipoCultivoData);
        setMessage('Actualizado con éxito');
      } else {
        await registerTipoCultivo(tipoCultivoData);
        setMessage('Registro exitoso');
      }
      setTipoCultivoData({ nombre: '' });
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
          value={tipoCultivoData.nombre}
          onChange={(e) =>
            setTipoCultivoData({ ...tipoCultivoData, nombre: e.target.value })
          }
          placeholder="Ingrese el nombre del tipo de cultivo"
          className="w-full border border-gray-300 rounded-lg p-2"
          required
        />
      </div>

      {message && <p className="text-center text-green-600">{message}</p>}

      <CustomButton
        type="submit"
        text={editId ? 'Actualizar Tipo de Cultivo' : 'Registrar Tipo de Cultivo'}
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 w-full"
      />
    </form>
  );
};

export default TipoCultivoForm;