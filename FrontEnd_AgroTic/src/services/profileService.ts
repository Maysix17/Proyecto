// src/services/profileService.ts
import apiClient from "../lib/axios/axios"; // Asegúrate que la ruta a tu cliente axios es correcta
import type { User } from '../types/user'; // Deberás crear este tipo basado en tu entidad de backend

// Define el tipo para los datos que se pueden actualizar
export interface UpdateProfilePayload {
  nombres?: string;
  apellidos?: string;
  telefono?: number;
  correo?: string;
}

/**
 * Obtiene los datos del perfil del usuario autenticado.
 */
export const getProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>("/usuarios/me");
    return response.data;
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    throw error;
  }
};

/**
 * Actualiza los datos del perfil del usuario autenticado.
 */
export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<User> => {
  try {
    // Aseguramos que el teléfono se envíe como número si existe
    const dataToSend = {
      ...payload,
      ...(payload.telefono && { telefono: Number(payload.telefono) }),
    };

    const response = await apiClient.patch<(User)>("/usuarios/me", dataToSend);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    throw error;
  }
};