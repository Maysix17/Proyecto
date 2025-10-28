import React from "react";
import { Outlet } from "react-router-dom";
import Menu from "../organisms/Menu";
import { useMenu } from "../../contexts/MenuContext"; 

const MainLayout: React.FC = () => {
  const { isMobileMenuOpen } = useMenu();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/*Menú lateral */}
      <Menu />

      {/*Contenedor principal */}
      <main
        className={`flex-1 p-6 h-full overflow-y-auto transition-all duration-300 ease-in-out 
          ${isMobileMenuOpen ? "blur-sm pointer-events-none" : ""}
          md:ml-56 md:blur-0 md:pointer-events-auto`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

