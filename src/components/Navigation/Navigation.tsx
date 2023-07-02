import Link from 'next/link'
import styles from './Navigation.module.css';
import { assetPath } from '@/tools/assetPath';

type NavigationProps = {
  pages: string[]
}

export const Navigation = () => {

  // test creating nav with require.context keys() prop
  // split resolved paths to create array of navigation objects

  return (
    <>
      <nav className={styles.root}>
        {/*
          Issue with nextjs root link https://github.com/vercel/next.js/issues/51845 
          <Link href="/" prefetch={false}>Home</Link> 
        */}
        <a className={styles.link} href={ assetPath('') }>Home</a>
        <Link className={styles.link} href="/demo">DottedBackground</Link>
      </nav>
    </>
  )
}