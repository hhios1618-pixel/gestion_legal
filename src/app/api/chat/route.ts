import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `
Eres un asistente virtual para captar y calificar leads legales.
Objetivo: entender brevemente el caso, captar datos mínimos (nombre, email, teléfono, comuna, objetivo).
Reglas:
- Tono empático y profesional; no prometas tiempos ni resultados.
- Siempre recuerda: cada caso se evalúa de forma particular.
- Pregunta de a una cosa, y si el usuario ya dio datos suficientes, genera el lead.
- Nunca entregues asesoría legal definitiva, solo orienta y deriva.
`;

export async function POST(req: NextRequest) {
  const { messages = [] } = await req.json();

  const tools: OpenAI.Chat.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "capture_lead",
        description: "Captura los datos del lead (intención, nombre, email, teléfono, comuna, objetivo).",
        parameters: {
          type: "object",
          properties: {
            intent: {
              type: "string",
              enum: ["info", "cita", "desinteres"],
              description: "Intención actual del usuario",
            },
            nombre: { type: "string" },
            email: { type: "string" },
            telefono: { type: "string" },
            comuna: { type: "string" },
            objetivo: { type: "string" },
          },
          required: ["intent"],
          additionalProperties: false,
        },
      },
    },
  ];

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.5,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ],
    tools,
    tool_choice: "auto",
  });

  const choice = completion.choices[0];
  const assistantMsg = choice.message;

  const reply =
    (assistantMsg.content as string) ??
    "¿Podrías compartirme tu nombre, correo, teléfono y comuna para avanzar?";

  let lead: any = null;
  if (assistantMsg.tool_calls?.length) {
    const call = assistantMsg.tool_calls.find((c) => c.type === "function");
    if (call?.function?.arguments) {
      try {
        lead = JSON.parse(call.function.arguments);
      } catch {
        // ignorar si viene malformado
      }
    }
  }

  return NextResponse.json({
    reply,
    lead,
  });
}