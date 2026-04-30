// src/components/Footer.tsx

import styles from "./Footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <a href="/" className={styles.logo}>
        GoF<span>G</span>
      </a>
      <span className={styles.text}>운동하는 사람들의 커뮤니티</span>
    </footer>
  )
}