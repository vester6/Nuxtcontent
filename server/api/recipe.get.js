// Server API-endpoint til at hente en enkelt opskrift efter navn
import { createError, getQuery, defineEventHandler } from 'h3'
import { readFile } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'

export default defineEventHandler(async (event) => {
  // Hent navnet på opskriften fra query-parameteren
  const query = getQuery(event)
  const name = query.name
  
  if (!name) {
    return { error: 'Manglende navn på opskrift' }
  }
  
  try {
    // Sti til markdownfilen
    const contentPath = join(process.cwd(), 'content', 'opskrifter', `${name}.md`)
    console.log('Server: Forsøger at læse opskriftsfil fra:', contentPath)
    
    // Læs filen direkte
    const fileContent = await readFile(contentPath, 'utf-8')
    
    // Brug gray-matter til at parse frontmatter og indhold
    const { data: frontmatter, content } = matter(fileContent)
    
    // Sammensæt vores svar
    const recipe = {
      _path: `/opskrifter/${name}`,
      title: frontmatter.title || name,
      description: frontmatter.description || '',
      time: frontmatter.time,
      difficulty: frontmatter.difficulty || 'Nem',
      servings: frontmatter.servings || 4,
      image: frontmatter.image,
      body: content
    }
    
    console.log('Server: Opskrift fundet og indlæst')
    return recipe
    
  } catch (err) {
    console.error('Server fejl ved læsning af opskrift:', err.message)
    return { 
      error: 'Opskrift ikke fundet', 
      message: err.message, 
      status: 404 
    }
  }
})
