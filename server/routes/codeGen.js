import express from 'express';
import LLMService from '../services/llmService.js';
import { createPlanningPrompt, createCodeGenerationPrompt } from '../prompts/codeGeneration.js';

const router = express.Router();

// Generate project structure and code
router.post('/generate', async (req, res) => {
    try {
        const { userRequest, apiSettings } = req.body;
        
        if (!userRequest || !apiSettings) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { provider, apiKey, model } = apiSettings;
        
        if (!provider || !apiKey || !model) {
            return res.status(400).json({ error: 'Invalid API settings' });
        }

        // Set headers for Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const llmService = new LLMService(provider, apiKey, model);

        // Send initial status
        res.write(`data: ${JSON.stringify({ type: 'status', message: 'Analyzing your request...' })}\n\n`);

        // Step 1: Generate file structure
        res.write(`data: ${JSON.stringify({ type: 'status', message: 'Planning project structure...' })}\n\n`);
        
        const planningMessages = createPlanningPrompt(userRequest);
        let planningResponse = '';

        for await (const chunk of llmService.streamCompletion(planningMessages)) {
            planningResponse += chunk;
            // Send planning progress
            res.write(`data: ${JSON.stringify({ type: 'planning_chunk', content: chunk })}\n\n`);
        }

        // Parse the file structure
        let fileStructure;
        try {
            // Clean the response to extract JSON
            const jsonMatch = planningResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in planning response');
            }
            fileStructure = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('Failed to parse planning response:', planningResponse);
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to parse project structure' })}\n\n`);
            return res.end();
        }

        // Send complete file structure
        res.write(`data: ${JSON.stringify({ type: 'file_structure', data: fileStructure })}\n\n`);

        // Step 2: Generate code for each file
        const files = fileStructure.fileStructure.filter(item => item.type === 'file');
        const generatedFiles = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            res.write(`data: ${JSON.stringify({ 
                type: 'status', 
                message: `Generating code for ${file.path} (${i + 1}/${files.length})...` 
            })}\n\n`);

            // Send file generation start event
            res.write(`data: ${JSON.stringify({ 
                type: 'file_generation_start', 
                file: file 
            })}\n\n`);

            const codeMessages = createCodeGenerationPrompt(
                userRequest,
                file.path,
                file.description,
                fileStructure.fileStructure,
                generatedFiles
            );

            let codeContent = '';

            for await (const chunk of llmService.streamCompletion(codeMessages)) {
                codeContent += chunk;
                // Stream code chunks
                res.write(`data: ${JSON.stringify({ 
                    type: 'code_chunk', 
                    file: file.path,
                    content: chunk 
                })}\n\n`);
            }

            // Send complete file
            generatedFiles.push({
                path: file.path,
                description: file.description,
                content: codeContent.trim()
            });

            res.write(`data: ${JSON.stringify({ 
                type: 'file_complete', 
                file: {
                    path: file.path,
                    content: codeContent.trim()
                }
            })}\n\n`);
        }

        // Send completion event
        res.write(`data: ${JSON.stringify({ 
            type: 'complete', 
            data: {
                projectType: fileStructure.projectType,
                description: fileStructure.description,
                dependencies: fileStructure.dependencies,
                devDependencies: fileStructure.devDependencies,
                files: generatedFiles
            }
        })}\n\n`);

        res.end();

    } catch (error) {
        console.error('Code generation error:', error);
        res.write(`data: ${JSON.stringify({ 
            type: 'error', 
            message: error.message || 'An error occurred during code generation' 
        })}\n\n`);
        res.end();
    }
});

export default router;
