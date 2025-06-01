# Instagram Reel Scenario Generator

A web application that uses OpenAI to generate 50 creative Instagram Reel scenarios based on your product description, the problem it solves, and your target audience.

## Features

- Input product details through a user-friendly form
- Generate 50 unique 10-second Instagram Reel scenarios using OpenAI
- Select scenarios by clicking on them or using checkboxes
- Export selected scenarios to a text file
- Responsive design with a modern UI

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter your product description, the problem it solves, and your target audience
2. Click "Generate Scenarios" to create 50 unique Instagram Reel ideas
3. Review the generated scenarios and select the ones you like by clicking on them
4. Export your selected scenarios using the "Export Selected" button

## Technologies Used

- Next.js 14 with App Router
- TypeScript
- React
- Tailwind CSS
- OpenAI API

## License

MIT
