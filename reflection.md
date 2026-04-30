# Reflection

This assignment made the GIGO principle very obvious: the quality of the chatbot depends less on the UI and more on the quality of the context given to the model. A generic prompt like “act like a mentor” produces generic answers, even if the frontend looks good. Once the prompts included background, values, communication style, constraints, and few-shot examples, the responses became much more distinct and useful.

The most important thing that worked was separating the three personas instead of trying to handle them with one common instruction. Anshuman’s prompt is more structured and fundamentals-focused, Abhimanyu’s prompt is more outcome and operator-focused, and Kshitij’s prompt is more analytical and debugging-focused. The few-shot examples were especially useful because they showed the model the exact kind of answer expected, not just the adjectives describing the personality.

Another important learning was that research has to be handled responsibly. These are real people, so the prompt should not invent private beliefs, exact quotes, or WhatsApp/classroom behavior that is not publicly available. For that reason, the app frames the personas as respectful educational simulations grounded in public information. This keeps the product useful while avoiding misleading impersonation.

If I had more time, I would improve the project in three ways. First, I would add more primary-source research for Kshitij Mishra, especially talks or long-form writing, so that persona becomes as strongly grounded as the other two. Second, I would add automated prompt evaluation with test questions to compare whether each persona stays distinct. Third, I would add persistent chat history per persona and a better deployment polish pass with screenshots, loading skeletons, and analytics for failed API calls.

Overall, the biggest lesson is that prompt engineering is not magic wording. It is product thinking: define the user experience, provide clean context, add examples, constrain failure modes, and test the output against real use cases.
