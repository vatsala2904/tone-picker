# Fiddle Tone Picker

**Live app:** https://tone-picker-psi.vercel.app  
**API:** https://tone-picker-fiddle.onrender.com

## What it does
3×3 tone matrix (Formality × Vibe). Click a cell to rewrite immediately.  
Selection-scoped rewrite, Undo/Redo, Reset, Try Again (adds variety), autosave, light/dark.

## Stack
React + Vite (client), Express (server), Mistral API.

## Run locally
### Server
```bash
cd server
cp .env.example .env   
npm i
npm start              
