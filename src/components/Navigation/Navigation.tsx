import Link from 'next/link'
import styles from './Navigation.module.css';
import { assetPath } from '@/tools/assetPath';

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

  // test creating nav with require.context keys() prop
  // split resolved paths to create array of navigation objects
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

  return (
    <>
      <nav className={styles.root}>
        {/*
          Issue with nextjs root link https://github.com/vercel/next.js/issues/51845 
          <Link href="/" prefetch={false}>Home</Link> 
        */}
        <a href={ assetPath('') }>Home</a>
        <Link href="/demo" prefetch={false}>Demo</Link>
      </nav>
    </>
  )
}