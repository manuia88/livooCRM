import { Property } from "@/types/property";

export const MOCK_PROPERTIES: Property[] = [
    {
        id: "1",
        title: "Penthouse de Lujo en Polanco",
        description: "Espectacular penthouse con terraza privada y vistas panorámicas a Chapultepec. Acabados de mármol importado y cocina italiana.",
        price: 65000000,
        currency: "MXN",
        type: "penthouse",
        listingType: "buy",
        location: {
            address: "Campos Elíseos 120",
            city: "Ciudad de México",
            state: "CDMX",
            zip: "11560",
            colonia: "Polanco V Sección",
            lat: 19.4290,
            lng: -99.1980
        },
        features: {
            bedrooms: 4,
            bathrooms: 4.5,
            parking: 3,
            area: 450,
            hasPool: true,
            hasSecurity: true,
            hasGym: true
        },
        images: [
            "https://images.unsplash.com/photo-1600596542815-2250c3d47e89?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800"
        ],
        agent: {
            name: "Camila Sodi",
            avatar: "https://i.pravatar.cc/150?u=camila",
            whatsapp: "525512345678",
            verified: true
        },
        featured: true,
        createdAt: "2024-01-15"
    },
    {
        id: "2",
        title: "Departamento Art Deco en Condesa",
        description: "Hermoso departamento renovado en edificio clásico. Pisos de madera original, techos altos y muchísima luz natural.",
        price: 35000,
        currency: "MXN",
        type: "apartment",
        listingType: "rent",
        location: {
            address: "Amsterdam 180",
            city: "Ciudad de México",
            state: "CDMX",
            zip: "06100",
            colonia: "Hipódromo Condesa",
            lat: 19.4120,
            lng: -99.1700
        },
        features: {
            bedrooms: 2,
            bathrooms: 2,
            parking: 1,
            area: 110,
            petFriendly: true,
            hasSecurity: true
        },
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800"
        ],
        agent: {
            name: "Santiago Matías",
            avatar: "https://i.pravatar.cc/150?u=santiago",
            whatsapp: "525587654321",
            verified: true
        },
        createdAt: "2024-01-20"
    },
    {
        id: "3",
        title: "Loft Industrial en Roma Norte",
        description: "Espacio abierto con doble altura, ideal para creativos. Ubicado en el corazón de la Roma, cerca de los mejores restaurantes.",
        price: 42000,
        currency: "MXN",
        type: "loft",
        listingType: "rent",
        location: {
            address: "Colima 85",
            city: "Ciudad de México",
            state: "CDMX",
            zip: "06700",
            colonia: "Roma Norte",
            lat: 19.4200,
            lng: -99.1600
        },
        features: {
            bedrooms: 1,
            bathrooms: 1.5,
            parking: 1,
            area: 95,
            furnished: true,
            hasGym: true
        },
        images: [
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800"
        ],
        agent: {
            name: "Ana Paula",
            avatar: "https://i.pravatar.cc/150?u=ana",
            whatsapp: "525598765432",
            verified: false
        },
        createdAt: "2024-01-22"
    },
    {
        id: "4",
        title: "Casa Moderna en Jardines del Pedregal",
        description: "Residencia de autor con jardín inmenso, alberca y salón de juegos. Seguridad 24/7 en calle cerrada.",
        price: 120000,
        currency: "MXN",
        type: "house",
        listingType: "rent",
        location: {
            address: "Fuego 200",
            city: "Ciudad de México",
            state: "CDMX",
            zip: "01900",
            colonia: "Jardines del Pedregal",
            lat: 19.3250,
            lng: -99.2000
        },
        features: {
            bedrooms: 5,
            bathrooms: 6,
            parking: 6,
            area: 800,
            hasPool: true,
            hasSecurity: true,
            petFriendly: true
        },
        images: [
            "https://images.unsplash.com/photo-1613490493576-2f508154be44?auto=format&fit=crop&q=80&w=800"
        ],
        agent: {
            name: "Roberto Gil",
            avatar: "https://i.pravatar.cc/150?u=roberto",
            whatsapp: "525555555555",
            verified: true
        },
        featured: true,
        createdAt: "2024-01-10"
    },
    {
        id: "5",
        title: "Departamento Nuevo en Santa Fe",
        description: "Vistas increíbles al parque La Mexicana. Amenidades de lujo: Sky pool, gym, business center.",
        price: 8500000,
        currency: "MXN",
        type: "apartment",
        listingType: "buy",
        location: {
            address: "Av. Santa Fe 400",
            city: "Ciudad de México",
            state: "CDMX",
            zip: "05349",
            colonia: "Santa Fe",
            lat: 19.3620,
            lng: -99.2600
        },
        features: {
            bedrooms: 2,
            bathrooms: 2,
            parking: 2,
            area: 120,
            hasPool: true,
            hasGym: true,
            hasSecurity: true
        },
        images: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800"
        ],
        agent: {
            name: "Kplr Team",
            avatar: "https://i.pravatar.cc/150?u=kplr",
            whatsapp: "525511112222",
            verified: true
        },
        createdAt: "2024-01-25"
    }
];
