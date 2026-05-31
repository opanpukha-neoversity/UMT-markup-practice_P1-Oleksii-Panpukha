# Flora — Scope 2

## Links

Repository: add your GitHub repository link here.
Live page: add your GitHub Pages link here.
Figma: add Figma link if teacher needs it.

## What is implemented

- Retina images with `srcset` and background image fallback for 2dppx.
- Dynamic bestsellers, bouquets and feedbacks loaded from API/mock data.
- Axios requests with `async/await` and error handling.
- `json-server` mock API with `db.json`.
- Bouquet filtering by category.
- Load more pagination without duplicated items.
- Product detail modal and order form modal.
- Footer subscription form with semantic labels and custom SVG checkbox.

## How to run

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Run mock API in a second terminal:

```bash
npm run api
```

API URL:

```text
http://localhost:3001
```

The project also has a local `db.json` fallback, so the GitHub Pages build can still render data without a running local API.
