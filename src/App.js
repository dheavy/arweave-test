import './App.css'
import { useState } from 'react'
import Arweave from 'arweave'

// Connect to Arweave node and specify gateway
const arweave = Arweave.init({})

function App() {
  const [state, setState] = useState('')
  const [transactionId, setTransactionId] = useState('')

  async function createTransaction() {
    if (!state) return
    try {
      const data = state
      setState('')

      // Create and send tnx to Arweave
      let tnx = await arweave.createTransaction({ data })
      await arweave.transactions.sign(tnx)
      const uploader = await arweave.transactions.getUploader(tnx)

      // Give progress feedback on upload
      while (!uploader.isComplete) {
        await uploader.uploadChunk()
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`)
      }

      setTransactionId(tnx.id)
    } catch (err) {
      console.error('error:', err)
    }
  }

  async function readFromArweave() {
    // Read arweave data using any tnx ID
    const data = await arweave.transactions.getData(transactionId, {
      decode: true,
      string: true
    })
    console.log('data:', data)
  }

  return (
    <div className="container">
      <button style={button} onClick={createTransaction}>
        Create Transaction
      </button>

      <button style={button} onClick={readFromArweave}>
        Read Transaction
      </button>

      <input
        style={input}
        onChange={(e) => setState(e.target.value)}
        placeholder="text"
        value={state}
      />
    </div>
  )
}

const button = {
  outline: 'none',
  border: '1px solid black',
  backgroundColor: 'white',
  padding: '10px',
  width: '200px',
  marginBottom: 10,
  cursor: 'pointer',
}

const input = {
  backgroundColor: '#ddd',
  outline: 'none',
  border: 'none',
  width: '200px',
  fontSize: '16px',
  padding: '10px',
}

export default App
