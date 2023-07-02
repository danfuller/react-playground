// Not currently used but might be useful

// Fetches pages at build time
const pages = require.context('./', true,/^(?!src\/app).*page.tsx/).keys();

type NavigationItem = {
  path: string,
  name: string,
  depth: number
}

// Creates array of Nav Items from require.context.keys()
// has to be used within a component (eg Navigation) as a prop

// const navItems : NavigationItem[] = pages.map((key : string) => {
//   const path = key.replace('.','').replace('/page.tsx','') || '/'
//   const segments = path.split('/')
//   const depth = segments.length - 1;
//   const name = segments.pop() || 'Home'
//   return {
//     path,
//     name,
//     depth
//   }
// }).filter(path => path.depth <= 1).reverse()  
