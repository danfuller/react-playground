"use client"

import { DottedBackground } from "@/components/DottedBackground/DottedBackground"

export default function Demo() {
  return (
    <main>
      <h1>Demo</h1>
      <div style={{ width: 400, height: 400 }}>
        <DottedBackground/>
      </div>
      <br/>
      <hr/>
      <br/>
      <div style={{ width: 800, height: 400 }}>
        <DottedBackground/>
      </div>
    </main>
  )
}