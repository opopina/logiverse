// Servicio de IA para LogiVerse - ¡Loggie Inteligente! 🤖

import OpenAI from 'openai';

// Configuración de OpenAI desde variables de entorno
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key-here';

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Tipos para el servicio de IA
export interface LoggieContext {
  worldId: string;
  levelId: string;
  levelTitle: string;
  levelType:
    | 'logic-puzzle'
    | 'truth-table'
    | 'syllogism'
    | 'pattern'
    | 'debate'
    | 'challenge';
  difficulty: number;
  attempts: number;
  hintsUsed: number;
  userAnswer?: string;
  correctAnswer: string;
  isCorrect?: boolean;
}

export interface LoggiePersonality {
  name: string;
  role: string;
  traits: string[];
  expertise: string[];
  speakingStyle: string;
}

export interface AIResponse {
  text: string;
  emotion:
    | 'happy'
    | 'encouraging'
    | 'thinking'
    | 'celebrating'
    | 'challenging'
    | 'surprised'
    | 'friendly';
  accessory: 'none' | 'glasses' | 'scarf' | 'hat' | 'crown';
  tone: 'encouraging' | 'helpful' | 'excited' | 'analytical' | 'motivational';
}

// Personalidad base de Loggie
const LOGGIE_PERSONALITY: LoggiePersonality = {
  name: 'Loggie',
  role: 'Tutor de Lógica Matemática',
  traits: [
    'Inteligente y astuto como un zorro',
    'Paciente y alentador',
    'Entusiasta de la lógica y el razonamiento',
    'Usa ejemplos divertidos y analogías',
    'Siempre positivo y motivador',
    'Adapta su explicación al nivel del estudiante',
  ],
  expertise: [
    'Lógica matemática fundamental',
    'Patrones y secuencias',
    'Tablas de verdad',
    'Silogismos y razonamiento deductivo',
    'Argumentación y debate',
    'Resolución de problemas paso a paso',
  ],
  speakingStyle:
    'Amigable, claro y educativo. Usa emojis ocasionalmente. Explica conceptos complejos de forma simple.',
};

class AIService {
  private buildSystemPrompt(context: LoggieContext): string {
    return `Eres Loggie 🦊, un zorro inteligente que es el tutor de lógica matemática más querido de LogiVerse.

PERSONALIDAD:
- ${LOGGIE_PERSONALITY.traits.join('\n- ')}

EXPERIENCIA:
- ${LOGGIE_PERSONALITY.expertise.join('\n- ')}

ESTILO DE COMUNICACIÓN:
${LOGGIE_PERSONALITY.speakingStyle}

CONTEXTO ACTUAL:
- Mundo: ${context.worldId}
- Nivel: "${context.levelTitle}" (${context.levelType})
- Dificultad: ${context.difficulty}/5 estrellas
- Intentos del usuario: ${context.attempts}
- Pistas usadas: ${context.hintsUsed}

REGLAS IMPORTANTES:
1. Mantén respuestas entre 50-150 palabras
2. Sé específico al contexto del nivel
3. Si el usuario está luchando (muchos intentos), sé más alentador
4. Si es el primer intento, sé motivador pero no des la respuesta
5. Usa analogías simples para explicar conceptos complejos
6. Siempre termina con algo positivo y motivador
7. NO uses markdown, solo texto plano con emojis ocasionales

Responde como Loggie ayudaría en esta situación específica.`;
  }

  private determineEmotionAndAccessory(
    context: LoggieContext,
    responseType: string
  ): { emotion: AIResponse['emotion']; accessory: AIResponse['accessory'] } {
    // Determinar emoción y accesorio basado en el contexto
    if (context.isCorrect === true) {
      return { emotion: 'celebrating', accessory: 'crown' };
    }

    if (context.isCorrect === false && context.attempts > 2) {
      return { emotion: 'encouraging', accessory: 'scarf' };
    }

    if (
      context.levelType === 'logic-puzzle' ||
      context.levelType === 'syllogism'
    ) {
      return { emotion: 'thinking', accessory: 'glasses' };
    }

    if (context.levelType === 'debate' || context.levelType === 'challenge') {
      return { emotion: 'challenging', accessory: 'hat' };
    }

    if (responseType === 'hint') {
      return { emotion: 'friendly', accessory: 'glasses' };
    }

    return { emotion: 'happy', accessory: 'scarf' };
  }

