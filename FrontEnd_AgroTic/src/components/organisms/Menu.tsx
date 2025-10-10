import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuButton from "../molecules/MenuButton";
import UserModal from "./UserModal";
import {
  HomeIcon,
  DocumentTextIcon,
  CubeIcon,
  CpuChipIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import logo from "../../assets/AgroTic.png";
import logo2 from "../../assets/logoSena.png";
import { usePermission } from "../../contexts/PermissionContext";
import { useMenu } from "../../contexts/MenuContext"; 

const Menu: React.FC = () => {
  const { permissions, isAuthenticated } = usePermission();
  const navigate = useNavigate();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMenu(); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserCardModalOpen, setIsUserCardModalOpen] = useState(false);
  const [isCultivosSubmenuOpen, setIsCultivosSubmenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsCultivosSubmenuOpen(false);
      }
    };

    if (isCultivosSubmenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCultivosSubmenuOpen]);

  const mainModules = [
    { nombre: "Inicio" },
    { nombre: "IOT" },
    { nombre: "Cultivos" },
    { nombre: "Inventario" },
    { nombre: "Usuarios" },
  ];

  const getIcon = (label: string) => {
    switch (label) {
      case "Inicio":
        return HomeIcon;
      case "IOT":
        return CpuChipIcon;
      case "Cultivos":
        return CubeIcon;
      case "Inventario":
        return DocumentTextIcon;
      case "Usuarios":
        return UserIcon;
      default:
        return HomeIcon;
    }
  };

  const getRoute = (label: string) => {
    switch (label) {
      case "Inicio":
        return "/app";
      case "IOT":
        return "/app/iot";
      case "Cultivos":
        return "/app/cultivos";
      case "Inventario":
        return "/app/inventario";
      default:
        return "/app";
    }
  };

  const filteredModules = mainModules.filter(
    (module) =>
      permissions.some(
        (perm) => perm.modulo === module.nombre && perm.accion === "ver"
      ) || module.nombre === "Usuarios"
  );

  const priorityOrder = ["Inicio", "IOT", "Cultivos", "Inventario", "Usuarios"];
  const sortedFilteredModules = [...filteredModules].sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.nombre);
    const bIndex = priorityOrder.indexOf(b.nombre);
    return aIndex - bIndex;
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando permisos...
      </div>
    );
  }

  return (
    <>
      {/*Botón hamburguesa visible solo en móviles */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 bg-gray-100 p-2 rounded-lg shadow-md md:hidden"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-800" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-800" />
        )}
      </button>

      {/*Menú lateral (desktop + mobile con animación) */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 h-screen w-56 bg-gray-50 p-4 flex flex-col justify-between rounded-tr-3xl rounded-br-3xl shadow-xl transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} 
          z-40`}
      >
        <div>
          {/* Logo principal */}
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Logo tic" className="w-40 h-auto mb-6" />
          </div>

          {/* Botones del menú */}
          <div className="flex flex-col gap-2">
            {sortedFilteredModules.map((module) => {
              const IconComponent = getIcon(module.nombre);
              const label =
                module.nombre === "Usuarios" ? "Perfil" : module.nombre;

              const onClickHandler =
                module.nombre === "Usuarios"
                  ? () => {
                      setIsUserCardModalOpen(true);
                      setIsCultivosSubmenuOpen(false);
                      setIsMobileMenuOpen(false);
                    }
                  : module.nombre === "Cultivos"
                  ? () => setIsCultivosSubmenuOpen(!isCultivosSubmenuOpen)
                  : () => {
                      navigate(getRoute(module.nombre));
                      setIsCultivosSubmenuOpen(false);
                      setIsMobileMenuOpen(false); // Cierra el menú móvil al navegar
                    };

              if (module.nombre === "Cultivos") {
                return (
                  <React.Fragment key={module.nombre}>
                    <MenuButton
                      icon={IconComponent}
                      label={label}
                      onClick={onClickHandler}
                    />
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isCultivosSubmenuOpen
                          ? "max-h-32 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <button
                          className="ml-2 py-1 px-2 w-full rounded-lg bg-white text-gray-600 shadow-sm hover:bg-gray-50 transition-all duration-150 ease-in-out select-none focus:outline-none text-sm"
                          onClick={() => {
                            navigate(getRoute("Cultivos"));
                            setIsCultivosSubmenuOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Gestionar Cultivos
                        </button>
                        <button
                          className="ml-2 py-1 px-2 w-full rounded-lg bg-white text-gray-600 shadow-sm hover:bg-gray-50 transition-all duration-150 ease-in-out select-none focus:outline-none text-sm"
                          onClick={() => {
                            navigate("/app/actividades");
                            setIsCultivosSubmenuOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Gestionar Actividades
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                );
              }

              return (
                <MenuButton
                  key={module.nombre}
                  icon={IconComponent}
                  label={label}
                  onClick={onClickHandler}
                />
              );
            })}
          </div>
        </div>

        {/* Logo secundario */}
        <div className="flex flex-col items-center mt-6">
          <img src={logo2} alt="Logo secundario" className="w-28 h-auto" />
        </div>

        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        <UserModal
          isOpen={isUserCardModalOpen}
          onClose={() => setIsUserCardModalOpen(false)}
        />
      </div>
    </>
  );
};

export default Menu;
