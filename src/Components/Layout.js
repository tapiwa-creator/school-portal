import React from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header */}
      <Header />

      {/* Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;