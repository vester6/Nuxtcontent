// Server API rute der returnerer opskrifter
import fs from 'fs'
import path from 'path'
import { defineEventHandler } from 'h3'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Server-side fil for at hente opskrifter direkte fra filesystem
export default defineEventHandler(async (event) => {
  try {
    // Få den absolutte sti til content/opskrifter mappen
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const contentDir = path.resolve(__dirname, '../../../../content/opskrifter')
    
    console.log('Læser opskrifter fra:', contentDir)
    
    // Læs alle filer i mappen
    const files = fs.readdirSync(contentDir)
    const recipes = []
    
    // For hver fil, læs indholdet og parse front matter
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(contentDir, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        
        // Meget simpel frontmatter parsing
        const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
        let meta = {}
        
        if (frontMatterMatch) {
          const frontMatter = frontMatterMatch[1]
          const lines = frontMatter.split('\n')
          
          lines.forEach(line => {
            const parts = line.split(':')
            if (parts.length >= 2) {
              const key = parts[0].trim()
              const value = parts.slice(1).join(':').trim()
              
              // Simpel kategorihåndtering
              if (key === 'categories') {
                meta[key] = value.replace(/[[\]']/g, '').split(',').map(item => item.trim())
              } else {
                // Fjern eventuelle anførselstegn
                meta[key] = value.replace(/^["'](.*)["']$/, '$1')
              }
            }
          })
        }
        
        // Udtræk titel og beskrivelse
        let title = meta.title || file.replace('.md', '')
        let description = meta.description || ''
        
        // Fjern filtypen fra stien for at få en pæn URL
        const slug = file.replace('.md', '')
        const _path = `/opskrifter/${slug}`
        
        recipes.push({
          _path,
          title,
          description,
          meta,
          slug
        })
      }
    }
    
    return {
      recipes,
      count: recipes.length,
      success: true
    }
  } catch (error) {
    console.error('Fejl ved hentning af opskrifter:', error)
    return {
      recipes: [],
      count: 0,
      success: false,
      error: error.message
    }
  }
})
