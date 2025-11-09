import React from "react";

type AuthLayoutProps = {
  children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps ) => {
  return(
    <div className="w-full h-screen overflow-hidden bg-linear-to-br from-[#FBBF24] via-[#ffebb4] via-30% to-[#E6F0FF] to-90%">
      <main className="w-full h-full">
        {children}
      </main>
    </div>
  )
}

export default AuthLayout;
