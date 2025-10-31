# Bitcoin Influencer

This is a [Next.js](https://nextjs.org) project for a cryptocurrency influencer platform, with integrated Supabase authentication.

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure Supabase:
   - Create an account on [Supabase](https://supabase.com)
   - Create a new project
   - Go to Settings > API and copy the URL and anonymous key
   - Create a `.env.local` file in the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load the [Geist](https://vercel.com/font) font.

## Features

- **Authentication**: Complete login and registration system using Supabase Auth
- **Route Protection**: Component to protect routes that require authentication
- **User Profile**: Profile page for authenticated users

## Technologies

- [Next.js](https://nextjs.org/) - React Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Supabase](https://supabase.com/) - Backend as a service for authentication

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
