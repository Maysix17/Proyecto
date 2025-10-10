import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { TipoCultivoData } from "../types/tipoCultivo.types";
import {
  registerTipoCultivo,
  getTipoCultivos,
  updateTipoCultivo,
  deleteTipoCultivo,
} from "../services/tipoCultivo";

const TipoCultivoPage = () => {
  const [tipoCultivoData, setTipoCultivoData] = useState<TipoCultivoData>({
    nombre: "",
  });
  const [cultivos, setCultivos] = useState<TipoCultivoData[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  // Cargar lista al iniciar
  useEffect(() => {
    fetchCultivos();
  }, []);

  const fetchCultivos = async () => {
    try {
      const data = await getTipoCultivos();
      setCultivos(data);
    } catch (err) {
      console.error("Error al cargar cultivos", err);
    }
  };

  // Crear o actualizar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateTipoCultivo(editId, tipoCultivoData);
        setMessage("Actualizado con éxito");
      } else {
        await registerTipoCultivo(tipoCultivoData);
        setMessage("Registro exitoso");
      }

      setTipoCultivoData({ nombre: "" });
      setEditId(null);
      fetchCultivos();
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error en la operación");
    }
  };

  const handleEdit = (id: string, nombre: string) => {
    setEditId(id);
    setTipoCultivoData({ nombre });
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este tipo de cultivo?")) {
      try {
        await deleteTipoCultivo(id);
        fetchCultivos();
      } catch (error: any) {
        alert(error.message || "Error al eliminar el tipo de cultivo");
      }
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-10 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editId ? "Editar Tipo de Cultivo" : "Registrar Tipo de Cultivo"}
          </h2>
          <button
            type="button"
            className="text-gray-500 hover:text-red-500 text-lg"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={tipoCultivoData.nombre}
              onChange={(e) =>
                setTipoCultivoData({ ...tipoCultivoData, nombre: e.target.value })
              }
              placeholder="Ingrese el nombre del tipo de cultivo"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {message && (
            <p className="text-center text-green-600 text-sm">{message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
          >
            {editId ? "Actualizar" : "Registrar"}
          </button>
        </form>

        {/* Tabla */}
        <table className="w-full border text-sm text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cultivos.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-2 border">{c.nombre}</td>
                <td className="p-2 border flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(c.id!, c.nombre)}
                    className="text-blue-600 hover:underline"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(c.id!)}
                    className="text-red-600 hover:underline"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {cultivos.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center p-2">
                  No hay registros aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TipoCultivoPage;
