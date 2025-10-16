# **App Name**: Scholar Suite

## Core Features:

- File Summarization: Upload a file, select summary length (short/medium/long), and receive a summarized version. Utilizes Firebase Storage for file uploads and Firestore to save file details.
- Text to PDF Conversion: Enter text and convert it to a PDF file for download. The input text will be stored on Firestore.
- AI Essay/Report Generation: Upload text or a file, and use an AI tool to generate an essay or report based on the input and specified length. Saves generated reports per user in Firestore.
- Citation Generation Tool: Accept text or file upload and create citations based on selected style (APA, MLA, etc.). The citations are displayed with an option to copy or download, with user references saved in Firestore.
- Multi-language Summarization Tool: Input text and receive a summary in a selected language. Uses Firestore to store summaries with language and user ID.
- Lecture Transcription: Upload a file with speech to be transcribed to text and made available for download.
- Unified Language Tool: Single textarea where user can specify whether the text is checked for grammar/spelling, rewritten/paraphrased, or translated, providing a processed output which will be saved to Firestore.

## Style Guidelines:

- Primary color: Forest green (#386641) to represent growth and learning, fitting for an academic platform.
- Background color: Light sage (#F2F5F1), offering a soft, neutral backdrop that doesn't distract from content.
- Accent color: Muted gold (#B3A17B), used for interactive elements to add sophistication and highlight important actions.
- Headline font: 'Playfair', serif, for headings and titles, lending an elegant, high-end feel; body font: 'PT Sans', sans-serif, providing excellent readability and a modern aesthetic.
- Code font: 'Source Code Pro' for any instances of displayed code.
- Grid and card-based layout to present tools inside each group, ensuring a clean, professional UI/UX across devices.
- Consistent use of minimalist icons across the platform to improve navigation and overall aesthetics.