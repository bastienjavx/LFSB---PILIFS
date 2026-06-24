-- Ajout des contenus éditoriaux demandés : blog, formations et guides.
ALTER TYPE "NoteType" ADD VALUE IF NOT EXISTS 'BLOG';
ALTER TYPE "NoteType" ADD VALUE IF NOT EXISTS 'TRAINING';
ALTER TYPE "NoteType" ADD VALUE IF NOT EXISTS 'GUIDE';
