export interface Zona {
  id: string;
  nombre: string;
  tipoLote: string;
  coorX: number;
  coorY: number;
  fkMapaId: string;
}

const API_URL = "http://localhost:3000";

export const getAllZonas = async (): Promise<Zona[]> => {
  const response = await fetch(`${API_URL}/zonas`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Error al obtener zonas");
  }

  return response.json();
};