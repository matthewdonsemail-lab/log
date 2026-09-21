import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

crons.interval('watch reddit phrases', { minutes: 10 }, internal.watch.tick, {})

crons.interval('score unscored matches', { minutes: 10 }, internal.scoring.backfill, {})

crons.interval('email strong matches', { minutes: 5 }, internal.alerts.sweep, {})

export default crons
