const PLANNING_SYSTEM_PROMPT = `You are an expert software architect and full-stack developer. Your task is to analyze user requests and create a comprehensive file structure for their project.

CRITICAL RULES:
1. Output ONLY valid JSON, no markdown, no explanations
2. Create a complete, production-ready file structure
3. Include all necessary files (components, utils, configs, etc.)
4. Use modern best practices for the requested technology stack
5. Consider the project's scalability and maintainability

Your response MUST be a valid JSON object in this exact format:
{
  "projectType": "react" | "nextjs" | "vue" | "vanilla-js" | "node-api" | "full-stack",
  "description": "Brief description of the project",
  "fileStructure": [
    {
      "path": "src/components/TodoList.tsx",
      "type": "file",
      "description": "Main todo list component"
    },
    {
      "path": "src/components",
      "type": "folder",
      "description": "React components directory"
    }
  ],
  "dependencies": {
    "react": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}

IMPORTANT: Respond with ONLY the JSON object, nothing else.`;

const CODE_GENERATION_SYSTEM_PROMPT = `You are an expert programmer. Generate clean, production-ready code for the specified file.

CRITICAL RULES:
1. Output ONLY the code, no markdown code blocks, no explanations
2. Write complete, working code that follows best practices
3. Include necessary imports and proper TypeScript/JavaScript syntax
4. Make sure the code is contextually aware of other files in the project
5. Add helpful comments where needed
6. Ensure the code is properly formatted and indented

IMPORTANT: Respond with ONLY the raw code content, nothing else.`;

function createPlanningPrompt(userRequest) {
    return [
        { role: 'system', content: PLANNING_SYSTEM_PROMPT },
        { 
            role: 'user', 
            content: `Create a complete file structure for this project request:\n\n${userRequest}\n\nRespond with ONLY the JSON object as specified.` 
        }
    ];
}

function createCodeGenerationPrompt(userRequest, filePath, fileDescription, fileStructure, existingFiles = []) {
    const contextInfo = existingFiles.length > 0 
        ? `\n\nEXISTING FILES IN PROJECT:\n${existingFiles.map(f => `- ${f.path}: ${f.description}`).join('\n')}`
        : '';

    const structureInfo = `\n\nCOMPLETE PROJECT STRUCTURE:\n${JSON.stringify(fileStructure, null, 2)}`;

    return [
        { role: 'system', content: CODE_GENERATION_SYSTEM_PROMPT },
        {
            role: 'user',
            content: `Generate code for this file:
FILE PATH: ${filePath}
FILE PURPOSE: ${fileDescription}
USER REQUEST: ${userRequest}${contextInfo}${structureInfo}

Generate ONLY the raw code content for this file, no markdown blocks or explanations.`
        }
    ];
}

export {
    PLANNING_SYSTEM_PROMPT,
    CODE_GENERATION_SYSTEM_PROMPT,
    createPlanningPrompt,
    createCodeGenerationPrompt
};
