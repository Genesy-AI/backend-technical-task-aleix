import { NativeConnection, Worker } from '@temporalio/worker'
import * as activities from './workflows/activities'

export async function runTemporalWorker() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  })
  try {
    const worker = await Worker.create({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
      taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'myQueue',
      workflowsPath: require.resolve('./workflows'),
      activities,
    })

    await worker.run()
  } finally {
    await connection.close()
  }
}
