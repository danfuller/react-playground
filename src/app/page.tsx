import Image from 'next/image'
import { assetPath } from '@/tools/assetPath'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>React Playground</h1>
    </main>
  )
}
