import React, { useState } from "react";
import InputSearch from "../components/atoms/buscador";
import CustomButton from "../components/atoms/Boton";
import DateRangeInput from "../components/atoms/DateRangeInput";
import Table from "../components/atoms/Table";
import MobileCard from "../components/atoms/MobileCard";
import type { CardField, CardAction } from "../types/MobileCard.types";
import { searchCultivos } from "../services/cultivosService";
import type { Cultivo, SearchCultivoDto } from "../types/cultivos.types";
import TipoCultivoModal from "../components/organisms/TipoCultivoModal";
import VariedadModal from "../components/organisms/VariedadModal";
import CultivoModal from "../components/organisms/CultivoModal";
import CosechaModal from "../components/organisms/CosechaModal";
import VentaModal from "../components/organisms/VentaModal";
import FichaModal from "../components/organisms/FichaModal";

const CultivosPage: React.FC = () => {
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchCultivoDto>({});
  const [isTipoCultivoModalOpen, setIsTipoCultivoModalOpen] = useState(false);
  const [isVariedadModalOpen, setIsVariedadModalOpen] = useState(false);
  const [isCultivoModalOpen, setIsCultivoModalOpen] = useState(false);
  const [isCosechaModalOpen, setIsCosechaModalOpen] = useState(false);
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false);
  const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
  const [selectedFichas, setSelectedFichas] = useState<string[]>([]);
  const [selectedCultivo, setSelectedCultivo] = useState<Cultivo | null>(null);

  const handleSearch = async () => {
    await handleSearchWithFilters(filters);
  };

  const handleFilterChange = (key: keyof SearchCultivoDto, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    handleSearchWithFilters(newFilters);
  };

  const handleSearchWithFilters = async (searchFilters: SearchCultivoDto) => {
    setLoading(true);
    try {
      const data = await searchCultivos(searchFilters);
      setCultivos(data);
    } catch (error) {
      console.error("Error searching cultivos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [startDate, endDate] = dates;
    setFilters((prev) => ({
      ...prev,
      fecha_inicio: startDate ? startDate.toISOString().split("T")[0] : undefined,
      fecha_fin: endDate ? endDate.toISOString().split("T")[0] : undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setCultivos([]);
  };

  const handleOpenCosechaModal = (cultivo: Cultivo) => {
    setSelectedCultivo(cultivo);
    setIsCosechaModalOpen(true);
  };

  const handleOpenVentaModal = (cultivo: Cultivo) => {
    setSelectedCultivo(cultivo);
    setIsVentaModalOpen(true);
  };

  const handleOpenFichaModal = (fichaString: string) => {
    const fichas = fichaString.split(",").map((f) => f.trim()).filter((f) => f);
    setSelectedFichas(fichas);
    setIsFichaModalOpen(true);
  };

  const exportToExcel = (cultivo?: Cultivo): void => {
    const dataToExport = cultivo ? [cultivo] : cultivos;
    if (dataToExport.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const headers = ["Ficha", "Lote", "Nombre del Cultivo", "Fecha de Siembra", "Fecha de Cosecha"];
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Cultivos Export</title></head>
      <body>
        <table border="1">
          <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
          <tbody>
            ${dataToExport
              .map(
                (cultivo) => `
              <tr>
                <td>${cultivo.ficha}</td>
                <td>${cultivo.lote}</td>
                <td>${cultivo.nombrecultivo}</td>
                <td>${cultivo.fechasiembra ? new Date(cultivo.fechasiembra).toLocaleDateString() : "Sin fecha"}</td>
                <td>${cultivo.fechacosecha ? new Date(cultivo.fechacosecha).toLocaleDateString() : "Sin cosecha"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const fileName = cultivo
      ? `cultivo_${cultivo.ficha}_${new Date().toISOString().split("T")[0]}.xls`
      : `cultivos_${new Date().toISOString().split("T")[0]}.xls`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full bg-gray-50 overflow-y-auto" style={{ height: '100%' }}>
      <div className="flex flex-col flex-grow gap-6 p-6">

        {/* Header adaptable */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-left whitespace-nowrap">
            Gestión de Cultivos
          </h1>

          {/* 🔹 Botones: apilados en móvil, alineados en web */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-start">
            <CustomButton
              label="Exportar Todos"
              onClick={() => exportToExcel()}
              size="md"
            />
            <CustomButton
              label="Gestion Tipo de Cultivo"
              onClick={() => setIsTipoCultivoModalOpen(true)}
              size="md"
            />
            <CustomButton
              label="Gestion de Variedad"
              onClick={() => setIsVariedadModalOpen(true)}
              size="md"
            />
            <CustomButton
              label="Registro del Cultivo"
              onClick={() => setIsCultivoModalOpen(true)}
              size="md"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center sm:text-left">
            Filtros de Búsqueda
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Buscar por Zona</label>
              <InputSearch
                placeholder="Nombre de zona..."
                value={filters.buscar || ""}
                onChange={(e) => handleFilterChange("buscar", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Buscar por Cultivo</label>
              <InputSearch
                placeholder="Nombre de variedad o tipo..."
                value={filters.buscar_cultivo || ""}
                onChange={(e) => handleFilterChange("buscar_cultivo", e.target.value)}
              />
            </div>

            <div>
              <DateRangeInput label="Rango de Fechas" onChange={handleDateRangeChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Buscar por Ficha</label>
              <InputSearch
                placeholder="Número de ficha..."
                value={filters.id_titulado || ""}
                onChange={(e) => handleFilterChange("id_titulado", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-4">Estado del Cultivo</label>
              <select
                className="w-full border border-gray-300 rounded-xl h-10"
                value={filters.estado_cultivo ?? ""}
                onChange={(e) =>
                  handleFilterChange(
                    "estado_cultivo",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
              >
                <option value="">Todos</option>
                <option value="1">En Curso</option>
                <option value="0">Finalizado</option>
              </select>
            </div>

            <div className="flex gap-2 items-center mt-6">
              <CustomButton label="Buscar" onClick={handleSearch} size="sm" />
              <CustomButton
                label="Limpiar"
                onClick={clearFilters}
                size="sm"
                color="danger"
                variant="solid"
              />
            </div>
          </div>
        </div>

        {/* Tabla escritorio */}
        <div className="hidden md:block bg-white rounded-lg shadow-md flex-grow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Resultados ({cultivos.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">Cargando...</div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-350px)]">
              <Table
                headers={[
                  "Ficha",
                  "Lote",
                  "Nombre del Cultivo",
                  "Fecha de Siembra",
                  "Fecha de Cosecha",
                  "Actividades",
                  "Finanzas",
                  "Cosecha/Venta",
                  "Exportar",
                ]}
              >
                {cultivos.map((cultivo, index) => (
                  <tr key={`${cultivo.cvzid}-${index}`} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <CustomButton
                        label="Ver Fichas"
                        onClick={() => handleOpenFichaModal(cultivo.ficha)}
                        size="sm"
                        variant="bordered"
                      />
                    </td>
                    <td className="px-4 py-2">{cultivo.lote}</td>
                    <td className="px-4 py-2">{cultivo.nombrecultivo}</td>
                    <td className="px-4 py-2">
                      {cultivo.fechasiembra
                        ? new Date(cultivo.fechasiembra).toLocaleDateString()
                        : "Sin fecha"}
                    </td>
                    <td className="px-4 py-2">
                      {cultivo.fechacosecha
                        ? new Date(cultivo.fechacosecha).toLocaleDateString()
                        : "Sin cosecha"}
                    </td>
                    <td className="px-4 py-2">
                      <CustomButton label="Actividades" onClick={() => {}} size="sm" variant="bordered" />
                    </td>
                    <td className="px-4 py-2">
                      <CustomButton label="Financiero" onClick={() => {}} size="sm" variant="bordered" />
                    </td>
                    <td className="px-4 py-2">
                      {cultivo.estado === 0 ? (
                        <CustomButton
                          label="Registrar Venta"
                          onClick={() => handleOpenVentaModal(cultivo)}
                          size="sm"
                        />
                      ) : (
                        <CustomButton
                          label="Registrar Cosecha"
                          onClick={() => handleOpenCosechaModal(cultivo)}
                          size="sm"
                        />
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <CustomButton
                        label="Exportar"
                        onClick={() => exportToExcel(cultivo)}
                        size="sm"
                        variant="bordered"
                      />
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          {cultivos.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              No se encontraron cultivos con los filtros aplicados.
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden bg-white rounded-lg shadow-md flex-grow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Resultados ({cultivos.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">Cargando...</div>
          ) : cultivos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron cultivos con los filtros aplicados.
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cultivos.map((cultivo, index) => {
                const fields: CardField[] = [
                  { label: "Lote", value: cultivo.lote },
                  { label: "Nombre del Cultivo", value: cultivo.nombrecultivo },
                  { label: "Fecha de Siembra", value: cultivo.fechasiembra ? new Date(cultivo.fechasiembra).toLocaleDateString() : "Sin fecha" },
                  { label: "Fecha de Cosecha", value: cultivo.fechacosecha ? new Date(cultivo.fechacosecha).toLocaleDateString() : "Sin cosecha" },
                ];

                const actions: CardAction[] = [
                  {
                    label: "Ver Fichas",
                    onClick: () => handleOpenFichaModal(cultivo.ficha),
                    size: "sm",
                    variant: "bordered",
                  },
                  {
                    label: "Actividades",
                    onClick: () => {},
                    size: "sm",
                    variant: "bordered",
                  },
                  {
                    label: "Financiero",
                    onClick: () => {},
                    size: "sm",
                    variant: "bordered",
                  },
                  {
                    label: cultivo.estado === 0 ? "Registrar Venta" : "Registrar Cosecha",
                    onClick: () =>
                      cultivo.estado === 0
                        ? handleOpenVentaModal(cultivo)
                        : handleOpenCosechaModal(cultivo),
                    size: "sm",
                  },
                  {
                    label: "Exportar",
                    onClick: () => exportToExcel(cultivo),
                    size: "sm",
                    variant: "bordered",
                  },
                ];

                return (
                  <MobileCard
                    key={`${cultivo.cvzid}-${index}`}
                    fields={fields}
                    actions={actions}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <TipoCultivoModal
        isOpen={isTipoCultivoModalOpen}
        onClose={() => setIsTipoCultivoModalOpen(false)}
      />
      <VariedadModal
        isOpen={isVariedadModalOpen}
        onClose={() => setIsVariedadModalOpen(false)}
      />
      <CosechaModal
        isOpen={isCosechaModalOpen}
        onClose={() => setIsCosechaModalOpen(false)}
        cvzId={selectedCultivo?.cvzid || ""}
        onSuccess={handleSearch}
      />
      <VentaModal
        isOpen={isVentaModalOpen}
        onClose={() => setIsVentaModalOpen(false)}
        cultivo={selectedCultivo}
        onSuccess={handleSearch}
      />
      <FichaModal
        isOpen={isFichaModalOpen}
        onClose={() => setIsFichaModalOpen(false)}
        fichas={selectedFichas}
      />

      <CultivoModal
        isOpen={isCultivoModalOpen}
        onClose={() => setIsCultivoModalOpen(false)}
        onSuccess={() => handleSearch()}
      />
    </div>
  );
};

export default CultivosPage;
