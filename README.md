# FoodieExpress — React

A redesigned FoodieExpress food-delivery site built with **React 19 + Vite**, animated with **Framer Motion**.

## Animations

- Intro splash that zooms in, then zooms out of the way
- Page transitions: the old page zooms out, a red curtain sweeps, the new page zooms in
- Hero headline that rises word by word, a spinning plate with orbiting dishes, and a parallax zoom on scroll
- A full-screen "Cooked fresh. Delivered hot." section that zooms from a rounded card to full size as you scroll
- Scroll reveals (zoom-in, zoom-out, pop, flip, blur, slide), staggered grids and count-up stats
- Product cards with 3D tilt and image zoom; clicking one zooms its photo into a quick-view modal (shared-layout animation)
- Add-to-cart sends the dish's photo flying into the cart icon, which bounces
- The menu filters zoom cards in and out, with a sliding pill indicator
- Animated order timeline, a rider moving on the live map, confetti on order success
- Respects the visitor's *reduce motion* setting

## Features

Menu with search, category and vendor filters · cart · checkout with delivery/pickup and address geocoding on a Leaflet map · order tracking · reviews · about · contact · login / register / vendor application · admin dashboard (products, orders, tracking, vendor approvals) · vendor dashboard · support chat and WhatsApp buttons.

Products load from Supabase (`products` table, `images` storage bucket — see `supabase/setup.sql`). If Supabase is unreachable or empty, the site uses a built-in 20-item starter menu and saves product edits in the browser. Cart, orders, users, vendors and reviews are stored in `localStorage`, as in the original site.

Admin demo login: `admin@foodieexpress.com` / `admin123`.

## Run

```bash
npm install
npm run dev      # http://localhost:5230
npm run build    # production build in dist/
```

To point at a different Supabase project, create `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deploy

`vercel.json` (Vercel) and `public/_redirects` (Netlify) route every path to `index.html` so deep links like `/menu` work.