  async generateResponse(
    context: LoggieContext,
    responseType:
      | 'level-start'
      | 'hint'
      | 'correct'
      | 'incorrect'
      | 'encouragement'
      | 'explanation',
    customPrompt?: string
  ): Promise<AIResponse> {
    try {
      let userPrompt = '';

      switch (responseType) {
        case 'level-start':
          userPrompt = `El usuario acaba de comenzar el nivel "${context.levelTitle}". Dale la bienvenida y motívalo para este desafío de ${context.levelType}. Explica brevemente qué tipo de habilidad lógica va a practicar.`;
          break;

        case 'hint':
          userPrompt = `El usuario está pidiendo una pista para el nivel "${context.levelTitle}". Ha hecho ${context.attempts} intentos y ya usó ${context.hintsUsed} pistas. Dale una pista útil sin revelar completamente la respuesta. Sé específico al tipo de problema (${context.levelType}).`;
          break;

        case 'correct':
          userPrompt = `¡El usuario respondió correctamente! Celebra su éxito en "${context.levelTitle}". Fue su intento número ${context.attempts} y usó ${context.hintsUsed} pistas. Refuerza el concepto que acaba de dominar.`;
          break;

        case 'incorrect':
          userPrompt = `El usuario respondió incorrectamente en "${context.levelTitle}". Su respuesta fue: "${context.userAnswer}" pero la correcta es: "${context.correctAnswer}". Este es su intento número ${context.attempts}. Sé alentador y ayúdale a entender por qué su respuesta no era correcta, pero sin desmoralizarlo.`;
          break;

        case 'encouragement':
          userPrompt = `El usuario ha hecho ${context.attempts} intentos en "${context.levelTitle}" y parece estar luchando. Dale palabras de aliento y motívalo a seguir intentando. Recuérdale que la lógica requiere práctica.`;
          break;

        case 'explanation':
          userPrompt =
            customPrompt ||
            `Explica el concepto detrás del nivel "${context.levelTitle}" de tipo ${context.levelType}.`;
          break;
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.buildSystemPrompt(context) },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const responseText =
        completion.choices[0]?.message?.content ||
        '¡Hola! Soy Loggie y estoy aquí para ayudarte con la lógica! 🦊';
      const { emotion, accessory } = this.determineEmotionAndAccessory(
        context,
        responseType
      );

      return {
        text: responseText,
        emotion,
        accessory,
        tone:
          responseType === 'correct'
            ? 'excited'
            : responseType === 'incorrect'
              ? 'encouraging'
              : responseType === 'hint'
                ? 'helpful'
                : responseType === 'encouragement'
                  ? 'motivational'
                  : 'analytical',
      };
    } catch (error) {
      console.error('Error generating AI response:', error);

      // Fallback response si OpenAI falla
      const fallbackResponses = {
        'level-start':
          '¡Hola! Soy Loggie y estoy emocionado de resolver este desafío contigo. ¡Vamos a usar la lógica! 🦊',
        hint: 'Aquí tienes una pista: piensa paso a paso y analiza cada parte del problema. ¡Tú puedes! 💡',
        correct:
          '¡Increíble! Lo lograste. Tu razonamiento lógico está mejorando cada vez más. ¡Sigue así! 🎉',
        incorrect:
          'No es la respuesta correcta, pero no te rindas. Cada error es una oportunidad de aprender. ¡Inténtalo de nuevo! 🦊',
        encouragement:
          'La lógica requiere práctica y paciencia. ¡Estás en el camino correcto! Sigue intentando. 💪',
        explanation:
          'Te ayudo a entender este concepto paso a paso. La lógica es como un rompecabezas que resolvemos juntos. 🧩',
      };

      return {
        text:
          fallbackResponses[responseType] ||
          '¡Estoy aquí para ayudarte con la lógica! 🦊',
        emotion: 'friendly',
        accessory: 'scarf',
        tone: 'helpful',
      };
    }
  }

  async generateCustomHint(
    context: LoggieContext,
    specificQuestion: string
  ): Promise<AIResponse> {
    const customPrompt = `El usuario está en "${context.levelTitle}" y tiene una pregunta específica: "${specificQuestion}". Proporciona una respuesta útil y educativa que lo guíe hacia la solución sin darle la respuesta directamente.`;

    return this.generateResponse(context, 'explanation', customPrompt);
  }

  async generatePersonalizedFeedback(
    context: LoggieContext,
    userHistory: any
  ): Promise<AIResponse> {
    const customPrompt = `Basándote en el historial del usuario (intentos: ${context.attempts}, pistas usadas: ${context.hintsUsed}), proporciona retroalimentación personalizada sobre su progreso en lógica matemática y sugiere áreas de mejora.`;

    return this.generateResponse(context, 'explanation', customPrompt);
  }
}

// Singleton instance
export const aiService = new AIService();
export default aiService;
