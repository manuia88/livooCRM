#!/bin/bash

# Script para aplicar la reparación completa del Backoffice
# Este script ejecuta el SQL de reparación en Supabase

echo "🔧 Aplicando reparaciones al Backoffice..."
echo ""

# Verificar que tenemos el CLI de Supabase
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no está instalado"
    echo "Instálalo con: npm install -g supabase"
    exit 1
fi

# Verificar que estamos conectados
echo "📡 Verificando conexión a Supabase..."
if ! supabase status &> /dev/null; then
    echo "⚠️  No hay proyecto Supabase vinculado"
    echo ""
    echo "Por favor, ejecuta el SQL manualmente:"
    echo "1. Ve a tu proyecto Supabase"
    echo "2. Abre 'SQL Editor'"
    echo "3. Copia y pega el contenido de: supabase/fix_backoffice_complete.sql"
    echo "4. Ejecuta el query"
    exit 1
fi

# Ejecutar el script de reparación
echo "🚀 Ejecutando script de reparación..."
echo ""

supabase db execute -f supabase/fix_backoffice_complete.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Reparación completada exitosamente!"
    echo ""
    echo "Ahora puedes:"
    echo "1. Refrescar tu navegador en http://localhost:3000/backoffice"
    echo "2. Ver los datos en Dashboard, Contactos y Tareas"
    echo ""
else
    echo ""
    echo "❌ Hubo un error al aplicar la reparación"
    echo ""
    echo "Ejecuta manualmente el SQL:"
    echo "supabase/fix_backoffice_complete.sql"
    echo ""
fi
