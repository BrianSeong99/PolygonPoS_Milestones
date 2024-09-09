import { createPublicClient, http, Block } from 'viem'
import { polygon, polygonAmoy } from 'viem/chains'
import { program } from 'commander'

async function pre_milestones_checkFinality(client: any, txHash: string): Promise<boolean> {
  const tx = await client.getTransaction({ hash: `0x${txHash}` })
  if (!tx || !tx.blockNumber) return false
  const latestBlock: Block = await client.getBlock({ blockTag: 'finalized' })

  console.log(`Latest finalized block: ${latestBlock.number}`)
  console.log(`Your transaction block: ${tx.blockNumber}`)
  console.log(`Blocks passed since your transaction: ${latestBlock.number !== null ? latestBlock.number - tx.blockNumber : 'N/A'}\n`)


  if (latestBlock.number !== null && latestBlock.number - tx.blockNumber >= 256) {
    return true
  } else {
    return false
  }
}

async function milestones_checkFinality(client: any, txHash: string): Promise<boolean> {
  const tx = await client.getTransaction({ hash: `0x${txHash}` })
  if (!tx || !tx.blockNumber) return false
  const latestBlock: Block = await client.getBlock({ blockTag: 'finalized' })

  console.log(`Latest finalized block: ${latestBlock.number}`)
  console.log(`Your transaction block: ${tx.blockNumber}`)
  console.log(`Blocks passed since your transaction: ${latestBlock.number !== null ? latestBlock.number - tx.blockNumber : 'N/A'}\n`)

  if (latestBlock.number !== null && latestBlock.number > tx.blockNumber) {
    return true
  } else {
    return false
  }
}
async function main() {
  program
    .requiredOption('-t, --txHash <string>', 'Transaction hash')
    .requiredOption('-f, --function <string>', 'Function to call', (value) => {
      if (!['pre_milestones', 'milestones'].includes(value)) {
        throw new Error('Invalid function. Allowed values are: pre_milestones, milestones');
      }
      return value;
    })
    .requiredOption('-n, --network <string>', 'Network to use', (value) => {
      if (!['polygon', 'amoy'].includes(value)) {
        throw new Error('Invalid network. Allowed values are: polygon, amoy');
      }
      return value;
    })
    .parse(process.argv);

  const { function: functionName, txHash, network } = program.opts();

  const chain = network === 'polygon' ? polygon : polygonAmoy;
  const client = createPublicClient({
    chain,
    transport: http(),
  });

  if (functionName === 'pre_milestones') {
    const result = await pre_milestones_checkFinality(client, txHash)
    console.log(`Pre-milestones finality check result: ${result}`)
  } else if (functionName === 'milestones') {
    const result = await milestones_checkFinality(client, txHash)
    console.log(`Milestones finality check result: ${result}`)
  }
}

main().catch((error) => {
  console.error('Error:', error)
})