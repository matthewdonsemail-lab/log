import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.interval('watch reddit phrases', { minutes: 10 }, internal.watch.tick, {})

export default crons
