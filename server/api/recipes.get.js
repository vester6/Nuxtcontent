// Server API-endpoint til at hente alle opskrifter
import { createError, defineEventHandler } from 'h3'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'

export default defineEventHandler(async (event) => {
  try {
    // Sti til opskrifter-mappen
    const contentPath = join(process.cwd(), 'content', 'opskrifter');
    console.log('Server: Indlæser opskrifter fra:', contentPath);
    
    // Læs alle filer i mappen
    const files = await readdir(contentPath);
    
    // Filtrer for kun at få markdown-filer
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    // Indlæs og parse hver opskrift
    const recipes = await Promise.all(markdownFiles.map(async (filename) => {
      try {
        const filePath = join(contentPath, filename);
        const fileContent = await readFile(filePath, 'utf-8');
        
        // Parse frontmatter
        const { data: frontmatter } = matter(fileContent);
        
        // Få slugen fra filnavnet (fjern .md)
        const slug = filename.replace(/\.md$/, '');
        
        // Opskrifter, der mangler titel eller beskrivelse, springes over
        if (!frontmatter.title) {
          console.log('Server: Opskrift uden titel ignoreret:', filename);
          return null;
        }
        
        // Returner nødvendige data for teaser-visning
        return {
          title: frontmatter.title,
          description: frontmatter.description || '',
          slug: `/opskrifter/${slug}`,
          image: frontmatter.image,
          time: frontmatter.time || 30,
          difficulty: frontmatter.difficulty || 'Nem',
          servings: frontmatter.servings || 4,
          categories: frontmatter.categories || []
        };
      } catch (err) {
        console.error('Fejl ved indlæsning af opskrift:', filename, err);
        return null;
      }
    }));
    
    // Fjern null-værdier og sorter alfabetisk efter titel
    const validRecipes = recipes
      .filter(recipe => recipe !== null)
      .sort((a, b) => a.title.localeCompare(b.title, 'da'));
    
    console.log('Server: Indlæst', validRecipes.length, 'opskrifter');
    return validRecipes;
    
  } catch (err) {
    console.error('Server fejl ved indlæsning af opskrifter:', err);
    return { error: 'Kunne ikke indlæse opskrifter', message: err.message };
  }
});
