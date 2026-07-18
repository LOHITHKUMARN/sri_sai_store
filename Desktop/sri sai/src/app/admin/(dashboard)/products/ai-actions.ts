"use server"

import { Groq } from "groq-sdk"
import { z } from "zod"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const productDataSchema = z.object({
  description: z.string().describe("A 2-3 sentence overview of the product."),
  features: z.array(z.string()).describe("A list of key features (About this item)."),
  whatsInTheBox: z.array(z.string()).describe("A list of items included in the box."),
  specs: z.array(z.object({
    category: z.string(),
    key: z.string(),
    value: z.string()
  })).describe("A list of specifications categorized.")
})

export type ProductParseResult = 
  | { success: true; data: z.infer<typeof productDataSchema> }
  | { success: false; error: string; rawText?: string }

export async function parseProductText(rawText: string): Promise<ProductParseResult> {
  if (!rawText || rawText.trim().length === 0) {
    return { success: false, error: "Input text is empty." }
  }

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a strict data extraction assistant. Your task is to extract product details from the raw text provided and output it in strict JSON format.
You must return ONLY valid JSON, no markdown, no explanation, no code fences.

Extract the following information:
1. "description": A 2-3 sentence marketing overview.
2. "features": Array of strings representing key features (bullet points).
3. "whatsInTheBox": Array of strings representing box contents (look for "What's in the box", "Included Components", "Package Contents"). Do NOT put box contents in the specs array, always put them here. If none found, return an empty array.
4. "specs": Array of objects with 'category', 'key', and 'value' strings.

Constraints for 'specs':
- 'category' must be one of the following: General, Design, Audio, Display, Power, Connectivity, Performance, Physical, Warranty. If a spec doesn't fit, use General.
- 'key' should be a concise label (e.g., "RMS Output").
- 'value' should be the value (e.g., "80W").
- Do NOT include box contents in specs.`
        },
        {
          role: "user",
          content: rawText
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })

    const rawContent = response.choices[0]?.message?.content || "{}"
    
    let parsedJson
    try {
      parsedJson = JSON.parse(rawContent)
    } catch (parseError) {
      return { success: false, error: "Failed to parse AI response as JSON.", rawText: rawContent }
    }

    const validation = productDataSchema.safeParse(parsedJson)
    if (!validation.success) {
      return { success: false, error: "AI response did not match expected schema.", rawText: rawContent }
    }

    return { success: true, data: validation.data }

  } catch (error: any) {
    console.error("AI parse error:", error)
    return { success: false, error: error.message || "An unknown error occurred during AI parsing." }
  }
}
