import { NativeConnection, Worker } from '@temporalio/worker'
import * as activities from './workflows/activities'

export async function runTemporalWorker() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  })

  // Parse rate limits from environment variables
  const orionRps = parseFloat(process.env.ORION_MAX_RPS || '1')
  const astraRps = parseFloat(process.env.ASTRA_MAX_RPS || '5')
  const nimbusRps = parseFloat(process.env.NIMBUS_MAX_RPS || '2')

  try {
    const commonConfig = {
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
      activities,
    }

    // Main worker for workflows and general activities
    const mainWorker = await Worker.create({
      ...commonConfig,
      taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'myQueue',
      workflowsPath: require.resolve('./workflows'),
    })

    // Specialized workers for phone providers with RPS throttling
    const orionWorker = await Worker.create({
      ...commonConfig,
      taskQueue: 'orion-lookup-queue',
      maxTaskQueueActivitiesPerSecond: orionRps,
    })

    const astraWorker = await Worker.create({
      ...commonConfig,
      taskQueue: 'astra-lookup-queue',
      maxTaskQueueActivitiesPerSecond: astraRps,
    })

    const nimbusWorker = await Worker.create({
      ...commonConfig,
      taskQueue: 'nimbus-lookup-queue',
      maxTaskQueueActivitiesPerSecond: nimbusRps,
    })

    console.log(
      `[Worker] Starting workers with limits: Orion=${orionRps} RPS, Astra=${astraRps} RPS, Nimbus=${nimbusRps} RPS`
    )

    await Promise.all([mainWorker.run(), orionWorker.run(), astraWorker.run(), nimbusWorker.run()])
  } finally {
    await connection.close()
  }
}
