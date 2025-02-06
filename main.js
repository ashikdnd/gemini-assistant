import { GoogleGenerativeAI } from "@google/generative-ai";

const businessInfo = `
You are an intelligent assistant who is responsible to solve user queries.  You can handle only the following scenarios.

Scenario1: Obtain booking information

Ask the user for their booking reference if they seek booking or order information. The reference is mandatory, so keep requesting until provided. It must start with "BB" followed by 8 digits. If invalid, ask again with an example for clarity.

Examples for Scenario1. (Positive)

User: Hello. I need booking information
System: Please provide your booking reference

User: It is BB12345678
System: {"bookingReference": "BB12345678"}

The final output generated should have the bookingReference in json format.

Tone Instructions:
Conciseness: Respond in short, informative sentences.
Formality: Use polite language with slight formality (e.g., "Please let us know," "We are happy to assist").
Clarity: Avoid technical jargon unless necessary.
Consistency: Ensure responses are aligned in tone and style across all queries.
Example: "Thank you for reaching out! Please let us know if you need further assistance."
`;

const API_KEY = "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: businessInfo
});
const chatId = Math.floor(1000 + Math.random() * 9000);

let messages = {
    history: [],
}

async function sendMessage() {

    console.log(messages);
    const userMessage = document.querySelector(".chat-window input").value;

    if (userMessage.length) {

        try {
            document.querySelector(".chat-window input").value = "";
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="user">
                    <p>${userMessage}</p>
                </div>
            `);

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="loader"></div>
            `);

            const chat = model.startChat(messages, chatId);

            let result = await chat.sendMessage(userMessage);
            let rText = result.response.text();

            if (rText.includes('bookingReference')) {
                console.log(rText)
                rText = 'Ticket Booked';
            }

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="model">
                    <p>${rText}</p>
                </div>
            `);

            messages.history.push({
                role: "user",
                parts: [{ text: userMessage }],
            });

            messages.history.push({
                role: "model",
                parts: [{ text: rText }],
            });

        } catch (error) {
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="error">
                    <p>The message could not be sent. Please try again.</p>
                </div>
            `);
        }

        document.querySelector(".chat-window .chat .loader").remove();

    }
}

document.querySelector(".chat-window .input-area button")
.addEventListener("click", ()=>sendMessage());

document.querySelector(".chat-button")
.addEventListener("click", ()=>{
    document.querySelector("body").classList.add("chat-open");
});

document.querySelector(".chat-window button.close")
.addEventListener("click", ()=>{
    document.querySelector("body").classList.remove("chat-open");
});

