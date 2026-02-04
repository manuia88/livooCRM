"use client";

import { useState } from "react";

const filters = [
    { id: "1bed", label: "1 habitación" },
    { id: "2bed", label: "2 habitaciones" },
    { id: "3bed", label: "3 habitaciones" },
    { id: "invest", label: "Inversión" },
    { id: "price", label: "Precio de oportunidad" }
];

export function FilterPills() {
    const [active, setActive] = useState("news");

    return (
        <div className="flex flex-wrap justify-center gap-3 mb-10">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => setActive(filter.id)}
                    className={`px-5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-300 ${active === filter.id
                        ? "bg-gradient-to-r from-[#B8975A] to-[#C4A872] text-white shadow-lg"
                        : "bg-white/90 backdrop-blur-sm text-[#2C3E2C] hover:bg-[#F8F7F4] border border-[#E5E3DB] shadow-md hover:shadow-lg"
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}
