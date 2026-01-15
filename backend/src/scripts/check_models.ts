
// @ts-ignore
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function main() {
    try {
        console.log("Checking available models...");
        // Hack: The current SDK might not expose listModels on top level easily in all versions, 
        // but let's try assuming it does or use the model manager if available.
        // As of recent versions:
        // const models = await genAI.listModels(); // N/A on top level usually?

        // Actually, there is no direct listModels method on GoogleGenerativeAI in some versions.
        // It's often on a ModelManager or you just try to use a model.

        // BUT, given 404, let's try a very basic 'gemini-pro' text generation to confirm connectivity.

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello?");
        console.log("Success with gemini-1.5-flash:", result.response.text());

    } catch (e: any) {
        console.error("Error with gemini-1.5-flash:", e.message);

        try {
            console.log("Trying gemini-pro...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result2 = await model2.generateContent("Hello?");
            console.log("Success with gemini-pro:", result2.response.text());
        } catch (e2: any) {
            console.error("Error with gemini-pro:", e2.message);
        }
    }
}

main();
