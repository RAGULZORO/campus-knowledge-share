import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  isStudyRelated: boolean;
  confidence: number;
  summary: string;
  categories: string[];
  reasoning: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, fileName } = await req.json();

    if (!content) {
      throw new Error('PDF content is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Analyze content with OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI content analyzer that determines if PDF documents are study-related or educational materials. 

            Analyze the provided content and determine:
            1. Is this study-related? (educational materials, textbooks, research papers, assignments, course materials, lab manuals, question papers, study guides, etc.)
            2. Confidence level (0-100%)
            3. Brief summary of content
            4. Relevant categories if study-related
            5. Reasoning for your decision

            Study-related content includes:
            - Academic papers and research
            - Textbooks and educational materials
            - Course syllabi and curricula
            - Assignments and homework
            - Lab manuals and experiments
            - Question papers and exams
            - Study guides and notes
            - Educational presentations
            - Academic journals and articles

            Non-study-related content includes:
            - Personal documents
            - Business documents
            - Entertainment content
            - Random text or spam
            - Marketing materials
            - Legal documents (unless academic law materials)

            Respond in JSON format only:
            {
              "isStudyRelated": boolean,
              "confidence": number,
              "summary": "brief summary",
              "categories": ["category1", "category2"],
              "reasoning": "explanation for decision"
            }`
          },
          {
            role: 'user',
            content: `Analyze this PDF content:\n\nFilename: ${fileName}\n\nContent:\n${content.substring(0, 8000)}${content.length > 8000 ? '\n...(truncated)' : ''}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to analyze content with AI');
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content) as AnalysisResult;

    console.log('Analysis result for', fileName, ':', analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-pdf function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isStudyRelated: false, // Default to requiring review on error
        confidence: 0,
        summary: 'Analysis failed',
        categories: [],
        reasoning: 'Error occurred during analysis'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});