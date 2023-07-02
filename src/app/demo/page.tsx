"use client"

import { DottedBackground } from "@/components/DottedBackground/DottedBackground"

export default function Demo() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center'}}>
      <div style={{ width: '100vw', height: '80vh' }}>
        <DottedBackground/>
      </div>
    </main>
  )
}