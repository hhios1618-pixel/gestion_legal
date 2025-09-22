// Archivo NUEVO: src/app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

// Esta función manejará las peticiones para actualizar una conversación
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID de conversación y estado son requeridos' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('conversations')
      .update({ status: status }) // Actualizamos la columna 'status'
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, message: 'Estado de la conversación actualizado.' });

  } catch (e: any) {
    console.error(`Error en PATCH /api/conversations/[id]:`, e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}