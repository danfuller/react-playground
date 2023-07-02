import Link from 'next/link'
import styles from './Navigation.module.css';

type NavigationProps = {
  pages: string[]
}
type NavigationItem = {
  path: string,
  name: string
}

export const Navigation = ({
  pages
} : NavigationProps) => {

  const navItems : NavigationItem[] = pages.map((key : string) => {
    const path = key.replace('.','').replace('/page.tsx','') || '/'
    const segments = path.split('/')
    const depth = segments.length - 1;
    const name = segments.pop() || 'Home'
    return {
      path,
      name,
      depth,
      segments
    }
  }).filter(path => path.depth <= 1).reverse()  

  // can probably use the depth data to display submenu items if required.
  console.log(navItems)

  return (
    <>
      <nav className={styles.root}>
        { navItems.map((item, i) => <Link href={ item.path } key={ item.path }>{ item.name }</Link>) }
      </nav>
      <nav className={styles.root}>
        <Link href="/">Home</Link>
      </nav>
    </>
  )
}