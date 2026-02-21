// web/src/app/[locale]/(marketing)/layout.tsx
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React from "react";

interface LayoutProps {
    children: React.ReactNode;
}

export default function MarketingLayout({ children }: LayoutProps) {
    return (
        <div>
            <Header />
            {children}
            <CartDrawer />
            <Footer />
        </div>
    );
}